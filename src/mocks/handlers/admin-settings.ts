import { http, HttpResponse } from 'msw';
import type {
  AdminUser,
  EmailTemplate,
  EmailTemplateFields,
  EmailTemplateKey,
  Problem,
  Role,
  SettingsAnalytics,
  SettingsChiffres,
  SettingsCoordonnees,
  SettingsEmails,
  SettingsGroup,
  SettingsReseaux,
  SettingsRgpd,
  SettingsSecurite,
  SettingsSeo,
  SettingsWhatsapp,
  SystemStatus,
} from '@/lib/api/schema';
import {
  isTextGroup,
  settingsTextRules,
  type TextGroup,
} from '@/components/admin/settings/settings-translation';
import { jsonBody, mockId, normalize } from '../admin-utils';
import { emailDocument } from '../email-layout';
import { unknownMediaErrors } from '../media-refs';
import { problem, validationProblem } from '../problem';
import { adminMedia } from './admin-media';
import { ROLES, can, forbidden } from '../permissions';
import { sessionUser } from '../session';
import { adminUsers, syncSessionRole } from '../team';
import {
  mockTextStatus,
  pickEnglish,
  saveMockTranslation,
  unknownReviewedFields,
  type MockTextTranslation,
} from '../text-translations';

type Groups = {
  coordonnees: SettingsCoordonnees;
  whatsapp: SettingsWhatsapp;
  reseaux: SettingsReseaux;
  emails: SettingsEmails;
  seo: SettingsSeo;
  analytics: SettingsAnalytics;
  chiffres: SettingsChiffres;
  rgpd: SettingsRgpd;
  securite: SettingsSecurite;
};

const GROUPS = Object.keys({
  coordonnees: 1,
  whatsapp: 1,
  reseaux: 1,
  emails: 1,
  seo: 1,
  analytics: 1,
  chiffres: 1,
  rgpd: 1,
  securite: 1,
} satisfies Record<SettingsGroup, 1>) as SettingsGroup[];

/** Groupes réservés aux administrateurs (contrat : `analytics`, `securite`). */
const ADMIN_GROUPS: SettingsGroup[] = ['analytics', 'securite'];

/** Paramètres de la maquette « BO — Paramètres » (coordonnées provisoires, adresse de l'agence à compléter). */
const settings: Groups = {
  coordonnees: {
    group: 'coordonnees',
    phoneFrance: null,
    phoneCameroon: '+237600000000',
    email: 'contact@mamboproxi.com',
    hoursLabel: 'Lun – Sam · 8h – 20h',
    agency: {
      name: 'Agence MAMBO Proxi',
      addressLines: [],
      city: 'Douala',
      country: 'CM',
      phone: '+237600000000',
      phoneDisplay: '+237 6 00 00 00 00',
      latitude: 4.0511,
      longitude: 9.7679,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=4.0511,9.7679',
      openingHours: [
        { label: 'Lundi – vendredi', hours: '8 h – 18 h' },
        { label: 'Samedi', hours: '9 h – 13 h' },
      ],
      parcelReceptionNote: 'Réception des colis et courriers aux heures d’ouverture.',
    },
  },
  whatsapp: {
    group: 'whatsapp',
    enabled: true,
    number: '+237600000000',
    message: 'Bonjour Mambo Proxi, je souhaite des informations sur…',
  },
  reseaux: {
    group: 'reseaux',
    social: [
      { network: 'instagram', url: 'https://www.instagram.com/mamboproxi' },
      { network: 'facebook', url: 'https://www.facebook.com/mamboproxi' },
      { network: 'linkedin', url: 'https://www.linkedin.com/company/mamboproxi' },
      { network: 'tiktok', url: 'https://www.tiktok.com/@mamboproxi' },
    ],
  },
  emails: {
    group: 'emails',
    teamRecipients: ['equipe.douala@mamboproxi.com', 'mireille@mamboproxi.com'],
    senderName: 'MAMBO Proxi',
    replyTo: 'contact@mamboproxi.com',
    surveyDelayHours: 24,
    surveyReminderDays: 3,
    appointmentReminderHour: 9,
  },
  seo: {
    group: 'seo',
    defaultTitle: 'MAMBO Proxi — Services du quotidien à domicile à Douala',
    defaultDescription:
      'Entretien du logement, linge, repas, colis, chef privé, massage, photographe… Des intervenants de confiance à domicile, à Douala et environs.',
    ogImageId: null,
    ogImage: null,
    searchConsoleVerification: null,
  },
  analytics: { group: 'analytics', ga4MeasurementId: null, ga4PropertyId: null, newsletterTracking: true },
  chiffres: {
    group: 'chiffres',
    keyFigures: [
      { key: 'projects', value: 150, prefix: '', suffix: '+', decimals: 0, label: 'projets accompagnés' },
      { key: 'partners', value: 40, prefix: '', suffix: '+', decimals: 0, label: 'partenaires engagés' },
      { key: 'services', value: 30, prefix: '', decimals: 0, label: 'services réunis en 6 univers' },
      {
        key: 'area',
        valueText: 'Douala',
        prefix: '',
        decimals: 0,
        label: 'et environs, au départ de Cité SIC',
      },
    ],
  },
  rgpd: { group: 'rgpd', inactiveContactsRetentionMonths: 36, rejectedApplicationsRetentionMonths: 24 },
  securite: { group: 'securite', maintenanceMode: false, trustedDeviceDays: 30 },
};

/**
 * Versions anglaises des groupes qui ont des textes (seed de l'API : textes seulement, sans suivi d'empreinte, donc
 * à jour) ; le groupe `coordonnees` n'a pas d'adresse française dans la maquette, donc pas d'adresse anglaise.
 */
