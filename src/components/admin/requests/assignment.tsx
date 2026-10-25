'use client';

import { useQuery } from '@tanstack/react-query';
import { UserCheck } from 'lucide-react';
import { useId } from 'react';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { useCan } from '@/components/admin/shell/permissions';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { RequestListItem, TeamMemberPresence, UserRef } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatDayMonth, formatStamp } from '@/lib/format/date';

export const presenceKey = ['team-presence'] as const;

/**
 * Équipe connectée et personnes assignables (`GET /v1/admin/users/presence`, permission `team:read`), rafraîchie
 * toutes les 60 s comme le conseille le contrat. Sans la permission, aucune requête n'est envoyée.
 */
export function useTeamPresence() {
  const can = useCan();
  return useQuery({
    queryKey: presenceKey,
    queryFn: () => data(browserApi.GET('/v1/admin/users/presence')),
    enabled: can('team:read'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Membres pouvant recevoir des demandes et des rendez-vous (`assignable`). */
export function useAssignableMembers(): TeamMemberPresence[] {
  return useTeamPresence().data?.data.filter((member) => member.assignable) ?? [];
}

/** Libellés des filtres d'échéance (`due` du contrat). */
export const DUE_OPTIONS = [
  { value: 'overdue', label: 'En retard' },
  { value: 'today', label: 'Aujourd’hui' },
  { value: 'week', label: 'Cette semaine' },
] as const;

export type DueFilter = (typeof DUE_OPTIONS)[number]['value'];

const isOpen = (request: Pick<RequestListItem, 'status'>) =>
  request.status === 'NOUVELLE' || request.status === 'EN_COURS';

/**
 * Pastille d'échéance d'une demande ouverte : « En retard » (orange) ou « Échéance 25 oct. » ; rien pour une demande
 * traitée ou sans échéance.
 */
export function DueBadge({
  request,
  long = false,
  className,
}: {
  request: Pick<RequestListItem, 'status' | 'dueAt' | 'isOverdue'>;
  /** Date et heure (détail) plutôt que le jour seul (listes). */
  long?: boolean;
  className?: string;
}) {
  if (!isOpen(request) || !request.dueAt) return null;
  const when = long ? formatStamp(request.dueAt) : formatDayMonth(request.dueAt);
  if (request.isOverdue)
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap text-text-brand',
          className,
        )}
      >
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-primary" />
        En retard
        {long && <span className="font-normal"> · échéance {when}</span>}
      </span>
    );
  return (
    <span className={cn('font-ui text-[12px] leading-4 whitespace-nowrap text-text-muted', className)}>
      Échéance {when}
    </span>
  );
}

/**
 * Assignation d'une demande (`requests:assign`) ou d'un rendez-vous (`appointments:assign`) : liste des personnes
 * assignables (présence de l'équipe, « en ligne » signalé) et raccourci « M’assigner ».
 */
export function AssignmentField({
  assignedTo,
  pending,
  onAssign,
  label = 'Assignée à',
  emptyLabel = 'Non assignée',
}: {
  assignedTo: UserRef | null | undefined;
  pending: boolean;
  onAssign: (userId: string | null) => void;
  label?: string;
  emptyLabel?: string;
}) {
  const id = useId();
  const { user } = useAdmin();
  const members = useAssignableMembers();
  const current = assignedTo?.id ?? '';
  // La personne assignée reste dans la liste même si elle n'est plus assignable (compte désactivé…).
  const options =
    assignedTo && !members.some((member) => member.user.id === assignedTo.id)
      ? [{ user: assignedTo, online: false }, ...members]
      : members;
  const selfAssignable = members.some((member) => member.user.id === user.id);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id={id}
          value={current}
          disabled={pending}
          onChange={(event) => onAssign(event.target.value || null)}
          className="h-[42px] min-w-0 flex-1 cursor-pointer rounded-[10px] border border-border-strong bg-neutral-0 px-3 font-ui text-[14px] leading-5 text-text-main focus-visible:border-brand-primary disabled:opacity-60"
        >
          <option value="">{emptyLabel}</option>
          {options.map((member) => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.name}
              {member.user.id === user.id ? ' (vous)' : ''}
              {member.online ? ' · en ligne' : ''}
            </option>
          ))}
        </select>
        {current !== user.id && selfAssignable && (
          <button
            type="button"
            disabled={pending}
            onClick={() => onAssign(user.id)}
            className="flex shrink-0 items-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50 disabled:opacity-60 [&_svg]:size-4"
          >
            <UserCheck aria-hidden />
            M’assigner
          </button>
        )}
      </div>
    </div>
  );
}
