import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { http, HttpResponse } from 'msw';
import type { AppointmentFormat, Availability } from '@/lib/api/schema';
import { problem } from '../problem';

/** Créneaux simulés, heure de Douala (UTC+1) : heure, minute, formats proposés. */
const SLOTS: ReadonlyArray<{ hour: number; minute: number; formats: AppointmentFormat[] }> = [
  { hour: 9, minute: 0, formats: ['AGENCE', 'TELEPHONE', 'VISIO'] },
  { hour: 10, minute: 30, formats: ['AGENCE', 'TELEPHONE', 'VISIO'] },
  { hour: 14, minute: 0, formats: ['AGENCE', 'TELEPHONE', 'VISIO'] },
  { hour: 15, minute: 30, formats: ['AGENCE', 'TELEPHONE', 'VISIO'] },
  { hour: 17, minute: 0, formats: ['TELEPHONE', 'VISIO'] },
];

/** Délai minimal avant un rendez-vous (contrat : 24 h). */
const MIN_NOTICE_MS = 24 * 60 * 60 * 1000;

/** Instant UTC d'une heure de Douala (UTC+1, sans changement d'heure). */
function doualaInstant(day: string, hour: number, minute: number): Date {
  return new Date(`${day}T${String(hour - 1).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`);
}

/**
 * `GET /v1/appointments/availability` : du lundi au samedi, 5 créneaux (le dernier sans rendez-vous à l'agence),
 * dimanches fermés, délai de 24 h ; un jour sur neuf est complet pour montrer l'état « sans créneau ».
 */
export const appointmentHandlers = [
  http.get('*/v1/appointments/availability', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const from = query.get('from');
    const to = query.get('to');
    const formatFilter = query.get('format') as AppointmentFormat | null;
    if (!from || !to) return problem(422, 'Les dates de début et de fin sont obligatoires.');
    const start = parseISO(from);
    const span = differenceInCalendarDays(parseISO(to), start);
    if (span < 0 || span > 62) return problem(422, 'La période demandée doit faire 62 jours au plus.');

    const now = Date.now();
    const days: Availability['days'] = Array.from({ length: span + 1 }, (_, index) => {
      const date = addDays(start, index);
      const key = format(date, 'yyyy-MM-dd');
      if (date.getDay() === 0)
        return { date: key, available: false, closedReason: 'Fermé le dimanche', slots: [] };
      const slots = SLOTS.filter((slot) => !formatFilter || slot.formats.includes(formatFilter))
        .map((slot) => {
          const startsAt = doualaInstant(key, slot.hour, slot.minute);
          return {
            startsAt: startsAt.toISOString(),
            endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000).toISOString(),
            formats: slot.formats,
          };
        })
        .filter((slot) => new Date(slot.startsAt).getTime() - now >= MIN_NOTICE_MS);
      const full = date.getDate() % 9 === 0;
      return {
        date: key,
        available: !full && slots.length > 0,
        closedReason: full ? 'Complet' : null,
        slots: full ? [] : slots,
      };
    });
    const body: Availability = { timezone: 'Africa/Douala', timezoneLabel: 'Heure de Douala (UTC+1)', days };
    return HttpResponse.json(body);
  }),
];
