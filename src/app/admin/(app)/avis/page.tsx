import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { AddReviewButton } from '@/components/admin/reviews/add-review';
import { ReviewsView } from '@/components/admin/reviews/reviews-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Avis clients' };

/** Avis clients (`93:10935`) : indicateurs, validation, réponses, mise en avant, questionnaire de satisfaction. */
export default function ReviewsPage() {
  return (
    <AdminPage
      title="Avis clients"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Avis clients
        </span>
      }
      actions={<AddReviewButton />}
    >
      <Suspense>
        <ReviewsView />
      </Suspense>
    </AdminPage>
  );
}
