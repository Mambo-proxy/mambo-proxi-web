import { http, HttpResponse } from 'msw';
import type { Page } from '@/lib/api/schema';
import { legalPages } from '../data/legal-pages';
import { pages, pagesEn } from '../data/pages';

/**
 * `GET /v1/pages/:key` : pages relevées dans les maquettes, en anglais si elles sont traduites (`?lang=en`) ; les
 * autres retombent sur les exemples du contrat.
 */
export const pageHandlers = [
  http.get('*/v1/pages/:key', ({ params, request }) => {
    const key = String(params.key) as Page['key'];
    const lang = new URL(request.url).searchParams.get('lang');
    const page =
      (lang === 'en' ? pagesEn[key] : undefined) ?? pages[key] ?? legalPages[key as keyof typeof legalPages];
    return page ? HttpResponse.json(page) : undefined;
  }),
];
