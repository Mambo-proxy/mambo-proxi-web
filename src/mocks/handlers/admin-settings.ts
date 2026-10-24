import { http, HttpResponse } from 'msw';
import type {
  AdminUser,
  EmailTemplate,
  EmailTemplateFields,
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
import { jsonBody, mockId } from '../admin-utils';
import { emailDocument } from '../email-layout';
import { problem } from '../problem';
import { mockUsers, sessionUser } from '../session';

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

const UPDATED = '2026-10-05T08:00:00.000Z';

type TemplateSeed = Pick<EmailTemplate, 'key' | 'name' | 'description' | 'subject' | 'title'> & {
  audience: NonNullable<EmailTemplate['audience']>;
  paragraphs: string[];
  buttonLabel?: string;
  variables: string[];
  canDisable?: boolean;
};

const SEEDS: TemplateSeed[] = [
  {
    key: 'quote-ack',
    audience: 'client',
    name: 'Accusé de réception du devis',
    description: 'Envoyé dès qu’une demande de devis est reçue.',
    subject: 'Nous avons bien reçu votre demande {référence}',
    title: 'Merci {prénom}, votre demande est bien arrivée',
    paragraphs: [
      'Votre demande de devis pour « {service} » est enregistrée sous la référence {référence}.',
      'Un membre de l’équipe vous recontacte sous 24 h ouvrées pour préciser votre besoin.',
    ],
    buttonLabel: 'Suivre ma demande',
    variables: ['{prénom}', '{référence}', '{service}', '{lien}'],
  },
  {
    key: 'contact-ack',
    audience: 'client',
    name: 'Accusé de réception du message',
    description: 'Envoyé après un message du formulaire de contact.',
    subject: 'Votre message est bien arrivé',
    title: 'Merci {prénom} pour votre message',
    paragraphs: ['Nous vous répondons dans les meilleurs délais, en général dans la journée.'],
    variables: ['{prénom}', '{référence}'],
  },
  {
    key: 'registration-confirmed',
    audience: 'client',
    name: 'Confirmation d’inscription',
    description: 'Envoyé après une inscription (particulier ou professionnel).',
    subject: 'Bienvenue chez Mambo Proxi',
    title: 'Bienvenue {prénom}',
    paragraphs: [
      'Votre inscription est confirmée. Vous pouvez désormais demander un service en quelques clics.',
    ],
    buttonLabel: 'Demander un service',
    variables: ['{prénom}', '{lien}'],
  },
  {
    key: 'application-received',
    audience: 'client',
    name: 'Candidature reçue',
    description: 'Envoyé après une candidature à une offre ou une candidature spontanée.',
    subject: 'Votre candidature est bien arrivée',
    title: 'Merci {prénom} pour votre candidature',
    paragraphs: ['Nous étudions votre candidature « {offre} » et revenons vers vous sous 15 jours.'],
    variables: ['{prénom}', '{offre}', '{référence}'],
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
    variables: ['{prénom}', '{formation}', '{référence}'],
  },
  {
    key: 'partner-request-received',
    audience: 'client',
    name: 'Demande de partenariat reçue',
    description: 'Envoyé après une demande de partenariat.',
    subject: 'Votre demande de partenariat',
    title: 'Merci {prénom} pour votre intérêt',
    paragraphs: ['Nous étudions votre proposition et revenons vers vous rapidement.'],
    variables: ['{prénom}', '{organisation}', '{référence}'],
  },
  {
    key: 'event-registration',
    audience: 'client',
    name: 'Inscription à un événement',
    description: 'Envoyé après une inscription à un événement de l’agenda.',
    subject: 'Votre inscription à « {événement} »',
    title: 'À bientôt {prénom} !',
    paragraphs: ['Votre place pour « {événement} » le {date} est réservée.'],
    variables: ['{prénom}', '{événement}', '{date}'],
  },
  {
    key: 'appointment-received',
    audience: 'client',
    name: 'Demande de rendez-vous reçue',
    description: 'Envoyé dès qu’une demande de rendez-vous est reçue.',
    subject: 'Votre demande de rendez-vous {référence}',
    title: 'Merci {prénom}, nous confirmons votre créneau',
    paragraphs: ['Nous revenons vers vous rapidement pour confirmer le rendez-vous du {date}.'],
    variables: ['{prénom}', '{date}', '{référence}'],
  },
  {
    key: 'appointment-confirmed',
    audience: 'client',
    name: 'Rendez-vous confirmé',
    description: 'Envoyé à la confirmation du rendez-vous.',
    subject: 'Votre rendez-vous du {date} est confirmé',
    title: 'C’est confirmé, {prénom}',
    paragraphs: ['Rendez-vous le {date} pour « {service} ». Un rappel vous sera envoyé la veille.'],
    buttonLabel: 'Ajouter à mon agenda',
    variables: ['{prénom}', '{date}', '{service}', '{lien}'],
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
    variables: ['{prénom}', '{date}', '{lien}'],
  },
  {
    key: 'appointment-cancelled',
    audience: 'client',
    name: 'Rendez-vous annulé',
    description: 'Envoyé à l’annulation d’un rendez-vous.',
    subject: 'Votre rendez-vous du {date} est annulé',
    title: 'Rendez-vous annulé',
    paragraphs: ['Votre rendez-vous du {date} est annulé. Vous pouvez en reprendre un à tout moment.'],
    variables: ['{prénom}', '{date}'],
  },
  {
    key: 'appointment-reminder',
    audience: 'client',
    name: 'Rappel de rendez-vous',
    description: 'Envoyé la veille du rendez-vous.',
    subject: 'Rappel : rendez-vous demain',
    title: 'À demain, {prénom}',
    paragraphs: ['Nous vous rappelons votre rendez-vous du {date} pour « {service} ».'],
    variables: ['{prénom}', '{date}', '{service}'],
  },
  {
    key: 'survey-invitation',
    audience: 'client',
    name: 'Questionnaire de satisfaction',
    description: 'Envoyé après le passage au statut « Prestation réalisée ».',
    subject: 'Comment s’est passée votre prestation ?',
    title: 'Votre avis compte, {prénom}',
    paragraphs: ['Deux minutes suffisent pour nous dire comment s’est passée la prestation « {service} ».'],
    buttonLabel: 'Donner mon avis',
    variables: ['{prénom}', '{service}', '{lien}'],
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
    variables: ['{prénom}', '{service}', '{lien}'],
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
    variables: ['{lien}'],
    canDisable: false,
  },
  {
    key: 'newsletter-campaign',
    audience: 'client',
    name: 'Gabarit de la newsletter',
    description: 'En-tête et pied communs à tous les envois de la newsletter.',
    subject: '{objet}',
    title: 'Mambo Proxi',
    paragraphs: ['Vous recevez cet e-mail car vous êtes inscrit·e à la newsletter de Mambo Proxi.'],
    variables: ['{objet}', '{prénom}', '{lien}'],
    canDisable: false,
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
    variables: ['{nom}', '{service}', '{quartier}', '{référence}', '{lien}'],
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
    variables: ['{prénom}', '{lien}'],
    canDisable: false,
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
    canDisable: false,
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
    variables: ['{lien}'],
    canDisable: false,
  },
];

export const adminEmailTemplates: EmailTemplate[] = SEEDS.map((seed) => ({
  preheader: null,
  buttonLabel: null,
  ...seed,
  enabled: true,
  canDisable: seed.canDisable ?? true,
  updatedAt: UPDATED,
}));

/** Utilisateurs du back-office (maquette : « 2 utilisateurs », Mireille Bell et Équipe Douala). */
export const adminUsers: AdminUser[] = mockUsers.map((user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  initials: user.initials ?? '',
  role: user.role,
  isActive: true,
  status: 'ACTIF',
  invitedAt: null,
  lastLoginAt: user.lastLoginAt ?? null,
  createdAt: '2026-06-02T09:00:00.000Z',
}));

