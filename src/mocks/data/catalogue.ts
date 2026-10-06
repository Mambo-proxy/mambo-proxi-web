import type { CategorySummary, ServiceSummary } from '@/lib/api/schema';
import operations from './contract-examples.json';
import catalogue from './catalogue-services.json';

/**
 * Catalogue simulé : 4 rubriques et 19 services du cahier des charges (§5), au format du contrat.
 * Les résumés de rubriques viennent de l'exemple `Categories` du contrat, les services de
 * `catalogue-services.json` (copie de `content/` du dossier de pilotage).
 */
/** Résumés des rubriques, sans leurs services (réponse par défaut de `GET /v1/categories`). */
export const categorySummaries = operations.find((operation) => operation.operationId === 'listCategories')
  ?.examples.default as CategorySummary[];

/** Services marqués « mis en avant sur l'accueil » dans les exemples du contrat. */
const FEATURED_ON_HOME = new Set(['location-voiture', 'chef-prive']);

export const services: ServiceSummary[] = catalogue.rubriques.flatMap((category) =>
  category.services.map((service) => ({
    id: `svc_${service.slug.replaceAll('-', '_')}`,
    slug: service.slug,
    name: service.nom,
    shortName: 'nomCourt' in service ? (service.nomCourt ?? null) : null,
    summary: service.resume,
    icon: service.icone,
    visual: {
      illustration: service.illustration as ServiceSummary['visual']['illustration'],
      image: null,
      alt: '',
    },
    category: { slug: category.slug, name: category.nom },
    href: `/services/${category.slug}/${service.slug}`,
    featuredOnHome: FEATURED_ON_HOME.has(service.slug),
  })),
);

export const categories: CategorySummary[] = categorySummaries.map((category) => ({
  ...category,
  services: services.filter((service) => service.category.slug === category.slug),
}));

/** Recherche insensible à la casse et aux accents. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
