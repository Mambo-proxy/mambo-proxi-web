import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageSections } from '@/components/sections/content/page-sections';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  return pageMetadata('qui-sommes-nous', '/qui-sommes-nous');
}

/** Qui sommes-nous ? (desktop `63:4730`, mobile `63:5199`) : sections de la page `qui-sommes-nous`. */
export default async function AboutPage({ params }: LocaleParams) {
  await withLocale(params);
  const [page, settings, t] = await Promise.all([
    getPage('qui-sommes-nous'),
    getSiteSettings(),
    getTranslations('rubrique'),
  ]);
  if (!page) notFound();
  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: t('home'), href: routes.home }, { label: page.title }]}
      whatsappHref={
        settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
      }
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[460px]"
    />
  );
}
