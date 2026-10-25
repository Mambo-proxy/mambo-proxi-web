import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { ExportRequestsButton } from '@/components/admin/requests/export-button';
import { RequestsView } from '@/components/admin/requests/requests-view';
import { AdminPage } from '@/components/admin/shell/admin-page';
import { Can } from '@/components/admin/shell/permissions';

export const metadata: Metadata = { title: 'Demandes' };

/** Demandes (`87:10782`) : liste filtrable, détail, changement de statut, assignation, échéances, notes, export. */
export default function RequestsPage() {
  return (
    <AdminPage
      title="Demandes"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Pilotage <ChevronRight aria-hidden size={12} /> Demandes
        </span>
      }
      actions={
        // Export CSV : permission `requests:export`.
        <Can permission="requests:export">
          <Suspense>
            <ExportRequestsButton />
          </Suspense>
        </Can>
      }
    >
      <Suspense>
        <RequestsView />
      </Suspense>
    </AdminPage>
  );
}
