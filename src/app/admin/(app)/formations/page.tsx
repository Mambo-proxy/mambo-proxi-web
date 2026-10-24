import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { AdminPage } from '@/components/admin/shell/admin-page';
import { NewTrainingButton, TrainingsView } from '@/components/admin/trainings/trainings-view';

export const metadata: Metadata = { title: 'Formations' };

/** Formations (`93:22873`) : catalogue de la page Formation du site (ordre, publication) et demandes de formation. */
export default function TrainingsPage() {
  return (
    <AdminPage
      title="Formations"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Formations
        </span>
      }
      actions={<NewTrainingButton />}
    >
      <Suspense>
        <TrainingsView />
      </Suspense>
    </AdminPage>
  );
}
