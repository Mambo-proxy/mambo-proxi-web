import { applyEnglishTexts, translatableFields } from '@/components/admin/pages/page-translation';
import type {
  AdminPage,
  AdminPageSummary,
  Page,
  PageKey,
  PageSection,
  PageSectionType,
  PageTranslationStatus,
  Seo,
  UserRef,
} from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';
import { rememberSeedImages } from '../media-refs';
import operations from './contract-examples.json';
import { legalPages, legalPagesEn } from './legal-pages';
import { pages as sitePages, pagesEn as sitePagesEn } from './pages';

/**
 * Pages & textes du back-office : pour chaque page, la version publiée et le brouillon éventuel. Les contenus sont
 * repris des données du site public simulé (exemples du contrat pour l'accueil et « Nos services », `pages.ts`,
 * `legal-pages.ts`), pour que les textes du back-office soient ceux du site ; la version anglaise de départ est
 * celle des pages anglaises simulées.
 */

type Group = NonNullable<AdminPageSummary['group']>;

/**
 * Version anglaise enregistrée (comme `translations.en` dans l'API) : sections traduites (textes anglais posés sur
 * la section française), titre, SEO et empreinte des textes français traduits, par section.
 */
export type StoredEnglish = {
  title: string | null;
  sections: PageSection[];
  seo: { title: string | null; description: string | null };
  sourceHashes: Record<string, string>;
};

export type StoredVersion = { sections: PageSection[]; seo: Seo; en: StoredEnglish | null };

export type StoredPage = {
  key: PageKey;
  title: string;
  path: string;
  group: Group;
  published: StoredVersion;
  draft: StoredVersion | null;
  publishedAt: string | null;
  updatedAt: string;
  updatedBy: UserRef | null;
};

const mireille: UserRef = { id: 'usr_mireille', name: 'Mireille Bell', initials: 'MB' };

const contractPages = ((operations as { operationId: string; examples: Record<string, unknown> }[]).find(
  (operation) => operation.operationId === 'getPage',
)?.examples ?? {}) as Record<string, Page>;

/** Noms affichés dans le back-office (maquette `92:10771`) pour les sections de l'accueil. */
const HOME_LABELS: Record<string, string> = {
  hero: 'Section principale',
  'bandeau-services': 'Bandeau des services',
  formules: 'Formules à domicile',
  univers: 'Rubriques de services',
  'comment-ca-marche': 'Comment ça marche',
  engagements: 'Nos engagements',
  zones: 'Zones d’intervention',
  avis: 'Témoignages',
  partenaires: 'Partenaires et newsletter',
  cta: 'Appel à l’action final',
};

/** Contact : page composée dans le code du site ; sections équivalentes pour le back-office. */
const contactPage: Page = {
  key: 'contact',
  title: 'Contact',
  updatedAt: '2026-10-05T08:00:00.000Z',
  isPreview: false,
  seo: {
    title: 'Contact',
    description:
      'Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous à l’agence de Douala : choisissez ce qui vous convient, nous vous répondons rapidement.',
    ogImageUrl: null,
    noindex: false,
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      variant: 'page',
      eyebrow: 'Contact',
      title: 'Parlons de ==votre projet.==',
      lead: 'Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous : choisissez ce qui vous convient, nous vous répondons rapidement.',
      visual: null,
      showWhatsapp: false,
    },
    { id: 'moyens', type: 'dynamic', enabled: true, source: 'contact-cards' },
    {
      id: 'rendez-vous',
      type: 'dynamic',
      enabled: true,
      anchor: 'rendez-vous',
      source: 'appointment-booking',
      eyebrow: 'Rendez-vous',
      title: 'Prenez rendez-vous avec ==notre équipe.==',
    },
    { id: 'agence', type: 'dynamic', enabled: true, source: 'agency-map' },
  ],
};

/** Ordre de la liste « Pages du site » (maquette), complété des pages ajoutées depuis (Zones, Magazine) et des CGU. */
const ORDER: { key: PageKey; path: string; group: Group; source: () => Page | undefined }[] = [
  { key: 'accueil', path: '/', group: 'principales', source: () => contractPages.accueil },
  { key: 'services', path: '/services', group: 'principales', source: () => contractPages.services },
  {
    key: 'zones-d-intervention',
    path: '/zones-d-intervention',
    group: 'principales',
    source: () => sitePages['zones-d-intervention'],
  },
  {
    key: 'qui-sommes-nous',
    path: '/qui-sommes-nous',
    group: 'principales',
    source: () => sitePages['qui-sommes-nous'],
  },
  { key: 'mission', path: '/mission', group: 'principales', source: () => sitePages.mission },
  { key: 'partenaires', path: '/partenaires', group: 'principales', source: () => sitePages.partenaires },
  { key: 'formation', path: '/formation', group: 'principales', source: () => sitePages.formation },
  { key: 'recrutement', path: '/recrutement', group: 'principales', source: () => sitePages.recrutement },
  {
    key: 'avis-clients',
    path: '/avis-clients',
    group: 'principales',
    source: () => sitePages['avis-clients'],
  },
  { key: 'contact', path: '/contact', group: 'principales', source: () => contactPage },
  { key: 'suivi-mambo', path: '/suivi-mambo', group: 'principales', source: () => sitePages['suivi-mambo'] },
  { key: 'magazine', path: '/magazine', group: 'principales', source: () => sitePages.magazine },
  {
    key: 'mentions-legales',
    path: '/mentions-legales',
    group: 'legales',
    source: () => legalPages['mentions-legales'],
  },
  {
    key: 'confidentialite',
    path: '/confidentialite',
    group: 'legales',
    source: () => legalPages.confidentialite,
  },
  { key: 'cookies', path: '/cookies', group: 'legales', source: () => legalPages.cookies },
  { key: 'cgu', path: '/cgu', group: 'legales', source: () => legalPages.cgu },
];

