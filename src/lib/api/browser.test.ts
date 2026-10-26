// @vitest-environment jsdom
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { redirectToLogin } from '@/lib/admin/expired-session';
import { server } from '@/mocks/node';
import { browserApi } from './browser';

vi.mock('@/lib/admin/expired-session', () => ({ redirectToLogin: vi.fn() }));

const unauthorized = () =>
  HttpResponse.json(
    { type: 'https://api.mamboproxi.com/problems/unauthorized', title: 'Session expirée', status: 401 },
    { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
  );

function captureCsrfHeader() {
  const seen: (string | null)[] = [];
  server.use(
    http.all('*/v1/admin/requests/:id/notes', ({ request }) => {
      seen.push(request.headers.get('X-CSRF-Token'));
      return HttpResponse.json({}, { status: 201 });
    }),
  );
  return seen;
}

describe('client API navigateur', () => {
  afterEach(() => {
    document.cookie = 'mp_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('recopie le cookie mp_csrf dans X-CSRF-Token pour les mutations', async () => {
    document.cookie = 'mp_csrf=jeton-123';
    const seen = captureCsrfHeader();
    await browserApi.POST('/v1/admin/requests/{id}/notes', {
      params: { path: { id: 'req_1' } },
      body: { body: 'Rappel client' } as never,
    });
    expect(seen).toEqual(['jeton-123']);
  });

  it("n'ajoute pas d'en-tête CSRF sans cookie", async () => {
    const seen = captureCsrfHeader();
    await browserApi.POST('/v1/admin/requests/{id}/notes', {
      params: { path: { id: 'req_1' } },
      body: { body: 'Rappel client' } as never,
    });
    expect(seen).toEqual([null]);
  });

  describe('renouvellement de la session sur 401', () => {
    /** Note simulée : 401 tant que la session n'est pas renouvelée ; jetons CSRF reçus à chaque envoi. */
    function notesRoute(state: { renewed: boolean }) {
      const csrf: (string | null)[] = [];
      const bodies: unknown[] = [];
      server.use(
        http.post('*/v1/admin/requests/:id/notes', async ({ request }) => {
          csrf.push(request.headers.get('X-CSRF-Token'));
          bodies.push(await request.json());
          return state.renewed ? HttpResponse.json({}, { status: 201 }) : unauthorized();
        }),
      );
      return { csrf, bodies };
    }

    it('renouvelle puis rejoue la mutation avec le nouveau jeton CSRF et le même corps', async () => {
      document.cookie = 'mp_csrf=jeton-1';
      const state = { renewed: false };
      const seen = notesRoute(state);
      let refreshes = 0;
      server.use(
        http.post('*/v1/auth/refresh', () => {
          refreshes += 1;
          state.renewed = true;
          // L'API dépose un nouveau jeton CSRF avec la rotation.
          document.cookie = 'mp_csrf=jeton-2';
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { response } = await browserApi.POST('/v1/admin/requests/{id}/notes', {
        params: { path: { id: 'req_1' } },
        body: { body: 'Rappel client' } as never,
      });

      expect(response.status).toBe(201);
      expect(refreshes).toBe(1);
      expect(seen.csrf).toEqual(['jeton-1', 'jeton-2']);
      expect(seen.bodies).toEqual([{ body: 'Rappel client' }, { body: 'Rappel client' }]);
      expect(redirectToLogin).not.toHaveBeenCalled();
    });

    it('un seul renouvellement pour plusieurs lectures refusées en même temps', async () => {
      const state = { renewed: false };
      let refreshes = 0;
      server.use(
        http.get('*/v1/admin/dashboard', () =>
          state.renewed ? HttpResponse.json({ ok: true }) : unauthorized(),
        ),
        http.post('*/v1/auth/refresh', async () => {
          refreshes += 1;
          await new Promise((done) => setTimeout(done, 20));
          state.renewed = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const results = await Promise.all([1, 2, 3].map(() => browserApi.GET('/v1/admin/dashboard')));

      expect(results.map(({ response }) => response.status)).toEqual([200, 200, 200]);
      expect(refreshes).toBe(1);
    });

    it('renouvellement refusé : retour à la connexion, la requête n’est pas rejouée', async () => {
      const seen = notesRoute({ renewed: false });
      server.use(http.post('*/v1/auth/refresh', unauthorized));

      const { response } = await browserApi.POST('/v1/admin/requests/{id}/notes', {
        params: { path: { id: 'req_1' } },
        body: { body: 'Rappel client' } as never,
      });

      expect(response.status).toBe(401);
      expect(seen.bodies).toHaveLength(1);
      expect(redirectToLogin).toHaveBeenCalledTimes(1);
    });

    it('aucun renouvellement pour un 401 de la connexion', async () => {
      let refreshes = 0;
      server.use(
        http.post('*/v1/auth/login', unauthorized),
        http.post('*/v1/auth/refresh', () => {
          refreshes += 1;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { response } = await browserApi.POST('/v1/auth/login', {
        body: { email: 'mireille@mamboproxi.com', password: 'mauvais', rememberMe: false },
      });

      expect(response.status).toBe(401);
      expect(refreshes).toBe(0);
      expect(redirectToLogin).not.toHaveBeenCalled();
    });
  });
});
