import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { AppointmentsView } from '@/components/admin/appointments/appointments-view';
import { AppointmentsHeaderActions } from '@/components/admin/appointments/header-actions';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Rendez-vous' };

/** Rendez-vous (`93:11364`) : calendrier jour / semaine / mois, file « À confirmer », détail, saisie manuelle. */
export default function AppointmentsPage() {
  return (
    <AdminPage
      title="Rendez-vous"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Pilotage <ChevronRight aria-hidden size={12} /> Rendez-vous
        </span>
      }
      actions={
        <Suspense>
          <AppointmentsHeaderActions />
        </Suspense>
      }
    >
      <Suspense>
        <AppointmentsView />
      </Suspense>
    </AdminPage>
  );
}
