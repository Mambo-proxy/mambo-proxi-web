import type {
  CategoryDetail,
  FaqItem,
  JobOfferDetail,
  ReviewSummary,
  ServiceDetail,
  SiteSettings,
} from '@/lib/api/schema';
import { SITE_NAME, absoluteUrl, siteUrl } from './site';

/** Données structurées schema.org (https://schema.org), sérialisées par `<JsonLd>`. */
export type JsonLdThing = { '@type': string; [key: string]: unknown };

const ORGANIZATION_ID = `${siteUrl}/#organisation`;
const WEBSITE_ID = `${siteUrl}/#site`;

/** Note globale des avis vérifiés, rattachée à l'organisation (aucune note si aucun avis). */
function aggregateRating(summary: ReviewSummary | null | undefined) {
  if (!summary || summary.total === 0) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: summary.average,
    reviewCount: summary.total,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Organisation : agence de Douala (`LocalBusiness`), joignable en France et au Cameroun, zone desservie France +
 * Cameroun. La note globale des avis (`AggregateRating`) y est rattachée quand elle est fournie.
 */
export function organizationJsonLd(settings: SiteSettings, reviews?: ReviewSummary | null): JsonLdThing {
  const { agency, contact } = settings;
  return {
    '@type': 'LocalBusiness',
    '@id': ORGANIZATION_ID,
    name: settings.siteName,
    description: settings.seo.defaultDescription,
    slogan: settings.tagline,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/logo-horizontal.svg'),
    image: absoluteUrl('/opengraph-image'),
    email: contact.email,
    telephone: contact.phoneCameroon,
    address: {
      '@type': 'PostalAddress',
      streetAddress: agency.addressLines.join(', '),
      addressLocality: agency.city,
      addressCountry: agency.country,
    },
    ...(agency.latitude != null && agency.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: agency.latitude, longitude: agency.longitude } }
      : {}),
    ...(agency.mapsUrl ? { hasMap: agency.mapsUrl } : {}),
    areaServed: [
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'Cameroun' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: contact.phoneFrance,
        areaServed: 'FR',
        availableLanguage: 'French',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: contact.phoneCameroon,
        areaServed: 'CM',
        availableLanguage: 'French',
      },
    ],
    sameAs: settings.social.map((link) => link.url),
    aggregateRating: aggregateRating(reviews),
  };
}

/** Site web (nom affiché par les moteurs de recherche). */
export function websiteJsonLd(settings: SiteSettings): JsonLdThing {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: settings.siteName,
    url: absoluteUrl('/'),
    inLanguage: 'fr-FR',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** Fil d'Ariane : le dernier élément (page courante) n'a pas d'adresse, comme dans le composant affiché. */
export function breadcrumbJsonLd(items: { label: string; href?: string }[]): JsonLdThing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && index < items.length - 1 ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

/** Service proposé par l'agence (fiche service), sans prix : uniquement sur devis. */
export function serviceJsonLd(service: ServiceDetail): JsonLdThing {
  return {
    '@type': 'Service',
    name: service.name,
    description: service.summary,
    serviceType: service.category.name,
    url: absoluteUrl(service.href),
    provider: { '@id': ORGANIZATION_ID },
    areaServed: service.cities.length
      ? service.cities.map((city) => ({ '@type': 'City', name: city }))
      : { '@type': 'Country', name: 'Cameroun' },
    aggregateRating: aggregateRating(service.reviewSummary),
  };
}

/** Rubrique : liste de ses services. */
export function categoryJsonLd(category: CategoryDetail): JsonLdThing {
  return {
    '@type': 'ItemList',
    name: category.name,
    itemListElement: (category.services ?? []).map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: service.name,
      url: absoluteUrl(service.href),
    })),
  };
}

/** Questions fréquentes (résultats enrichis). */
export function faqJsonLd(faq: FaqItem[]): JsonLdThing | null {
  if (!faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  CDI: 'FULL_TIME',
  CDD: 'TEMPORARY',
  STAGE: 'INTERN',
  ALTERNANCE: 'INTERN',
  FREELANCE: 'CONTRACTOR',
  INDEPENDANT: 'CONTRACTOR',
};

/** Offre d'emploi (Google for Jobs). */
export function jobPostingJsonLd(job: JobOfferDetail): JsonLdThing {
  const description = [
    job.description,
    job.missions.length ? `Vos missions : ${job.missions.join(' ; ')}.` : null,
    job.profile.length ? `Votre profil : ${job.profile.join(' ; ')}.` : null,
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    '@type': 'JobPosting',
    title: job.title,
    description: description || job.summary,
    datePosted: job.publishedAt,
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    employmentType: EMPLOYMENT_TYPES[job.contractType.toUpperCase()] ?? 'OTHER',
    hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: absoluteUrl('/') },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.city, addressCountry: job.country },
    },
    url: absoluteUrl(`/recrutement/${job.slug}`),
    directApply: true,
  };
}
