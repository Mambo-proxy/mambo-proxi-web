import { HttpResponse } from 'msw';
import type { Problem } from '@/lib/api/schema';

/** Base des identifiants `type` des erreurs de l'API (`src/common/problem/problem.ts`). */
export const PROBLEM_TYPE_BASE_URL = 'https://api.mamboproxi.com/problems/';

/** Type et titre par défaut de chaque code, repris de l'API (`problemForStatus` et erreurs métier courantes). */
const DEFAULTS: Record<number, { type: string; title: string }> = {
  400: { type: 'bad-request', title: 'Requête invalide' },
  401: { type: 'unauthorized', title: 'Session expirée' },
  403: { type: 'forbidden', title: 'Action non autorisée' },
  404: { type: 'not-found', title: 'Introuvable' },
  409: { type: 'conflict', title: 'Conflit' },
  410: { type: 'link-expired', title: 'Lien expiré' },
  412: { type: 'precondition-failed', title: 'Version obsolète' },
  413: { type: 'payload-too-large', title: 'Envoi trop volumineux' },
  415: { type: 'unsupported-media-type', title: 'Format non pris en charge' },
  422: { type: 'validation-error', title: 'Certaines informations sont à corriger' },
  423: { type: 'account-locked', title: 'Compte verrouillé' },
  429: { type: 'rate-limited', title: 'Trop de tentatives' },
  500: { type: 'internal-error', title: 'Erreur interne' },
  501: { type: 'not-implemented', title: 'Non simulé' },
  503: { type: 'service-unavailable', title: 'Service indisponible' },
};

/** Détail des erreurs de validation d'un corps (`ZodValidationPipe` et `validationException` de l'API). */
export const VALIDATION_DETAIL = 'Vérifiez les champs signalés puis renvoyez le formulaire.';

export type FieldErrors = NonNullable<Problem['errors']>;

/**
 * Réponse d'erreur RFC 9457 identique à celles de l'API : `type` `https://api.mamboproxi.com/problems/<code>`, titre
 * en français du code HTTP (ou ceux passés dans `options`), `errors` omis s'il est vide.
 */
export function problem(
  status: number,
  detail: string,
  errors?: Problem['errors'],
  options: { type?: string; title?: string } = {},
) {
  const defaults = DEFAULTS[status] ?? { type: 'request-rejected', title: 'Requête refusée' };
  const type = options.type ?? defaults.type;
  const body: Problem = {
    type: /^https?:\/\//.test(type) ? type : `${PROBLEM_TYPE_BASE_URL}${type}`,
    title: options.title ?? defaults.title,
    status,
    detail,
  };
  if (errors && errors.length > 0) body.errors = errors;
  return HttpResponse.json(body, { status, headers: { 'Content-Type': 'application/problem+json' } });
}

/** 422 `validation-error` avec toutes les erreurs de champ (détail de l'API, sauf s'il est précisé). */
export function validationProblem(errors: FieldErrors, detail = VALIDATION_DETAIL) {
  return problem(422, detail, errors);
}

/** 400 `invalid-query` : paramètres de requête invalides (`ZodValidationPipe` de l'API). */
export function invalidQuery(errors: FieldErrors) {
  return problem(400, 'Vérifiez les paramètres de la requête.', errors, { type: 'invalid-query' });
}
