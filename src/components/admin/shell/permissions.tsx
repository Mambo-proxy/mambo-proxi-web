'use client';

import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState } from '@/components/admin/ui/filters';
import type { CurrentUser, Permission } from '@/lib/api/schema';
import { useAdmin } from './admin-context';

/**
 * Vrai si l'utilisateur a au moins une des permissions (règle `x-permissions` du contrat : une seule suffit).
 * Les permissions viennent de l'API (`CurrentUser.permissions`) : la matrice des rôles n'est pas codée ici.
 */
export function hasPermission(
  user: Pick<CurrentUser, 'permissions'> | null | undefined,
  ...permissions: Permission[]
): boolean {
  if (!user || permissions.length === 0) return !!user;
  return permissions.some((permission) => user.permissions?.includes(permission));
}

/** `can('requests:assign')` : permissions de l'utilisateur connecté (une des permissions suffit). */
export function useCan(): (...permissions: Permission[]) => boolean {
  const { user } = useAdmin();
  return (...permissions) => hasPermission(user, ...permissions);
}

/**
 * Périmètre limité aux dossiers assignés (`…:read-assigned` sans `…:read`) : chargé·e de clientèle. Les listes sont
 * alors filtrées d'office sur « Moi » par l'API.
 */
export function useAssignedOnly(domain: 'requests' | 'appointments'): boolean {
  const can = useCan();
  return domain === 'requests'
    ? !can('requests:read') && can('requests:read-assigned')
    : !can('appointments:read') && can('appointments:read-assigned');
}

/** Contenu affiché seulement avec l'une des permissions (actions des barres supérieures, rendues côté serveur). */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const can = useCan();
  const list = Array.isArray(permission) ? permission : [permission];
  return <>{can(...list) ? children : fallback}</>;
}

/** Écran sans permission (même langage que le Journal d'activité). */
export function AccessDenied({
  title = 'Accès réservé',
  text = 'Votre rôle ne donne pas accès à cet écran. Demandez à un administrateur si vous en avez besoin.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <AdminCard className="p-6">
      <EmptyState icon={<ShieldAlert size={24} />} title={title} text={text} />
    </AdminCard>
  );
}
