import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { MagazineView, NewEditionButton } from '@/components/admin/magazine/magazine-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Magazine' };

/** Magazine (`267:1511`) : éditions, articles, statistiques de la dernière campagne. */
export default function MagazinePage() {
  return (
    <AdminPage
      title="Magazine"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Magazine
        </span>
      }
      actions={<NewEditionButton />}
    >
      <Suspense>
        <MagazineView />
      </Suspense>
    </AdminPage>
  );
}
