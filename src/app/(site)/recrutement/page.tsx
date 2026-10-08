import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApplicationForm } from '@/components/forms/application-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { JobsList } from '@/components/sections/jobs/jobs-list';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('recrutement', '/recrutement');
}

type SearchParams = { searchParams: Promise<{ poste?: string }> };

/** Recrutement (desktop `67:6710`, mobile `67:7189`) : atouts, offres, bandeau prestataires, candidature. */
export default async function RecruitmentPage({ searchParams }: SearchParams) {
  const { poste } = await searchParams;
  const [page, settings, jobs] = await Promise.all([
    getPage('recrutement'),
    getSiteSettings(),
    unwrap(api.GET('/v1/jobs', cached([cacheTags.jobs]))),
  ]);
  if (!page) notFound();
  const now = new Date().toISOString();

  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Recrutement' }]}
      whatsappHref={null}
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[440px]"
      renderSection={(section) => {
        if (section.type !== 'dynamic') return undefined;
        if (section.source === 'jobs-list')
          return <JobsList key={section.id} section={section} jobs={jobs} now={now} />;
        if (section.source === 'application-form')
          return (
            <FormSection
              key={section.id}
              section={section}
              titleClassName="text-[26px]! leading-8! md:text-[34px]! md:leading-[42px]! xl:text-[40px]! xl:leading-[48px]!"
            >
              <ApplicationForm
                jobs={jobs.map((job) => ({ slug: job.slug, title: job.title }))}
                initialJob={poste ?? null}
              />
            </FormSection>
          );
        return undefined;
      }}
    />
  );
}
