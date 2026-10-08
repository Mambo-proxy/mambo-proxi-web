import type { Metadata } from 'next';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { ServicesView } from '@/components/admin/services/services-view';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { adminRoutes } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Services' };

/** Services (`88:10421`) : liste par rubrique, ordre d'affichage, menu, publication ; gestion des rubriques. */
export default function ServicesPage() {
  return (
    <AdminPage
      title="Services"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Services
        </span>
      }
      actions={
        <Link href={adminRoutes.newService} className={topbarActionClass}>
          <Plus aria-hidden />
          Ajouter un service
        </Link>
      }
    >
      <Suspense>
        <ServicesView />
      </Suspense>
    </AdminPage>
  );
}
