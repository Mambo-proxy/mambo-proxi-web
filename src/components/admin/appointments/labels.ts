import { shortName } from '@/components/admin/ui/admin-ui';
import type {
  AdminAppointment,
  AppointmentFormat,
  AppointmentReason,
  AppointmentStatus,
  ContactSummary,
} from '@/lib/api/schema';
import { formatClock, formatDayMonth } from '@/lib/format/date';
import { dayKeyOf, weekdayShort } from './calendar-utils';

/**
 * Rendez-vous du back-office. `subject` (« Chef privé », « Événement », « entretien » sur la maquette) n'existe pas
 * dans le contrat : lu s'il est présent (mocks), sinon le nom du contact est affiché après le motif.
 */
export type Appointment = AdminAppointment & { subject?: string | null };

export const REASON_LABELS: Record<AppointmentReason, string> = {
  DEVIS: 'Devis',
  IMMOBILIER: 'Immobilier',
  PARTENARIAT: 'Partenariat',
  RECRUTEMENT: 'Recrutement',
  AUTRE: 'Autre',
};

export const FORMAT_LABELS: Record<AppointmentFormat, string> = {
  AGENCE: 'Agence',
  TELEPHONE: 'Téléphone',
  VISIO: 'Visio',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  A_CONFIRMER: 'À confirmer',
  CONFIRME: 'Confirmé',
  AUTRE_CRENEAU_PROPOSE: 'Autre créneau proposé',
  ANNULE: 'Annulé',
  TERMINE: 'Terminé',
};

/** Tons de `StatusPill` par statut. */
export const STATUS_TONES = {
  A_CONFIRMER: 'warning',
  CONFIRME: 'success',
  AUTRE_CRENEAU_PROPOSE: 'brand',
  ANNULE: 'muted',
  TERMINE: 'neutral',
} as const satisfies Record<AppointmentStatus, string>;

/**
 * Événement du calendrier (`93:11535`) : bordure gauche 3 px ; à confirmer = `orange/50` + `brand/primary`,
 * confirmé = `vert/50` + `vert/500` ; états non maquettés dans le même langage (proposé en pointillés, annulé
 * barré, terminé neutre).
 */
export const EVENT_STYLES: Record<AppointmentStatus, string> = {
  A_CONFIRMER: 'bg-orange-50 border-l-brand-primary',
  CONFIRME: 'bg-vert-50 border-l-vert-500',
  AUTRE_CRENEAU_PROPOSE:
    'bg-neutral-0 border-l-brand-primary border-dashed border-y border-r border-orange-200',
  ANNULE: 'bg-neutral-50 border-l-neutral-300 [&_[data-title]]:line-through',
  TERMINE: 'bg-neutral-100 border-l-neutral-500',
};

/** Pastille de couleur (vue mois en mobile, légende). */
export const DOT_STYLES: Record<AppointmentStatus, string> = {
  A_CONFIRMER: 'bg-brand-primary',
  CONFIRME: 'bg-vert-500',
  AUTRE_CRENEAU_PROPOSE: 'bg-orange-300',
  ANNULE: 'bg-neutral-300',
  TERMINE: 'bg-neutral-500',
};

/** Nom affiché : complet pour une structure ou une famille (« Saveurs de Douala », « Famille Ndzana »), abrégé sinon. */
export function displayName(contact: Pick<ContactSummary, 'fullName' | 'profile'>): string {
  if (contact.profile === 'PROFESSIONNEL' || /^famille\s/i.test(contact.fullName)) return contact.fullName;
  return shortName(contact.fullName);
}

/** Titre d'un rendez-vous : « Devis · Chef privé », « Immobilier · Sandrine M. ». */
export function appointmentTitle(appointment: Appointment): string {
  return `${REASON_LABELS[appointment.reason]} · ${appointment.subject || displayName(appointment.contact)}`;
}

/** Lieu affiché : adresse saisie (« Agence Douala ») ou format (« Agence », « Visio », « Téléphone »). */
export function placeLabel(appointment: Appointment): string {
  return appointment.location || FORMAT_LABELS[appointment.format];
}

/** Début affiché : le créneau proposé au client s'il y en a un. */
export function shownStart(appointment: Appointment): string {
  return appointment.status === 'AUTRE_CRENEAU_PROPOSE' && appointment.proposedStartsAt
    ? appointment.proposedStartsAt
    : appointment.startsAt;
}

/** Durée en minutes. */
export function durationOf(appointment: Appointment): number {
  return Math.max(
    15,
    Math.round((new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime()) / 60_000),
  );
}

/** « Jeu 12 nov. · 14:00 » (carte « À confirmer »). */
export function shortStamp(instant: string): string {
  return `${weekdayShort(dayKeyOf(instant))} ${formatDayMonth(instant)} · ${formatClock(instant)}`;
}
