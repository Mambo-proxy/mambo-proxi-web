import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DashboardView } from '@/components/admin/dashboard/dashboard-view';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { adminRoutes } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Tableau de bord' };

/** Tableau de bord du back-office (`85:10235`, mobile `95:11777`). */
export default function DashboardPage() {
  return (
    <AdminPage
      title="Tableau de bord"
      hideMobileTitle
      actions={
        <Link href={adminRoutes.newService} className={topbarActionClass}>
          <Plus aria-hidden />
          Nouveau service
        </Link>
      }
    >
      <DashboardView />
    </AdminPage>
  );
}
