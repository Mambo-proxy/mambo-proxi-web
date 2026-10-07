import { http, HttpResponse } from 'msw';
import type { Page } from '@/lib/api/schema';
import { pages } from '../data/pages';

/** `GET /v1/pages/:key` : pages relevées dans les maquettes ; les autres retombent sur les exemples du contrat. */
export const pageHandlers = [
  http.get('*/v1/pages/:key', ({ params }) => {
    const page = pages[String(params.key) as Page['key']];
    return page ? HttpResponse.json(page) : undefined;
  }),
];
