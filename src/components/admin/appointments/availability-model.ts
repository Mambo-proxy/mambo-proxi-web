import type { AppointmentFormat, AvailabilityConfig } from '@/lib/api/schema';
import { formatMinutes, isDateKey, parseTime } from './calendar-utils';

export const WEEKDAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export type TimeRange = { id?: string | null; start: string; end: string; formats: AppointmentFormat[] };
export type DayPlan = { open: boolean; ranges: TimeRange[] };
export type Exception = AvailabilityConfig['exceptions'][number] & { key: string };

/** Formulaire des disponibilités : une entrée par jour (lundi → dimanche), réglages communs, fermetures. */
export type AvailabilityForm = {
  days: DayPlan[];
  slotMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  exceptions: Exception[];
  agencyAddress: string;
  defaultVideoLink: string;
};

const ALL_FORMATS: AppointmentFormat[] = ['AGENCE', 'TELEPHONE', 'VISIO'];
let keySequence = 0;
export const newKey = () => `k${++keySequence}`;

export function newRange(previous?: TimeRange): TimeRange {
  if (!previous) return { start: '09:00', end: '12:00', formats: ALL_FORMATS };
  const start = Math.min((parseTime(previous.end) ?? 720) + 60, 22 * 60);
  return {
    start: formatMinutes(start),
    end: formatMinutes(Math.min(start + 180, 23 * 60 + 45)),
    formats: previous.formats,
  };
}

export function fromConfig(config: AvailabilityConfig): AvailabilityForm {
  const days: DayPlan[] = WEEKDAY_NAMES.map((_, index) => {
    const ranges = config.rules
      .filter((rule) => rule.weekday === index + 1)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((rule) => ({
        id: rule.id ?? null,
        start: rule.startTime,
        end: rule.endTime,
        formats: rule.formats,
      }));
    return { open: ranges.length > 0, ranges: ranges.length ? ranges : [newRange()] };
  });
  return {
    days,
    // Une seule durée pour toutes les plages (la plus fréquente si elles diffèrent).
    slotMinutes: config.rules[0]?.slotMinutes ?? 60,
    minNoticeHours: config.minNoticeHours,
    maxAdvanceDays: config.maxAdvanceDays,
    exceptions: config.exceptions.map((exception) => ({ ...exception, key: newKey() })),
    agencyAddress: config.agencyAddress ?? '',
    defaultVideoLink: config.defaultVideoLink ?? '',
  };
}

/** Règles envoyées à l'API et, pour chacune, le jour et la plage d'origine (erreurs `rules[i]`). */
export function toConfig(form: AvailabilityForm): {
  config: AvailabilityConfig;
  origins: [number, number][];
} {
  const origins: [number, number][] = [];
  const rules = form.days.flatMap((day, dayIndex) =>
    day.open
      ? day.ranges.map((range, rangeIndex) => {
          origins.push([dayIndex, rangeIndex]);
          return {
            id: range.id ?? null,
            weekday: dayIndex + 1,
            startTime: range.start,
            endTime: range.end,
            slotMinutes: form.slotMinutes,
            formats: range.formats,
          };
        })
      : [],
  );
  return {
    config: {
      rules,
      exceptions: form.exceptions.map((exception) => ({
        id: exception.id ?? null,
        date: exception.date,
        closed: exception.closed,
        label: exception.label?.trim() || null,
        startTime: exception.closed ? null : (exception.startTime ?? null),
        endTime: exception.closed ? null : (exception.endTime ?? null),
      })),
      minNoticeHours: form.minNoticeHours,
      maxAdvanceDays: form.maxAdvanceDays,
      agencyAddress: form.agencyAddress.trim() || null,
      defaultVideoLink: form.defaultVideoLink.trim() || null,
    },
    origins,
  };
}

/** Clé d'erreur d'un champ de plage (`day-0-1-end`) ou de fermeture (`exception-k3-date`). */
export const rangeKey = (day: number, range: number, field: 'start' | 'end' | 'formats') =>
  `day-${day}-${range}-${field}`;
export const exceptionKey = (key: string, field: 'date' | 'start' | 'end') => `exception-${key}-${field}`;

