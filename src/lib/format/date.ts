import { TZDate } from '@date-fns/tz';
import { differenceInCalendarDays, format, formatDistanceStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Fuseau d'affichage par défaut (docs/05 §1). */
export const DEFAULT_TIME_ZONE = 'Africa/Douala';

type DateInput = string | number | Date;

function inZone(date: DateInput, timeZone: string): TZDate {
  return new TZDate(new Date(date).getTime(), timeZone);
}

/** « 6 octobre 2026 ». */
export function formatDate(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'd MMMM yyyy', { locale: fr });
}

/** « 06/10/2026 ». */
export function formatShortDate(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'dd/MM/yyyy', { locale: fr });
}

/** « mardi 6 octobre ». */
export function formatWeekdayDate(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'EEEE d MMMM', { locale: fr });
}

/** « samedi 14 novembre 2026 ». */
export function formatLongDate(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'EEEE d MMMM yyyy', { locale: fr });
}

/** « 14 h 30 ». */
export function formatTime(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  const zoned = inZone(date, timeZone);
  return zoned.getMinutes() === 0
    ? format(zoned, "H'\u00A0h'", { locale: fr })
    : format(zoned, "H'\u00A0h\u00A0'mm", { locale: fr });
}

/** « 09:00 » (créneaux de rendez-vous, maquette Contact). */
export function formatClock(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'HH:mm', { locale: fr });
}

/** « 6 octobre 2026 à 14 h 30 ». */
export function formatDateTime(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return `${formatDate(date, timeZone)} à ${formatTime(date, timeZone)}`;
}

/**
 * Date relative : « à l'instant », « il y a 5 minutes », « hier », « il y a 3 jours »,
 * puis la date complète au-delà de 7 jours.
 */
export function formatRelative(
  date: DateInput,
  now: DateInput = Date.now(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const target = inZone(date, timeZone);
  const reference = inZone(now, timeZone);
  const seconds = (reference.getTime() - target.getTime()) / 1000;
  if (seconds < 60) return "à l'instant";
  const days = differenceInCalendarDays(reference, target);
  if (days === 0) return formatDistanceStrict(target, reference, { locale: fr, addSuffix: true });
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}\u00A0jours`;
  return formatDate(target, timeZone);
}

/**
 * Ancienneté d'une publication (liste des offres) : « aujourd’hui », « il y a 3 jours », « il y a 1 semaine »,
 * « il y a 3 semaines », puis « le 2 octobre 2026 » au-delà d'un mois.
 */
export function formatPublishedAgo(
  date: DateInput,
  now: DateInput = Date.now(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const days = differenceInCalendarDays(inZone(now, timeZone), inZone(date, timeZone));
  if (days <= 0) return 'aujourd’hui';
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}\u00A0jours`;
  if (days < 31) {
    const weeks = Math.floor(days / 7);
    return `il y a ${weeks}\u00A0semaine${weeks > 1 ? 's' : ''}`;
  }
  return `le ${formatDate(date, timeZone)}`;
}

/** « 3 oct. » (tableaux du back-office). */
export function formatDayMonth(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return format(inZone(date, timeZone), 'd MMM', { locale: fr });
}

/** « 5 oct. · 09:12 » (horodatage du back-office). */
export function formatStamp(date: DateInput, timeZone = DEFAULT_TIME_ZONE): string {
  return `${formatDayMonth(date, timeZone)} · ${formatClock(date, timeZone)}`;
}

/**
 * Ancienneté courte du back-office (tableau de bord `85:10528`) : « À l’instant », « Il y a 12 min »,
 * « Il y a 2 h », « Hier », puis « 3 oct. ».
 */
export function formatAgo(
  date: DateInput,
  now: DateInput = Date.now(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const target = inZone(date, timeZone);
  const reference = inZone(now, timeZone);
  const minutes = Math.floor((reference.getTime() - target.getTime()) / 60_000);
  const days = differenceInCalendarDays(reference, target);
  if (days === 0) {
    if (minutes < 1) return 'À l’instant';
    if (minutes < 60) return `Il y a ${minutes}\u00A0min`;
    return `Il y a ${Math.floor(minutes / 60)}\u00A0h`;
  }
  if (days === 1) return 'Hier';
  return formatDayMonth(target, timeZone);
}
