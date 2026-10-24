import type {
  DynamicSection,
  IllustrationScene,
  KeyFigure,
  Link,
  PageKey,
  PageSection,
  PageSectionType,
  SectionItem,
  SectionTone,
} from '@/lib/api/schema';

/**
 * Modèle de l'écran « Pages & textes » (`92:10771`) : libellés et descriptions des sections, sections créées par
 * « Ajouter une section », validation champ par champ (partagée avec les gestionnaires simulés), chiffres clés.
 * Module sans React : utilisable côté mocks et dans les tests unitaires.
 */

/**
 * Pages de rubrique de la liste (maquette : « Expérience », « Immobilier »…). Elles ne sont pas des `PageKey` du
 * contrat : leur contenu est composé à partir de la rubrique et de ses services (écran Services).
 */
export const CATEGORY_PAGES = [
  { key: 'services-a-domicile', title: 'Services à domicile', path: '/services/services-a-domicile' },
  { key: 'experience', title: 'Expérience', path: '/services/experience' },
  { key: 'immobilier', title: 'Immobilier', path: '/services/immobilier' },
  { key: 'services-de-proximite', title: 'Services de proximité', path: '/services/services-de-proximite' },
  { key: 'culture-evenementiel', title: 'Culture & événementiel', path: '/services/culture-evenementiel' },
] as const;

export type CategoryPageKey = (typeof CATEGORY_PAGES)[number]['key'];

/** Les pages de rubrique s'insèrent après « Nos services », comme sur la maquette. */
export const CATEGORY_PAGES_AFTER: PageKey = 'services';

export const SECTION_TYPE_LABELS: Record<PageSectionType, string> = {
  hero: 'Section principale',
  marquee: 'Bandeau défilant',
  steps: 'Étapes',
  featureList: 'Liste d’atouts',
  cardGrid: 'Grille de cartes',
  textMedia: 'Texte et visuel',
  quote: 'Citation',
  statsGrid: 'Chiffres clés',
  team: 'Équipe',
  faq: 'Questions fréquentes',
  richText: 'Texte juridique',
  ctaBand: 'Appel à l’action',
  dynamic: 'Contenu automatique',
};

/** Aide de la fenêtre « Ajouter une section ». */
export const SECTION_TYPE_HELP: Record<PageSectionType, string> = {
  hero: 'Titre, texte, boutons et visuel en tête de page',
  marquee: 'Mentions qui défilent en continu',
  steps: 'Étapes numérotées : titre et texte',
  featureList: 'Atouts ou engagements : titre et texte, visuel',
  cardGrid: 'Cartes sur 1 à 4 colonnes',
  textMedia: 'Paragraphes, visuel et mots-clés',
  quote: 'Citation, auteur et visuel',
  statsGrid: 'Valeurs et libellés (150+, 40+…)',
  team: 'Membres de l’équipe : nom, rôle, photo',
  faq: 'Questions et réponses',
  richText: 'Articles mis en forme (pages légales)',
  ctaBand: 'Texte et bouton vers le devis',
  dynamic: 'Contenu calculé à partir d’un autre écran',
};

type DynamicSource = DynamicSection['source'];

/** Contenus calculés : description et écran où ils se gèrent. */
export const DYNAMIC_SOURCES: Record<
  DynamicSource,
  { label: string; description: string; manage?: { label: string; screen: string } }