const translations: Record<TextGroup, MockTextTranslation> = {
  coordonnees: {
    en: {
      hoursLabel: 'Mon – Sat · 8am – 8pm',
      agency: {
        name: 'MAMBO Proxi agency',
        openingHours: [
          { label: 'Monday – Friday', hours: '8am – 6pm' },
          { label: 'Saturday', hours: '9am – 1pm' },
        ],
        parcelReceptionNote: 'Parcels and mail are received during opening hours.',
      },
    },
    sources: {},
  },
  whatsapp: { en: { message: 'Hello Mambo Proxi, I would like some information about…' }, sources: {} },
  seo: {
    en: {
      defaultTitle: 'MAMBO Proxi — Home services in Douala, Cameroon',
      defaultDescription:
        'Home cleaning, laundry, meals, parcels, private chef, massage, photographer: trusted professionals at your home, in Douala and the surrounding area.',
    },
    sources: {},
  },
  chiffres: {
    en: {
      keyFigures: [
        { suffix: '+', label: 'projects supported' },
        { suffix: '+', label: 'committed partners' },
        { label: 'services across 6 areas' },
        { valueText: 'Douala', label: 'and surroundings, starting from Cité SIC' },
      ],
    },
    sources: {},
  },
};

const UPDATED = '2026-10-05T08:00:00.000Z';

type TemplateSeed = Pick<EmailTemplate, 'key' | 'name' | 'description' | 'subject' | 'title'> & {
  audience: NonNullable<EmailTemplate['audience']>;
  paragraphs: string[];
  buttonLabel?: string;
  variables: string[];
};

