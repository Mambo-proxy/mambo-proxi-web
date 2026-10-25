import { getApiBaseUrl, isApiMocking } from '@/lib/api/config';

/** `interval` : envoi périodique ; `unload` : page masquée ou quittée (la requête doit survivre à la page). */
export type SendMode = 'interval' | 'unload';
export type Sender = (body: string, mode: SendMode) => void | Promise<unknown>;

/** JSON envoyé en `text/plain` : requête « simple », sans requête préalable CORS (accepté par le contrat). */
const CONTENT_TYPE = 'text/plain;charset=UTF-8';

/**
 * Envoi d'un lot à `POST /v1/analytics/events`, sans cookie (`credentials: 'omit'`) et sans jamais bloquer
 * l'interface : `navigator.sendBeacon` quand la page se ferme, sinon `fetch` avec `keepalive`. Toute erreur est
 * ignorée (mesure perdue plutôt qu'un message à l'utilisateur). Avec les mocks, le lot est résolu par les
 * gestionnaires MSW du navigateur (aucune requête réseau), chargés au premier envoi seulement : importer le transport
 * charge les mocks, qui pèseraient sinon sur chaque page ; rien n'est envoyé hors du navigateur.
 */
export const sendBatch: Sender = (body, mode) => {
  if (typeof window === 'undefined') return;
  const url = `${getApiBaseUrl()}/v1/analytics/events`;
  if (isApiMocking)
    return import('@/lib/api/transport')
      .then(({ transport }) =>
        transport(new Request(url, { method: 'POST', body, headers: { 'Content-Type': CONTENT_TYPE } })),
      )
      .catch(() => undefined);
  if (mode === 'unload' && typeof navigator.sendBeacon === 'function') {
    try {
      // Une chaîne est envoyée en `text/plain;charset=UTF-8`.
      if (navigator.sendBeacon(url, body)) return;
    } catch {
      // Balise refusée (quota, adresse) : repli sur fetch.
    }
  }
  return fetch(url, {
    method: 'POST',
    body,
    keepalive: true,
    credentials: 'omit',
    headers: { 'Content-Type': CONTENT_TYPE },
  }).catch(() => undefined);
};
