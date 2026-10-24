import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActivityLog } from '@/components/admin/activity/activity-log';

export const metadata: Metadata = { title: 'Journal d’activité' };

/** Journal d'activité (non maquetté, administrateurs) : actions du back-office par jour, filtres, détail. */
export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityLog />
    </Suspense>
  );
}
