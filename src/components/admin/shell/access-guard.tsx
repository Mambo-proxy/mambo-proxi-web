'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAdmin } from './admin-context';
import { AdminPage } from './admin-page';
import { screenFor } from './nav';
import { AccessDenied, hasPermission } from './permissions';

/**
 * Garde des écrans du back-office : un écran dont l'utilisateur n'a aucune des permissions (menu ou sous-écran,
 * `nav.ts`) affiche « Accès réservé » au lieu de son contenu, qui n'est alors ni rendu ni chargé. L'API reste juge
 * (403) ; la garde évite seulement d'ouvrir un écran inutilisable par une adresse saisie ou un lien partagé.
 */
export function AccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAdmin();
  const screen = screenFor(pathname);
  if (!screen || hasPermission(user, ...screen.permissions)) return <>{children}</>;
  return (
    <AdminPage title={screen.label}>
      <AccessDenied />
    </AdminPage>
  );
}
