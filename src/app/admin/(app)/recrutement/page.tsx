import type { Metadata } from 'next';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { JobsView, newOfferHref } from '@/components/admin/jobs/jobs-view';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { Can } from '@/components/admin/shell/permissions';

export const metadata: Metadata = { title: 'Recrutement' };

/** Recrutement (`93:21723`) : offres d'emploi, dernières candidatures, candidatures filtrées et leur détail. */
export default function JobsPage() {
  return (
    <AdminPage
      title="Recrutement"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Recrutement
        </span>
      }
      actions={
        // « Nouvelle offre » : permission `content:write`.
        <Can permission="content:write">
          <Link href={newOfferHref} className={topbarActionClass}>
            <Plus aria-hidden />
            Nouvelle offre
          </Link>
        </Can>
      }
    >
      <Suspense>
        <JobsView />
      </Suspense>
    </AdminPage>
  );
}
