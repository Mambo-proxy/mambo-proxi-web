'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, ChevronRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useCan } from '@/components/admin/shell/permissions';
import { DueBadge } from '@/components/admin/requests/assignment';
import { AdminCard, CardTitle, ContactAvatar, shortName } from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import type { MyTasks } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatStamp } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';

export const myTasksKey = ['my-tasks'] as const;

/** Liste des demandes filtrée (toutes dates : une demande en retard peut avoir plus de 30 jours). */
const requestsHref = (query: string) => `${adminRoutes.requests}?${query}&period=all` as Route;

const plural = (count: number, singular: string, several: string) =>
  `${formatNumber(count)} ${count > 1 ? several : singular}`;

function Stat({
  label,
  value,
  href,
  alert = false,
}: {
  label: string;
  value: number;
  href: Route;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col gap-0.5 rounded-md border px-3.5 py-3 transition-colors hover:bg-neutral-50',
        alert && value > 0 ? 'border-orange-200 bg-orange-50' : 'border-border-default bg-neutral-0',
      )}
    >
      <span
        className={cn(
          'font-brand text-[22px] leading-7 font-semibold text-text-main',
          alert && value > 0 && 'text-text-brand',
        )}
      >
        {formatNumber(value)}
      </span>
      <span className="font-ui text-[12px] leading-4 text-text-muted">{label}</span>
    </Link>
  );
}

function subtitleOf(tasks: MyTasks): string {
  const { open, overdue } = tasks.requests;
  if (!open) return 'Aucune demande ouverte ne vous est assignée';
  const base = plural(open, 'demande ouverte', 'demandes ouvertes');
  return overdue ? `${base} · ${plural(overdue, 'en retard', 'en retard')}` : base;
}

/**
 * « Mes tâches » du tableau de bord (`GET /v1/admin/me/tasks`, non maquetté, langage des cartes du tableau de bord) :
 * demandes ouvertes qui me sont assignées (en retard, à traiter aujourd’hui, les plus urgentes d’abord), mes
 * prochains rendez-vous et, pour qui distribue les demandes (`requests:assign`), les demandes non assignées.
 * Masquée pour un rôle sans demandes (rédacteur).
 */
export function MyTasksCard() {
  const can = useCan();
  const enabled = can('requests:read', 'requests:read-assigned');
  const query = useQuery({
    queryKey: myTasksKey,
    queryFn: () => data(browserApi.GET('/v1/admin/me/tasks')),
    enabled,
    refetchInterval: 60_000,
  });
  const tasks = query.data;
  if (!enabled) return null;

  return (
    <AdminCard
      aria-labelledby="my-tasks"
      aria-busy={query.isFetching}
      className="flex flex-col gap-4 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle id="my-tasks" title="Mes tâches" subtitle={tasks ? subtitleOf(tasks) : ' '} />
        <Link
          href={requestsHref('assignee=me')}
          className="inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
        >
          Toutes mes demandes
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>

      {query.isError && !tasks ? (
        <p role="alert" className="font-ui text-[14px] leading-5 text-text-muted">
          Impossible de charger vos tâches pour le moment.
        </p>
      ) : !tasks ? (
        <div aria-hidden className="flex flex-col gap-3">
          <Skeleton className="h-[68px] rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat
              label="En retard"
              value={tasks.requests.overdue}
              href={requestsHref('assignee=me&due=overdue')}
              alert
            />
            <Stat
              label="À traiter aujourd’hui"
              value={tasks.requests.dueToday}
              href={requestsHref('assignee=me&due=today')}
            />
            <Stat
              label="Nouvelles"
              value={tasks.requests.byStatus.NOUVELLE}
              href={requestsHref('assignee=me&status=NOUVELLE')}
            />
            <Stat
              label="Rendez-vous aujourd’hui"
              value={tasks.appointments.today}
              href={adminRoutes.appointments}
            />
          </div>

          {tasks.requests.items.length === 0 ? (
            <p className="flex items-center gap-2 rounded-md bg-neutral-50 p-3.5 font-ui text-[14px] leading-5 text-text-muted">
              <Inbox aria-hidden size={16} className="shrink-0" />
              Rien à traiter pour l’instant.
            </p>
          ) : (
            <ul aria-label="Demandes à traiter, les plus urgentes d’abord" className="flex flex-col">
              {tasks.requests.items.slice(0, 5).map((request) => (
                <li key={request.id}>
                  <Link
                    href={`${adminRoutes.requests}?id=${request.id}` as Route}
                    className="flex items-center gap-3 border-b border-border-default py-2.5 font-ui text-[14px] leading-5 text-text-main hover:bg-neutral-50 md:px-1"
                  >
                    <ContactAvatar
                      name={request.contact.fullName}
                      initials={request.contact.initials}
                      size={32}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">{shortName(request.contact.fullName)}</span>
                      <span className="truncate text-[12px] leading-4 text-text-muted">
                        {request.subject ?? request.reference}
                      </span>
                    </span>
                    <DueBadge request={request} />
                    <ChevronRight aria-hidden size={16} className="shrink-0 text-icon-default" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tasks.appointments.upcoming.length > 0 && (
            <section aria-labelledby="my-appointments" className="flex flex-col gap-2">
              <h3 id="my-appointments" className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                Mes prochains rendez-vous
                {tasks.appointments.toConfirm > 0 && (
                  <span className="font-normal text-text-muted">
                    {' '}
                    · {plural(tasks.appointments.toConfirm, 'à confirmer', 'à confirmer')}
                  </span>
                )}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {tasks.appointments.upcoming.slice(0, 3).map((appointment) => (
                  <li key={appointment.id}>
                    <Link
                      href={`${adminRoutes.appointments}?id=${appointment.id}` as Route}
                      className="flex items-center gap-2.5 rounded-md px-1 py-1.5 font-ui text-[13px] leading-5 text-text-main hover:bg-neutral-50"
                    >
                      <Calendar aria-hidden size={16} className="shrink-0 text-icon-default" />
                      <span className="min-w-0 flex-1 truncate">
                        {formatStamp(appointment.proposedStartsAt ?? appointment.startsAt)} ·{' '}
                        {appointment.contact.fullName}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tasks.unassigned !== null && tasks.unassigned !== undefined && tasks.unassigned > 0 && (
            <Link
              href={requestsHref('assignee=none')}
              className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 p-3.5 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-100"
            >
              {plural(tasks.unassigned, 'demande ouverte à distribuer', 'demandes ouvertes à distribuer')}
              <ChevronRight aria-hidden size={16} className="shrink-0 text-icon-default" />
            </Link>
          )}
        </>
      )}
    </AdminCard>
  );
}
