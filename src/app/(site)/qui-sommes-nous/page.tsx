import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '@/components/sections/content/page-sections';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('qui-sommes-nous', '/qui-sommes-nous');
}

/** Qui sommes-nous ? (desktop `63:4730`, mobile `63:5199`) : sections de la page `qui-sommes-nous`. */
export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage('qui-sommes-nous'), getSiteSettings()]);
  if (!page) notFound();
  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Qui sommes-nous ?' }]}
      whatsappHref={
        settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
      }
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[460px]"
    />
  );
}
