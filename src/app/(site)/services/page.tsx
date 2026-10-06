import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/sections/page-hero';
import { CategoryNav } from '@/components/sections/services/category-nav';
import { CategoryServices } from '@/components/sections/services/category-services';
import { CtaBand } from '@/components/site/cta-band';
import type { PageSection } from '@/lib/api/schema';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

async function getServicesData() {
  const [page, settings, categories] = await Promise.all([
    unwrapOrNull(
      api.GET('/v1/pages/{key}', {
        params: { path: { key: 'services' } },
        ...cached([cacheTags.page('services')]),
      }),
    ),
    getSiteSettings(),
    unwrap(
      api.GET('/v1/categories', {
        params: { query: { include: 'services' } },
        ...cached([cacheTags.categories, cacheTags.services]),
      }),
    ),
  ]);
  return { page, settings, categories };
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getServicesData();
  return {
    title: page?.seo.title ?? 'Nos services',
    description: page?.seo.description ?? undefined,
    alternates: { canonical: '/services' },
  };
}

/** « Nos services » (Figma `58:828`, mobile `58:1543`) : héros, rubriques avec leurs services, bandeau CTA. */
export default async function ServicesPage() {
  const { page, settings, categories } = await getServicesData();
  if (!page) notFound();
  const whatsappHref = settings.whatsapp.enabled
    ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message)
    : null;

  function render(section: PageSection) {
    if (!section.enabled) return null;
    switch (section.type) {
      case 'hero':
        return (
          <PageHero
            key={section.id}
            section={section}
            whatsappHref={whatsappHref}
            breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: page?.title ?? 'Nos services' }]}
          />
        );
      case 'dynamic':
        if (section.source !== 'categories-list') return null;
        return (
          <div key={section.id}>
            <CategoryNav items={categories.map(({ slug, name }) => ({ slug, name }))} />
            {categories.map((category, index) => (
              <CategoryServices key={category.slug} category={category} index={index} />
            ))}
          </div>
        );
      case 'ctaBand':
        return (
          <CtaBand
            key={section.id}
            title={section.title ?? ''}
            text={section.text ?? ''}
            textMobile={section.textMobile}
            href={(section.primaryCta?.href ?? routes.devis) as Route}
            ctaLabel={section.primaryCta?.label}
            whatsappHref={section.showWhatsapp ? whatsappHref : null}
          />
        );
      default:
        return null;
    }
  }

  return <>{page.sections.map(render)}</>;
}
