import { formatDayMonth, formatWeekdayDate } from '@/lib/format/date';

export const PERIODS = [
  { value: '7j', label: '7 derniers jours', days: 7 },
  { value: '30j', label: '30 derniers jours', days: 30 },
  { value: '90j', label: '90 derniers jours', days: 90 },
  { value: 'tout', label: 'Depuis le début', days: null },
] as const;

export type Period = (typeof PERIODS)[number]['value'];

/** Début de la période (minuit UTC, `days` jours avant aujourd'hui) ; `undefined` pour « Depuis le début ». */
export function periodStart(period: Period, now = Date.now()): string | undefined {
  const days = PERIODS.find((item) => item.value === period)?.days;
  if (!days) return undefined;
  const start = new Date(now - days * 86_400_000);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

/** En-tête d'un jour du journal : « Aujourd’hui », « Hier », puis « lundi 20 octobre ». */
export function activityDay(date: string, now = Date.now()): string {
  const day = formatDayMonth(date);
  if (day === formatDayMonth(now)) return 'Aujourd’hui';
  if (day === formatDayMonth(now - 86_400_000)) return 'Hier';
  return formatWeekdayDate(date);
}

/** Détail d'une modification : `{ statut: ['Nouvelle', 'Devis envoyé'] }` → « statut : Nouvelle → Devis envoyé ». */
export function diffLines(
  diff: Record<string, unknown> | null | undefined,
): { field: string; change: string }[] {
  if (!diff) return [];
  return Object.entries(diff).map(([field, value]) => {
    if (Array.isArray(value) && value.length === 2)
      return { field, change: `${String(value[0] ?? '—')} → ${String(value[1] ?? '—')}` };
    return { field, change: typeof value === 'string' ? value : JSON.stringify(value) };
  });
}
