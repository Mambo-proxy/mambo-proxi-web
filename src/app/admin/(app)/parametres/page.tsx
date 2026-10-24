import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SettingsView } from '@/components/admin/settings/settings-view';

export const metadata: Metadata = { title: 'Paramètres' };

/** Paramètres (`94:12218`) : coordonnées, e-mails automatiques, référencement, utilisateurs, sécurité & sauvegardes. */
export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
