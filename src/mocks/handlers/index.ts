import { http } from 'msw';
import { problem } from '../problem';
import { catalogueHandlers } from './catalogue';
import { contractHandlers } from './contract';
import { formHandlers } from './forms';

/**
 * Ordre de priorité : gestionnaires dédiés (filtres, pagination, validation), puis exemples du contrat,
 * puis une erreur explicite pour toute route de l'API qui ne serait pas simulée.
 */
export const handlers = [
  ...catalogueHandlers,
  ...formHandlers,
  ...contractHandlers,
  http.all('*/v1/*', ({ request }) =>
    problem(501, `Route non simulée : ${request.method} ${new URL(request.url).pathname}.`),
  ),
];
