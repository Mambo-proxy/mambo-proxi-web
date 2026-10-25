import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { TrainingForm } from '@/components/forms/training-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { TrainingsCatalog, TrainingsCatalogFromUrl } from '@/components/sections/training/trainings-catalog';
import { Visual } from '@/components/ui/visual';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  return pageMetadata('formation', '/formation');
}

/**
 * Formation (desktop `66:6190`, mobile `66:6730`) : offres, catalogue filtrable, demande de formation. Pas de
 * bandeau CTA. Page prérendue : le filtre `?categorie=` est lu dans le navigateur ; repli du `<Suspense>` : le
 * catalogue complet (« Toutes »), remplacé à l'hydratation.
 */
export default async function TrainingPage({ params }: LocaleParams) {
  await withLocale(params);
  const [page, settings, trainings, t] = await Promise.all([
    getPage('formation'),
    getSiteSettings(),
    unwrap(api.GET('/v1/trainings', cached([cacheTags.trainings]))),
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
        if (section.source === 'trainings-catalog')
          return (
            <Suspense
              key={section.id}
              fallback={<TrainingsCatalog section={section} trainings={trainings} initialFilter={null} />}
            >
              <TrainingsCatalogFromUrl section={section} trainings={trainings} />
            </Suspense>
          );
        if (section.source === 'training-form')
          return (
            <FormSection
              key={section.id}
              section={section}
              aside={
                section.visual && (
                  <Visual visual={section.visual} sizes="420px" className="h-[280px] rounded-3xl" />
                )
              }
            >
              <TrainingForm trainings={trainings} />
            </FormSection>
          );
        return undefined;
      }}
    />
  );
}