const SEEDS: TemplateSeed[] = [
  {
    key: 'quote-ack',
    audience: 'client',
    name: 'Accusé de réception du devis',
    description: 'Envoyé dès qu’une demande de devis est reçue.',
    subject: 'Nous avons bien reçu votre demande {référence}',
    title: 'Bonjour {prénom}, nous avons bien reçu votre demande.',
    paragraphs: [
      'Merci pour votre confiance. Un conseiller étudie votre besoin et vous envoie un devis personnalisé sous 24 h.',
    ],
    buttonLabel: 'Écrire à mon conseiller sur WhatsApp',
    variables: ['{prénom}', '{nom}', '{référence}', '{service}', '{rubrique}', '{quartier}', '{ville}'],
  },
  {
    key: 'contact-ack',
    audience: 'client',
    name: 'Accusé de réception du message',
    description: 'Envoyé après un message du formulaire de contact.',
    subject: 'Votre message est bien arrivé',
    title: 'Merci {prénom} pour votre message',
    paragraphs: ['Nous vous répondons dans les meilleurs délais, en général dans la journée.'],
    variables: ['{prénom}', '{nom}', '{référence}'],
  },
  {
    key: 'registration-confirmed',
    audience: 'client',
    name: 'Confirmation d’inscription',
    description: 'Envoyé après une inscription (particulier ou professionnel).',
    subject: 'Bienvenue chez Mambo Proxi',
    title: 'Bienvenue chez Mambo Proxi\u202f!',
    paragraphs: [
      'Votre inscription est enregistrée. Vos prochaines demandes seront plus rapides et mieux suivies.',
      'Découvrez dès maintenant nos services, à Douala et environs.',
    ],
    buttonLabel: 'Découvrir nos services',
    variables: ['{prénom}', '{nom}', '{référence}'],
  },
  {
    key: 'application-received',
    audience: 'client',
    name: 'Candidature reçue',
    description: 'Envoyé après une candidature à une offre ou une candidature spontanée.',
    subject: 'Votre candidature est bien arrivée',
    title: 'Merci {prénom} pour votre candidature',
    paragraphs: ['Nous étudions votre candidature « {offre} » et revenons vers vous sous 15 jours.'],
    variables: ['{prénom}', '{nom}', '{référence}', '{offre}', '{poste}'],
  },
  {
    key: 'training-request-received',
    audience: 'client',
    name: 'Demande de formation reçue',
    description: 'Envoyé après une demande de formation.',
    subject: 'Votre demande de formation {référence}',
    title: 'Merci {prénom}, nous préparons votre formation',
    paragraphs: [
      'Votre demande pour « {formation} » est enregistrée. Nous vous proposons un programme sous 48 h.',
    ],
    variables: ['{prénom}', '{nom}', '{référence}', '{formation}'],
  },
  {
    key: 'partner-request-received',
    audience: 'client',
    name: 'Demande de partenariat reçue',
    description: 'Envoyé après une demande de partenariat.',
    subject: 'Votre demande de partenariat',
    title: 'Merci {prénom} pour votre intérêt',
    paragraphs: ['Nous étudions votre proposition et revenons vers vous rapidement.'],
    variables: ['{prénom}', '{nom}', '{référence}'],
  },
  {
    key: 'event-registration',
    audience: 'client',
    name: 'Inscription à un événement',
    description: 'Envoyé après une inscription à un événement de l’agenda.',
    subject: 'Votre inscription à « {événement} »',
    title: 'À bientôt {prénom} !',
    paragraphs: ['Votre place pour « {événement} » le {date} est réservée.'],
    variables: ['{prénom}', '{nom}', '{référence}', '{événement}', '{lieu}', '{date}', '{heure}'],
  },
  {
    key: 'appointment-received',
    audience: 'client',
    name: 'Demande de rendez-vous reçue',
    description: 'Envoyé dès qu’une demande de rendez-vous est reçue.',
    subject: 'Votre demande de rendez-vous {référence}',
    title: 'Merci {prénom}, nous confirmons votre créneau',
    paragraphs: ['Nous revenons vers vous rapidement pour confirmer le rendez-vous du {date}.'],
    variables: ['{prénom}', '{nom}', '{référence}', '{date}', '{heure}'],
  },
  {
    key: 'appointment-confirmed',
    audience: 'client',
    name: 'Rendez-vous confirmé',
    description: 'Envoyé à la confirmation du rendez-vous.',
    subject: 'Votre rendez-vous du {date} est confirmé',
    title: 'Votre rendez-vous est confirmé.',
    paragraphs: ['Nous avons hâte d’échanger avec vous. Vous recevrez un rappel la veille.'],
    buttonLabel: 'Ajouter à mon agenda',
    variables: ['{prénom}', '{nom}', '{référence}', '{service}', '{date}', '{heure}'],
  },
  {
    key: 'appointment-proposed',
    audience: 'client',
    name: 'Nouveau créneau proposé',
    description: 'Envoyé quand l’équipe propose un autre créneau.',
    subject: 'Un nouveau créneau vous est proposé',
    title: '{prénom}, ce créneau vous convient-il ?',
    paragraphs: ['Nous vous proposons le {date}. Confirmez-le ou choisissez-en un autre.'],
    buttonLabel: 'Répondre',
    variables: ['{prénom}', '{nom}', '{référence}', '{date}', '{heure}'],
  },
  {
    key: 'appointment-cancelled',
    audience: 'client',
    name: 'Rendez-vous annulé',
    description: 'Envoyé à l’annulation d’un rendez-vous.',
    subject: 'Votre rendez-vous du {date} est annulé',
    title: 'Rendez-vous annulé',
    paragraphs: ['Votre rendez-vous du {date} est annulé. Vous pouvez en reprendre un à tout moment.'],
    variables: ['{prénom}', '{nom}', '{référence}', '{date}', '{heure}'],
  },
  {
    key: 'appointment-reminder',
    audience: 'client',
    name: 'Rappel de rendez-vous',
    description: 'Envoyé la veille du rendez-vous.',
    subject: 'Rappel : rendez-vous demain',
    title: 'À demain, {prénom}',
    paragraphs: ['Nous vous rappelons votre rendez-vous du {date} pour « {service} ».'],
    variables: ['{prénom}', '{nom}', '{référence}', '{service}', '{date}', '{heure}'],
  },
  {
    key: 'survey-invitation',
    audience: 'client',
    name: 'Questionnaire de satisfaction',
    description: 'Envoyé après le passage au statut « Prestation réalisée ».',
    subject: 'Comment s’est passée votre prestation ?',
    title: 'Votre avis compte, {prénom}.',
    paragraphs: [
      'Votre prestation « {service} » du {date} est terminée. Pouvez-vous nous dire comment elle s’est passée\u202f? 5 questions, 2 minutes.',
    ],
    buttonLabel: 'Donner mon avis',
    variables: ['{prénom}', '{nom}', '{référence}', '{service}', '{date}'],
  },
  {
    key: 'survey-reminder',
    audience: 'client',
    name: 'Relance du questionnaire',
    description: 'Relance si le questionnaire n’a pas été rempli.',
    subject: 'Il n’est pas trop tard pour donner votre avis',
    title: 'Un instant, {prénom} ?',
    paragraphs: ['Votre retour sur « {service} » nous aide à progresser.'],
    buttonLabel: 'Donner mon avis',
    variables: ['{prénom}', '{nom}', '{référence}', '{service}'],
  },
  {
    key: 'newsletter-confirm',
    audience: 'client',
    name: 'Confirmation d’inscription à la newsletter',
    description: 'Double validation de l’adresse : obligatoire.',
    subject: 'Confirmez votre inscription à la newsletter',
    title: 'Plus qu’un clic',
    paragraphs: ['Confirmez votre adresse pour recevoir la newsletter de Mambo Proxi.'],
    buttonLabel: 'Confirmer mon inscription',
    variables: ['{prénom}', '{nom}'],
  },
  {
    key: 'newsletter-campaign',
    audience: 'client',
    name: 'Gabarit de la newsletter',
    description: 'En-tête et pied communs à tous les envois de la newsletter.',
    subject: '{objet}',
    title: 'Mambo Proxi',
    paragraphs: ['Vous recevez cet e-mail car vous êtes inscrit·e à la newsletter de Mambo Proxi.'],
    variables: ['{prénom}', '{nom}', '{objet}'],
  },
  {
    key: 'team-new-request',
    audience: 'equipe',
    name: 'Alerte « nouvelle demande »',
    description: 'Une notification par e-mail pour chaque nouvelle demande.',
    subject: 'Nouvelle demande {référence} · {service}',
    title: 'Nouvelle demande de {nom}',
    paragraphs: ['{nom} demande « {service} » à {quartier}.', 'Ouvrez la demande pour la qualifier.'],
    buttonLabel: 'Ouvrir la demande',
    variables: ['{nom}', '{référence}', '{service}', '{quartier}', '{ville}'],
  },
  {
    key: 'team-assignment',
    audience: 'equipe',
    name: 'Alerte « demande assignée »',
    description: 'Prévient la personne à qui une demande ou un rendez-vous vient d’être assigné.',
    subject: '{référence} vous est assignée · {service}',
    title: 'Une demande vous est assignée',
    paragraphs: ['{nom} demande « {service} ».', 'Ouvrez la demande pour la prendre en charge.'],
    buttonLabel: 'Ouvrir la demande',
    variables: ['{nom}', '{référence}', '{service}'],
  },
  {
    key: 'user-invite',
    audience: 'utilisateur',
    name: 'Invitation au back-office',
    description: 'Lien d’activation valable 7 jours.',
    subject: 'Votre accès au back-office Mambo Proxi',
    title: 'Bienvenue dans l’équipe, {prénom}',
    paragraphs: [
      'Vous êtes invité·e à rejoindre le back-office de Mambo Proxi. Le lien est valable 7 jours.',
    ],
    buttonLabel: 'Activer mon accès',
    variables: ['{prénom}', '{nom}'],
  },
  {
    key: 'otp-code',
    audience: 'utilisateur',
    name: 'Code de connexion',
    description: 'Code à usage unique de la double authentification.',
    subject: 'Votre code de connexion : {code}',
    title: 'Votre code de connexion',
    paragraphs: ['Saisissez le code {code}. Il expire dans 10 minutes.'],
    variables: ['{code}'],
  },
  {
    key: 'password-reset',
    audience: 'utilisateur',
    name: 'Réinitialisation du mot de passe',
    description: 'Lien de réinitialisation valable 1 heure.',
    subject: 'Réinitialisez votre mot de passe',
    title: 'Nouveau mot de passe',
    paragraphs: ['Choisissez un nouveau mot de passe. Le lien est valable 1 heure.'],
    buttonLabel: 'Choisir un mot de passe',
    variables: [],
  },
];

