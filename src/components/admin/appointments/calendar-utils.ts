import { TZDate } from '@date-fns/tz';
import { DEFAULT_TIME_ZONE } from '@/lib/format/date';

/** Fuseau de l'agence (Douala) : le calendrier affiche toujours les heures de l'agence. */
export const AGENCY_TIME_ZONE = DEFAULT_TIME_ZONE;

export type CalendarView = 'jour' | 'semaine' | 'mois';
export const CALENDAR_VIEWS: CalendarView[] = ['jour', 'semaine', 'mois'];

/** Jour du calendrier de l'agence, `yyyy-MM-dd`. */
export type DateKey = string;

const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const pad = (value: number) => String(value).padStart(2, '0');

function parts(key: DateKey): [number, number, number] {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return [year, month, day];
}

/** Date locale à midi (calculs de jours sans effet des changements d'heure). */
function noon(key: DateKey): Date {
  const [year, month, day] = parts(key);
  return new Date(year, month - 1, day, 12);
}

function toKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDateKey(value: string | null | undefined): value is DateKey {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toKey(noon(value)) === value;
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = noon(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

/** 1 = lundi … 7 = dimanche (comme `AvailabilityConfig.rules[].weekday`). */
export function weekdayOf(key: DateKey): number {
  return ((noon(key).getDay() + 6) % 7) + 1;
}

export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, 1 - weekdayOf(key));
}

/** Jour (heure de Douala) d'un instant. */
export function dayKeyOf(instant: string | number | Date, timeZone = AGENCY_TIME_ZONE): DateKey {
  const zoned = new TZDate(new Date(instant).getTime(), timeZone);
  return `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}`;
}

export function todayKey(now: number = Date.now()): DateKey {
  return dayKeyOf(now);
}

/** Minutes écoulées depuis minuit (heure de Douala). */
export function minutesOfDay(instant: string | number | Date, timeZone = AGENCY_TIME_ZONE): number {
  const zoned = new TZDate(new Date(instant).getTime(), timeZone);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

/** Instant ISO d'un jour et d'une heure de Douala (`minutes` depuis minuit). */
export function zonedInstant(key: DateKey, minutes = 0, timeZone = AGENCY_TIME_ZONE): string {
  const [year, month, day] = parts(key);
  // `TZDate#toISOString` garde le décalage du fuseau : conversion en instant UTC (`Z`), comme l'API.
  return new Date(
    new TZDate(year, month - 1, day, Math.floor(minutes / 60), minutes % 60, timeZone).getTime(),
  ).toISOString();
}

/** « 09:30 » → 570. */
export function parseTime(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** 570 → « 09:30 ». */
export function formatMinutes(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** 60 → « 1 h », 90 → « 1 h 30 », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}\u00A0min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}\u00A0h\u00A0${pad(rest)}` : `${hours}\u00A0h`;
}

/** Jours affichés et période chargée pour une vue (fin exclue). */
export function viewRange(
  view: CalendarView,
  key: DateKey,
): { start: DateKey; end: DateKey; days: DateKey[] } {
  let start = key;
  let length = 1;
  if (view === 'semaine') {
    start = startOfWeek(key);
    length = 7;
  } else if (view === 'mois') {
    const [year, month] = parts(key);
    const first = `${year}-${pad(month)}-01`;
    const last = toKey(new Date(year, month, 0, 12));
    start = startOfWeek(first);
    length = Math.round((noon(addDays(startOfWeek(last), 7)).getTime() - noon(start).getTime()) / 86_400_000);
  }
  const days = Array.from({ length }, (_, index) => addDays(start, index));
  return { start, end: addDays(start, length), days };
}

/** Jour de référence après « précédent » (−1) ou « suivant » (+1). */
export function shiftDate(view: CalendarView, key: DateKey, direction: 1 | -1): DateKey {
  if (view === 'jour') return addDays(key, direction);
  if (view === 'semaine') return addDays(startOfWeek(key), 7 * direction);
  const [year, month] = parts(key);
  return toKey(new Date(year, month - 1 + direction, 1, 12));
}

/** « Lun 9 » (en-têtes de colonnes). */
export function dayHeader(key: DateKey): string {
  return `${WEEKDAYS_SHORT[weekdayOf(key) - 1]} ${parts(key)[2]}`;
}

export function weekdayShort(key: DateKey): string {
  return WEEKDAYS_SHORT[weekdayOf(key) - 1] ?? '';
}

/** « jeudi 12 novembre » (accessibilité, liste du jour). */
export function dayLabel(key: DateKey, withYear = false): string {
  const [year, month, day] = parts(key);
  return `${WEEKDAYS[weekdayOf(key) - 1]} ${day === 1 ? '1er' : day} ${MONTHS[month - 1]}${withYear ? ` ${year}` : ''}`;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Titre de la période : « Semaine du 9 au 14 novembre 2026 » (maquette `93:11518`), « Semaine du 28 septembre au
 * 3 octobre 2026 », « Jeudi 12 novembre 2026 », « Novembre 2026 ». `days` : jours réellement affichés.
 */
export function viewTitle(view: CalendarView, key: DateKey, days: DateKey[]): string {
  const [year, month] = parts(key);
  if (view === 'jour') return capitalize(dayLabel(key, true));
  if (view === 'mois') return `${capitalize(MONTHS[month - 1] ?? '')} ${year}`;
  const first = days[0] ?? key;
  const last = days.at(-1) ?? key;
  const [startYear, startMonth, startDay] = parts(first);
  const [endYear, endMonth, endDay] = parts(last);
  const from =
    startYear !== endYear
      ? `${startDay} ${MONTHS[startMonth - 1]} ${startYear}`
      : startMonth !== endMonth
        ? `${startDay} ${MONTHS[startMonth - 1]}`
        : `${startDay}`;
  return `Semaine du ${from} au ${endDay} ${MONTHS[endMonth - 1]} ${endYear}`;
}

export function monthOf(key: DateKey): number {
  return parts(key)[1];
}

export function dayOfMonth(key: DateKey): number {
  return parts(key)[2];
}

type Span = { id: string; start: number; end: number };

/**
 * Rendez-vous qui se chevauchent dans une journée : colonne (`lane`) de chacun et nombre de colonnes (`lanes`) de son
 * groupe, pour les afficher côte à côte.
 */
export function layoutLanes(spans: Span[]): Map<string, { lane: number; lanes: number }> {
  const result = new Map<string, { lane: number; lanes: number }>();
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  let group: string[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -Infinity;
  const flush = () => {
    for (const id of group) {
      const entry = result.get(id);
      if (entry) entry.lanes = laneEnds.length;
    }
    group = [];
    laneEnds = [];
  };
  for (const span of sorted) {
    if (span.start >= groupEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= span.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(span.end);
    } else laneEnds[lane] = span.end;
    group.push(span.id);
    result.set(span.id, { lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, span.end);
  }
  flush();
  return result;
}

/** Plage horaire affichée : 08:00 – 18:00 (maquette), élargie aux disponibilités et rendez-vous hors plage. */
export function hourRange(minutes: { start: number; end: number }[]): { startHour: number; endHour: number } {
  let startHour = 8;
  let endHour = 18;
  for (const item of minutes) {
    startHour = Math.min(startHour, Math.floor(item.start / 60));
    endHour = Math.max(endHour, Math.ceil(item.end / 60));
  }
  return { startHour: Math.max(0, startHour), endHour: Math.min(24, endHour) };
}
