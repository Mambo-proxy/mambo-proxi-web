import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrainingForm } from '@/components/forms/training-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { TrainingsCatalog } from '@/components/sections/training/trainings-catalog';
import { Visual } from '@/components/ui/visual';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('formation', '/formation');
}

type SearchParams = { searchParams: Promise<{ categorie?: string }> };

/** Formation (desktop `66:6190`, mobile `66:6730`) : offres, catalogue filtrable, demande de formation. Pas de bandeau CTA. */
export default async function TrainingPage({ searchParams }: SearchParams) {
  const { categorie } = await searchParams;
  const [page, settings, trainings] = await Promise.all([
    getPage('formation'),
    getSiteSettings(),
    unwrap(api.GET('/v1/trainings', cached([cacheTags.trainings]))),
  ]);
  if (!page) notFound();

  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Formation' }]}
      whatsappHref={null}
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[440px]"
      renderSection={(section) => {
        if (section.type !== 'dynamic') return undefined;
        if (section.source === 'trainings-catalog')
          return (
            <TrainingsCatalog
              key={section.id}
              section={section}
              trainings={trainings}
              initialFilter={categorie ?? null}
            />
          );
        if (section.source === 'training-form')
          return (
            <FormSection
              key={section.id}
              section={section}
              aside={
                <Visual
                  visual={{ illustration: 'formation', image: null, alt: '' }}
                  sizes="420px"
                  className="h-[280px] rounded-3xl"
                />
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