/** Ordre de l'énumération `EmailTemplateKey` du contrat (ordre de la liste renvoyée par l'API). */
const TEMPLATE_ORDER: EmailTemplateKey[] = [
  'quote-ack',
  'team-new-request',
  'team-assignment',
  'contact-ack',
  'appointment-received',
  'appointment-confirmed',
  'appointment-proposed',
  'appointment-cancelled',
  'appointment-reminder',
  'survey-invitation',
  'survey-reminder',
  'registration-confirmed',
  'application-received',
  'training-request-received',
  'partner-request-received',
  'event-registration',
  'newsletter-confirm',
  'newsletter-campaign',
  'user-invite',
  'otp-code',
  'password-reset',
];

/**
 * E-mails indispensables (API : `ESSENTIAL_TEMPLATES`) : sécurité, invitation, double opt-in et gabarit des
 * campagnes, jamais désactivables et toujours envoyés.
 */
const ESSENTIAL_TEMPLATES = new Set<EmailTemplateKey>([
  'otp-code',
  'password-reset',
  'user-invite',
  'newsletter-confirm',
  'newsletter-campaign',
]);

export const adminEmailTemplates: EmailTemplate[] = SEEDS.map((seed) => ({
  preheader: null,
  buttonLabel: null,
  ...seed,
  enabled: true,
  canDisable: !ESSENTIAL_TEMPLATES.has(seed.key!),
  updatedAt: UPDATED,
})).sort((a, b) => TEMPLATE_ORDER.indexOf(a.key!) - TEMPLATE_ORDER.indexOf(b.key!));

export { adminUsers };

/**
 * Sauvegardes simulées : une par nuit à 03:00, heure de Douala (UTC+1) ; l'API renvoie la dernière sauvegarde
 * réussie (`backup_runs`), `null` tant qu'aucune n'a eu lieu.
 */
function lastBackup(now = new Date()): string {
  const backup = new Date(now);
  backup.setUTCHours(2, 0, 0, 0);
  if (backup > now) backup.setUTCDate(backup.getUTCDate() - 1);
  return backup.toISOString();
}

/** Version de l'API (`package.json`) et serveur d'envoi (`SMTP_HOST`, valeur par défaut de l'API en développement). */
const API_VERSION = '0.1.0';
const SMTP_HOST = 'localhost';

/** HTTPS actif si le site et l'API sont servis en `https://` (comme `WEB_URL` et `API_URL` de l'API). */
function httpsEnabled(request: Request): boolean {
  const site = typeof location !== 'undefined' && location.origin.startsWith('http') ? location.origin : null;
  return new URL(request.url).protocol === 'https:' && (site === null || site.startsWith('https://'));
}

const E164 = /^\+[1-9]\d{6,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+\.\S+$/;
const NETWORKS = ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'x'];
type FieldError = NonNullable<Problem['errors']>[number];

/** Champs du contrat de chaque groupe (API : `GROUP_FIELDS`) ; les autres clés envoyées sont ignorées. */
const GROUP_FIELDS: Record<SettingsGroup, readonly string[]> = {
  coordonnees: ['phoneFrance', 'phoneCameroon', 'email', 'hoursLabel', 'agency'],
  whatsapp: ['enabled', 'number', 'message'],
  reseaux: ['social'],
  emails: [
    'teamRecipients',
    'senderName',
    'replyTo',
    'surveyDelayHours',
    'surveyReminderDays',
    'appointmentReminderHour',
  ],
  seo: ['defaultTitle', 'defaultDescription', 'ogImageId', 'searchConsoleVerification'],
  analytics: ['ga4MeasurementId', 'ga4PropertyId', 'newsletterTracking'],
  chiffres: ['keyFigures'],
  rgpd: ['inactiveContactsRetentionMonths', 'rejectedApplicationsRetentionMonths'],
  securite: ['maintenanceMode', 'trustedDeviceDays'],
};