const clone = <T>(value: T): T => structuredClone(value);

/** Page anglaise simulée (exemples `…En` du contrat, `pagesEn`, `legalPagesEn`). */
function englishSource(key: PageKey): Page | undefined {
  if (key === 'accueil') return contractPages.accueilEn;
  if (key === 'services') return contractPages.servicesEn;
  return sitePagesEn[key] ?? (legalPagesEn as Partial<Record<PageKey, Page>>)[key];
}

/**
 * Empreinte des textes d'une section (chemins et textes triés) ; `null` si elle n'a rien à traduire. Version
 * simplifiée du sha256 de l'API : seule l'égalité compte.
 */
export function sectionTextHash(section: PageSection): string | null {
  const texts = translatableFields(section)
    .map((field): [string, string] => [field.path, field.french])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return texts.length === 0 ? null : JSON.stringify(texts);
}

/** Version anglaise de départ : sections de la page anglaise simulée de même `id` et de même type, à jour. */
function seedEnglish(english: Page | undefined, french: PageSection[]): StoredEnglish | null {
  if (!english) return null;
  const byId = new Map(english.sections.map((section) => [section.id, section]));
  const sections: PageSection[] = [];
  const sourceHashes: Record<string, string> = {};
  for (const section of french) {
    const match = byId.get(section.id);
    const hash = sectionTextHash(section);
    if (match?.type !== section.type || hash === null) continue;
    sections.push(applyEnglishTexts(section, match) as PageSection);
    sourceHashes[section.id] = hash;
  }
  return {
    title: english.title,
    sections,
    seo: { title: english.seo.title ?? null, description: english.seo.description ?? null },
    sourceHashes,
  };
}

function seed(): StoredPage[] {
  return ORDER.flatMap(({ key, path, group, source }) => {
    const page = source();
    if (!page) return [];
    const sections = clone(page.sections).map((section) =>
      key === 'accueil' && HOME_LABELS[section.id]
        ? { ...section, adminLabel: HOME_LABELS[section.id] }
        : section,
    );
    const stored: StoredPage = {
      key,
      title: page.title,
      path,
      group,
      published: { sections, seo: clone(page.seo), en: seedEnglish(clone(englishSource(key)), sections) },
      draft: null,
      publishedAt: page.updatedAt,
      updatedAt: page.updatedAt,
      updatedBy: mireille,
    };
    // « Mentions légales » : modifiée hier, pas encore publiée (méta « Modifié hier » de la maquette).
    if (key === 'mentions-legales') {
      const draft = clone(stored.published);
      const content = draft.sections.find((section) => section.type === 'richText');
      const hosting = content?.type === 'richText' ? content.articles[1] : undefined;
      if (hosting)
        hosting.html =
          '<p>Le site est hébergé en France. Nom, adresse et coordonnées de l’hébergeur : à compléter à la mise en ligne.</p>';
      stored.draft = draft;
      // 24 h exactement : toujours « hier » à Douala (fuseau fixe), même juste après minuit.
      stored.updatedAt = daysAgo(1);
    }
    // Photos des pages : présentes dans la médiathèque de l'API (seed), donc acceptées comme références.
    rememberSeedImages(stored.published.sections);
    return [stored];
  });
}

export let adminPages: StoredPage[] = seed();

/** Remise à l'état initial (tests). */
export function resetAdminPages() {
  adminPages = seed();
}

export function findAdminPage(key: string): StoredPage | undefined {
  return adminPages.find((page) => page.key === key);
}

const LEGAL_TYPES: PageSectionType[] = ['hero', 'richText'];
const CONTENT_TYPES: PageSectionType[] = [
  'hero',
  'marquee',
  'steps',
  'featureList',
  'cardGrid',
  'textMedia',
  'quote',
  'statsGrid',
  'team',
  'faq',
  'richText',
  'ctaBand',
];

