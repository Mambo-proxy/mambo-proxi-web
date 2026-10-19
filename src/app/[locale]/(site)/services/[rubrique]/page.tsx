import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { FormulaCards } from '@/components/sections/home/formula-cards';
import { PageHero } from '@/components/sections/page-hero';
import { Agenda } from '@/components/sections/rubrique/agenda';
import { Audiences } from '@/components/sections/rubrique/audiences';
import { OtherCategories } from '@/components/sections/rubrique/other-categories';
import { ParcelHighlight } from '@/components/sections/rubrique/parcel-highlight';
import { ProcessSteps } from '@/components/sections/rubrique/process-steps';
import { RubriqueServices } from '@/components/sections/rubrique/rubrique-services';
import { Testimonial } from '@/components/sections/rubrique/testimonial';
import { CtaBand } from '@/components/site/cta-band';
import type { HeroSection } from '@/lib/api/schema';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { seoMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { categoryJsonLd } from '@/lib/seo/json-ld';

type Params = { params: Promise<{ rubrique: string }> };

/** Nombre d'événements chargés pour l'agenda (3 affichés, les suivants au clic). */
const AGENDA_LIMIT = 12;

function getCategory(slug: string) {
  return unwrapOrNull(
    api.GET('/v1/categories/{slug}', {
      params: { path: { slug } },
      ...cached([cacheTags.category(slug), cacheTags.categories, cacheTags.services]),
    }),
  );
}

export async function generateStaticParams() {
  const categories = await unwrap(api.GET('/v1/categories', cached([cacheTags.categories])));
  return categories.map((category) => ({ rubrique: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { rubrique } = await params;
  const category = await getCategory(rubrique);
  if (!category) return {};
  return seoMetadata({
    title: category.name,
    description: category.description,
    path: category.href,
    seo: category.seo,
  });
}

/**
 * Page rubrique (Services à domicile `249:24507`, Expérience `60:1491`, Immobilier `61:2156`, Proximité `61:3356`,
 * Culture `61:5620`). Une rubrique de formules (Services à domicile) présente ses formules en cartes photo et
 * « Nos formules » dans le fil d'Ariane.
 */
export default async function RubriquePage({ params }: Params) {
  const { rubrique } = await params;
  const [category, settings, t] = await Promise.all([
    getCategory(rubrique),
    getSiteSettings(),
    getTranslations(),
  ]);
  if (!category) notFound();
  const services = category.services ?? [];
  const isFormulaCategory = services.length > 0 && services.every((service) => service.kind === 'formula');
  const agenda =
    category.highlight?.kind === 'AGENDA'
      ? await unwrap(
          api.GET('/v1/events', {
            params: { query: { upcoming: true, limit: AGENDA_LIMIT } },
            ...cached([cacheTags.events]),
          }),
        )
      : null;
  const whatsappHref = settings.whatsapp.enabled
    ? whatsappUrl(
        settings.whatsapp.number,
        settings.whatsapp.message,
        t('rubrique.whatsappContext', { name: category.name }),
      )
    : null;

  const hero: HeroSection = {
    id: 'hero',
    type: 'hero',
    enabled: true,
    variant: 'page',
    eyebrow: category.eyebrow ?? category.name,
    title: category.heroTitle,
    lead: category.heroLead,
    primaryCta: {
      label: t('site.cta.quote'),
      href: `/devis?rubrique=${category.slug}`,
      external: false,
    },
    showWhatsapp: true,
    visual: category.heroVisual ?? category.visual,
  };

  return (
    <>
      <JsonLd data={categoryJsonLd(category)} />
      <PageHero
        section={hero}
        whatsappHref={whatsappHref}
        visualClassName="xl:h-[440px]"
        breadcrumb={[
          { label: t('rubrique.home'), href: routes.home },
          { label: isFormulaCategory ? t('rubrique.formulas') : t('rubrique.services'), href: '/services' },
          { label: category.name },
        ]}
      />
      <Audiences category={category} />
      {isFormulaCategory ? (
        <FormulaCards
          section={{
            id: 'formules',
            type: 'dynamic',
            enabled: true,
            source: 'formulas',
            categorySlug: category.slug,
            eyebrow: t('rubrique.formulas'),
            title: category.servicesTitle,
            lead: category.servicesLead,
          }}
          formulas={services}
        />
      ) : (
        <RubriqueServices category={category} />
      )}
      {(category.highlight?.kind === 'PARCEL_RECEPTION' || category.highlight?.kind === 'STEPS_BAND') && (
        <ParcelHighlight highlight={category.highlight} />
      )}
      {category.highlight?.kind === 'AGENDA' && agenda && (
        <Agenda highlight={category.highlight} events={agenda.data} />
      )}
      <ProcessSteps category={category} />
      <Testimonial category={category} />
      <OtherCategories category={category} />
      <CtaBand
        title={category.cta.title}
        text={category.cta.text}
        href={`/devis?rubrique=${category.slug}`}
        whatsappHref={whatsappHref}
      />
    </>
  );
}