/** Sauvegarde de la nuit à 03:00, heure de Douala (UTC+1). */
function lastBackup(now = new Date()): string {
  const backup = new Date(now);
  backup.setUTCHours(2, 0, 0, 0);
  if (backup > now) backup.setUTCDate(backup.getUTCDate() - 1);
  return backup.toISOString();
}

const E164 = /^\+[1-9]\d{6,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+\.\S+$/;
type FieldError = NonNullable<Problem['errors']>[number];

/** Contrôles de l'API sur un groupe (messages en français, chemins des champs). */
function validate(group: SettingsGroup, value: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  const check = (ok: boolean, path: string, message: string) => {
    if (!ok) errors.push({ path, message });
  };
  const text = (key: string) => (typeof value[key] === 'string' ? (value[key] as string).trim() : '');
  switch (group) {
    case 'coordonnees': {
      check(
        E164.test(text('phoneCameroon')),
        'phoneCameroon',
        'Saisissez un numéro au format +237 6 00 00 00 00.',
      );
      check(EMAIL.test(text('email')), 'email', 'Saisissez une adresse e-mail valide.');
      check(Boolean(text('hoursLabel')), 'hoursLabel', 'Indiquez les horaires.');
      break;
    }
    case 'whatsapp': {
      check(E164.test(text('number')), 'number', 'Saisissez un numéro au format +237 6 00 00 00 00.');
      check(text('message').length <= 500, 'message', '500 caractères au maximum.');
      break;
    }
    case 'reseaux': {
      const social = (value.social as SettingsReseaux['social'] | undefined) ?? [];
      social.forEach((item, index) =>
        check(URL_PATTERN.test(item.url), `social.${index}.url`, 'Saisissez une adresse valide.'),
      );
      break;
    }
    case 'emails': {
      const recipients = (value.teamRecipients as string[] | undefined) ?? [];
      check(
        recipients.length > 0 && recipients.every((email) => EMAIL.test(email)),
        'teamRecipients',
        'Indiquez au moins une adresse valide.',
      );
      check(Boolean(text('senderName')), 'senderName', 'Indiquez le nom de l’expéditeur.');
      const replyTo = value.replyTo as string | null | undefined;
      check(!replyTo || EMAIL.test(replyTo), 'replyTo', 'Saisissez une adresse e-mail valide.');
      const delay = value.surveyDelayHours as number;
      check(
        Number.isInteger(delay) && delay >= 0 && delay <= 720,
        'surveyDelayHours',
        'Entre 0 et 720 heures.',
      );
      const reminder = value.surveyReminderDays as number | null;
      check(
        reminder === null || (Number.isInteger(reminder) && reminder >= 1 && reminder <= 30),
        'surveyReminderDays',
        'Entre 1 et 30 jours.',
      );
      const hour = value.appointmentReminderHour as number;
      check(Number.isInteger(hour) && hour >= 0 && hour <= 23, 'appointmentReminderHour', 'Entre 0 et 23 h.');
      break;
    }
    case 'seo': {
      check(Boolean(text('defaultTitle')), 'defaultTitle', 'Indiquez le titre.');
      check(text('defaultTitle').length <= 60, 'defaultTitle', '60 caractères au maximum.');
      check(Boolean(text('defaultDescription')), 'defaultDescription', 'Indiquez la description.');
      check(text('defaultDescription').length <= 160, 'defaultDescription', '160 caractères au maximum.');
      break;
    }
    case 'analytics': {
      const id = value.ga4MeasurementId as string | null | undefined;
      check(!id || /^G-[A-Z0-9]+$/.test(id), 'ga4MeasurementId', 'Identifiant au format G-XXXXXXXXXX.');
      break;
    }
    case 'rgpd': {
      const contacts = value.inactiveContactsRetentionMonths as number;
      const applications = value.rejectedApplicationsRetentionMonths as number;
      check(contacts >= 6 && contacts <= 120, 'inactiveContactsRetentionMonths', 'Entre 6 et 120 mois.');
      check(
        applications >= 1 && applications <= 60,
        'rejectedApplicationsRetentionMonths',
        'Entre 1 et 60 mois.',
      );
      break;
    }
    case 'securite': {
      const days = (value.trustedDeviceDays as number | undefined) ?? 30;
      check(Number.isInteger(days) && days >= 0 && days <= 90, 'trustedDeviceDays', 'Entre 0 et 90 jours.');
      break;
    }
    case 'chiffres':
      break;
  }
  return errors;
}

const SAMPLE: Record<string, string> = {
  '{prénom}': 'Aurélie',
  '{nom}': 'Aurélie Ngo',
  '{référence}': 'MP-2026-0142',
  '{service}': 'Entretien du logement',
  '{quartier}': 'Bonapriso',
  '{date}': 'jeudi 6 novembre à 10 h',
  '{offre}': 'Assistant·e de vie',
  '{formation}': 'Hygiène et sécurité à domicile',
  '{organisation}': 'DLA Transports',
  '{événement}': 'Portes ouvertes de l’agence',
  '{objet}': 'Les nouveautés de novembre',
  '{code}': '482 913',
  '{lien}': '#',
};

const fill = (text: string) => text.replace(/\{[^}]+\}/g, (name) => SAMPLE[name] ?? name);
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

