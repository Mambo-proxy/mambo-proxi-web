import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { EventsView, NewEventButton } from '@/components/admin/events/events-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Agenda' };

/** Agenda (non maquetté) : événements de la rubrique Culture & événementiel, places, publication, inscriptions. */
export default function EventsPage() {
  return (
    <AdminPage
      title="Agenda"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Agenda
        </span>
      }
      actions={<NewEventButton />}
    >
      <Suspense>
        <EventsView />
      </Suspense>
    </AdminPage>
  );
}