export function toSummary(page: StoredPage): AdminPageSummary {
  return {
    key: page.key,
    title: page.title,
    path: page.path,
    group: page.group,
    hasDraft: page.draft !== null,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    updatedBy: page.updatedBy,
  };
}

/**
 * État de la traduction anglaise (comme l'API) : sections françaises avec du texte sans section anglaise de même
 * `id` et de même type (`missing`), ou dont les textes français ont changé depuis l'enregistrement de leur version
 * anglaise (`outdated`).
 */
export function translationStatus(
  french: PageSection[],
  english: StoredEnglish | null,
): PageTranslationStatus {
  const translated = new Map(english?.sections.map((section) => [section.id, section]));
  const missingSectionIds: string[] = [];
  const outdatedSectionIds: string[] = [];
  for (const section of french) {
    const hash = sectionTextHash(section);
    if (hash === null) continue;
    if (translated.get(section.id)?.type !== section.type) missingSectionIds.push(section.id);
    else if (english?.sourceHashes[section.id] !== hash) outdatedSectionIds.push(section.id);
  }
  const state =
    english === null || missingSectionIds.length > 0
      ? 'MISSING'
      : outdatedSectionIds.length > 0
        ? 'OUTDATED'
        : 'UP_TO_DATE';
  return { state, missingSectionIds, outdatedSectionIds };
}

/** Sections anglaises recomposées sur les sections françaises actuelles (seules les sections traduites). */
function englishSections(french: PageSection[], english: StoredEnglish): PageSection[] {
  const translated = new Map(english.sections.map((section) => [section.id, section]));
  return french.flatMap((section) => {
    const match = translated.get(section.id);
    return match?.type === section.type ? [applyEnglishTexts(section, match) as PageSection] : [];
  });
}

/** Page avec son brouillon s'il existe (toutes les sections, y compris masquées) et sa version anglaise. */
export function toAdminPage(page: StoredPage): AdminPage {
  const current = page.draft ?? page.published;
  const english = current.en;
  return {
    ...toSummary(page),
    sections: clone(current.sections),
    seo: clone(current.seo),
    allowedSectionTypes: page.group === 'legales' ? LEGAL_TYPES : CONTENT_TYPES,
    translations: {
      en: english
        ? {
            title: english.title,
            sections: clone(englishSections(current.sections, english)),
            seo: {
              ...clone(current.seo),
              title: english.seo.title ?? current.seo.title ?? null,
              description: english.seo.description ?? current.seo.description ?? null,
            },
          }
        : null,
    },
    translationStatus: { en: translationStatus(current.sections, english) },
  };
}

/** Version publiée telle que la lit le site (`GET /v1/pages/{key}`) : sections visibles uniquement. */
export function toPublicPage(page: StoredPage): Page {
  return {
    key: page.key,
    title: page.title,
    sections: clone(page.published.sections.filter((section) => section.enabled)),
    seo: clone(page.published.seo),
    isPreview: false,
    updatedAt: page.publishedAt ?? page.updatedAt,
  };
}

/**
 * Jeton d'aperçu simulé d'une page (`GET /v1/admin/pages/{key}/preview-token`) : `apercu_<clé>.<expiration en ms>`,
 * vérifié comme celui de l'API (page du jeton, expiration). Sans le préfixe `apercu-` des éditions du Magazine.
 */
export function pagePreviewToken(key: PageKey, expiresAt: number): string {
  return `apercu_${key}.${String(expiresAt)}`;
}

/** Jeton d'aperçu simulé valide pour cette page, non expiré. */
export function isPagePreviewToken(token: string | null, key: string, now = Date.now()): boolean {
  const match = token ? /^apercu_([a-z0-9-]+)\.(\d+)$/.exec(token) : null;
  return Boolean(match && match[1] === key && Number(match[2]) > now);
}

/**
 * Brouillon tel que le lit le site avec un jeton d'aperçu (`GET /v1/pages/{key}?preview=`) : brouillon, ou version
 * publiée s'il n'y en a pas, sections visibles ; en anglais, chaque section traduite remplace la section française
 * (les autres restent en français), comme l'API.
 */
export function toPreviewPage(page: StoredPage, lang: 'fr' | 'en'): Page {
  const current = page.draft ?? page.published;
  const english = lang === 'en' ? current.en : null;
  const translated = new Map(
    english ? englishSections(current.sections, english).map((section) => [section.id, section]) : [],
  );
  return {
    key: page.key,
    title: english?.title || page.title,
    sections: clone(
      current.sections
        .filter((section) => section.enabled)
        .map((section) => translated.get(section.id) ?? section),
    ),
    seo: {
      ...clone(current.seo),
      ...(english
        ? {
            title: english.seo.title ?? current.seo.title ?? null,
            description: english.seo.description ?? current.seo.description ?? null,
          }
        : {}),
    },
    isPreview: true,
    updatedAt: page.updatedAt,
  };
}
