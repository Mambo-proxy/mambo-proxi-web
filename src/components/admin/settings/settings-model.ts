import type { EmailTemplate, EmailTemplateKey, Role } from '@/lib/api/schema';
import { formatClock, formatDayMonth } from '@/lib/format/date';

/** Onglets de Paramètres (`?onglet=`) ; utilisateurs et sécurité réservés aux administrateurs. */
export const SETTINGS_TABS = [
  { value: 'coordonnees', label: 'Coordonnées' },
  { value: 'e-mails', label: 'E-mails automatiques' },
  { value: 'referencement', label: 'Référencement' },
  { value: 'utilisateurs', label: 'Utilisateurs', adminOnly: true },
  { value: 'securite', label: 'Sécurité & sauvegardes', adminOnly: true },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]['value'];

export function tabsFor(role: Role | undefined) {
  return SETTINGS_TABS.filter((tab) => !('adminOnly' in tab) || role === 'ADMIN');
}

/** « +237600000000 » → « +237 6 00 00 00 00 » ; « +33612345678 » → « +33 6 12 34 56 78 ». */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return '';
  const cameroon = /^\+237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (cameroon) return `+237 ${cameroon.slice(1).join(' ')}`;
  const france = /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (france) return `+33 ${france.slice(1).join(' ')}`;
  return e164;
}

/** Saisie libre → E.164 : espaces, points, tirets et parenthèses retirés, « 00 » initial remplacé par « + ». */
export function parsePhone(input: string): string {
  const compact = input.replace(/[\s.\-()]/g, '');
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
}

/** « https://www.instagram.com/mamboproxi » → « instagram.com/mamboproxi » (saisie de la maquette). */
export function socialDisplay(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
}

/** « instagram.com/mamboproxi » → « https://www.instagram.com/mamboproxi » ; une adresse complète est gardée. */
export function socialUrl(input: string): string {
  const value = input.trim();
  if (!value || /^https?:\/\//.test(value)) return value;
  return `https://${value.startsWith('www.') ? '' : 'www.'}${value}`;
}

/** Réseaux de la maquette (YouTube et X, prévus par le contrat, ne sont pas proposés). */
export const SOCIAL_NETWORKS: {
  network: 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
  label: string;
  placeholder: string;
}[] = [
  { network: 'instagram', label: 'Instagram', placeholder: 'instagram.com/mamboproxi' },
  { network: 'facebook', label: 'Facebook', placeholder: 'facebook.com/mamboproxi' },
  { network: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/company/mamboproxi' },
  { network: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@mamboproxi' },
];

export type EmailFamily = {
  id: string;
  name: string;
  description: (surveyDelayHours: number) => string;
  /** Modèle ouvert par « Modèle ». */
  template: EmailTemplateKey;
  /** Modèles activés ou désactivés ensemble par l'interrupteur. */
  keys: EmailTemplateKey[];
};

/** Les 4 familles d'e-mails de la carte « E-mails automatiques » (`94:12112`). */
export const EMAIL_FAMILIES: EmailFamily[] = [
  {
    id: 'ack',
    name: 'Accusé de réception',
    description: () => 'À chaque demande de devis, contact, inscription ou candidature',
    template: 'quote-ack',
    keys: [
      'quote-ack',
      'contact-ack',
      'registration-confirmed',
      'application-received',
      'training-request-received',
      'partner-request-received',
      'event-registration',
      'appointment-received',
    ],
  },
  {
    id: 'survey',
    name: 'Questionnaire de satisfaction',
    description: (hours) =>
      `${hours === 0 ? 'Dès' : `${hours}\u00A0h après`} le passage au statut « Prestation réalisée »`,
    template: 'survey-invitation',
    keys: ['survey-invitation', 'survey-reminder'],
  },
  {
    id: 'appointment',
    name: 'Confirmation et rappel de rendez-vous',
    description: () => 'À la confirmation, puis la veille du rendez-vous',
    template: 'appointment-confirmed',
    keys: ['appointment-confirmed', 'appointment-reminder'],
  },
  {
    id: 'team',
    name: 'Alerte à l’équipe',
    description: () => 'Une notification par e-mail pour chaque nouvelle demande',
    template: 'team-new-request',
    keys: ['team-new-request'],
  },
];

/** Famille active : tous ses modèles (désactivables) sont activés. */
export function familyEnabled(family: EmailFamily, templates: EmailTemplate[]): boolean {
  const members = templates.filter((template) => family.keys.includes(template.key!));
  return members.length > 0 && members.every((template) => template.enabled);
}

export const AUDIENCE_LABELS: Record<NonNullable<EmailTemplate['audience']>, string> = {
  client: 'Clients et visiteurs',
  equipe: 'Équipe',
  utilisateur: 'Utilisateurs du back-office',
};

/** Périmètre de chaque rôle (« Accès au back-office », invitation). */
export const ROLE_SCOPES: Record<Role, string> = {
  ADMIN: 'Tout le back-office, paramètres sensibles et utilisateurs compris',
  EDITOR: 'Demandes et contenus',
};

/** Moment d'une sauvegarde : « aujourd’hui 03:00 », « hier 03:00 », puis « 3 oct. 03:00 ». */
export function backupMoment(date: string, now = Date.now()): string {
  const day = formatDayMonth(date);
  const label =
    day === formatDayMonth(now) ? 'aujourd’hui' : day === formatDayMonth(now - 86_400_000) ? 'hier' : day;
  return `${label} ${formatClock(date)}`;
}

/** « Chaque nuit · dernière : aujourd’hui 03:00 » (carte « Sauvegarde automatique »). */
export function backupLabel(lastBackupAt: string | null | undefined, now = Date.now()): string {
  return lastBackupAt
    ? `Chaque nuit · dernière : ${backupMoment(lastBackupAt, now)}`
    : 'Chaque nuit · aucune sauvegarde pour l’instant';
}

/** Adresses saisies séparées par des virgules, points-virgules ou retours à la ligne. */
export function parseEmails(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
