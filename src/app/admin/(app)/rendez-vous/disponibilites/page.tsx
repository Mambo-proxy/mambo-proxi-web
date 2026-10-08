import type { Metadata } from 'next';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AvailabilityEditor } from '@/components/admin/appointments/availability-editor';
import { AdminPage, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { adminRoutes } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Créneaux disponibles' };

/** Créneaux disponibles (non maquetté) : jours et horaires, durée, délais, fermetures, lieu et visio. */
export default function AvailabilityPage() {
  return (
    <AdminPage
      title="Créneaux disponibles"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Pilotage <ChevronRight aria-hidden size={12} />
          <Link href={adminRoutes.appointments} className="rounded-xs hover:text-text-main hover:underline">
            Rendez-vous
          </Link>
          <ChevronRight aria-hidden size={12} /> Créneaux disponibles
        </span>
      }
      actions={
        <Link href={adminRoutes.appointments} className={topbarSecondaryClass}>
          <ArrowLeft aria-hidden />
          Retour au calendrier
        </Link>
      }
    >
      <AvailabilityEditor />
    </AdminPage>
  );
}
