import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { ContactsView, ExportContactsButton } from '@/components/admin/contacts/contacts-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Contacts & inscrits' };

/** Contacts & inscrits (`93:23268`) : indicateurs, contacts filtrés par profil, quartier et rubrique, fiche contact. */
export default function ContactsPage() {
  return (
    <AdminPage
      title="Contacts & inscrits"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Relations <ChevronRight aria-hidden size={12} /> Contacts & inscrits
        </span>
      }
      actions={
        <Suspense>
          <ExportContactsButton />
        </Suspense>
      }
    >
      <Suspense>
        <ContactsView />
      </Suspense>
    </AdminPage>
  );
}
