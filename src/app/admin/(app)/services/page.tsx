import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { AddServiceButton } from '@/components/admin/services/add-service-button';
import { ServicesView } from '@/components/admin/services/services-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Services' };

/** Services (`88:10421`) : liste réordonnable, filtres par rubrique, publication et présence au menu. */
export default function ServicesPage() {
  return (
    <AdminPage
      title="Services"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Services
        </span>
      }
      actions={<AddServiceButton />}
    >
      <Suspense>
        <ServicesView />
      </Suspense>
    </AdminPage>
  );
}
