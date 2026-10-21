import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageSections } from '@/components/sections/content/page-sections';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('magazine', '/magazine');
}

/**
 * Magazine, édition en cours (desktop `254:26265`, mobile `254:26493`) : sections de la page `magazine` — héros et
 * pastilles, édito de la fondatrice, thèmes du numéro, bandeau d'abonnement à la lettre Mambo.
 */
export default async function MagazinePage() {
  const [page, settings, t] = await Promise.all([
    getPage('magazine'),
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
