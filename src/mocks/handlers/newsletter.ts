import { http, HttpResponse } from 'msw';
import { problem } from '../problem';
import { MOCK_FAILURE_EMAIL } from './forms';

/** Adresse simulée comme déjà inscrite et confirmée. */
export const MOCK_SUBSCRIBED_EMAIL = 'deja@exemple.fr';

/** Inscription à la newsletter (double opt-in) : succès, déjà inscrit, erreur. */
export const newsletterHandlers = [
  http.post('*/v1/newsletter/subscriptions', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = body?.email?.trim().toLowerCase() ?? '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return problem(422, 'Certains champs sont invalides.', [
        { path: 'email', code: 'format', message: 'Merci d’indiquer une adresse e-mail valide.' },
      ]);
    }
    if (email === MOCK_FAILURE_EMAIL) {
      return problem(500, 'Une erreur est survenue. Merci de réessayer dans quelques instants.');
    }
    return HttpResponse.json(
      {
        message: 'Merci ! Confirmez votre inscription dans l’e-mail que nous venons de vous envoyer.',
        alreadySubscribed: email === MOCK_SUBSCRIBED_EMAIL,
      },
      { status: 202 },
    );
  }),
];
