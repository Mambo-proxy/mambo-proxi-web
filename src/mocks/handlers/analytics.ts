import { http, HttpResponse } from 'msw';
import type { AnalyticsAction, AnalyticsSummary, Problem } from '@/lib/api/schema';
import {
  buildAnalyticsSummary,
  recordAnalyticsBatch,
  type StoredBatch,
  type StoredEvent,
} from '../data/analytics';
import { can, forbidden } from '../permissions';
import { problem } from '../problem';
import { sessionUser } from '../session';

const MAX_BYTES = 16 * 1024;
const MAX_EVENTS = 50;
const PAST_WINDOW_MS = 24 * 60 * 60 * 1000;
const FUTURE_WINDOW_MS = 5 * 60 * 1000;

const ACTIONS = new Set<AnalyticsAction>([
  'quote',
  'whatsapp',
  'call',
  'email',
  'participate',
  'newsletter',
  'appointment',
  'sign_up',
  'contact',
  'application',
  'partner',
  'training',
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERIODS = new Set<AnalyticsSummary['period']>(['7d', '30d', '90d']);

type FieldError = NonNullable<Problem['errors']>[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (value: unknown, max: number) =>
  value === undefined || value === null || (typeof value === 'string' && value.length <= max);

/** Erreurs de validation d'un événement (`AnalyticsPageView` ou `AnalyticsActionEvent`). */
function eventErrors(event: unknown, index: number): FieldError[] {
  const at = (field: string) => `events.${index}.${field}`;
  if (!isRecord(event))
    return [{ path: `events.${index}`, code: 'invalid_type', message: 'Événement invalide.' }];
  const errors: FieldError[] = [];
  if (event.type !== 'page_view' && event.type !== 'action')
    errors.push({ path: at('type'), code: 'invalid_enum', message: 'Type d’événement inconnu.' });
  if (typeof event.path !== 'string' || !event.path.startsWith('/') || event.path.length > 300)
    errors.push({ path: at('path'), code: 'invalid_format', message: 'Adresse de page invalide.' });
  if (event.lang !== 'fr' && event.lang !== 'en')
    errors.push({ path: at('lang'), code: 'invalid_enum', message: 'Langue inconnue.' });
  if (typeof event.occurredAt !== 'string' || Number.isNaN(Date.parse(event.occurredAt)))
    errors.push({ path: at('occurredAt'), code: 'invalid_format', message: 'Date invalide.' });
  if (event.device !== undefined && !['mobile', 'tablet', 'desktop'].includes(String(event.device)))
    errors.push({ path: at('device'), code: 'invalid_enum', message: 'Appareil inconnu.' });
  if (event.type === 'page_view' && !optionalString(event.referrerHost, 253))
    errors.push({ path: at('referrerHost'), code: 'too_long', message: 'Domaine d’origine invalide.' });
  if (event.type === 'action') {
    if (!ACTIONS.has(event.action as AnalyticsAction))
      errors.push({ path: at('action'), code: 'invalid_enum', message: 'Action inconnue.' });
    if (event.step !== undefined && event.step !== 'click' && event.step !== 'submit')
      errors.push({ path: at('step'), code: 'invalid_enum', message: 'Étape inconnue.' });
    if (!optionalString(event.target, 120))
      errors.push({ path: at('target'), code: 'too_long', message: 'Contenu concerné trop long.' });
    if (!optionalString(event.placement, 40))
      errors.push({ path: at('placement'), code: 'too_long', message: 'Emplacement trop long.' });
  }
  return errors;
}

/**
 * Mesure d'audience (`POST /v1/analytics/events`, `GET /v1/admin/analytics/summary`) : le lot est lu en texte
 * (`application/json` ou `text/plain` de `navigator.sendBeacon`), validé comme l'API (16 Kio, 50 événements,
 * `visitorId` seulement avec consentement), puis les événements datés de moins de 24 h (et pas plus de 5 min dans
 * le futur) hors back-office sont comptés ; les autres sont rejetés (`rejected`). Les statistiques ajoutent ces
 * événements aux données de démonstration. Le contrôle de l'origine et la limite de débit ne sont pas simulés.
 */
export const analyticsHandlers = [
  http.post('*/v1/analytics/events', async ({ request }) => {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BYTES)
      return problem(413, 'Envoyez au plus 50 événements et 16 Kio par lot.');
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return problem(400, 'Le contenu envoyé n’est pas un JSON valide.');
    }
    if (!isRecord(body)) return problem(400, 'Le contenu envoyé n’est pas un JSON valide.');

    const errors: FieldError[] = [];
    if (typeof body.consent !== 'boolean')
      errors.push({ path: 'consent', code: 'required', message: 'Indiquez le consentement.' });
    if (body.visitorId !== undefined) {
      if (body.consent !== true)
        errors.push({
          path: 'visitorId',
          code: 'not_allowed',
          message: 'Identifiant de visiteur interdit sans consentement.',
        });
      else if (typeof body.visitorId !== 'string' || !UUID.test(body.visitorId))
        errors.push({
          path: 'visitorId',
          code: 'invalid_format',
          message: 'Identifiant de visiteur invalide.',
        });
    }
    const events = Array.isArray(body.events) ? (body.events as unknown[]) : null;
    if (!events || events.length === 0)
      errors.push({ path: 'events', code: 'too_small', message: 'Envoyez au moins un événement.' });
    else if (events.length > MAX_EVENTS)
      errors.push({ path: 'events', code: 'too_big', message: 'Envoyez au plus 50 événements par lot.' });
    else events.forEach((event, index) => errors.push(...eventErrors(event, index)));
    if (errors.length) return problem(422, 'Certaines données sont invalides.', errors);

    const visitorId = body.consent === true && typeof body.visitorId === 'string' ? body.visitorId : null;
    const now = Date.now();
    const accepted: StoredEvent[] = [];
    let rejected = 0;
    for (const raw of events as Record<string, unknown>[]) {
      const time = Date.parse(String(raw.occurredAt));
      const path = String(raw.path);
      if (
        time < now - PAST_WINDOW_MS ||
        time > now + FUTURE_WINDOW_MS ||
        path === '/admin' ||
        path.startsWith('/admin/')
      ) {
        rejected += 1;
        continue;
      }
      accepted.push({
        type: raw.type === 'action' ? 'action' : 'page_view',
        action: raw.type === 'action' ? (raw.action as AnalyticsAction) : null,
        path,
        lang: raw.lang === 'en' ? 'en' : 'fr',
        occurredAt: new Date(time).toISOString(),
        visitorId,
      });
    }
    const batch: StoredBatch = {
      consent: body.consent === true,
      visitorId,
      events: accepted.map(({ type, action, path }) => ({ type, action, path })),
    };
    recordAnalyticsBatch(batch, accepted);
    return HttpResponse.json({ accepted: accepted.length, rejected }, { status: 202 });
  }),

  http.get('*/v1/admin/analytics/summary', ({ request }) => {
    const user = sessionUser(request);
    if (!user) return problem(401, 'Votre session a expiré. Merci de vous reconnecter.');
    if (!can(user, 'analytics:read')) return forbidden('Vous n’avez pas accès aux statistiques d’audience.');
    const params = new URL(request.url).searchParams;
    const period = (params.get('period') ?? '30d') as AnalyticsSummary['period'];
    const lang = params.get('lang');
    const errors: FieldError[] = [];
    if (!PERIODS.has(period))
      errors.push({ path: 'period', code: 'invalid_enum', message: 'Période attendue : 7d, 30d ou 90d.' });
    if (lang !== null && lang !== 'fr' && lang !== 'en')
      errors.push({ path: 'lang', code: 'invalid_enum', message: 'Langue attendue : fr ou en.' });
    if (errors.length) return problem(422, 'Certains paramètres sont invalides.', errors);
    return HttpResponse.json(buildAnalyticsSummary(period, lang as 'fr' | 'en' | null));
  }),
];
