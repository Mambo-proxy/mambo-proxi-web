'use client';

import { Eye, ShieldAlert } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState } from '@/components/admin/ui/filters';
import type { CurrentUser, Permission } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
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

/**
 * Bandeau « Lecture seule » en tête d'un écran de contenus : affiché seulement sans la permission d'écriture (ex.
 * responsable : `content:read` sans `content:write`). Les boutons d'écriture sont alors masqués et les champs figés.
 */
export function ReadOnlyNotice({
  permission,
  text = 'votre rôle permet de consulter ces contenus, pas de les modifier.',
  className,
}: {
  permission: Permission | Permission[];
  text?: string;
  className?: string;
}) {
  const can = useCan();
  const list = Array.isArray(permission) ? permission : [permission];
  if (can(...list)) return null;
  return (
    <p
      role="note"
      className={cn(
        'flex items-start gap-3 rounded-[14px] border border-border-default bg-neutral-0 px-4 py-3 font-ui text-[14px] leading-5 text-text-main',
        className,
      )}
    >
      <Eye aria-hidden size={18} className="mt-px shrink-0 text-icon-default" />
      <span>
        <strong className="font-semibold">Lecture seule :</strong> {text}
      </span>
    </p>
  );
}

const ReadOnlyContext = createContext(false);

/** Vrai dans un `ReadOnlyFieldset` figé : listes réordonnables, éditeur de texte riche et boutons d'ajout s'y plient. */
export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}

/**
 * Formulaire figé sans la permission d'écriture : `fieldset disabled` (champs, interrupteurs et boutons désactivés,
 * hors de l'ordre de tabulation) sans effet sur la mise en page (`display: contents`). Les composants qui ne sont pas
 * des champs natifs (glisser-déposer, texte riche, boutons d'ajout ou de suppression) lisent `useReadOnly()`.
 */
export function ReadOnlyFieldset({
  readOnly,
  className,
  children,
}: {
  readOnly: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <fieldset disabled={readOnly || undefined} className={cn('contents', className)}>
        {children}
      </fieldset>
    </ReadOnlyContext.Provider>
  );
}
