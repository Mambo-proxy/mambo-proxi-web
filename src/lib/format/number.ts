import type { JobSalary } from '@/lib/api/schema';

const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });

/** 1200 → « 1 200 » (espace fine insécable comme séparateur des milliers). */
export function formatNumber(value: number): string {
  return integer.format(value);
}

/** Note moyenne : 4.8 → « 4,8 ». */
export function formatRating(value: number): string {
  return oneDecimal.format(value);
}

/** 0.92 → « 92 % » (espace fine insécable avant %, comme frenchTypography). */
export function formatPercent(ratio: number): string {
  return percent.format(ratio).replace(/\s%/, '\u202F%');
}

/** Taille de fichier : 2_400_000 → « 2,3 Mo ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${formatNumber(bytes)}\u00A0o`;
  if (bytes < 1024 * 1024) return `${formatNumber(Math.round(bytes / 1024))}\u00A0Ko`;
  return `${oneDecimal.format(bytes / (1024 * 1024))}\u00A0Mo`;
}

const CURRENCIES = { XAF: 'FCFA', EUR: '€' } as const;
const PERIODS = {
  fr: { HOUR: 'de l’heure', DAY: 'par jour', WEEK: 'par semaine', MONTH: 'par mois', YEAR: 'par an' },
  en: { HOUR: 'an hour', DAY: 'a day', WEEK: 'a week', MONTH: 'a month', YEAR: 'a year' },
} as const;
const englishInteger = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

/** Rémunération d'une offre : « 90 000 – 120 000 FCFA par mois » (« 90,000 – 120,000 FCFA a month » en anglais). */
export function formatSalary(salary: JobSalary, locale: 'fr' | 'en' = 'fr'): string {
  const number = locale === 'en' ? englishInteger.format : formatNumber;
  const amount = salary.max ? `${number(salary.min)} – ${number(salary.max)}` : number(salary.min);
  return `${amount}\u00A0${CURRENCIES[salary.currency]} ${PERIODS[locale][salary.period]}`;
}
