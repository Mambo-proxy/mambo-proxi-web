import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PartnerForm, PartnerFormFromUrl } from '@/components/forms/partner-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { PartnersGrid, PartnersGridFromUrl } from '@/components/sections/partners/partners-grid';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  return pageMetadata('partenaires', '/partenaires');
}

/**
 * Partenaires (desktop `65:5704`, mobile `65:6208`) : logos filtrables, types de partenariat, formulaire. Pas
 * de bandeau CTA. Page prérendue : le filtre `?categorie=` et le type `?type=` sont lus dans le navigateur ;
 * les replis des `<Suspense>` sont les rendus par défaut (« Tous », premier type), remplacés à l'hydratation.
 */
export default async function PartnersPage({ params }: LocaleParams) {
  await withLocale(params);
  const [page, settings, partners, t] = await Promise.all([
    getPage('partenaires'),
    getSiteSettings(),
    unwrap(api.GET('/v1/partners', cached([cacheTags.partners]))),
    getTranslations('rubrique'),
  ]);
  if (!page) notFound();

  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: t('home'), href: routes.home }, { label: page.title }]}
      whatsappHref={null}
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[440px]"
      renderSection={(section) => {
        if (section.type !== 'dynamic') return undefined;
        if (section.source === 'partners-grid')
          return (
            <Suspense
              key={section.id}
              fallback={<PartnersGrid section={section} partners={partners} initialFilter="TOUS" />}
            >
              <PartnersGridFromUrl section={section} partners={partners} />
            </Suspense>
          );
        if (section.source === 'partner-form')
          return (
            <FormSection key={section.id} section={section}>
              <Suspense fallback={<PartnerForm initialType={null} />}>
                <PartnerFormFromUrl />
              </Suspense>
            </FormSection>
          );
        return undefined;
      }}
    />
  );
}
