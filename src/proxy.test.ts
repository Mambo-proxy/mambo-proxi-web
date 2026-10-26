import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/node';
import { resetSessionRenewals } from '@/lib/admin/session-renewal';
import { proxy, resetMaintenanceCache } from './proxy';

function request(path: string, cookies: Record<string, string> = {}) {
  const headers = new Headers();
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookie) headers.set('cookie', cookie);
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

function maintenance(enabled: boolean) {
  server.use(
    http.get('*/v1/site/settings', () =>
      HttpResponse.json({ features: { maintenanceMode: enabled, newsletterTracking: false } }),
    ),
  );
}

beforeEach(() => {
  resetMaintenanceCache();
  resetSessionRenewals();
});
afterEach(() => vi.unstubAllEnvs());

describe('proxy — back-office', () => {
  it('redirige vers la connexion sans session, en conservant la page demandée', async () => {
    const response = await proxy(request('/admin/demandes?statut=NOUVELLE'));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.pathname).toBe('/admin/connexion');
    expect(location.searchParams.get('suite')).toBe('/admin/demandes?statut=NOUVELLE');
  });

  it('laisse accéder aux écrans de connexion et pose une CSP stricte avec nonce', async () => {
    const response = await proxy(request('/admin/connexion'));
    expect(response.headers.get('location')).toBeNull();
    const csp = response.headers.get('content-security-policy') ?? '';
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic' 'sha256-[^']+'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('laisse passer une session ouverte', async () => {
    const response = await proxy(request('/admin', { mp_at: 'acces', mp_rt: 'jeton' }));
    expect(response.headers.get('location')).toBeNull();
  });

  describe('jeton d’accès expiré (cookie mp_at absent)', () => {
    /** Renouvellement simulé : cookies reçus et nombre d'appels. */
    function refreshRoute(status: 204 | 401, setCookies: string[]) {
      const calls: { cookie: string | null; userAgent: string | null; csrf: string | null }[] = [];
      server.use(
        http.post('*/v1/auth/refresh', async ({ request }) => {
          calls.push({
            cookie: request.headers.get('cookie'),
            userAgent: request.headers.get('user-agent'),
            csrf: request.headers.get('x-csrf-token'),
          });
          await new Promise((done) => setTimeout(done, 10));
          const headers = new Headers();
          for (const cookie of setCookies) headers.append('set-cookie', cookie);
          return new HttpResponse(null, { status, headers });
        }),
      );
      return calls;
    }

    it('renouvelle la session avant le rendu : cookies transmis au navigateur et à la page', async () => {
      const calls = refreshRoute(204, [
        'mp_at=nouvel-acces; Path=/; HttpOnly; SameSite=Lax; Max-Age=900',
        'mp_rt=nouveau-jeton; Path=/; HttpOnly; SameSite=Lax',
        'mp_csrf=nouveau-csrf; Path=/; SameSite=Lax',
      ]);
      const incoming = request('/admin/demandes', { mp_rt: 'jeton', mp_csrf: 'ancien', mp_td: 'appareil' });
      incoming.headers.set('user-agent', 'Navigateur de test');

      const response = await proxy(incoming);

      expect(response.headers.get('location')).toBeNull();
      expect(calls).toEqual([{ cookie: 'mp_rt=jeton', userAgent: 'Navigateur de test', csrf: null }]);
      expect(response.headers.getSetCookie().map((cookie) => cookie.split(';')[0])).toEqual([
        'mp_at=nouvel-acces',
        'mp_rt=nouveau-jeton',
        'mp_csrf=nouveau-csrf',
      ]);
      // En-têtes de la requête transmise aux Server Components.
      expect(response.headers.get('x-middleware-request-cookie')).toBe(
        'mp_rt=nouveau-jeton; mp_csrf=nouveau-csrf; mp_td=appareil; mp_at=nouvel-acces',
      );
    });

    it('un seul renouvellement pour des chargements simultanés (préchargements)', async () => {
      const calls = refreshRoute(204, ['mp_at=nouvel-acces; Path=/', 'mp_rt=nouveau-jeton; Path=/']);

      const responses = await Promise.all(
        ['/admin', '/admin/demandes', '/admin/rendez-vous'].map((path) =>
          proxy(request(path, { mp_rt: 'jeton' })),
        ),
      );

      expect(calls).toHaveLength(1);
      for (const response of responses)
        expect(response.headers.getSetCookie().map((cookie) => cookie.split(';')[0])).toContain(
          'mp_at=nouvel-acces',
        );
    });

    it('renouvellement refusé : connexion en conservant la page demandée, cookies effacés', async () => {
      refreshRoute(401, [
        'mp_at=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'mp_rt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);

      const response = await proxy(request('/admin/demandes?statut=NOUVELLE', { mp_rt: 'revoque' }));

      expect(response.status).toBe(307);
      const location = new URL(response.headers.get('location') ?? '');
      expect(location.pathname).toBe('/admin/connexion');
      expect(location.searchParams.get('suite')).toBe('/admin/demandes?statut=NOUVELLE');
      expect(response.headers.getSetCookie().map((cookie) => cookie.split(';')[0])).toEqual([
        'mp_at=',
        'mp_rt=',
      ]);
    });

    it('API injoignable : la page est servie sans renouvellement (pas de déconnexion)', async () => {
      server.use(http.post('*/v1/auth/refresh', () => HttpResponse.error()));

      const response = await proxy(request('/admin', { mp_rt: 'jeton' }));

      expect(response.headers.get('location')).toBeNull();
      expect(response.headers.getSetCookie()).toEqual([]);
    });

    it('pas de renouvellement sur les écrans de connexion', async () => {
      const calls = refreshRoute(204, []);
      await proxy(request('/admin/connexion', { mp_rt: 'jeton' }));
      expect(calls).toEqual([]);
    });
  });
});

describe('proxy — maintenance', () => {
  it('site ouvert quand la maintenance est désactivée', async () => {
    maintenance(false);
    const response = await proxy(request('/services'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/fr/services');
  });

  it('affiche la page de maintenance (503) quand elle est activée dans les Paramètres', async () => {
    maintenance(true);
    const response = await proxy(request('/services'));
    expect(response.status).toBe(503);
    expect(response.headers.get('x-middleware-rewrite')).toContain('/maintenance');
    expect(response.headers.get('retry-after')).toBe('3600');
  });

  it('page de maintenance dans la langue de l’adresse', async () => {
    maintenance(true);
    const response = await proxy(request('/en/about-us'));
    expect(response.status).toBe(503);
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/en/maintenance');
  });

  it('les membres de l’équipe connectés voient toujours le site', async () => {
    maintenance(true);
    const response = await proxy(request('/services', { mp_at: 'jeton' }));
    expect(response.status).toBe(200);
  });

  it('MAINTENANCE_MODE=on force la maintenance même si l’API ne répond pas', async () => {
    vi.stubEnv('MAINTENANCE_MODE', 'on');
    server.use(http.get('*/v1/site/settings', () => HttpResponse.error()));
    const response = await proxy(request('/'));
    expect(response.status).toBe(503);
  });

  it('API injoignable : le site reste ouvert', async () => {
    server.use(http.get('*/v1/site/settings', () => HttpResponse.error()));
    const response = await proxy(request('/'));
    expect(response.status).toBe(200);
  });
});

describe('proxy — langues', () => {
  beforeEach(() => maintenance(false));

  it('français sans préfixe', async () => {
    const response = await proxy(request('/qui-sommes-nous'));
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/fr/qui-sommes-nous');
  });

  it('anglais sous /en, avec les adresses traduites', async () => {
    const response = await proxy(request('/en/about-us'));
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/en/qui-sommes-nous');
  });

  it('le préfixe /fr est retiré', async () => {
    const response = await proxy(request('/fr/contact'));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/contact');
  });

  it('pages internes hors langue', async () => {
    const response = await proxy(request('/dev/ui'));
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });
});