/** Contrôles avant envoi : heures cohérentes, plages sans chevauchement, au moins un format, dates uniques. */
export function validateForm(form: AvailabilityForm): Record<string, string> {
  const errors: Record<string, string> = {};
  form.days.forEach((day, dayIndex) => {
    if (!day.open) return;
    const spans: [number, number, number][] = [];
    day.ranges.forEach((range, rangeIndex) => {
      const start = parseTime(range.start);
      const end = parseTime(range.end);
      if (start === null) errors[rangeKey(dayIndex, rangeIndex, 'start')] = 'Heure de début invalide.';
      if (end === null) errors[rangeKey(dayIndex, rangeIndex, 'end')] = 'Heure de fin invalide.';
      else if (start !== null && end <= start)
        errors[rangeKey(dayIndex, rangeIndex, 'end')] = 'La fin doit suivre le début.';
      else if (start !== null && end - start < form.slotMinutes)
        errors[rangeKey(dayIndex, rangeIndex, 'end')] = 'Plage plus courte qu’un rendez-vous.';
      if (!range.formats.length)
        errors[rangeKey(dayIndex, rangeIndex, 'formats')] = 'Choisissez au moins un format.';
      if (start !== null && end !== null) spans.push([start, end, rangeIndex]);
    });
    spans.sort((a, b) => a[0] - b[0]);
    for (let index = 1; index < spans.length; index++) {
      const previous = spans[index - 1]!;
      const current = spans[index]!;
      if (current[0] < previous[1])
        errors[rangeKey(dayIndex, current[2], 'start')] = 'Cette plage chevauche la précédente.';
    }
  });
  const seen = new Set<string>();
  for (const exception of form.exceptions) {
    if (!isDateKey(exception.date)) errors[exceptionKey(exception.key, 'date')] = 'Indiquez une date.';
    else if (seen.has(exception.date))
      errors[exceptionKey(exception.key, 'date')] = 'Cette date est déjà indiquée.';
    seen.add(exception.date);
    if (!exception.closed) {
      const start = parseTime(exception.startTime ?? '');
      const end = parseTime(exception.endTime ?? '');
      if (start === null) errors[exceptionKey(exception.key, 'start')] = 'Heure de début invalide.';
      if (end === null) errors[exceptionKey(exception.key, 'end')] = 'Heure de fin invalide.';
      else if (start !== null && end <= start)
        errors[exceptionKey(exception.key, 'end')] = 'La fin doit suivre le début.';
    }
  }
  return errors;
}

/** Erreurs de l'API (`rules[2].endTime`, `exceptions[0].date`) → clés du formulaire. */
export function mapServerErrors(
  fieldErrors: Record<string, string>,
  origins: [number, number][],
  form: AvailabilityForm,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [path, message] of Object.entries(fieldErrors)) {
    const rule = /^rules\[(\d+)\]\.(startTime|endTime|formats)$/.exec(path);
    const exception = /^exceptions\[(\d+)\]\.(date|startTime|endTime)$/.exec(path);
    if (rule) {
      const origin = origins[Number(rule[1])];
      const field = rule[2] === 'startTime' ? 'start' : rule[2] === 'endTime' ? 'end' : 'formats';
      if (origin) errors[rangeKey(origin[0], origin[1], field)] = message;
    } else if (exception) {
      const item = form.exceptions[Number(exception[1])];
      const field = exception[2] === 'startTime' ? 'start' : exception[2] === 'endTime' ? 'end' : 'date';
      if (item) errors[exceptionKey(item.key, field)] = message;
    } else errors[path] = message;
  }
  return errors;
}

/** Nombre de créneaux proposés par semaine (aperçu). */
export function slotsPerWeek(form: AvailabilityForm): number {
  return form.days.reduce(
    (total, day) =>
      total +
      (day.open
        ? day.ranges.reduce((sum, range) => {
            const start = parseTime(range.start);
            const end = parseTime(range.end);
            return start === null || end === null || end <= start
              ? sum
              : sum + Math.floor((end - start) / form.slotMinutes);
          }, 0)
        : 0),
    0,
  );
}
