import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '@/components/sections/content/page-sections';
import { SuiviHero } from '@/components/sections/suivi/suivi-hero';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('suivi-mambo', '/suivi-mambo');
}

/**
 * Suivi Mambo (desktop `83:9413`, mobile `83:9731`) : page d'information, l'espace client étant hors lot 1
 * (cahier §9). Inscription pour être prévenu de l'ouverture, fonctionnalités à venir, bandeau CTA.
 */
export default async function SuiviPage() {
  const [page, settings] = await Promise.all([getPage('suivi-mambo'), getSiteSettings()]);
  if (!page) notFound();
  return (
    <PageSections
      page={page}
      breadcrumb={[{ label: 'Accueil', href: routes.home }, { label: 'Suivi Mambo' }]}
      whatsappHref={
        settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
      }
      keyFigures={settings.keyFigures ?? []}
      renderSection={(section) =>
        section.type === 'hero' ? <SuiviHero key={section.id} section={section} /> : undefined
      }
    />
  );
}