> = {
  'categories-bento': {
    label: 'Rubriques de services',
    description: 'Générée automatiquement à partir des Services',
    manage: { label: 'Services', screen: 'services' },
  },
  'categories-list': {
    label: 'Liste des rubriques',
    description: 'Rubriques et services générés automatiquement à partir des Services',
    manage: { label: 'Services', screen: 'services' },
  },
  'reviews-highlight': {
    label: 'Témoignages',
    description: 'Les avis publiés s’affichent automatiquement',
    manage: { label: 'Avis clients', screen: 'reviews' },
  },
  'reviews-list': {
    label: 'Liste des avis',
    description: 'Tous les avis publiés, avec filtres',
    manage: { label: 'Avis clients', screen: 'reviews' },
  },
  'partners-strip': {
    label: 'Partenaires et newsletter',
    description: 'Logos gérés dans Partenaires · inscription à la lettre',
    manage: { label: 'Partenaires', screen: 'partners' },
  },
  'partners-grid': {
    label: 'Logos des partenaires',
    description: 'Logos gérés dans Partenaires',
    manage: { label: 'Partenaires', screen: 'partners' },
  },
  'trainings-catalog': {
    label: 'Catalogue des formations',
    description: 'Formations publiées, gérées dans Formations',
    manage: { label: 'Formations', screen: 'trainings' },
  },
  'jobs-list': {
    label: 'Offres d’emploi',
    description: 'Offres publiées, gérées dans Recrutement',
    manage: { label: 'Recrutement', screen: 'jobs' },
  },
  'contact-cards': {
    label: 'Moyens de contact',
    description: 'Téléphones, e-mail et WhatsApp · repris des Paramètres',
    manage: { label: 'Paramètres', screen: 'settings' },
  },
  'appointment-booking': {
    label: 'Prise de rendez-vous',
    description: 'Créneaux calculés à partir des disponibilités',
    manage: { label: 'Rendez-vous', screen: 'appointments' },
  },
  'agency-map': {
    label: 'Agence et carte',
    description: 'Adresse et horaires · repris des Paramètres',
    manage: { label: 'Paramètres', screen: 'settings' },
  },
  'quote-form': { label: 'Formulaire de devis', description: 'Formulaire de demande de devis' },
  'registration-form': { label: 'Formulaire d’inscription', description: 'Formulaire d’inscription' },
  'partner-form': { label: 'Formulaire partenaire', description: 'Demande de partenariat' },
  'training-form': { label: 'Formulaire de formation', description: 'Demande de formation' },
  'application-form': {
    label: 'Formulaire de candidature',
    description: 'Candidature spontanée ou à une offre',
  },
  'suivi-preview': {
    label: 'Aperçu du suivi',
    description: 'Exemple de suivi Mambo, généré automatiquement',
  },
  formulas: {
    label: 'Formules',
    description: 'Formules de la rubrique, gérées dans Services',
    manage: { label: 'Services', screen: 'services' },
  },
  'zones-map': {
    label: 'Carte des zones',
    description: 'Quartiers et délais, gérés dans Zones d’intervention',
    manage: { label: 'Zones d’intervention', screen: 'zones' },
  },
};

export const TONE_LABELS: Record<SectionTone, string> = {
  light: 'Blanc',
  muted: 'Gris clair',
  dark: 'Sombre',
  green: 'Vert clair',
  orange: 'Orange clair',
};

export const SCENE_LABELS: Record<IllustrationScene, string> = {
  accueil: 'Accueil',
  chef: 'Chef privé',
  colis: 'Colis',
  courses: 'Courses',
  culture: 'Culture',
  equipe: 'Équipe',
  evenement: 'Événement',
  formation: 'Formation',
  livraison: 'Livraison',
  logement: 'Logement',
  marche: 'Marché',
  massage: 'Massage',
  photo: 'Photo',
  portrait: 'Portrait',
  voiture: 'Voiture',
};

/** Icônes proposées pour les éléments (noms `lucide-react` déjà utilisés par le site). */
export const ITEM_ICONS = [
  'Users',
  'ShieldCheck',
  'Sparkles',
  'GraduationCap',
  'Globe',
  'FileText',
  'Mail',
  'Check',
  'Key',
  'Heart',
  'Handshake',
  'MapPin',
  'Phone',
  'Clock',
  'Star',
  'Home',
  'Car',
  'ChefHat',
  'Package',
  'Calendar',
  'Briefcase',
  'MessageCircle',
  'Target',
  'Leaf',
] as const;

