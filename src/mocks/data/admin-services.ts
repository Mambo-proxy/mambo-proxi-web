import type {
  AdminCategory,
  AdminService,
  AdminServiceListItem,
  Completeness,
  ServiceSummary,
} from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';
import { categorySummaries, services } from './catalogue';

/**
 * Services et rubriques du back-office (`88:10421`) : les 22 services à page du catalogue (les 4 formules de
 * Services à domicile n'ont pas de fiche), répartis sur les 5 rubriques de la refonte. Les valeurs de la maquette
 * (demandes sur 30 jours, brouillon, complétude) sont reprises quand le service existe.
 */

/** Demandes des 30 derniers jours relevées sur la maquette (les autres services en ont 0 à 5). */
const REQUESTS_30D: Record<string, number> = {
  'chef-prive': 14,
  'location-voiture': 6,
  photographe: 3,
  'massage-bien-etre': 4,
  'services-evenementiels': 5,
  'recherche-logement': 9,
  'gestion-locative': 7,
  'collecte-livraison-colis-courrier': 4,
  'decouverte-cameroun': 2,
  'organisation-activites-evenements': 1,
};

/** Brouillons de la maquette : seul le service de démonstration n'est pas publié. */
const DRAFTS = new Set<string>();

/** Publics proposés par défaut aux services du catalogue. */
const DEFAULT_AUDIENCES = ['Aux particuliers', 'Aux entreprises'];

const toListItem = (service: ServiceSummary, index: number): AdminServiceListItem => {
  const status = DRAFTS.has(service.slug) ? 'DRAFT' : 'PUBLISHED';
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    category: { slug: service.category.slug, name: service.category.name },
    status,
    showInMenu: status === 'PUBLISHED',
    featuredOnHome: service.featuredOnHome ?? false,
    sortOrder: index + 1,
    visual: service.visual,
    path: service.href,
    requests30d: REQUESTS_30D[service.slug] ?? 0,
    completeness: 0,
    toComplete: status === 'DRAFT',
    isDemo: false,
    updatedAt: daysAgo((index % 6) + 1, (index * 3) % 24),
  };
};

/** Critères de complétude de l'éditeur (`91:11184`) : 6 sections + photo principale en haute définition. */
export function completenessOf(service: {
  name: string;
  tagline: string;
  audiences: string[];
  steps: unknown[];
  advantages: unknown[];
  faq: unknown[];
  relatedServiceIds: string[];
  coverImage?: { width?: number; height?: number } | null;
}): Completeness {
  const criteria: Completeness['criteria'] = [
    { key: 'general', label: 'Informations générales', done: Boolean(service.name && service.tagline) },
    { key: 'audiences', label: 'Public', done: service.audiences.length > 0 },
    { key: 'steps', label: 'Étapes', done: service.steps.length > 0 },
    { key: 'advantages', label: 'Avantages', done: service.advantages.length > 0 },
    { key: 'faq', label: 'Questions fréquentes', done: service.faq.length > 0 },
    { key: 'related', label: 'Services liés', done: service.relatedServiceIds.length > 0 },
    {
      key: 'coverImage',
      label: 'Photo principale en haute définition',
      done: Boolean((service.coverImage?.width ?? 0) >= 1600),
    },
  ];
  const done = criteria.filter((criterion) => criterion.done).length;
  return { percent: Math.round((done / criteria.length) * 100), criteria };
}

/** Contenu de la fiche « Organisation d'activités et d'événements », repris de la maquette de l'éditeur. */
function visitsContent(): Pick<
  AdminService,
  'tagline' | 'summary' | 'audiences' | 'steps' | 'advantages' | 'faq' | 'relatedServiceIds'
> {
  return {
    tagline: 'Découvrez Douala avec un guide passionné, loin des circuits classiques.',
    summary: 'Balades commentées dans les quartiers historiques, marchés et lieux de création.',
    audiences: [
      'Aux visiteurs de passage et à la diaspora en séjour',
      'Aux nouveaux arrivants qui veulent découvrir la ville',
      'Aux groupes et aux entreprises',
    ],
    steps: [
      { title: 'Échange sur vos envies', text: 'Durée, quartiers, centres d’intérêt, langue.' },
      { title: 'Proposition d’itinéraire et devis', text: 'Un parcours sur mesure, envoyé sous 24 h.' },
      { title: 'Visite avec un guide local', text: 'Accueil à votre hôtel ou à l’agence.' },
    ],
    advantages: [
      { title: 'Des guides locaux passionnés', text: 'Ils connaissent chaque rue et ses histoires.' },
      { title: 'Un parcours sur mesure', text: 'Adapté à votre rythme et à vos envies.' },
    ],
    faq: [
      {
        question: 'Combien de temps dure une visite ?',
        answer: 'Entre 2 h et une journée complète, selon le parcours choisi.',
      },
    ],
    relatedServiceIds: ['svc_decouverte_cameroun', 'svc_activites_culturelles_loisirs_sorties'],
  };
}

