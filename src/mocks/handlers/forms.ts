import { http, HttpResponse } from 'msw';
import type { SubmissionAccepted } from '@/lib/api/schema';
import { problem } from '../problem';

const ACCEPTED_MESSAGE =
  'Merci, votre demande est bien envoyée ! Vous recevrez un e-mail de confirmation dans quelques instants.';

/** Adresse e-mail qui déclenche une erreur serveur, pour tester l'affichage des erreurs. */
export const MOCK_FAILURE_EMAIL = 'erreur@exemple.fr';

let sequence = 142;

/** Premier champ `email` trouvé dans le corps, à n'importe quelle profondeur (`contact.email`…). */
function findEmail(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return null;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'email' && typeof child === 'string') return child;
    const nested = findEmail(child);
    if (nested) return nested;
  }
  return null;
}

async function readEmail(request: Request): Promise<string | null> {
  try {
    const body: unknown = request.headers.get('Content-Type')?.includes('multipart/form-data')
      ? Object.fromEntries(await request.formData())
      : await request.json();
    return findEmail(body);
  } catch {
    return null;
  }
}

const FORM_ENDPOINTS = [
  '/v1/quote-requests',
  '/v1/contact-messages',
  '/v1/appointments',
  '/v1/registrations',
  '/v1/training-requests',
  '/v1/partner-requests',
  '/v1/event-registrations',
  '/v1/job-applications',
];

/** Envois des formulaires publics → `201 { reference, message }` (docs/05 §3.1). */
export const formHandlers = FORM_ENDPOINTS.map((path) =>
  http.post(`*${path}`, async ({ request }) => {
    if ((await readEmail(request)) === MOCK_FAILURE_EMAIL) {
      return problem(500, 'Une erreur est survenue. Merci de réessayer dans quelques instants.');
    }
    sequence += 1;
    const body: SubmissionAccepted = {
      reference: `MP-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`,
      message: ACCEPTED_MESSAGE,
    };
    return HttpResponse.json(body, { status: 201 });
  }),
);
