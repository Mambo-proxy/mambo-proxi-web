import { http, HttpResponse } from 'msw';
import type { Page } from '@/lib/api/schema';
import { findAdminPage, isPagePreviewToken, toPreviewPage } from '../data/admin-pages';
import { legalPages, legalPagesEn } from '../data/legal-pages';
import { pages, pagesEn } from '../data/pages';

/**
 * `GET /v1/pages/:key` : pages relevées dans les maquettes, en anglais si elles sont traduites (`?lang=en`) ; les
 * autres retombent sur les exemples du contrat. Avec un jeton d'aperçu simulé valide pour la page (`?preview=`,
 * délivré par `GET /v1/admin/pages/{key}/preview-token`) : le brouillon des Pages & textes simulées, sans cache
 * (`isPreview: true`) ; jeton expiré ou d'une autre page : la version publiée, comme l'API.
 */
export const pageHandlers = [
  http.get('*/v1/pages/:key', ({ params, request }) => {
    const key = String(params.key) as Page['key'];
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang');
    const stored = findAdminPage(key);
    if (stored && isPagePreviewToken(url.searchParams.get('preview'), key))
      return HttpResponse.json(toPreviewPage(stored, lang === 'en' ? 'en' : 'fr'), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    const legal = lang === 'en' ? legalPagesEn : legalPages;
    const page =
      (lang === 'en' ? pagesEn[key] : undefined) ?? pages[key] ?? legal[key as keyof typeof legalPages];
    return page ? HttpResponse.json(page) : undefined;
  }),
];
