import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartnerForm } from '@/components/forms/partner-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { PartnersGrid } from '@/components/sections/partners/partners-grid';
import type { PartnerCategory } from '@/lib/api/schema';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('partenaires', '/partenaires');
}

const CATEGORIES: PartnerCategory[] = ['EXPERIENCE', 'IMMOBILIER', 'ENTREPRISES'];

type SearchParams = { searchParams: Promise<{ categorie?: string; type?: string }> };

/** Partenaires (desktop `65:5704`, mobile `65:6208`) : logos filtrables, types de partenariat, formulaire. Pas de bandeau CTA. */
export default async function PartnersPage({ searchParams }: SearchParams) {
  const query = await searchParams;
  const [page, settings, partners] = await Promise.all([
    getPage('partenaires'),
    getSiteSettings(),
    unwrap(api.GET('/v1/partners', cached([cacheTags.partners]))),
  ]);
  if (!page) notFound();
  const initialFilter = CATEGORIES.find((category) => category === query.categorie) ?? 'TOUS';

  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Partenaires' }]}
      whatsappHref={null}
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[440px]"
      renderSection={(section) => {
        if (section.type !== 'dynamic') return undefined;
        if (section.source === 'partners-grid')
          return (
            <PartnersGrid
              key={section.id}
              section={section}
              partners={partners}
              initialFilter={initialFilter}
            />
          );
        if (section.source === 'partner-form')
          return (
            <FormSection key={section.id} section={section}>
              <PartnerForm initialType={query.type ?? null} />
            </FormSection>
          );
        return undefined;
      }}
    />
  );
}
