import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '@/components/sections/content/page-sections';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('mission', '/mission');
}

/** Mission (desktop `64:5257`, mobile `64:5667`) : sections de la page `mission`. */
export default async function MissionPage() {
  const [page, settings] = await Promise.all([getPage('mission'), getSiteSettings()]);
  if (!page) notFound();
  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Mission' }]}
      whatsappHref={
        settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
      }
      keyFigures={settings.keyFigures ?? []}
      heroVisualClassName="xl:h-[440px]"
    />
  );
}