/** Groupe renvoyé comme par l'API : champs du contrat, image de partage relue dans la médiathèque. */
function groupValue(group: SettingsGroup): Groups[SettingsGroup] {
  const stored = settings[group] as Record<string, unknown>;
  const value: Record<string, unknown> = { group };
  for (const field of GROUP_FIELDS[group]) if (field in stored) value[field] = stored[field];
  // Version anglaise et son statut (groupes qui ont des textes, liste blanche de l'API).
  if (isTextGroup(group)) {
    const rules = settingsTextRules(group);
    value.translations = { en: pickEnglish(value, translations[group].en, rules) };
    value.translationStatus = { en: mockTextStatus(value, translations[group], rules) };
  }
  if (group === 'seo') {
    const media = adminMedia.find((item) => item.id === stored.ogImageId);
    value.ogImage = media
      ? {
          id: media.id,
          url: media.url,
          width: media.width,
          height: media.height,
          alt: media.alt,
          focalPoint: media.focalPoint,
          blurDataUrl: media.blurDataUrl,
          variants: media.variants,
        }
      : null;
  }
  return value as Groups[SettingsGroup];
}

/** Contrôles du schéma `settingsGroupSchema` de l'API pour un groupe (messages en français, chemins des champs). */
function validate(group: SettingsGroup, value: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  const check = (ok: boolean, path: string, message: string, code = 'invalid') => {
    if (!ok) errors.push({ path, code, message });
  };
  const text = (key: string) => (typeof value[key] === 'string' ? (value[key] as string).trim() : '');
  const integer = (key: string, min: number, max: number, message: string, nullable = false) => {
    const number = value[key];
    if (nullable && number === null) return;
    check(
      typeof number === 'number' && Number.isInteger(number) && number >= min && number <= max,
      key,
      message,
      'invalid_type',
    );
  };
  const phoneMessage = 'Saisissez un numéro au format +237 6 00 00 00 00.';
  const optionalPhone = (phone: unknown) =>
    phone === null || phone === undefined || (typeof phone === 'string' && E164.test(phone.trim()));
  switch (group) {
    case 'coordonnees': {
      check(E164.test(text('phoneCameroon')), 'phoneCameroon', phoneMessage, 'invalid_format');
      check(optionalPhone(value.phoneFrance), 'phoneFrance', phoneMessage, 'invalid_format');
      check(EMAIL.test(text('email')), 'email', 'Saisissez une adresse e-mail valide.', 'invalid_email');
      check(Boolean(text('hoursLabel')), 'hoursLabel', 'Indiquez les horaires.', 'required');
      const agency = value.agency;
      if (typeof agency !== 'object' || agency === null) {
        check(false, 'agency', 'Ce champ est obligatoire.', 'required');
        break;
      }
      const fields = agency as Record<string, unknown>;
      check(
        /^[A-Z]{2}$/.test(String(fields.country ?? '')),
        'agency.country',
        'Code pays ISO 3166-1 attendu (ex. CM).',
        'invalid_format',
      );
      check(optionalPhone(fields.phone), 'agency.phone', phoneMessage, 'invalid_format');
      break;
    }
    case 'whatsapp': {
      check(E164.test(text('number')), 'number', phoneMessage, 'invalid_format');
      check(text('message').length <= 500, 'message', '500 caractères au maximum.', 'too_long');
      check(typeof value.enabled === 'boolean', 'enabled', 'Indiquez oui ou non.', 'invalid_type');
      break;
    }
    case 'reseaux': {
      const social = (value.social as SettingsReseaux['social'] | undefined) ?? [];
      check(social.length <= 6, 'social', 'Sélectionnez au plus 6 éléments.', 'too_many');
      social.forEach((item, index) => {
        check(
          NETWORKS.includes(item.network),
          `social.${index}.network`,
          'Réseau inconnu.',
          'invalid_choice',
        );
        check(
          URL_PATTERN.test(item.url),
          `social.${index}.url`,
          'Saisissez une adresse valide.',
          'invalid_url',
        );
      });
      break;
    }
    case 'emails': {
      const recipients = (value.teamRecipients as string[] | undefined) ?? [];
      check(
        recipients.length > 0 && recipients.length <= 20 && recipients.every((email) => EMAIL.test(email)),
        'teamRecipients',
        'Indiquez au moins une adresse valide.',
      );
      check(Boolean(text('senderName')), 'senderName', 'Indiquez le nom de l’expéditeur.', 'required');
      const replyTo = value.replyTo as string | null | undefined;
      check(
        !replyTo || EMAIL.test(replyTo),
        'replyTo',
        'Saisissez une adresse e-mail valide.',
        'invalid_email',
      );
      integer('surveyDelayHours', 0, 720, 'Entre 0 et 720 heures.');
      integer('surveyReminderDays', 1, 30, 'Entre 1 et 30 jours.', true);
      integer('appointmentReminderHour', 0, 23, 'Entre 0 et 23 h.');
      break;
    }
    case 'seo': {
      check(Boolean(text('defaultTitle')), 'defaultTitle', 'Indiquez le titre.', 'required');
      check(text('defaultTitle').length <= 60, 'defaultTitle', '60 caractères au maximum.', 'too_long');
      check(
        Boolean(text('defaultDescription')),
        'defaultDescription',
        'Indiquez la description.',
        'required',
      );
      check(
        text('defaultDescription').length <= 160,
        'defaultDescription',
        '160 caractères au maximum.',
        'too_long',
      );
      break;
    }
    case 'analytics': {
      const id = value.ga4MeasurementId as string | null | undefined;
      check(
        !id || /^G-[A-Z0-9]+$/.test(id),
        'ga4MeasurementId',
        'Identifiant au format G-XXXXXXXXXX.',
        'invalid_format',
      );
      break;
    }
    case 'rgpd': {
      integer('inactiveContactsRetentionMonths', 6, 120, 'Entre 6 et 120 mois.');
      integer('rejectedApplicationsRetentionMonths', 1, 60, 'Entre 1 et 60 mois.');
      break;
    }
    case 'securite': {
      check(
        typeof value.maintenanceMode === 'boolean',
        'maintenanceMode',
        'Indiquez oui ou non.',
        'invalid_type',
      );
      if (value.trustedDeviceDays !== undefined) integer('trustedDeviceDays', 0, 90, 'Entre 0 et 90 jours.');
      break;
    }
    case 'chiffres': {
      check(
        Array.isArray(value.keyFigures),
        'keyFigures',
        'Une liste de valeurs est attendue.',
        'invalid_type',
      );
      if (Array.isArray(value.keyFigures))
        check(value.keyFigures.length <= 8, 'keyFigures', 'Sélectionnez au plus 8 éléments.', 'too_many');
      break;
    }
  }
  return errors;
}

