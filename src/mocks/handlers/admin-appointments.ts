import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  AdminAppointmentInput,
  AppointmentAction,
  AppointmentFormat,
  AppointmentReason,
  AppointmentStatus,
  AvailabilityConfig,
  Problem,
} from '@/lib/api/schema';
import { jsonBody } from '../admin-utils';
import { adminAppointments, availabilityState, type MockAppointment } from '../data/admin-appointments';
import { problem } from '../problem';
import { MOCK_FAILURE_EMAIL } from './forms';

const REASONS: AppointmentReason[] = ['DEVIS', 'IMMOBILIER', 'PARTENARIAT', 'RECRUTEMENT', 'AUTRE'];
const FORMATS: AppointmentFormat[] = ['AGENCE', 'TELEPHONE', 'VISIO'];
const STATUSES: AppointmentStatus[] = [
  'A_CONFIRMER',
  'CONFIRME',
  'AUTRE_CRENEAU_PROPOSE',
  'ANNULE',
  'TERMINE',
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+[1-9]\d{6,14}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MINUTE = 60_000;

let sequence = 160;

const byStart = (a: MockAppointment, b: MockAppointment) => a.startsAt.localeCompare(b.startsAt);

/** Début affiché d'un rendez-vous : le créneau proposé s'il y en a un. */
const shownStart = (item: MockAppointment) => item.proposedStartsAt ?? item.startsAt;

function find(id: string) {
  return adminAppointments.find((item) => item.id === id) ?? null;
}

function isUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Autre rendez-vous actif sur le même créneau (saisie manuelle : 409). */
function overlapping(startsAt: string, minutes: number, ignoreId?: string) {
  const begin = new Date(startsAt).getTime();
  const end = begin + minutes * MINUTE;
  return adminAppointments.find((item) => {
    if (item.id === ignoreId || !['A_CONFIRMER', 'CONFIRME'].includes(item.status)) return false;
    const start = new Date(item.startsAt).getTime();
    const finish = new Date(item.endsAt).getTime();
    return begin < finish && end > start;
  });
}

function videoLinkFor(item: { reference: string }) {
  return (
    availabilityState.config.defaultVideoLink ??
    `https://meet.mamboproxi.com/${item.reference.toLowerCase().replace('mp-', 'rdv-')}`
  );
}

/** Validation de la saisie manuelle (chemins d'erreur du contrat : `contact.email`, `startsAt`…). */
function validateInput(body: Partial<AdminAppointmentInput>): Problem['errors'] {
  const errors: NonNullable<Problem['errors']> = [];
  const contact = body.contact ?? ({} as Partial<AdminAppointmentInput['contact']>);
  if (!contact.fullName || contact.fullName.trim().length < 2)
    errors.push({ path: 'contact.fullName', message: 'Indiquez le nom du contact.' });
  if (!contact.email || !EMAIL.test(contact.email))
    errors.push({ path: 'contact.email', message: 'Adresse e-mail invalide.' });
  if (!contact.phone || !PHONE.test(contact.phone))
    errors.push({
      path: 'contact.phone',
      message: 'Numéro de téléphone invalide (indicatif international).',
    });
  if (!body.reason || !REASONS.includes(body.reason))
    errors.push({ path: 'reason', message: 'Choisissez le motif du rendez-vous.' });
  if (!body.format || !FORMATS.includes(body.format))
    errors.push({ path: 'format', message: 'Choisissez le format du rendez-vous.' });
  if (!body.startsAt || Number.isNaN(new Date(body.startsAt).getTime()))
    errors.push({ path: 'startsAt', message: 'Indiquez la date et l’heure du rendez-vous.' });
  const duration = body.durationMinutes ?? 90;
  if (!Number.isInteger(duration) || duration < 15 || duration > 480)
    errors.push({ path: 'durationMinutes', message: 'La durée doit être comprise entre 15 min et 8 h.' });
  if (body.videoLink && !isUrl(body.videoLink))
    errors.push({ path: 'videoLink', message: 'Lien de visio invalide.' });
  if (body.notes && body.notes.length > 2000)
    errors.push({ path: 'notes', message: '2 000 caractères au maximum.' });
  return errors;
}

/** Validation des disponibilités (`rules[0].endTime`, `exceptions[1].date`…). */
function validateConfig(body: Partial<AvailabilityConfig>): Problem['errors'] {
  const errors: NonNullable<Problem['errors']> = [];
  (body.rules ?? []).forEach((rule, index) => {
    const path = `rules[${index}]`;
    if (!Number.isInteger(rule.weekday) || rule.weekday < 1 || rule.weekday > 7)
      errors.push({ path: `${path}.weekday`, message: 'Jour invalide.' });
    if (!TIME.test(rule.startTime)) errors.push({ path: `${path}.startTime`, message: 'Heure invalide.' });
    if (!TIME.test(rule.endTime)) errors.push({ path: `${path}.endTime`, message: 'Heure invalide.' });
    else if (rule.endTime <= rule.startTime)
      errors.push({ path: `${path}.endTime`, message: 'L’heure de fin doit suivre l’heure de début.' });
    if (!Number.isInteger(rule.slotMinutes) || rule.slotMinutes < 15 || rule.slotMinutes > 240)
      errors.push({ path: `${path}.slotMinutes`, message: 'Durée comprise entre 15 min et 4 h.' });
    if (!rule.formats?.length)
      errors.push({ path: `${path}.formats`, message: 'Choisissez au moins un format.' });
  });
  (body.exceptions ?? []).forEach((exception, index) => {
    const path = `exceptions[${index}]`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.date ?? ''))
      errors.push({ path: `${path}.date`, message: 'Date invalide.' });
    if (!exception.closed) {
      if (!exception.startTime || !TIME.test(exception.startTime))
        errors.push({ path: `${path}.startTime`, message: 'Heure invalide.' });
      if (!exception.endTime || !TIME.test(exception.endTime))
        errors.push({ path: `${path}.endTime`, message: 'Heure invalide.' });
      else if (exception.startTime && exception.endTime <= exception.startTime)
        errors.push({ path: `${path}.endTime`, message: 'L’heure de fin doit suivre l’heure de début.' });
    }
  });
  const minNotice = body.minNoticeHours ?? -1;
  if (!Number.isInteger(minNotice) || minNotice < 0 || minNotice > 168)
    errors.push({ path: 'minNoticeHours', message: 'Délai compris entre 0 et 168 h.' });
  const maxAdvance = body.maxAdvanceDays ?? 0;
  if (!Number.isInteger(maxAdvance) || maxAdvance < 7 || maxAdvance > 365)
    errors.push({ path: 'maxAdvanceDays', message: 'Horizon compris entre 7 et 365 jours.' });
  if (body.defaultVideoLink && !isUrl(body.defaultVideoLink))
    errors.push({ path: 'defaultVideoLink', message: 'Lien de visio invalide.' });
  return errors;
}

