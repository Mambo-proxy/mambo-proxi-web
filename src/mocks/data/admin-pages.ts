import type {
  AdminPage,
  AdminPageSummary,
  Page,
  PageKey,
  PageSection,
  PageSectionType,
  Seo,
  UserRef,
} from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';
import operations from './contract-examples.json';
import { legalPages } from './legal-pages';
import { pages as sitePages } from './pages';

/**
 * Pages & textes du back-office : pour chaque page, la version publiée et le brouillon éventuel. Les contenus sont
 * repris des données du site public simulé (exemples du contrat pour l'accueil et « Nos services », `pages.ts`,
 * `legal-pages.ts`), pour que les textes du back-office soient ceux du site.
 */

type Group = NonNullable<AdminPageSummary['group']>;

export type StoredPage = {
  key: PageKey;
  title: string;
  path: string;
  group: Group;
  published: { sections: PageSection[]; seo: Seo };
  draft: { sections: PageSection[]; seo: Seo } | null;
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
      published: { sections, seo: clone(page.seo) },
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
      stored.updatedAt = daysAgo(1, 2);
    }
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

/** Page avec son brouillon s'il existe (toutes les sections, y compris masquées). */
export function toAdminPage(page: StoredPage): AdminPage {
  const current = page.draft ?? page.published;
  return {
    ...toSummary(page),
    sections: clone(current.sections),
    seo: clone(current.seo),
    allowedSectionTypes: page.group === 'legales' ? LEGAL_TYPES : CONTENT_TYPES,
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