/** Détail éditable de chaque service à page. */
export const adminServices: AdminService[] = services
  .filter((service) => service.kind !== 'formula')
  .map((service, index) => {
    const item = toListItem(service, index);
    const coverImage = service.visual.image ?? null;
    const detail: AdminService = {
      ...item,
      shortName: service.shortName,
      tagline: service.summary,
      summary: service.summary,
      icon: service.icon,
      illustration: service.visual.illustration,
      coverImage,
      galleryImageIds: [],
      cities: ['Douala'],
      audiences: DEFAULT_AUDIENCES,
      steps: [],
      advantages: [],
      faq: [],
      quoteBullets: [],
      offersEyebrow: null,
      offersTitle: null,
      offersLead: null,
      offersLeadMobile: null,
      offers: [],
      relatedServiceIds: services
        .filter((other) => other.category.slug === service.category.slug && other.id !== service.id)
        .slice(0, 2)
        .map((other) => other.id),
      featuredReviewIds: [],
      showWhatsapp: true,
      seoTitle: `${service.name} | MAMBO Proxi`,
      seoDescription: service.summary.slice(0, 160),
      publishedAt: item.status === 'PUBLISHED' ? item.updatedAt : null,
      completenessDetail: { percent: 0, criteria: [] },
      version: '1',
    };
    const completeness = completenessOf(detail);
    detail.completenessDetail = completeness;
    detail.completeness = completeness.percent;
    detail.toComplete = completeness.percent < 100;
    return detail;
  });

/**
 * Service de démonstration de la maquette (`91:10598`) : « Visites guidées de Douala » n'existe plus dans la
 * refonte ; il reste dans la liste, marqué `isDemo`, pour l'exemple de l'éditeur et les tests de fidélité.
 */
const DEMO_SERVICE: AdminService = (() => {
  const base = toListItem(
    {
      id: 'svc_visites_douala',
      slug: 'visites-guidees-douala',
      name: 'Visites guidées de Douala',
      shortName: null,
      summary: '',
      icon: 'MapPin',
      visual: { illustration: 'marche', image: null, alt: '' },
      category: { slug: 'culture-evenementiel', name: 'Culture & événementiel' },
      href: '/services/culture-evenementiel/visites-guidees-douala',
      featuredOnHome: false,
      kind: 'service',
    },
    adminServices.length,
  );
  const detail: AdminService = {
    ...base,
    status: 'DRAFT',
    showInMenu: false,
    requests30d: 0,
    isDemo: true,
    shortName: null,
    tagline: visitsContent().tagline,
    summary: visitsContent().summary,
    icon: 'MapPin',
    illustration: 'marche',
    coverImage: null,
    galleryImageIds: [],
    cities: ['Douala'],
    audiences: visitsContent().audiences,
    steps: visitsContent().steps,
    advantages: visitsContent().advantages,
    faq: visitsContent().faq,
    quoteBullets: [],
    offersEyebrow: null,
    offersTitle: null,
    offersLead: null,
    offersLeadMobile: null,
    offers: [],
    relatedServiceIds: visitsContent().relatedServiceIds,
    featuredReviewIds: [],
    showWhatsapp: true,
    seoTitle: 'Visites guidées de Douala | MAMBO Proxi',
    seoDescription:
      'Découvrez Douala avec un guide local : quartiers historiques, marchés, lieux de création. Devis gratuit sous 24 h.',
    publishedAt: null,
    completenessDetail: { percent: 0, criteria: [] },
    version: '1',
  };
  const completeness = completenessOf(detail);
  detail.completenessDetail = completeness;
  detail.completeness = completeness.percent;
  detail.toComplete = true;
  return detail;
})();

adminServices.push(DEMO_SERVICE);

/** Rubriques éditables (`GET /v1/admin/categories`), dans l'ordre du site. */
export const adminCategories: AdminCategory[] = categorySummaries.map((category, index) => ({
  id: `cat_${category.slug.replaceAll('-', '_')}`,
  slug: category.slug,
  name: category.name,
  tagline: category.tagline ?? '',
  description: category.description ?? '',
  heroTitle: category.name,
  heroLead: category.tagline ?? '',
  audiencesTitle: null,
  servicesTitle: null,
  servicesLead: null,
  processTitle: null,
  homeCard: { title: category.name, text: category.tagline ?? '', textMobile: null, chips: [] },
  icon: category.icon,
  imageId: null,
  tint: category.tint,
  status: 'PUBLISHED',
  audiences: [],
  processSteps: [],
  testimonialId: null,
  groups: [],
  highlight: null,
  offerSections: [],
  quoteFields: [],
  seoTitle: null,
  seoDescription: null,
  sortOrder: index + 1,
  serviceCount: adminServices.filter((service) => service.category.slug === category.slug).length,
  updatedAt: daysAgo(3),
}));

/** Compteurs des onglets (mêmes valeurs que `countsByCategory` de l'API). */
export function adminServiceCounts(): Record<string, number> {
  return Object.fromEntries(
    adminCategories.map((category) => [
      category.slug,
      adminServices.filter((service) => service.category.slug === category.slug).length,
    ]),
  );
}