/** Destinations proposées pour les boutons (`Link.href`) ; « Autre adresse » permet toute adresse valide. */
export const LINK_TARGETS: { label: string; href: string }[] = [
  { label: 'Devis gratuit', href: '/devis' },
  { label: 'S’inscrire', href: '/inscription' },
  { label: 'Contact', href: '/contact' },
  { label: 'Prendre rendez-vous', href: '/contact#rendez-vous' },
  { label: 'Accueil', href: '/' },
  { label: 'Nos services', href: '/services' },
  { label: 'Expérience', href: '/services/experience' },
  { label: 'Immobilier', href: '/services/immobilier' },
  { label: 'Services de proximité', href: '/services/services-de-proximite' },
  { label: 'Culture & événementiel', href: '/services/culture-evenementiel' },
  { label: 'Qui sommes-nous ?', href: '/qui-sommes-nous' },
  { label: 'Mission', href: '/mission' },
  { label: 'Partenaires', href: '/partenaires' },
  { label: 'Devenir partenaire', href: '/partenaires#devenir-partenaire' },
  { label: 'Formation', href: '/formation' },
  { label: 'Recrutement', href: '/recrutement' },
  { label: 'Avis clients', href: '/avis-clients' },
  { label: 'Suivi Mambo', href: '/suivi-mambo' },
];

