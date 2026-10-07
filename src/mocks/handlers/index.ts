import { http } from 'msw';
import { problem } from '../problem';
import { appointmentHandlers } from './appointments';
import { catalogueHandlers } from './catalogue';
import { contractHandlers } from './contract';
import { eventHandlers } from './events';
import { formHandlers } from './forms';
import { newsletterHandlers } from './newsletter';
import { pageHandlers } from './pages';
import { partnerHandlers } from './partners';

/**
 * Ordre de priorité : gestionnaires dédiés (filtres, pagination, validation), puis exemples du contrat,
 * puis une erreur explicite pour toute route de l'API qui ne serait pas simulée.
 */
export const handlers = [
  ...catalogueHandlers,
  ...appointmentHandlers,
  ...formHandlers,
  ...newsletterHandlers,
  ...partnerHandlers,
  ...eventHandlers,
  ...pageHandlers,
  ...contractHandlers,
  http.all('*/v1/*', ({ request }) =>
    problem(501, `Route non simulée : ${request.method} ${new URL(request.url).pathname}.`),
  ),
];
