'use client';

import { Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { useCan } from '@/components/admin/shell/permissions';
import { adminRoutes } from '@/lib/admin/routes';

/** Réglage des disponibilités (sous-page). */
export const availabilityRoute = `${adminRoutes.appointments}/disponibilites` as Route;

/**
 * Actions de la barre supérieure (`93:11508`, `93:11513`) : « Créneaux disponibles » (`availability:write`) et
 * « Ajouter » (`appointments:write`).
 */
export function AppointmentsHeaderActions() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const can = useCan();
  return (
    <>
      {can('availability:write') && (
        <Link href={availabilityRoute} className={topbarSecondaryClass}>
          <Clock aria-hidden />
          Créneaux disponibles
        </Link>
      )}
      {can('appointments:write') && (
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.set('nouveau', '1');
            router.replace(`${pathname}?${next.toString()}` as Route, { scroll: false });
          }}
          className={topbarActionClass}
        >
          <Plus aria-hidden />
          Ajouter
        </button>
      )}
    </>
  );
}