/** Données d'exemple des aperçus, par variable normalisée (`prenom`, `reference`…). */
const SAMPLE: Record<string, string> = {
  prenom: 'Aurélie',
  nom: 'Aurélie Ngo',
  reference: 'MP-2026-0142',
  service: 'Entretien du logement',
  rubrique: 'Services à domicile',
  quartier: 'Bonapriso',
  ville: 'Douala',
  lieu: 'Agence MAMBO Proxi, Douala',
  date: 'jeudi 6 novembre à 10 h',
  heure: '10 h',
  offre: 'Assistant·e de vie',
  poste: 'Assistant·e de vie',
  formation: 'Hygiène et sécurité à domicile',
  evenement: 'Portes ouvertes de l’agence',
  objet: 'Les nouveautés de novembre',
  code: '482 913',
};

/** Variables écrites dans un texte (`{prénom}`, `{{prenom}}` accepté), comme `variablesIn` de l'API. */
const VARIABLE = /\{\{?\s*([\p{L}\p{N}_.-]+)\s*\}?\}/gu;

/**
 * Variables inconnues du modèle dans les textes envoyés (une erreur par champ, `unknown_variable`), avec la liste
 * des variables disponibles, comme l'API. Les noms sont comparés sans accents ni majuscules.
 */
function unknownVariableErrors(template: EmailTemplate, fields: EmailTemplateFields): FieldError[] {
  const variables = template.variables ?? [];
  const allowed = new Set(variables.map((variable) => normalize(variable.slice(1, -1))));
  const available =
    variables.length === 0
      ? 'Ce modèle n’utilise aucune variable.'
      : `Variables disponibles : ${variables.join(', ')}.`;
  const texts: [string, string | null | undefined][] = [
    ['subject', fields.subject],
    ['preheader', fields.preheader],
    ['title', fields.title],
    ['buttonLabel', fields.buttonLabel],
    ...(fields.paragraphs ?? []).map((paragraph, index): [string, string] => [
      `paragraphs.${index}`,
      paragraph,
    ]),
  ];
  return texts.flatMap(([path, text]) => {
    if (typeof text !== 'string') return [];
    const unknown = [...text.matchAll(VARIABLE)]
      .map((match) => match[1] ?? '')
      .filter((name) => !allowed.has(normalize(name)));
    return unknown.length === 0
      ? []
      : [
          {
            path,
            code: 'unknown_variable',
            message: `Variable inconnue : ${unknown.map((name) => `{${name}}`).join(', ')}. ${available}`,
          },
        ];
  });
}

/** Champs `EmailTemplateFields` (schéma de l'API) : textes coupés, paragraphes vides retirés, longueurs. */
function templateFields(body: EmailTemplateFields): { fields: EmailTemplateFields; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const fields: EmailTemplateFields = {};
  const required = (key: 'subject' | 'title', message: string) => {
    const value = body[key];
    if (value === undefined) return;
    if (typeof value !== 'string' || !value.trim()) errors.push({ path: key, code: 'required', message });
    else if (value.trim().length > 150)
      errors.push({ path: key, code: 'too_long', message: 'Saisissez au plus 150 caractères.' });
    else fields[key] = value.trim();
  };
  required('subject', 'Indiquez l’objet de l’e-mail.');
  required('title', 'Indiquez le titre.');
  for (const [key, max] of [
    ['preheader', 150],
    ['buttonLabel', 60],
  ] as const) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value === 'string' && value.trim().length > max)
      errors.push({ path: key, code: 'too_long', message: `Saisissez au plus ${max} caractères.` });
    else fields[key] = typeof value === 'string' && value.trim() ? value.trim() : null;
  }
  if (body.paragraphs !== undefined) {
    if (body.paragraphs.length > 8)
      errors.push({ path: 'paragraphs', code: 'too_many', message: '8 paragraphes au maximum.' });
    body.paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length > 1500)
        errors.push({
          path: `paragraphs.${index}`,
          code: 'too_long',
          message: 'Saisissez au plus 1500 caractères.',
        });
    });
    fields.paragraphs = body.paragraphs.map((item) => item.trim()).filter(Boolean);
  }
  if (body.enabled !== undefined) fields.enabled = body.enabled;
  return { fields, errors };
}

