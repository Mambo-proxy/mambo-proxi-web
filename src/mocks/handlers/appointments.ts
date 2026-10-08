import { differenceInCalendarDays, parseISO } from 'date-fns';
import { http, HttpResponse } from 'msw';
import type { AppointmentFormat, AppointmentInput } from '@/lib/api/schema';
import { adminAppointments, availabilityState, computeAvailability } from '../data/admin-appointments';
import { problem } from '../problem';
import { MOCK_FAILURE_EMAIL } from './forms';

let sequence = 200;

/**
 * Rendez-vous du site, branchés sur les données du back-office (`src/mocks/data/admin-appointments.ts`) :
 * les créneaux proposés suivent les disponibilités réglées dans « Créneaux disponibles » (règles, fermetures,
 * délai de prévenance, horizon) et les rendez-vous déjà pris ; une demande envoyée arrive « À confirmer ».
 */
export const appointmentHandlers = [
  http.get('*/v1/appointments/availability', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const from = query.get('from');
    const to = query.get('to');
    const formatFilter = query.get('format') as AppointmentFormat | null;
    if (!from || !to) return problem(422, 'Les dates de début et de fin sont obligatoires.');
    const span = differenceInCalendarDays(parseISO(to), parseISO(from));
    if (span < 0 || span > 62) return problem(422, 'La période demandée doit faire 62 jours au plus.');
    return HttpResponse.json(
      computeAvailability(availabilityState.config, adminAppointments, from, to, { format: formatFilter }),
    );
  }),

  // Demande de rendez-vous du site : ajoutée à la file « À confirmer » du back-office, puis réponse du
  // gestionnaire générique des formulaires (référence, erreur simulée).
  http.post('*/v1/appointments', async ({ request }) => {
    const body = (await request
      .clone()
      .json()
      .catch(() => null)) as Partial<AppointmentInput> | null;
    if (!body?.startsAt || !body.contact?.fullName || body.contact.email === MOCK_FAILURE_EMAIL) return;
    sequence += 1;
    const startsAt = new Date(body.startsAt);
    if (Number.isNaN(startsAt.getTime())) return;
    const minutes = availabilityState.config.rules.find((rule) => rule.slotMinutes)?.slotMinutes ?? 60;
    adminAppointments.push({
      id: `apt_web_${sequence}`,
      reference: `MP-2026-0${sequence}`,
      contact: {
        id: `ctc_web_${sequence}`,
        fullName: body.contact.fullName,
        email: body.contact.email ?? '',
        phone: body.contact.phone ?? null,
        country: body.contact.country ?? null,
        city: body.contact.city ?? null,
        profile: 'PARTICULIER',
      },
      reason: body.reason ?? 'AUTRE',
      format: body.format ?? 'TELEPHONE',
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + minutes * 60_000).toISOString(),
      status: 'A_CONFIRMER',
      proposedStartsAt: null,
      location: null,
      videoLink: null,
      message: body.message ?? null,
      notes: null,
      reminderSentAt: null,
      createdAt: new Date().toISOString(),
    });
  }),

  // Acceptation du créneau proposé par l'agence : `expire` → 410, `pris` → 409 (créneau plus disponible).
  http.post('*/v1/appointments/:reference/accept-proposal', async ({ request }) => {
    const { token } = ((await request.json().catch(() => null)) ?? {}) as { token?: string };
    if (!token || token === 'expire')
      return problem(410, 'Cette proposition a expiré. Choisissez un nouveau créneau.');
    if (token === 'pris') return problem(409, 'Ce créneau vient d’être réservé. Choisissez-en un autre.');
    return HttpResponse.json({
      message: 'Parfait ! Votre rendez-vous est confirmé. Vous allez recevoir une invitation par e-mail.',
    });
  }),
];
