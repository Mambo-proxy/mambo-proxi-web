import { describe, expect, it, vi } from 'vitest';
import { isRefreshableRoute, withSessionRefresh, type RefreshOutcome } from './session-refresh';

const API = 'http://localhost:4000';

/** Réponse de l'API simulée : `401` tant que la session n'est pas renouvelée. */
function fakeApi() {
  const state = { renewed: false };
  const seen: { url: string; body: string; csrf: string | null }[] = [];
  const send = vi.fn(async (request: Request) => {
    seen.push({
      url: new URL(request.url).pathname,
      body: await request.text(),
      csrf: request.headers.get('X-CSRF-Token'),
    });
    return new Response(null, { status: state.renewed ? 200 : 401 });
  });
  return { state, seen, send };
}

/** Renouvellement contrôlé par le test (résolu à la demande). */
function deferredRefresh() {
  let resolve: (outcome: RefreshOutcome) => void = () => {};
  const refresh = vi.fn(
    () =>
      new Promise<RefreshOutcome>((done) => {
        resolve = done;
      }),
  );
  return { refresh, resolve: (outcome: RefreshOutcome) => resolve(outcome) };
}

describe('isRefreshableRoute', () => {
  it('ne concerne que les routes du back-office, jamais /v1/auth/*', () => {
    expect(isRefreshableRoute(`${API}/v1/admin/dashboard`)).toBe(true);
    expect(isRefreshableRoute(`${API}/v1/admin`)).toBe(true);
    expect(isRefreshableRoute(`${API}/v1/auth/login`)).toBe(false);
    expect(isRefreshableRoute(`${API}/v1/auth/refresh`)).toBe(false);
    expect(isRefreshableRoute(`${API}/v1/auth/me`)).toBe(false);
    expect(isRefreshableRoute(`${API}/v1/forms/contact`)).toBe(false);
    expect(isRefreshableRoute(`${API}/v1/administration`)).toBe(false);
  });
});

describe('withSessionRefresh', () => {
  it('renouvelle la session puis rejoue la requête, corps compris', async () => {
    const api = fakeApi();
    const refresh = vi.fn(async (): Promise<RefreshOutcome> => {
      api.state.renewed = true;
      return 'refreshed';
    });
    const onExpired = vi.fn();
    const send = withSessionRefresh({ send: api.send, refresh, onExpired });

    const response = await send(
      new Request(`${API}/v1/admin/requests/req_1/notes`, { method: 'POST', body: '{"body":"Rappel"}' }),
    );

    expect(response.status).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(api.seen).toEqual([
      { url: '/v1/admin/requests/req_1/notes', body: '{"body":"Rappel"}', csrf: null },
      { url: '/v1/admin/requests/req_1/notes', body: '{"body":"Rappel"}', csrf: null },
    ]);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('partage un seul renouvellement entre les requêtes refusées en même temps', async () => {
    const api = fakeApi();
    const control = deferredRefresh();
    const send = withSessionRefresh({ send: api.send, refresh: control.refresh, onExpired: vi.fn() });

    const pending = Promise.all(
      ['dashboard', 'requests', 'appointments'].map((path) => send(new Request(`${API}/v1/admin/${path}`))),
    );
    await vi.waitFor(() => expect(control.refresh).toHaveBeenCalled());
    await vi.waitFor(() => expect(api.send).toHaveBeenCalledTimes(3));
    api.state.renewed = true;
    control.resolve('refreshed');
    const responses = await pending;

    expect(control.refresh).toHaveBeenCalledTimes(1);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    expect(api.send).toHaveBeenCalledTimes(6);
  });

  it('rejoue sans nouveau renouvellement une requête partie avant le renouvellement', async () => {
    const api = fakeApi();
    let releaseLate: () => void = () => {};
    const late = new Promise<void>((done) => {
      releaseLate = done;
    });
    const refresh = vi.fn(async (): Promise<RefreshOutcome> => {
      api.state.renewed = true;
      return 'refreshed';
    });
    const send = withSessionRefresh({
      send: async (request) => {
        // Réponse 401 de la requête « lente » reçue après le renouvellement.
        if (request.url.endsWith('/slow') && !api.state.renewed) {
          await late;
          return new Response(null, { status: 401 });
        }
        return api.send(request);
      },
      refresh,
      onExpired: vi.fn(),
    });

    const slow = send(new Request(`${API}/v1/admin/slow`));
    expect((await send(new Request(`${API}/v1/admin/fast`))).status).toBe(200);
    releaseLate();
    expect((await slow).status).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('ne boucle pas : un 401 après le rejeu est rendu tel quel', async () => {
    const api = fakeApi();
    const refresh = vi.fn(async (): Promise<RefreshOutcome> => 'refreshed');
    const onExpired = vi.fn();
    const send = withSessionRefresh({ send: api.send, refresh, onExpired });

    const response = await send(new Request(`${API}/v1/admin/dashboard`));

    expect(response.status).toBe(401);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(api.send).toHaveBeenCalledTimes(2);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('renouvellement refusé : retour à la connexion, sans rejeu', async () => {
    const api = fakeApi();
    const onExpired = vi.fn();
    const send = withSessionRefresh({
      send: api.send,
      refresh: async () => 'expired',
      onExpired,
    });

    const response = await send(new Request(`${API}/v1/admin/dashboard`));

    expect(response.status).toBe(401);
    expect(api.send).toHaveBeenCalledTimes(1);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('API injoignable pendant le renouvellement : le 401 est rendu, sans redirection', async () => {
    const api = fakeApi();
    const onExpired = vi.fn();
    const send = withSessionRefresh({
      send: api.send,
      refresh: () => Promise.reject(new TypeError('Failed to fetch')),
      onExpired,
    });

    expect((await send(new Request(`${API}/v1/admin/dashboard`))).status).toBe(401);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('ne renouvelle jamais pour les routes /v1/auth/*', async () => {
    const api = fakeApi();
    const refresh = vi.fn(async (): Promise<RefreshOutcome> => 'refreshed');
    const send = withSessionRefresh({ send: api.send, refresh, onExpired: vi.fn() });

    for (const path of ['login', 'verify-otp', 'refresh', 'logout', 'me'])
      expect((await send(new Request(`${API}/v1/auth/${path}`, { method: 'POST' }))).status).toBe(401);

    expect(refresh).not.toHaveBeenCalled();
    expect(api.send).toHaveBeenCalledTimes(5);
  });

  it('met à jour la copie rejouée (jeton CSRF renouvelé)', async () => {
    const api = fakeApi();
    const send = withSessionRefresh({
      send: api.send,
      refresh: async () => {
        api.state.renewed = true;
        return 'refreshed';
      },
      onExpired: vi.fn(),
      prepareReplay: (request) => {
        request.headers.set('X-CSRF-Token', 'nouveau');
        return request;
      },
    });

    await send(
      new Request(`${API}/v1/admin/users/usr_1`, { method: 'PATCH', headers: { 'X-CSRF-Token': 'ancien' } }),
    );

    expect(api.seen.map((entry) => entry.csrf)).toEqual(['ancien', 'nouveau']);
  });
});
