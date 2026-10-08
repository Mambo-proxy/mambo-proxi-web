import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/node';
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

beforeEach(() => resetMaintenanceCache());
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
    const response = await proxy(request('/admin', { mp_rt: 'jeton' }));
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('proxy — maintenance', () => {
  it('site ouvert quand la maintenance est désactivée', async () => {
    maintenance(false);
    const response = await proxy(request('/services'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('affiche la page de maintenance (503) quand elle est activée dans les Paramètres', async () => {
    maintenance(true);
    const response = await proxy(request('/services'));
    expect(response.status).toBe(503);
    expect(response.headers.get('x-middleware-rewrite')).toContain('/maintenance');
    expect(response.headers.get('retry-after')).toBe('3600');
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