/** Nom de la destination d'un lien (« Devis gratuit »), ou l'adresse elle-même. */
export function linkTargetLabel(href: string): string {
  return LINK_TARGETS.find((target) => target.href === href)?.label ?? href;
}

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count}\u00A0${count > 1 ? pluralForm : singular}`;

/** Nom de la section dans le back-office : `adminLabel`, sinon un nom déduit du type. */
export function sectionLabel(section: PageSection): string {
  if (section.adminLabel?.trim()) return section.adminLabel.trim();
  if (section.type === 'dynamic') return DYNAMIC_SOURCES[section.source].label;
  if (section.type === 'hero' && section.variant === 'legal') return 'En-tête de la page';
  return SECTION_TYPE_LABELS[section.type];
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Description sous le nom de la section (maquette : « Titre, texte, boutons et visuel »). */
export function sectionDescription(section: PageSection): string {
  switch (section.type) {
    case 'hero':
      return section.variant === 'legal' ? 'Titre et date de mise à jour' : 'Titre, texte, boutons et visuel';
    case 'marquee':
      return `${plural(section.items.length, 'mention')} qui défilent`;
    case 'steps':
      return `${plural(section.items.length, 'étape')} : titre et texte`;
    case 'featureList': {
      const noun = /engagement/i.test(sectionLabel(section)) ? 'engagement' : 'atout';
      return `${plural(section.items.length, noun)} : titre et texte`;
    }
    case 'cardGrid':
      return `${plural(section.items.length, 'carte')} : titre et texte`;
    case 'textMedia':
      return section.quote ? 'Citation, texte et visuel' : 'Texte, visuel et mots-clés';
    case 'quote':
      return 'Citation et auteur';
    case 'statsGrid':
      return section.items.length
        ? capitalize(section.items.map((item) => item.label).join(', '))
        : 'Aucun chiffre pour le moment';
    case 'team':
      return `${plural(section.members.length, 'membre')} de l’équipe`;
    case 'faq':
      return `${plural(section.items.length, 'question')} et réponses`;
    case 'richText':
      return `${plural(section.articles.length, 'article')}${section.toComplete ? ' · modèle à compléter' : ''}`;
    case 'ctaBand':
      return 'Texte et bouton d’appel à l’action';
    case 'dynamic': {
      const source = DYNAMIC_SOURCES[section.source];
      if (section.source === 'reviews-highlight' && section.limit)
        return `${source.description} (${section.limit} derniers)`;
      return source.description;
    }
  }
}

/** Identifiant libre dans la page (`cartes`, `cartes-2`…). */
export function uniqueSectionId(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let index = 2;
  while (existing.includes(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

const ID_BASES: Record<PageSectionType, string> = {
  hero: 'hero',
  marquee: 'bandeau',
  steps: 'etapes',
  featureList: 'atouts',
  cardGrid: 'cartes',
  textMedia: 'texte',
  quote: 'citation',
  statsGrid: 'chiffres',
  team: 'equipe',
  faq: 'faq',
  richText: 'contenu',
  ctaBand: 'cta',
  dynamic: 'automatique',
};

export const emptyItem = (): SectionItem => ({ title: '', text: '' });

/** Section créée par « Ajouter une section » : contenu minimal valide, visible. */
export function createSection(type: Exclude<PageSectionType, 'dynamic'>, existingIds: string[]): PageSection {
  const id = uniqueSectionId(ID_BASES[type], existingIds);
  const base = { id, enabled: true, adminLabel: null, title: null, lead: null };
  switch (type) {
    case 'hero':
      return {
        ...base,
        type,
        variant: 'page',
        showWhatsapp: false,
        title: '',
        primaryCta: null,
        secondaryCta: null,
        visual: null,
      };
    case 'marquee':
      return { ...base, type, items: [''] };
    case 'steps':
      return { ...base, type, layout: 'cards', items: [{ ...emptyItem(), number: '01' }] };
    case 'featureList':
      return { ...base, type, items: [emptyItem()], visual: null, figures: [] };
    case 'cardGrid':
      return { ...base, type, layout: 'cards', columns: 3, items: [emptyItem()], cta: null };
    case 'textMedia':
      return { ...base, type, paragraphs: [''], visual: null, reverse: false, chips: [] };
    case 'quote':
      return { ...base, type, text: '', author: null, role: null, visual: null };
    case 'statsGrid':
      return {
        ...base,
        type,
        items: [{ key: 'chiffre-1', value: 0, prefix: '', suffix: '', decimals: 0, label: '' }],
      };
    case 'team':
      return { ...base, type, members: [] };
    case 'faq':
      return { ...base, type, items: [{ question: '', answer: '' }] };
    case 'richText':
      return { ...base, type, articles: [{ title: '', html: '' }], toComplete: false };
    case 'ctaBand':
      return {
        ...base,
        type,
        text: null,
        primaryCta: { label: 'Demander un devis gratuit', href: '/devis', external: false },
        showWhatsapp: true,
      };
  }
}

// ───────────────────────────── Chiffres clés ─────────────────────────────

/** « 150+ » à partir d'un `KeyFigure` (virgule décimale française) ; texte affiché tel quel (« Douala »). */
export function formatFigure(
  figure: Pick<KeyFigure, 'value' | 'valueText' | 'prefix' | 'suffix' | 'decimals'>,
): string {
  if (figure.valueText) return figure.valueText;
  const decimals = figure.decimals ?? 0;
  const number = (figure.value ?? 0).toFixed(decimals).replace('.', ',');
  return `${figure.prefix ?? ''}${number}${figure.suffix ?? ''}`;
}

/** Saisie « 150+ », « 4,8 / 5 », « +12 % » → valeur, préfixe, suffixe et décimales ; `null` si aucun nombre. */
export function parseFigure(raw: string): Pick<KeyFigure, 'value' | 'prefix' | 'suffix' | 'decimals'> | null {
  const match = /^\s*(\D{0,4}?)\s*(\d{1,3}(?:[\s\u00A0\u202F]\d{3})+|\d+)(?:[,.](\d{1,2}))?(.{0,8})$/.exec(
    raw,
  );
  if (!match) return null;
  const [, prefix = '', integer = '', fraction, suffix = ''] = match;
  const value = Number(`${integer.replace(/[\s\u00A0\u202F]/g, '')}${fraction ? `.${fraction}` : ''}`);
  if (!Number.isFinite(value)) return null;
  return { value, prefix, suffix: suffix.trimEnd(), decimals: fraction ? fraction.length : 0 };
}

// ───────────────────────────── Validation ─────────────────────────────

export type FieldErrors = Record<string, string>;

const REQUIRED = 'Ce champ est obligatoire.';
const HREF = /^(\/|https?:\/\/|mailto:|tel:|#)/i;

function validateLink(link: Link | null | undefined, path: string, errors: FieldErrors) {
  if (!link) return;
  if (!link.label.trim()) errors[`${path}.label`] = 'Indiquez le libellé du bouton.';
  if (!link.href.trim()) errors[`${path}.href`] = 'Choisissez la destination du bouton.';
  else if (!HREF.test(link.href.trim()))
    errors[`${path}.href`] = 'Saisissez une adresse commençant par /, https://, mailto: ou tel:.';
}

function validateItems(items: SectionItem[], path: string, errors: FieldErrors) {
  items.forEach((item, index) => {
    if (!item.title.trim()) errors[`${path}.${index}.title`] = 'Indiquez un titre.';
    validateLink(item.cta, `${path}.${index}.cta`, errors);
  });
}

/**
 * Erreurs d'un brouillon, indexées par chemin (`sections.1.title`, `sections.4.items.0.title`), comme les
 * `errors[].path` d'une réponse 422 de l'API. Les longueurs maximales sont garanties par les champs (`maxLength`).
 */
export function validateSections(sections: PageSection[]): FieldErrors {
  const errors: FieldErrors = {};
  const ids = new Set<string>();
  sections.forEach((section, index) => {
    const path = `sections.${index}`;
    if (ids.has(section.id)) errors[`${path}.id`] = 'Cet identifiant est déjà utilisé dans la page.';
    ids.add(section.id);
    if (section.anchor && !/^[a-z0-9-]+$/.test(section.anchor))
      errors[`${path}.anchor`] = 'Lettres minuscules, chiffres et tirets uniquement (ex. notre-equipe).';
    switch (section.type) {
      case 'hero':
        if (!section.title?.trim()) errors[`${path}.title`] = REQUIRED;
        validateLink(section.primaryCta, `${path}.primaryCta`, errors);
        validateLink(section.secondaryCta, `${path}.secondaryCta`, errors);
        section.anchors?.forEach((anchor, position) =>
          validateLink(anchor, `${path}.anchors.${position}`, errors),
        );
        break;
      case 'marquee':
        if (section.items.length === 0) errors[`${path}.items`] = 'Ajoutez au moins une mention.';
        section.items.forEach((item, position) => {
          if (!item.trim()) errors[`${path}.items.${position}`] = 'Saisissez la mention ou supprimez-la.';
        });
        break;
      case 'steps':
        if (section.items.length === 0) errors[`${path}.items`] = 'Ajoutez au moins une étape.';
        validateItems(section.items, `${path}.items`, errors);
        break;
      case 'featureList':
      case 'cardGrid':
        validateItems(section.items, `${path}.items`, errors);
        if (section.type === 'cardGrid') validateLink(section.cta, `${path}.cta`, errors);
        else
          section.figures?.forEach((figure, position) => {
            if (!figure.label.trim()) errors[`${path}.figures.${position}.label`] = 'Indiquez le libellé.';
          });
        break;
      case 'textMedia':
        section.paragraphs.forEach((paragraph, position) => {
          if (!paragraph.trim())
            errors[`${path}.paragraphs.${position}`] = 'Saisissez le paragraphe ou supprimez-le.';
        });
        validateLink(section.cta, `${path}.cta`, errors);
        break;
      case 'quote':
        if (!section.text.trim()) errors[`${path}.text`] = REQUIRED;
        break;
      case 'statsGrid':
        section.items.forEach((figure, position) => {
          if (!figure.label.trim()) errors[`${path}.items.${position}.label`] = 'Indiquez le libellé.';
        });
        break;
      case 'team':
        section.members.forEach((member, position) => {
          if (!member.name.trim()) errors[`${path}.members.${position}.name`] = 'Indiquez le nom.';
          if (!member.role.trim()) errors[`${path}.members.${position}.role`] = 'Indiquez le rôle.';
        });
        break;
      case 'faq':
        section.items.forEach((item, position) => {
          if (!item.question.trim()) errors[`${path}.items.${position}.question`] = 'Indiquez la question.';
          if (!item.answer.trim()) errors[`${path}.items.${position}.answer`] = 'Indiquez la réponse.';
        });
        break;
      case 'richText':
        section.articles.forEach((article, position) => {
          if (!article.title.trim())
            errors[`${path}.articles.${position}.title`] = 'Indiquez le titre de l’article.';
        });
        break;
      case 'ctaBand':
        validateLink(section.primaryCta, `${path}.primaryCta`, errors);
        break;
      case 'dynamic':
        validateLink(section.link, `${path}.link`, errors);
        validateItems(section.items ?? [], `${path}.items`, errors);
        break;
    }
  });
  return errors;
}

/** Index des sections concernées par des erreurs (`sections.3.title` → 3). */
export function sectionsWithErrors(errors: FieldErrors): number[] {
  const indexes = new Set<number>();
  for (const path of Object.keys(errors)) {
    const match = /^sections\.(\d+)/.exec(path);
    if (match) indexes.add(Number(match[1]));
  }
  return [...indexes].sort((a, b) => a - b);
}