function requireAdmin(request: Request) {
  return sessionUser(request)?.role === 'ADMIN'
    ? null
    : problem(403, 'Cette action est réservée aux administrateurs.');
}

/** Back-office — Paramètres, modèles d’e-mails, utilisateurs, journal (`/v1/admin/settings*`, `/v1/admin/email-templates*`, `/v1/admin/users*`, `/v1/admin/audit-log`, `/v1/admin/system-status`). */
export const adminSettingsHandlers = [
  http.get('*/v1/admin/settings/:group', ({ params }) => {
    const group = params.group as SettingsGroup;
    if (!GROUPS.includes(group)) return problem(404, 'Ce groupe de paramètres n’existe pas.');
    return HttpResponse.json(settings[group]);
  }),

  http.put('*/v1/admin/settings/:group', async ({ request, params }) => {
    const group = params.group as SettingsGroup;
    if (!GROUPS.includes(group)) return problem(404, 'Ce groupe de paramètres n’existe pas.');
    if (ADMIN_GROUPS.includes(group)) {
      const denied = requireAdmin(request);
      if (denied) return denied;
    }
    const body = await jsonBody<Record<string, unknown>>(request);
    if (body.group !== group) return problem(422, 'Le groupe envoyé ne correspond pas à l’adresse.');
    const errors = validate(group, body);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    (settings as Record<SettingsGroup, unknown>)[group] = { ...settings[group], ...body };
    return HttpResponse.json(settings[group]);
  }),

  http.get('*/v1/admin/system-status', () =>
    HttpResponse.json({
      https: true,
      lastBackupAt: lastBackup(),
      lastBackupSize: 48_300_000,
      backupRetentionDays: 30,
      version: '1.0.0',
      emailProvider: 'Resend',
    } satisfies SystemStatus),
  ),

  http.get('*/v1/admin/email-templates', () => HttpResponse.json(adminEmailTemplates)),

  http.get('*/v1/admin/email-templates/:key', ({ params }) => {
    const template = findTemplate(params.key);
    return template ? HttpResponse.json(template) : problem(404, 'Ce modèle n’existe pas.');
  }),

  http.put('*/v1/admin/email-templates/:key', async ({ request, params }) => {
    const template = findTemplate(params.key);
    if (!template) return problem(404, 'Ce modèle n’existe pas.');
    const body = await jsonBody<EmailTemplateFields>(request);
    const errors: FieldError[] = [];
    if (body.subject !== undefined && !body.subject.trim())
      errors.push({ path: 'subject', message: 'Indiquez l’objet de l’e-mail.' });
    if (body.title !== undefined && !body.title.trim())
      errors.push({ path: 'title', message: 'Indiquez le titre.' });
    if (body.paragraphs && body.paragraphs.length > 8)
      errors.push({ path: 'paragraphs', message: '8 paragraphes au maximum.' });
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    if (body.enabled === false && !template.canDisable)
      return problem(422, 'Cet e-mail est indispensable : il ne peut pas être désactivé.');
    Object.assign(template, body, {
      paragraphs: body.paragraphs?.map((item) => item.trim()).filter(Boolean) ?? template.paragraphs,
      updatedAt: new Date().toISOString(),
    });
    return HttpResponse.json(template);
  }),

  http.post('*/v1/admin/email-templates/:key/preview', async ({ request, params }) => {
    const template = findTemplate(params.key);
    if (!template) return problem(404, 'Ce modèle n’existe pas.');
    const text = await request.text();
    return HttpResponse.json(renderTemplate(template, text ? (JSON.parse(text) as EmailTemplateFields) : {}));
  }),

  http.post('*/v1/admin/email-templates/:key/test', async ({ request, params }) => {
    if (!findTemplate(params.key)) return problem(404, 'Ce modèle n’existe pas.');
    const { email } = await jsonBody<{ email?: string }>(request);
    if (!email || !EMAIL.test(email))
      return problem(422, 'Adresse e-mail invalide.', [
        { path: 'email', message: 'Saisissez une adresse e-mail valide.' },
      ]);
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
    if (body.role !== 'ADMIN' && body.role !== 'EDITOR')
      errors.push({ path: 'role', message: 'Choisissez un rôle.' });
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
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
    if (body.isActive === false && user.id === sessionUser(request)?.id)
      return problem(409, 'Vous ne pouvez pas désactiver votre propre compte.');
    const next = { ...user, ...body };
    if (!activeAdmins(adminUsers.map((item) => (item.id === user.id ? next : item))).length)
      return problem(409, 'Impossible de retirer le dernier administrateur actif.');
    Object.assign(user, body, {
      status: next.isActive === false ? 'DESACTIVE' : user.lastLoginAt ? 'ACTIF' : 'INVITE',
    });
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
