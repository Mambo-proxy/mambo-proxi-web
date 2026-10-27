import type { AdminService, ServiceDetail } from '@/lib/api/schema';
import type { Category } from '@/components/admin/services/service-utils';
import { serviceCompleteness } from '@/components/admin/services/completeness';
import { adminMedia } from '../handlers/admin-media';
import { daysAgo } from '../admin-utils';
import { rememberSeedImages } from '../media-refs';
import { adminReviews } from './admin-reviews';
import { categorySummaries, services as catalogueServices } from './catalogue';
import { catalogueSeed } from './catalogue-services';
import { categoryDetails } from './category-details';
import { serviceDetails } from './service-details';

/**
 * Services et rubriques du back-office (« BO — Services » `88:10421`, « Ajouter un service » `91:10598`) :
 * le catalogue des nouvelles maquettes (5 rubriques, formules comprises) et le brouillon « Visites guidées de
 * Douala » de la maquette (dernier service de « Culture & événementiel », comme l'exemple `AdminServices` du contrat).
 */

// Deuxième visuel de la maquette (scène « culture ») : ajouté à la médiathèque simulée s'il n'y figure pas.
if (!adminMedia.some((media) => media.id === 'med_culture'))
  adminMedia.push({
    id: 'med_culture',
    url: '/illustrations/culture.svg',
    width: 1600,
    height: 1600,
    alt: 'Masque traditionnel et décor de fête au crépuscule',
    focalPoint: null,
    blurDataUrl: null,
    variants: [],
    fileName: 'culture.svg',
    mimeType: 'image/svg+xml',
    size: 21_400,
    status: 'READY',
    usages: [{ kind: 'service', label: 'Service « Visites guidées de Douala »', href: null }],
    createdAt: daysAgo(12),
  });

/** Ordre de la maquette dans « Expérience » ; ordre du catalogue ailleurs. */
const EXPERIENCE_ORDER = [
  'chef-prive',
  'location-voiture',
  'photographe',
  'massage-bien-etre',
  'services-evenementiels',
];

/** Demandes des 30 derniers jours (maquette pour les 9 lignes affichées, valeurs plausibles ailleurs). */
const REQUESTS_30D: Record<string, number> = {
  'maison-essentiel': 18,
  'entretien-du-logement': 12,
  'pressing-laverie': 9,
  'achat-vente-biens': 8,
  'collecte-livraison-colis-courrier': 4,
  'chef-prive': 14,
  'location-voiture': 6,
  photographe: 3,
  'massage-bien-etre': 4,
  'services-evenementiels': 5,
  'recherche-logement': 9,
  'location-sous-location-colocation': 5,
  'logement-adapte-meuble': 2,
  'gestion-locative': 7,
  'entretien-logements': 3,
  'accompagnement-installation': 4,
  'logement-temporaire': 6,
  'portage-livraison-repas': 3,
  'livraison-courses-commandes': 5,
  'decouverte-cameroun': 6,
  'activites-culturelles-loisirs-sorties': 4,
  'organisation-activites-evenements': 3,
  'decouverte-integration-locale': 2,
};

const serviceId = (slug: string) => `svc_${slug.replaceAll('-', '_')}`;

/** Complétude (pourcentage et détail) recalculée à partir des champs du service. */
export function withCompleteness(service: AdminService): AdminService {
  const detail = serviceCompleteness({
    name: service.name,
    categoryId: service.category.slug,
    tagline: service.tagline,
    summary: service.summary,
    audiences: service.audiences,
    steps: service.steps,
    advantages: service.advantages,
    faq: service.faq,
    relatedServiceIds: service.relatedServiceIds,
    cover: service.coverImage ?? null,
  });
  return { ...service, completeness: detail.percent, completenessDetail: detail };
}

/**
 * Fiche d'un service, ou, pour une formule (sans fiche sur le site : sa carte mène à la prise de rendez-vous), son
 * résumé du catalogue complété de sections vides.
 */
function detailOf(slug: string): ServiceDetail {
  const detail = serviceDetails.fr[slug];
  if (detail) return detail;
  const summary = catalogueServices.find((service) => service.slug === slug)!;
  return {
    ...summary,
    tagline: summary.summary,
    cities: ['Douala'],
    audiences: [],
    steps: [],
    advantages: [],
    faq: [],
    quoteBullets: [],
    related: [],
    showWhatsapp: true,
    toComplete: false,
    seo: { title: summary.name, description: summary.summary, noindex: false },
    gallery: [],
    reviews: [],
    updatedAt: daysAgo(30),
  };
}

function fromCatalogue(slug: string, sortOrder: number): AdminService {
  const detail = detailOf(slug);
  // Photo de la fiche (maquettes refondues), servie comme média.
  const cover = detail.visual.image ?? null;
  return withCompleteness({
    id: detail.id,
    slug,
    name: detail.name,
    shortName: detail.shortName ?? null,
    category: detail.category,
    status: 'PUBLISHED',
    showInMenu: true,
    featuredOnHome: detail.featuredOnHome ?? false,
    sortOrder,
    visual: { ...detail.visual, image: cover },
    path: detail.href,
    requests30d: REQUESTS_30D[slug] ?? 0,
    completeness: 0,
    toComplete: detail.toComplete,
    isDemo: false,
    updatedAt: daysAgo(3 + (sortOrder % 5), sortOrder),
    tagline: detail.tagline,
    summary: detail.summary,
    icon: detail.icon,
    illustration: detail.visual.illustration,
    coverImage: cover,
    galleryImageIds: [],
    cities: detail.cities,
    audiences: detail.audiences,
    steps: detail.steps,
    advantages: detail.advantages,
    faq: detail.faq,
    quoteBullets: detail.quoteBullets,
    relatedServiceIds: detail.related.map((item) => item.id),
    featuredReviewIds: [],
    showWhatsapp: detail.showWhatsapp,
    seoTitle: detail.seo.title ? detail.seo.title.slice(0, 60) : null,
    seoDescription: detail.seo.description ? detail.seo.description.slice(0, 160) : null,
    publishedAt: daysAgo(60),
    completenessDetail: { percent: 0, criteria: [] },
    version: 'v1',
  });
}

