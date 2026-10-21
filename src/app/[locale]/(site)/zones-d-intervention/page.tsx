import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageSections } from '@/components/sections/content/page-sections';
import { ZonesSection } from '@/components/sections/zones/zones-section';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('zones-d-intervention', '/zones-d-intervention');
}

/**
 * Zones d'intervention (desktop `255:12322`, mobile `255:12506`) : héros et pastilles, carte interactive, recherche de
 * quartier et quartiers par zone (`GET /v1/zones`), bandeau final.
 */
export default async function ZonesPage() {
  const [page, areas, settings, t] = await Promise.all([
    getPage('zones-d-intervention'),
    unwrapOrNull(api.GET('/v1/zones', cached([cacheTags.zones]))),
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
      heroVisualClassName="xl:h-[440px]"
      renderSection={(section) => {
        if (section.type !== 'dynamic' || section.source !== 'zones-map') return undefined;
        return areas ? (
          <ZonesSection key={section.id} section={section} areas={areas} withQuarterList />
        ) : null;
      }}
    />
  );
}
