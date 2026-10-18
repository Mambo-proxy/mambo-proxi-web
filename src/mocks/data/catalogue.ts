import type { CategorySummary, ServiceSummary } from '@/lib/api/schema';
import { catalogueSeed } from './catalogue-services';
import operations from './contract-examples.json';

/**
 * Catalogue simulé des nouvelles maquettes : 5 rubriques et 24 services, en français et en anglais (`?lang=en`).
 * Les résumés de rubriques viennent des exemples `Categories` / `CategoriesEn` du contrat, les services de
 * `catalogue-services.ts`.
 */
export type Lang = 'fr' | 'en';

const categoryExamples = operations.find((operation) => operation.operationId === 'listCategories')
  ?.examples as Record<'default' | 'en', CategorySummary[]>;

/** Langue d'une requête simulée (`?lang=en`), le français sinon. */
export function langOf(request: Request): Lang {
  return new URL(request.url).searchParams.get('lang') === 'en' ? 'en' : 'fr';
}

/** Résumés des rubriques, sans leurs services (réponse par défaut de `GET /v1/categories`). */
export function getCategorySummaries(lang: Lang = 'fr'): CategorySummary[] {
  return lang === 'en' ? categoryExamples.en : categoryExamples.default;
}

export function getServices(lang: Lang = 'fr'): ServiceSummary[] {
  const summaries = getCategorySummaries(lang);
  return Object.entries(catalogueSeed).flatMap(([categorySlug, seeds]) => {
    const category = summaries.find((item) => item.slug === categorySlug);
    return seeds.map((seed) => ({
      id: `svc_${seed.slug.replaceAll('-', '_')}`,
      slug: seed.slug,
      name: seed.name[lang],
      shortName: seed.shortName?.[lang] ?? null,
      summary: seed.summary[lang],
      icon: seed.icon,
      visual: {
        illustration: seed.illustration,
        image: seed.photo ? { id: `photo-${seed.slug}`, ...seed.photo, variants: [] } : null,
        alt: '',
      },
      category: { slug: categorySlug, name: category?.name ?? categorySlug },
      // Une formule n'a pas de fiche : elle renvoie à la section des formules de sa rubrique.
      href:
        seed.kind === 'formula'
          ? `/services/${categorySlug}#formules`
          : `/services/${categorySlug}/${seed.slug}`,
      featuredOnHome: seed.featuredOnHome ?? false,
      kind: seed.kind ?? 'service',
    }));
  });
}

export function getCategories(lang: Lang = 'fr'): CategorySummary[] {
  const services = getServices(lang);
  return getCategorySummaries(lang).map((category) => ({
    ...category,
    services: services.filter((service) => service.category.slug === category.slug),
  }));
}

/** Données françaises (gestionnaires et tests qui n'ont pas besoin de la langue). */
export const categorySummaries = getCategorySummaries('fr');
export const services = getServices('fr');
export const categories = getCategories('fr');

/** Recherche insensible à la casse et aux accents. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