/** Back-office — Rendez-vous et disponibilités (`/v1/admin/appointments*`, `/v1/admin/availability`). */
export const adminAppointmentHandlers: HttpHandler[] = [
  http.get('*/v1/admin/appointments', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const from = params.get('from');
    const to = params.get('to');
    const status = params.get('status') as AppointmentStatus | null;
    if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to)))
      return problem(422, 'Les dates de début et de fin sont obligatoires.', [
        { path: 'from', message: 'Date obligatoire.' },
      ]);
    if (status && !STATUSES.includes(status)) return problem(422, 'Statut inconnu.');
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    const data = adminAppointments
      .filter((item) => {
        const time = new Date(shownStart(item)).getTime();
        return time >= start && time < end && (!status || item.status === status);
      })
      .sort(byStart);
    const pending = adminAppointments.filter((item) => item.status === 'A_CONFIRMER').sort(byStart);
    return HttpResponse.json({ data, pending });
  }),

  http.get('*/v1/admin/appointments/:id', ({ params }) => {
    const item = find(String(params.id));
    return item ? HttpResponse.json(item) : problem(404, 'Rendez-vous introuvable.');
  }),

  http.post('*/v1/admin/appointments', async ({ request }) => {
    const body = await jsonBody<Partial<AdminAppointmentInput>>(request);
    if (body.contact?.email === MOCK_FAILURE_EMAIL)
      return problem(500, 'Une erreur est survenue. Merci de réessayer dans quelques instants.');
    const errors = validateInput(body);
    if (errors?.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const input = body as AdminAppointmentInput;
    const minutes = input.durationMinutes ?? 90;
    const conflict = overlapping(input.startsAt, minutes);
    if (conflict)
      return problem(
        409,
        `Ce créneau chevauche le rendez-vous de ${conflict.contact.fullName}. Choisissez une autre heure.`,
      );
    sequence += 1;
    const reference = `MP-2026-0${sequence}`;
    const now = new Date().toISOString();
    const created: MockAppointment = {
      id: `apt_${sequence}`,
      reference,
      contact: {
        id: `ctc_${sequence}`,
        fullName: input.contact.fullName.trim(),
        initials: input.contact.fullName
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        email: input.contact.email,
        phone: input.contact.phone,
        country: input.contact.country ?? null,
        city: input.contact.city ?? null,
        profile: 'PARTICULIER',
      },
      reason: input.reason,
      format: input.format,
      startsAt: new Date(input.startsAt).toISOString(),
      endsAt: new Date(new Date(input.startsAt).getTime() + minutes * MINUTE).toISOString(),
      status: 'CONFIRME',
      proposedStartsAt: null,
      location:
        input.format === 'AGENCE' ? input.location || availabilityState.config.agencyAddress || null : null,
      videoLink: input.format === 'VISIO' ? input.videoLink || videoLinkFor({ reference }) : null,
      message: null,
      notes: input.notes || null,
      reminderSentAt: null,
      createdAt: now,
    };
    adminAppointments.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch('*/v1/admin/appointments/:id', async ({ params, request }) => {
    const item = find(String(params.id));
    if (!item) return problem(404, 'Rendez-vous introuvable.');
    const body = await jsonBody<Partial<AppointmentAction>>(request);
    const closed = item.status === 'ANNULE' || item.status === 'TERMINE';
    switch (body.action) {
      case 'confirm': {
        if (item.status !== 'A_CONFIRMER' && item.status !== 'AUTRE_CRENEAU_PROPOSE')
          return problem(409, 'Ce rendez-vous n’est plus à confirmer.');
        if (item.proposedStartsAt) {
          const length = new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime();
          item.startsAt = item.proposedStartsAt;
          item.endsAt = new Date(new Date(item.startsAt).getTime() + length).toISOString();
          item.proposedStartsAt = null;
        }
        item.status = 'CONFIRME';
        if ('location' in body && body.location) item.location = body.location;
        if (item.format === 'VISIO')
          item.videoLink = ('videoLink' in body && body.videoLink) || item.videoLink || videoLinkFor(item);
        if (item.format === 'AGENCE' && !item.location)
          item.location = availabilityState.config.agencyAddress ?? null;
        break;
      }
      case 'propose': {
        if (closed) return problem(409, 'Ce rendez-vous est clos\u00A0: impossible de proposer un créneau.');
        const proposed = 'proposedStartsAt' in body ? body.proposedStartsAt : undefined;
        if (!proposed || Number.isNaN(Date.parse(proposed)))
          return problem(422, 'Indiquez le créneau proposé.', [
            { path: 'proposedStartsAt', message: 'Indiquez la date et l’heure proposées.' },
          ]);
        if (new Date(proposed).getTime() < Date.now())
          return problem(422, 'Le créneau proposé doit être à venir.', [
            { path: 'proposedStartsAt', message: 'Choisissez une date à venir.' },
          ]);
        item.proposedStartsAt = new Date(proposed).toISOString();
        item.status = 'AUTRE_CRENEAU_PROPOSE';
        break;
      }
      case 'cancel':
        if (closed) return problem(409, 'Ce rendez-vous est déjà clos.');
        item.status = 'ANNULE';
        item.proposedStartsAt = null;
        break;
      case 'complete':
        if (item.status !== 'CONFIRME')
          return problem(409, 'Seul un rendez-vous confirmé peut être terminé.');
        item.status = 'TERMINE';
        break;
      case 'notes': {
        const notes = 'notes' in body ? (body.notes ?? null) : null;
        if (notes && notes.length > 2000)
          return problem(422, 'Note trop longue.', [
            { path: 'notes', message: '2 000 caractères au maximum.' },
          ]);
        item.notes = notes?.trim() || null;
        break;
      }
      default:
        return problem(422, 'Action inconnue.', [{ path: 'action', message: 'Action inconnue.' }]);
    }
    return HttpResponse.json(item);
  }),

  http.get('*/v1/admin/availability', () => HttpResponse.json(availabilityState.config)),

  http.put('*/v1/admin/availability', async ({ request }) => {
    const body = await jsonBody<Partial<AvailabilityConfig>>(request);
    if (!Array.isArray(body.rules) || !Array.isArray(body.exceptions))
      return problem(422, 'Règles et fermetures obligatoires.');
    const errors = validateConfig(body);
    if (errors?.length) return problem(422, 'Certains réglages sont à corriger.', errors);
    const config = body as AvailabilityConfig;
    availabilityState.config = {
      ...config,
      rules: config.rules
        .map((rule, index) => ({ ...rule, id: rule.id ?? `rul_${Date.now().toString(36)}_${index}` }))
        .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
      exceptions: config.exceptions
        .map((exception, index) => ({
          ...exception,
          id: exception.id ?? `exc_${Date.now().toString(36)}_${index}`,
          startTime: exception.closed ? null : (exception.startTime ?? null),
          endTime: exception.closed ? null : (exception.endTime ?? null),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
    return HttpResponse.json(availabilityState.config);
  }),
];
