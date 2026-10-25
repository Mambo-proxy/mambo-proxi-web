import { http, HttpResponse } from 'msw';
import { langOf } from '../data/catalogue';
import { serviceAreas, serviceAreasEn } from '../data/zones';

/**
 * `GET /v1/zones` : exemple du contrat complété des contours de démonstration (`data/zones.ts`). Indépendant des
 * modifications du back-office simulé, pour que les pages publiques restent stables d'un test à l'autre.
 */
export const zoneHandlers = [
  http.get('*/v1/zones', ({ request }) =>
    HttpResponse.json(langOf(request) === 'en' ? serviceAreasEn : serviceAreas),
  ),
];
