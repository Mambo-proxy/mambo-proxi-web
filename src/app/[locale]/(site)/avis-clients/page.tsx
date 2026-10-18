import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '@/components/sections/content/page-sections';
import { ReviewsHero } from '@/components/sections/reviews/reviews-hero';
import { ReviewsList } from '@/components/sections/reviews/reviews-list';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationJsonLd } from '@/lib/seo/json-ld';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('avis-clients', '/avis-clients');
}

/** Avis par page : 6, comme la maquette (« 1 2 3 … 12 »). */
const PAGE_SIZE = 6;

type SearchParams = { searchParams: Promise<{ page?: string; categorie?: string; tri?: string }> };

/** Avis clients (desktop `68:7186`, mobile `68:7686`) : note globale, avis filtrables et paginés, collecte, CTA. */
export default async function ReviewsPage({ searchParams }: SearchParams) {
  const query = await searchParams;
  const [page, settings, categories, summary] = await Promise.all([
    getPage('avis-clients'),
    getSiteSettings(),
    unwrap(api.GET('/v1/categories', cached([cacheTags.categories]))),
    unwrap(api.GET('/v1/reviews/summary', cached([cacheTags.reviews]))),
  ]);
  if (!page) notFound();
  const category = categories.find((item) => item.slug === query.categorie)?.slug ?? null;
  const sort = query.tri === 'notes' ? 'rating' : 'recent';
  const pageNumber = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const reviews = await unwrap(
    api.GET('/v1/reviews', {
      params: {
        query: { category: category ?? undefined, sort, page: pageNumber, pageSize: PAGE_SIZE },
      },
      ...cached([cacheTags.reviews]),
    }),
  );
  const breadcrumb = [{ label: 'Accueil', href: routes.home }, { label: 'Avis clients' }];

  return (
    <>
      <JsonLd data={organizationJsonLd(settings, summary)} />
      <PageSections
        page={page}
        breadcrumb={breadcrumb}
        whatsappHref={
          settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
        }
        keyFigures={settings.keyFigures ?? []}
        renderSection={(section) => {
          if (section.type === 'hero')
            return (
              <ReviewsHero key={section.id} section={section} summary={summary} breadcrumb={breadcrumb} />
            );
          if (section.type === 'dynamic' && section.source === 'reviews-list')
            return (
              <ReviewsList
                key={section.id}
                reviews={reviews.data}
                categories={categories.map((item) => ({ slug: item.slug, name: item.name }))}
                category={category}
                sort={sort}
                page={reviews.meta.page}
                totalPages={reviews.meta.totalPages}
              />
            );
          return undefined;
        }}
      />
    </>
  );
}
