import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ApplicationForm, ApplicationFormFromUrl } from '@/components/forms/application-form';
import { FormSection } from '@/components/sections/content/form-section';
import { PageSections } from '@/components/sections/content/page-sections';
import { JobsList } from '@/components/sections/jobs/jobs-list';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  return pageMetadata('recrutement', '/recrutement');
}

/** Page prérendue, régénérée toutes les heures pour que « Publiée il y a… » des offres reste à jour. */
export const revalidate = 3600;

/**
 * Recrutement (desktop `67:6710`, mobile `67:7189`) : atouts, offres, bandeau prestataires, candidature.
 * Le poste `?poste=` est lu dans le navigateur ; repli du `<Suspense>` : la candidature spontanée, remplacée
 * à l'hydratation.
 */
export default async function RecruitmentPage({ params }: LocaleParams) {
  await withLocale(params);
  const [page, settings, jobs, t] = await Promise.all([
    getPage('recrutement'),
    getSiteSettings(),
    unwrap(api.GET('/v1/jobs', cached([cacheTags.jobs]))),
    getTranslations('rubrique'),
  ]);
  if (!page) notFound();
  const now = new Date().toISOString();
  const jobOptions = jobs.map((job) => ({ slug: job.slug, title: job.title }));

  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: t('home'), href: routes.home }, { label: page.title }]}
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
              <Suspense fallback={<ApplicationForm jobs={jobOptions} initialJob={null} />}>
                <ApplicationFormFromUrl jobs={jobOptions} />
              </Suspense>
            </FormSection>
          );
        return undefined;
      }}
    />
  );
}
