import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { CategoriesBento } from '@/components/sections/home/categories-bento';
import { FormulaCards } from '@/components/sections/home/formula-cards';
import { ZonesSection } from '@/components/sections/zones/zones-section';
import { Commitments } from '@/components/sections/home/commitments';
import { HomeHero } from '@/components/sections/home/home-hero';
import { PartnersStrip } from '@/components/sections/home/partners-strip';
import { ServiceFinder, type FinderCategory } from '@/components/sections/home/service-finder';
import { ReviewsHighlight } from '@/components/sections/home/reviews-highlight';
import { StepsCards } from '@/components/sections/home/steps-cards';
import { MarqueeBand } from '@/components/sections/marquee-band';
import { CtaBand } from '@/components/site/cta-band';
import type { PageSection } from '@/lib/api/schema';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getNavigation, getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { seoMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

/**
 * Rubriques et services de « Trouver mon service » : ceux du méga-menu (déjà chargé par la mise en page, même
 * requête mise en cache), réduits aux champs utiles pour alléger les données envoyées au navigateur.
 */
async function getFinderCategories(): Promise<FinderCategory[]> {
  const navigation = await getNavigation();
  return navigation.megaMenu.categories.map(({ slug, name, href, services }) => ({
    slug,
    name,
    href,
    services: services.map((service) => ({ slug: service.slug, name: service.name, href: service.href })),
  }));
}

async function getHomeData() {
  const [page, settings, categories, reviews, summary, partners, zones] = await Promise.all([
    unwrapOrNull(
      api.GET('/v1/pages/{key}', {
        params: { path: { key: 'accueil' } },
        ...cached([cacheTags.page('accueil')]),
      }),
    ),
    getSiteSettings(),
    unwrap(api.GET('/v1/categories', cached([cacheTags.categories]))),
    unwrap(
      api.GET('/v1/reviews', {
        params: { query: { featured: true, pageSize: 3 } },
        ...cached([cacheTags.reviews]),
      }),
    ),
    unwrap(api.GET('/v1/reviews/summary', cached([cacheTags.reviews]))),
    unwrap(api.GET('/v1/partners', cached([cacheTags.partners]))),
    unwrapOrNull(api.GET('/v1/zones', cached([cacheTags.zones]))),
  ]);
  const formulaCategories = page?.sections.flatMap((section) =>
    section.type === 'dynamic' && section.source === 'formulas' && section.categorySlug
      ? [section.categorySlug]
      : [],
  );
  const formulas = formulaCategories?.length
    ? await unwrap(
        api.GET('/v1/services', {
          params: { query: { category: formulaCategories[0] } },
          ...cached([cacheTags.services]),
        }),
      )
    : [];
  return { page, settings, categories, reviews: reviews.data, summary, partners, zones, formulas };
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  const { page, settings } = await getHomeData();
  return seoMetadata({
    title: settings.seo?.defaultTitle ?? settings.siteName,
    description: settings.seo?.defaultDescription,
    path: '/',
    seo: page?.seo,
    absoluteTitle: true,
  });
}

/** Accueil (Figma `47:151`, mobile `53:530`) : sections de la page `accueil`, dans l'ordre défini dans le back-office. */
export default async function HomePage({ params }: LocaleParams) {
  await withLocale(params);
  const [data, finderCategories] = await Promise.all([getHomeData(), getFinderCategories()]);
  if (!data.page) notFound();
  const { settings } = data;
  const whatsappHref = settings.whatsapp.enabled
    ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message)
    : null;

  function render(section: PageSection) {
    if (!section.enabled) return null;
    switch (section.type) {
      case 'hero':
        // « Trouver mon service » juste sous le héros, sur le même fond : accès direct à un service.
        return (
          <Fragment key={section.id}>
            <HomeHero section={section} />
            {finderCategories.length > 0 && <ServiceFinder categories={finderCategories} />}
          </Fragment>
        );
      case 'marquee':
        return <MarqueeBand key={section.id} section={section} />;
      case 'steps':
        return <StepsCards key={section.id} section={section} whatsappHref={whatsappHref} />;
      case 'featureList':
        return <Commitments key={section.id} section={section} keyFigures={settings.keyFigures ?? []} />;
      case 'ctaBand':
        return (
          <CtaBand
            key={section.id}
            title={section.title ?? ''}
            text={section.text ?? ''}
            textMobile={section.textMobile}
            href={(section.primaryCta?.href ?? '/devis') as Route}
            ctaLabel={section.primaryCta?.label}
            whatsappHref={section.showWhatsapp ? whatsappHref : null}
          />
        );
      case 'dynamic':
        if (section.source === 'categories-bento')
          return <CategoriesBento key={section.id} section={section} categories={data.categories} />;
        if (section.source === 'reviews-highlight')
          return (
            <ReviewsHighlight
              key={section.id}
              section={section}
              reviews={data.reviews.slice(0, section.limit ?? 3)}
              summary={data.summary}
            />
          );
        if (section.source === 'formulas')
          return (
            <FormulaCards
              key={section.id}
              section={section}
              formulas={data.formulas.filter(
                (service) => service.kind === 'formula' && service.category.slug === section.categorySlug,
              )}
            />
          );
        if (section.source === 'zones-map')
          return data.zones ? <ZonesSection key={section.id} section={section} areas={data.zones} /> : null;
        if (section.source === 'partners-strip')
          return <PartnersStrip key={section.id} section={section} partners={data.partners} />;
        return null;
      default:
        return null;
    }
  }

  return (
    <>
      <JsonLd data={[organizationJsonLd(settings, data.summary), websiteJsonLd(settings)]} />
      {data.page.sections.map(render)}
    </>
  );
}
