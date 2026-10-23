import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Suspense } from 'react';
import { NewZoneButton, ZonesView } from '@/components/admin/zones/zones-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Zones d’intervention' };

/** Zones d'intervention (`267:1934`) : zones, quartiers, délais, tarifs indicatifs et aperçu de la carte. */
export default async function ZonesPage() {
  // Textes de la carte du site (zoom, légende), réutilisée pour l'aperçu.
  const { zones } = await getMessages();
  return (
    <AdminPage
      title="Zones d’intervention"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Zones d’intervention
        </span>
      }
      actions={<NewZoneButton />}
    >
      <NextIntlClientProvider messages={{ zones }}>
        <Suspense>
          <ZonesView />
        </Suspense>
      </NextIntlClientProvider>
    </AdminPage>
  );
}