/** Brouillon de la maquette « Ajouter un service » (`91:10598`). */
function visitesDouala(sortOrder: number): AdminService {
  return withCompleteness({
    id: 'svc_visites_douala',
    slug: 'visites-guidees-douala',
    name: 'Visites guidées de Douala',
    shortName: null,
    category: { slug: 'culture-evenementiel', name: 'Culture & événementiel' },
    status: 'DRAFT',
    showInMenu: false,
    featuredOnHome: false,
    sortOrder,
    visual: { illustration: 'marche', image: null, alt: '' },
    path: '/services/culture-evenementiel/visites-guidees-douala',
    requests30d: 0,
    completeness: 0,
    toComplete: false,
    isDemo: true,
    updatedAt: new Date(Date.now() - 60_000).toISOString(),
    tagline: 'Découvrez Douala avec un guide passionné, loin des circuits classiques.',
    summary: 'Balades commentées dans les quartiers historiques, marchés et lieux de création.',
    icon: 'MapPinned',
    illustration: 'marche',
    coverImage: null,
    galleryImageIds: ['med_culture'],
    cities: ['Douala'],
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
      {
        icon: null,
        title: 'Des guides locaux passionnés',
        text: 'Ils connaissent chaque rue et ses histoires.',
      },
      { icon: null, title: 'Un parcours sur mesure', text: 'Adapté à votre rythme et à vos envies.' },
    ],
    faq: [
      {
        question: 'Combien de temps dure une visite ?',
        answer: 'Entre 2 h et une journée complète, selon le parcours choisi.',
      },
    ],
    quoteBullets: [],
    relatedServiceIds: [
      serviceId('decouverte-cameroun'),
      serviceId('activites-culturelles-loisirs-sorties'),
      serviceId('location-voiture'),
    ],
    // Témoignage de la maquette : avis publié de Patrick E. (« Découverte du Cameroun »).
    featuredReviewIds: adminReviews
      .filter((review) => review.authorName === 'Patrick E.' && review.status === 'PUBLIE')
      .slice(0, 1)
      .map((review) => review.id),
    showWhatsapp: true,
    seoTitle: 'Visites guidées de Douala | MAMBO Proxi',
    seoDescription:
      'Découvrez Douala avec un guide local : quartiers historiques, marchés, lieux de création. Devis gratuit sous 24 h.',
    publishedAt: null,
    completenessDetail: { percent: 0, criteria: [] },
    version: 'v1',
  });
}

function seedServices(): AdminService[] {
  return Object.entries(catalogueSeed).flatMap(([categorySlug, seeds]) => {
    const slugs = seeds.map((service) => service.slug);
    const ordered =
      categorySlug === 'experience'
        ? [...EXPERIENCE_ORDER, ...slugs.filter((slug) => !EXPERIENCE_ORDER.includes(slug))]
        : slugs;
    const list = ordered.map((slug, index) => fromCatalogue(slug, index + 1));
    if (categorySlug === 'culture-evenementiel') list.push(visitesDouala(list.length + 1));
    return list;
  });
}

function seedCategories(): Category[] {
  return categorySummaries.map((summary) => {
    const detail = categoryDetails[summary.slug];
    return {
      id: summary.id,
      slug: summary.slug,
      name: summary.name,
      tagline: summary.tagline,
      description: summary.description,
      eyebrow: detail?.eyebrow ?? null,
      heroTitle: detail?.heroTitle ?? '',
      heroLead: detail?.heroLead ?? '',
      audiencesTitle: detail?.audiencesTitle ?? null,
      servicesTitle: detail?.servicesTitle ?? null,
      servicesLead: detail?.servicesLead ?? null,
      processTitle: detail?.processTitle ?? null,
      homeCard: summary.homeCard,
      icon: summary.icon,
      illustration: summary.visual.illustration,
      imageId: null,
      tint: summary.tint,
      status: 'PUBLISHED',
      audiences: detail?.audiences ?? [],
      processSteps: detail?.processSteps ?? [],
      testimonialId: detail?.testimonial?.id ?? null,
      groups: detail?.groups ?? [],
      highlight: detail?.highlight ?? null,
      quoteFields: detail?.quoteFields ?? [],
      ctaTitle: detail?.cta.title ?? null,
      ctaText: detail?.cta.text ?? null,
      seoTitle: detail?.seo.title ? detail.seo.title.slice(0, 60) : null,
      seoDescription: detail?.seo.description ? detail.seo.description.slice(0, 160) : null,
      sortOrder: summary.sortOrder,
      serviceCount: 0,
      updatedAt: daysAgo(20),
    };
  });
}

/** Données en mémoire (modifiées par les gestionnaires simulés). */
export const adminServices: AdminService[] = seedServices();
export const adminCategories: Category[] = seedCategories();

// Photos des fiches : présentes dans la médiathèque de l'API (seed), donc acceptées comme références.
rememberSeedImages(adminServices);
