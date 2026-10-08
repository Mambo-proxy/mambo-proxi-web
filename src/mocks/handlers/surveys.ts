import { http, HttpResponse } from 'msw';
import type { PublicSurvey } from '@/lib/api/schema';
import operations from '../data/contract-examples.json';
import { problem } from '../problem';

/** Questionnaire de l'exemple du contrat (« Chef privé », demande MP-2026-0142). */
const survey = operations.find((operation) => operation.operationId === 'getSurvey')?.examples
  .default as PublicSurvey;

/**
 * Jetons de démonstration : `expire` et `deja-rempli` → 410 (lien expiré ou déjà utilisé), `invalide` → 404 ;
 * tout autre jeton ouvre le questionnaire. L'envoi répond 201.
 */
export const surveyHandlers = [
  http.get('*/v1/surveys/:token', ({ params }) => {
    const token = String(params.token);
    if (token === 'invalide') return problem(404, 'Ce lien de questionnaire n’est pas valide.');
    if (token === 'expire')
      return problem(410, 'Ce lien a expiré : le questionnaire reste ouvert 30 jours après la prestation.');
    if (token === 'deja-rempli') return problem(410, 'Vous avez déjà répondu à ce questionnaire. Merci !');
    return HttpResponse.json(survey);
  }),

  http.post('*/v1/surveys/:token/responses', () =>
    HttpResponse.json({ message: 'Merci pour votre retour !' }, { status: 201 }),
  ),
];