/** Variable remplacée par sa donnée d'exemple ; une variable sans valeur disparaît (`interpolate` de l'API). */
const fill = (text: string) =>
  text.replace(VARIABLE, (_match, name: string) => SAMPLE[normalize(name)] ?? '');
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rendu d'un modèle avec les données d'exemple (contenu non enregistré possible). */
function renderTemplate(template: EmailTemplate, draft: EmailTemplateFields = {}) {
  const fields = { ...template, ...draft };
  const subject = fill(fields.subject ?? '');
  const body = [
    `<h1>${escape(fill(fields.title ?? ''))}</h1>`,
    ...(fields.paragraphs ?? []).filter((item) => item.trim()).map((item) => `<p>${escape(fill(item))}</p>`),
    fields.buttonLabel ? `<p><a data-button href="#">${escape(fields.buttonLabel)}</a></p>` : '',
  ].join('');
  const footer =
    template.audience === 'equipe'
      ? 'Alerte envoyée à l’équipe Mambo Proxi.'
      : 'Mambo Proxi · Douala, Cameroun · contact@mamboproxi.com';
  return {
    subject,
    html: emailDocument(subject, body, footer),
    text: body
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  };
}

const findTemplate = (key: unknown) => adminEmailTemplates.find((item) => item.key === key);

const activeAdmins = (users: AdminUser[]) => users.filter((user) => user.role === 'ADMIN' && user.isActive);

/** Utilisateurs : permission `users:manage` (déjà contrôlée par la garde commune, rappelée ici pour les tests). */
function requireAdmin(request: Request) {
  return can(sessionUser(request), 'users:manage')
    ? null
    : forbidden('Cette action est réservée aux administrateurs.');
}

