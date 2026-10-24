import type { AdminEvent } from '@/lib/api/schema';
import { formatClock } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';

export const EVENT_PERIODS = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'past', label: 'Passés' },
  { value: 'all', label: 'Tous' },
] as const;

export type EventPeriod = (typeof EVENT_PERIODS)[number]['value'];

/** Types proposés à la saisie (texte libre côté API). */
export const EVENT_TAGS = ['Concert', 'Culture', 'Gastronomie', 'Nature', 'Artisanat', 'Festival', 'Atelier'];

const pad = (value: number) => String(value).padStart(2, '0');

/** Date ISO → champs « date » et « heure » (heure de l'appareil) ; demain à 18 h par défaut. */
export function dateParts(iso: string | null | undefined, fallbackHour = 18) {
  const date = iso ? new Date(iso) : new Date(Date.now() + 86_400_000);
  if (!iso) date.setHours(fallbackHour, 0, 0, 0);
  return {
    day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

/** Champs « date » et « heure » → ISO ; `null` si incomplets ou invalides. */
export function toIso(day: string, time: string): string | null {
  if (!day || !time) return null;
  const date = new Date(`${day}T${time}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** « 18:00 – 21:00 », « 18:00 » sans fin. */
export function timeRange(event: Pick<AdminEvent, 'startsAt' | 'endsAt'>): string {
  const start = formatClock(event.startsAt);
  return event.endsAt ? `${start} – ${formatClock(event.endsAt)}` : start;
}

/** « 6 / 40 places », « 6 places réservées » sans limite. */
export function seatsLabel(event: Pick<AdminEvent, 'seatsTaken' | 'capacity'>): string {
  if (event.capacity == null)
    return `${formatNumber(event.seatsTaken)} place${event.seatsTaken > 1 ? 's' : ''} réservée${event.seatsTaken > 1 ? 's' : ''}`;
  return `${formatNumber(event.seatsTaken)} / ${formatNumber(event.capacity)} places`;
}

/** Taux de remplissage (0 à 1), `null` sans limite de places. */
export function fillRate(event: Pick<AdminEvent, 'seatsTaken' | 'capacity'>): number | null {
  if (!event.capacity) return null;
  return Math.min(1, event.seatsTaken / event.capacity);
}
