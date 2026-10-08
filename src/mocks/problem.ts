import { HttpResponse } from 'msw';
import type { Problem } from '@/lib/api/schema';

const TITLES: Record<number, string> = {
  400: 'Requête invalide',
  401: 'Non authentifié',
  403: 'Accès refusé',
  404: 'Introuvable',
  409: 'Conflit',
  410: 'Lien expiré',
  422: 'Données invalides',
  423: 'Compte verrouillé',
  429: 'Trop de requêtes',
  500: 'Erreur interne',
  501: 'Non simulé',
};

/** Réponse d'erreur RFC 9457 identique à celles de l'API. */
export function problem(status: number, detail: string, errors?: Problem['errors']) {
  const body: Problem = { type: 'about:blank', title: TITLES[status] ?? 'Erreur', status, detail };
  if (errors) body.errors = errors;
  return HttpResponse.json(body, { status, headers: { 'Content-Type': 'application/problem+json' } });
}