/** Back-office — Paramètres, modèles d’e-mails, utilisateurs (`/v1/admin/settings*`, `/v1/admin/email-templates*`, `/v1/admin/users*`, `/v1/admin/system-status`). */
export const adminSettingsHandlers = [
  http.get('*/v1/admin/settings/:group', ({ params }) => {
    const group = params.group as SettingsGroup;
    if (!GROUPS.includes(group)) return problem(404, 'Ce groupe de paramètres n’existe pas.');
    return HttpResponse.json(groupValue(group));
  }),

  http.put('*/v1/admin/settings/:group', async ({ request, params }) => {
    const body = await jsonBody<Record<string, unknown>>(request);
    // Corps validé d'abord (schéma du groupe envoyé), comme le `ZodValidationPipe` de l'API.
    const sent = body.group as SettingsGroup;
    if (!GROUPS.includes(sent))
      return validationProblem([
        { path: 'group', code: 'invalid_union', message: 'Groupe de paramètres inconnu.' },
      ]);
    const errors = validate(sent, body);
    if (errors.length) return validationProblem(errors);
    const group = params.group as SettingsGroup;
    if (!GROUPS.includes(group)) return problem(404, 'Ce groupe de paramètres n’existe pas.');
    // Groupes sensibles : `settings:admin` ; autres groupes : `settings:write`.
    const user = sessionUser(request);
    if (ADMIN_GROUPS.includes(group) ? !can(user, 'settings:admin') : !can(user, 'settings:write'))
      return forbidden(
        ADMIN_GROUPS.includes(group)
          ? 'Ces paramètres sont réservés aux administrateurs.'
          : 'Votre rôle ne permet pas de modifier les paramètres.',
      );
    if (sent !== group)
      return validationProblem([
        { path: 'group', code: 'group_mismatch', message: 'Le groupe envoyé ne correspond pas à l’adresse.' },
      ]);
    if (group === 'seo') {
      const mediaErrors = unknownMediaErrors([{ path: 'ogImageId', id: body.ogImageId as string | null }]);
      if (mediaErrors.length) return validationProblem(mediaErrors);
    }
    // Champs du contrat seulement (`ogImage`, en lecture seule, est ignoré).
    const fields = Object.fromEntries(
      GROUP_FIELDS[group].filter((field) => field in body).map((field) => [field, body[field]]),
    );
    const previous = settings[group];
    const next = { ...previous, ...fields };
    // Version anglaise : textes de la liste blanche, référence française mise à jour (`reviewedFields` compris).
    if (isTextGroup(group)) {
      const sent = body.translations as { en?: unknown; reviewedFields?: string[] } | undefined;
      const rules = settingsTextRules(group);
      const reviewed = sent?.reviewedFields ?? [];
      const reviewErrors = unknownReviewedFields(
        next,
        sent?.en,
        reviewed,
        rules,
        'translations.reviewedFields',
      );
      if (reviewErrors.length) return validationProblem(reviewErrors);
      translations[group] = saveMockTranslation({
        french: next,
        previousFrench: previous,
        before: translations[group],
        english: sent === undefined ? undefined : (sent.en ?? null),
        reviewed,
        rules,
      });
    }
    (settings as Record<SettingsGroup, unknown>)[group] = next;
    return HttpResponse.json(groupValue(group));
  }),

  // État du site : HTTPS déduit des adresses, dernière sauvegarde de la nuit simulée, version et serveur d'envoi.
  http.get('*/v1/admin/system-status', ({ request }) =>
    HttpResponse.json({
      https: httpsEnabled(request),
      lastBackupAt: lastBackup(),
      lastBackupSize: 48_300_000,
      backupRetentionDays: 30,
      version: API_VERSION,
      emailProvider: SMTP_HOST,
    } satisfies SystemStatus),
  ),

  http.get('*/v1/admin/email-templates', () => HttpResponse.json(adminEmailTemplates)),

  http.get('*/v1/admin/email-templates/:key', ({ params }) => {
    const template = findTemplate(params.key);
    return template ? HttpResponse.json(template) : problem(404, 'Ce modèle n’existe pas.');
  }),

  // Textes (variables du modèle seulement) et activation ; les e-mails indispensables restent actifs.
  http.put('*/v1/admin/email-templates/:key', async ({ request, params }) => {
    const body = await jsonBody<EmailTemplateFields>(request);
    const { fields, errors } = templateFields(body);
    const empty = Object.values(body).every((value) => value === undefined);
    if (empty) errors.push({ path: '', code: 'invalid', message: 'Aucune modification envoyée.' });
    if (errors.length) return validationProblem(errors);
    const template = findTemplate(params.key);
    if (!template) return problem(404, 'Ce modèle n’existe pas.');
    const ruleErrors = unknownVariableErrors(template, fields);
    if (fields.enabled === false && !template.canDisable)
      ruleErrors.push({
        path: 'enabled',
        code: 'cannot_disable',
        message: 'Cet e-mail est indispensable : il ne peut pas être désactivé.',
      });
    if (ruleErrors.length) return validationProblem(ruleErrors);
    Object.assign(template, fields, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(template);
  }),

  // Aperçu avec les données d'exemple (contenu non enregistré facultatif ; corps absent ou vide = modèle enregistré).
  http.post('*/v1/admin/email-templates/:key/preview', async ({ request, params }) => {
    const text = await request.text();
    const draft = text ? (JSON.parse(text) as EmailTemplateFields | null) : null;
    const { fields, errors } = templateFields(draft ?? {});
    if (errors.length) return validationProblem(errors);
    const template = findTemplate(params.key);
    if (!template) return problem(404, 'Ce modèle n’existe pas.');
    const variableErrors = unknownVariableErrors(template, fields);
    if (variableErrors.length) return validationProblem(variableErrors);
    return HttpResponse.json(renderTemplate(template, fields));
  }),

  // Envoi de test du modèle enregistré ; refusé (409) pour un modèle désactivé, que l'envoi n'enverrait pas.
  http.post('*/v1/admin/email-templates/:key/test', async ({ request, params }) => {
    const { email } = await jsonBody<{ email?: string }>(request);
    if (!email || email.length > 254 || !EMAIL.test(email))
      return validationProblem([
        { path: 'email', code: 'invalid_email', message: 'Saisissez une adresse e-mail valide.' },
      ]);
    const template = findTemplate(params.key);
    if (!template) return problem(404, 'Ce modèle n’existe pas.');
    if (!template.enabled)
      return problem(409, 'Ce modèle est désactivé : activez-le avant d’envoyer un test.');
    return HttpResponse.json({ message: `E-mail de test envoyé à ${email}.` }, { status: 202 });
  }),

  http.get('*/v1/admin/users', ({ request }) => requireAdmin(request) ?? HttpResponse.json(adminUsers)),

  http.post('*/v1/admin/users/invite', async ({ request }) => {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const body = await jsonBody<{ email?: string; name?: string; role?: Role }>(request);
    const errors: FieldError[] = [];
    const name = body.name?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    if (!name) errors.push({ path: 'name', message: 'Indiquez le nom.' });
    if (!EMAIL.test(email)) errors.push({ path: 'email', message: 'Saisissez une adresse e-mail valide.' });
    if (!body.role || !ROLES.includes(body.role))
      errors.push({ path: 'role', message: 'Choisissez un rôle.' });
    if (errors.length) return validationProblem(errors);
    if (adminUsers.some((user) => user.email === email))
      return problem(409, 'Un utilisateur utilise déjà cette adresse.');
    const now = new Date().toISOString();
    const user: AdminUser = {
      id: mockId('usr'),
      email,
      name,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
      role: body.role!,
      isActive: true,
      status: 'INVITE',
      invitedAt: now,
      lastLoginAt: null,
      lastActiveAt: null,
      createdAt: now,
    };
    adminUsers.push(user);
    return HttpResponse.json(user, { status: 201 });
  }),

  http.patch('*/v1/admin/users/:id', async ({ request, params }) => {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const user = adminUsers.find((item) => item.id === params.id);
    if (!user) return problem(404, 'Cet utilisateur n’existe plus.');
    const body = await jsonBody<{ name?: string; role?: Role; isActive?: boolean }>(request);
    if (body.role !== undefined && !ROLES.includes(body.role))
      return problem(422, 'Rôle inconnu.', [{ path: 'role', message: 'Choisissez un rôle.' }]);
    if (body.isActive === false && user.id === sessionUser(request)?.id)
      return problem(409, 'Vous ne pouvez pas désactiver votre propre compte.');
    const next = { ...user, ...body };
    if (!activeAdmins(adminUsers.map((item) => (item.id === user.id ? next : item))).length)
      return problem(409, 'Impossible de retirer le dernier administrateur actif.');
    Object.assign(user, body, {
      status: next.isActive === false ? 'DESACTIVE' : user.lastLoginAt ? 'ACTIF' : 'INVITE',
    });
    if (body.role) syncSessionRole(user.id, body.role);
    return HttpResponse.json(user);
  }),

  http.delete('*/v1/admin/users/:id', ({ request, params }) => {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const index = adminUsers.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cet utilisateur n’existe plus.');
    if (adminUsers[index]!.id === sessionUser(request)?.id)
      return problem(409, 'Vous ne pouvez pas supprimer votre propre compte.');
    if (!activeAdmins(adminUsers.filter((_, position) => position !== index)).length)
      return problem(409, 'Impossible de supprimer le dernier administrateur actif.');
    adminUsers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/users/:id/reset-password', ({ request, params }) => {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const user = adminUsers.find((item) => item.id === params.id);
    if (!user) return problem(404, 'Cet utilisateur n’existe plus.');
    return HttpResponse.json(
      {
        message:
          user.status === 'INVITE'
            ? `Invitation renvoyée à ${user.email}.`
            : `Lien de réinitialisation envoyé à ${user.email}.`,
      },
      { status: 202 },
    );
  }),
];
