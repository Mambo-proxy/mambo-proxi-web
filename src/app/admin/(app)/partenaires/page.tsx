import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { AddPartnerButton, PartnersView } from '@/components/admin/partners/partners-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Partenaires' };

/** Partenaires (`93:22449`) : logos affichés sur le site (ordre, visibilité, catégorie) et demandes de partenariat. */
export default function PartnersPage() {
  return (
    <AdminPage
      title="Partenaires"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Partenaires
        </span>
      }
      actions={<AddPartnerButton />}
    >
      <Suspense>
        <PartnersView />
      </Suspense>
    </AdminPage>
  );
}
