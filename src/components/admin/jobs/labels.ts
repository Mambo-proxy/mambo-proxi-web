import { differenceInCalendarDays } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import type { ApplicationStatus } from '@/lib/api/schema';
import { DEFAULT_TIME_ZONE, formatDayMonth } from '@/lib/format/date';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  NOUVEAU: 'Nouveau',
  LU: 'Lu',
  RETENU: 'Retenu',
  REFUSE: 'Refusé',
};

/** Teintes des statuts de candidature (maquette : Nouveau orange, Lu gris, Retenu vert ; Refusé gris clair). */
export const APPLICATION_STATUS_TONES = {
  NOUVEAU: 'brand',
  LU: 'neutral',
  RETENU: 'success',
  REFUSE: 'muted',
} as const satisfies Record<ApplicationStatus, string>;

/** Types de contrat proposés (maquette) ; une autre valeur reste possible. */
export const CONTRACT_TYPES = ['CDI', 'CDD 12 mois', 'Temps partiel', 'Freelance', 'Stage'];

export const COUNTRIES = [
  { value: 'CM', label: 'Cameroun' },
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
];

/** Filtre « offre » des candidatures : candidatures spontanées (valeur du contrat). */
export const SPONTANEOUS = 'spontaneous';

/** Date de réception courte : « Aujourd’hui », « Hier », puis « 2 oct. » (maquette `93:22046`). */
export function receivedLabel(date: string | number | Date, now: string | number | Date = Date.now()): string {
  const days = differenceInCalendarDays(
    new TZDate(new Date(now).getTime(), DEFAULT_TIME_ZONE),
    new TZDate(new Date(date).getTime(), DEFAULT_TIME_ZONE),
  );
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  return formatDayMonth(date);
}

/** Taille d'un fichier : « 186 Ko », « 1,2 Mo ». */
export function fileSizeLabel(bytes: number): string {
  if (bytes < 1000) return `${bytes} o`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} Ko`;
  return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`;
}

/** Libellé court du bouton de téléchargement (« CV.pdf », « CV.docx »), comme la maquette. */
export function cvLabel(fileName: string): string {
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : null;
  return extension ? `CV.${extension}` : 'CV';
}

/** « Publiée le 2 oct. · expire le 2 déc. », « Non publiée », « Archivée ». */
export function offerMeta(offer: {
  status?: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
}): string {
  if (offer.status === 'ARCHIVED') return 'Archivée';
  if (offer.status !== 'PUBLISHED' || !offer.publishedAt) return 'Non publiée';
  const published = `Publiée le ${formatDayMonth(offer.publishedAt)}`;
  return offer.expiresAt ? `${published} · expire le ${formatDayMonth(offer.expiresAt)}` : published;
}

/** « 6 · 2 nouvelles », « 4 », « — » (colonne Candidatures). */
export function applicationsCountLabel(total: number, fresh = 0): string {
  if (!total) return '—';
  if (!fresh) return String(total);
  return `${total} · ${fresh} nouvelle${fresh > 1 ? 's' : ''}`;
}
