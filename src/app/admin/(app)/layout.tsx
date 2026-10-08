import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/shell/admin-shell';
import { requireAdminUser } from '@/lib/admin/session';

/** Écrans du back-office réservés aux utilisateurs connectés. */
export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
