import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Page } from '@/lib/api/schema';
import { pagePreviewToken } from '@/mocks/data/admin-pages';
import { server } from '@/mocks/node';
import { api } from './api/server';
import { getPage, previewState } from './pages';

const valid = (key: Parameters<typeof pagePreviewToken>[0]) => pagePreviewToken(key, Date.now() + 60_000);

/** Requêtes envoyées par le transport (adresse et options de cache Next). */
function spyFetch() {
  const spy = vi.spyOn(globalThis, 'fetch');
  return () =>
    spy.mock.calls.map(([input, init]) => ({
      url: input instanceof Request ? input.url : String(input),
      init: init as (RequestInit & { next?: { tags?: string[] } }) | undefined,
    }));
}

/** Les lectures avec jeton d'aperçu échouent avec ce gestionnaire ; les autres suivent les mocks. */
function failPreview(response: () => Response) {
  server.use(
    http.get('*/v1/pages/:key', ({ request }) =>
      new URL(request.url).searchParams.has('preview') ? response() : undefined,
    ),
  );
}

afterEach(() => vi.restoreAllMocks());

describe('getPage', () => {
  it('sans jeton : version publiée, mise en cache avec l’étiquette de la page', async () => {
    const calls = spyFetch();
    const page = await getPage('qui-sommes-nous');
    expect(page?.isPreview).toBe(false);
    expect(previewState(undefined, page)).toBeNull();
    const [call] = calls();
    expect(call?.url).not.toContain('preview=');
    expect(call?.init?.next?.tags).toEqual(['page:qui-sommes-nous']);
    expect(call?.init?.cache).toBeUndefined();
  });

  it('avec un jeton valide : brouillon lu sans cache ni étiquette', async () => {
    const calls = spyFetch();
    const preview = valid('mentions-legales');
    const page = await getPage('mentions-legales', { preview });
    expect(page?.isPreview).toBe(true);
    expect(JSON.stringify(page?.sections)).toContain('Le site est hébergé en France');
    expect(previewState(preview, page)).toBe('draft');
    const [call] = calls();
    expect(call?.url).toContain(`preview=${encodeURIComponent(preview)}`);
    expect(call?.init?.cache).toBe('no-store');
    expect(call?.init?.next).toBeUndefined();
  });

  it('jeton expiré ou d’une autre page : version publiée, aperçu « expiré »', async () => {
    const expired = pagePreviewToken('mentions-legales', Date.now() - 1);
    const page = await getPage('mentions-legales', { preview: expired });
    expect(page?.isPreview).toBe(false);
    expect(previewState(expired, page)).toBe('expired');

    const other = valid('cgu');
    const published = await getPage('mentions-legales', { preview: other });
    expect(previewState(other, published)).toBe('expired');
  });

  it('erreur de l’API pendant l’aperçu : repli sur la version publiée mise en cache, jamais d’erreur', async () => {
    failPreview(() => HttpResponse.json({ title: 'Erreur' }, { status: 500 }));
    const calls = spyFetch();
    const page = await getPage('mission', { preview: valid('mission') });
    expect(page?.isPreview).toBe(false);
    const [, fallback] = calls();
    expect(fallback?.url).not.toContain('preview=');
    expect(fallback?.init?.next?.tags).toEqual(['page:mission']);
  });

  it('API injoignable pendant l’aperçu : repli sur la version publiée', async () => {
    failPreview(() => HttpResponse.error());
    const page = await getPage('mission', { preview: valid('mission') });
    expect(page?.key).toBe('mission');
    expect(page?.isPreview).toBe(false);
  });

  it('page introuvable avec un jeton (jamais publiée, jeton refusé) : null', async () => {
    failPreview(() => HttpResponse.json({ title: 'Introuvable' }, { status: 404 }));
    expect(await getPage('mission', { preview: 'inconnu' })).toBeNull();
  });
});

describe('aperçu simulé (GET /v1/pages/{key}?preview=)', () => {
  it('brouillon anglais : sections traduites, sans cache', async () => {
    const { data, response } = await api.GET('/v1/pages/{key}', {
      params: { path: { key: 'qui-sommes-nous' }, query: { lang: 'en', preview: valid('qui-sommes-nous') } },
    });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const page = data as Page;
    expect(page.isPreview).toBe(true);
    const published = await api.GET('/v1/pages/{key}', {
      params: { path: { key: 'qui-sommes-nous' }, query: { lang: 'en' } },
    });
    expect(page.title).toBe(published.data?.title);
  });
});
