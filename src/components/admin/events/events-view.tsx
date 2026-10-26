'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Eye, Pencil, Plus, Power, Trash2, Users } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog, PublishStatusBadge } from '@/components/admin/editor/editor-ui';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { ActionMenu, type ActionMenuItem } from '@/components/admin/ui/action-menu';
import { AdminCard, ContactAvatar, RequestStatusBadge } from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminEvent } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo, formatDayMonth, formatWeekdayDate } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';
import { EventDialog } from './event-dialog';
import { EVENT_PERIODS, fillRate, seatsLabel, timeRange, type EventPeriod } from './event-model';

export const eventsKey = ['events', 'admin'] as const;

/** Agenda du site, ouvert par l'action « Voir sur le site ». */
const PUBLIC_AGENDA = '/services/culture-evenementiel#agenda';

/** Période dans l'adresse (`?periode=passes|tous`), sans requête au serveur. */
function usePeriod() {
  const params = useSearchParams();
  const values: Record<string, EventPeriod> = { passes: 'past', tous: 'all' };
  const period = values[params.get('periode') ?? ''] ?? 'upcoming';
  function setPeriod(next: EventPeriod) {
    const slug = Object.entries(values).find(([, value]) => value === next)?.[0];
    window.history.replaceState(null, '', `${window.location.pathname}${slug ? `?periode=${slug}` : ''}`);
  }
  return [period, setPeriod] as const;
}

function useRefreshEvents() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: eventsKey });
}

/** Bouton « Nouvel événement » de la barre supérieure ; absent sans `content:write`. */
export function NewEventButton() {
  const canWrite = useCan()('content:write');
  const [open, setOpen] = useState(false);
  const refresh = useRefreshEvents();
  if (!canWrite) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={topbarActionClass}>
        <Plus aria-hidden />
        Nouvel événement
      </button>
      <EventDialog open={open} onClose={() => setOpen(false)} event={null} onSaved={refresh} />
    </>
  );
}

/**
 * Agenda (non maquetté) : événements à venir, passés ou tous ; places réservées, publication dans l'agenda de la
 * rubrique Culture & événementiel, inscriptions (demandes « Événement »).
 */
export function EventsView() {
  const [period, setPeriod] = usePeriod();
  const listOf = (value: EventPeriod) => ({
    queryKey: [...eventsKey, value],
    queryFn: () => data(browserApi.GET('/v1/admin/events', { params: { query: { period: value } } })),
  });
  const events = useQuery(listOf(period));
  // Compteurs des onglets : listes « à venir » et « passés » (mises en cache, partagées avec l'onglet affiché).
  const upcoming = useQuery(listOf('upcoming'));
  const past = useQuery(listOf('past'));
  const counts: Record<EventPeriod, number | undefined> = {
    upcoming: upcoming.data?.length,
    past: past.data?.length,
    all: upcoming.data && past.data ? upcoming.data.length + past.data.length : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <ReadOnlyNotice permission="content:write" />
      <StatusTabs
        label="Période"
        tabs={EVENT_PERIODS.map((item) => ({
          value: item.value,
          label: item.label,
          count: counts[item.value],
        }))}
        value={period}
        onChange={setPeriod}
      />
      <EventsTable events={events.data} error={events.isError && !events.data} period={period} />
    </div>
  );
}

/**
 * Colonnes : Date 92, Événement, Places 180, Inscriptions 110, Statut 110, actions 110 ; Inscriptions masquée sous
 * 1 400 px, Places sous 1 024 px, cartes en mobile.
 */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[92px_minmax(0,1fr)_110px_110px] lg:max-[1399px]:grid-cols-[92px_minmax(0,1fr)_180px_110px_110px] min-[1400px]:grid-cols-[92px_minmax(0,1fr)_180px_110px_110px_110px]';
const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';
const iconButton =
  'flex size-8 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main';

/** Pastille de date : « 14 NOV. » et l'heure. */
function DateBadge({ event }: { event: AdminEvent }) {
  const [day, month] = formatDayMonth(event.startsAt).split(' ');
  return (
    <span className="flex w-[64px] shrink-0 flex-col items-center rounded-md border border-border-default bg-neutral-0 py-1.5">
      <span className="font-ui text-[18px] leading-6 font-semibold text-text-main">{day}</span>
      <span className="font-ui text-[11px] leading-4 font-semibold tracking-[0.04em] text-text-brand uppercase">
        {month}
      </span>
    </span>
  );
}

function SeatsGauge({ event }: { event: AdminEvent }) {
  const rate = fillRate(event);
  return (
    <span className="flex flex-col gap-1.5">
      <span className={bodyCell}>{seatsLabel(event)}</span>
      {rate !== null && (
        <span aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <span
            className={cn('block h-full rounded-full', rate >= 0.9 ? 'bg-brand-primary' : 'bg-vert-500')}
            style={{ width: `${Math.max(rate * 100, 2)}%` }}
          />
        </span>
      )}
    </span>
  );
}

function EventsTable({
  events,
  error,
  period,
}: {
  events: AdminEvent[] | undefined;
  error: boolean;
  period: EventPeriod;
}) {
  const refresh = useRefreshEvents();
  // Sans `content:write` : fiches consultées, inscriptions visibles, ni publication ni suppression.
  const canWrite = useCan()('content:write');
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState<AdminEvent | null>(null);
  const [viewing, setViewing] = useState<AdminEvent | null>(null);

  const publish = useMutation({
    mutationFn: (event: AdminEvent) =>
      data(
        browserApi.PATCH('/v1/admin/events/{id}', {
          params: { path: { id: event.id } },
          body: { status: event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } as never,
        }),
      ),
    onSuccess: (event) => {
      toast.success(
        event.status === 'PUBLISHED'
          ? 'Événement publié dans l’agenda du site.'
          : 'Événement dépublié : il n’apparaît plus dans l’agenda du site.',
      );
      void refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.DELETE('/v1/admin/events/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Événement supprimé.');
      void refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  return (
    <AdminCard className="overflow-hidden">
      <div role="table" aria-label="Événements de l’agenda">
        <div role="rowgroup" className="hidden md:block">
          <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
            <span role="columnheader" className={headerCell}>
              Date
            </span>
            <span role="columnheader" className={headerCell}>
              Événement
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Places
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Inscriptions
            </span>
            <span role="columnheader" className={headerCell}>
              Statut
            </span>
            <span role="columnheader" className="sr-only">
              Actions
            </span>
          </div>
        </div>
        <div role="rowgroup">
          {error ? (
            <div className="p-6">
              <EmptyState
                icon={<CalendarDays size={24} />}
                title="Agenda indisponible"
                text="Le chargement a échoué."
              />
            </div>
          ) : !events ? (
            Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
                <Skeleton className="h-14 w-full rounded-sm" />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CalendarDays size={24} />}
                title={period === 'past' ? 'Aucun événement passé' : 'Aucun événement à venir'}
                text={
                  canWrite
                    ? 'Ajoutez un événement avec « Nouvel événement ».'
                    : 'Les événements de l’agenda apparaîtront ici.'
                }
              />
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                role="row"
                className={cn(
                  COLUMNS,
                  'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-2.5',
                )}
              >
                <span role="cell">
                  <DateBadge event={event} />
                </span>
                <div role="cell" className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditing(event)}
                    className="text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                  >
                    {event.title}
                  </button>
                  <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted first-letter:uppercase">
                    {formatWeekdayDate(event.startsAt)} · {timeRange(event)} ·{' '}
                    {[event.place, event.city].filter(Boolean).join(', ')} · {event.tag}
                  </span>
                  <span className="font-ui text-[12px] leading-4 text-text-muted lg:hidden">
                    {seatsLabel(event)}
                  </span>
                </div>
                <span role="cell" className="hidden lg:block">
                  <SeatsGauge event={event} />
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  <button
                    type="button"
                    onClick={() => setViewing(event)}
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    <Users aria-hidden size={14} className="text-icon-default" />
                    {formatNumber(event.registrationsCount)}
                  </button>
                </span>
                <span role="cell" className="max-md:hidden">
                  <PublishStatusBadge status={event.status} />
                </span>
                <div
                  role="cell"
                  className="flex items-center justify-end gap-2.5 max-md:ml-auto max-md:w-full"
                >
                  <span className="mr-auto md:hidden">
                    <PublishStatusBadge status={event.status} />
                  </span>
                  <a
                    href={PUBLIC_AGENDA}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Voir l’agenda du site (nouvel onglet)`}
                    title="Voir sur le site"
                    className={iconButton}
                  >
                    <Eye aria-hidden size={16} />
                  </a>
                  <button
                    type="button"
                    aria-label={`${canWrite ? 'Modifier' : 'Consulter'} ${event.title}`}
                    title={canWrite ? 'Modifier' : 'Consulter'}
                    className={iconButton}
                    onClick={() => setEditing(event)}
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  <ActionMenu
                    label={`Actions pour ${event.title}`}
                    items={[
                      {
                        label: `Inscriptions (${formatNumber(event.registrationsCount)})`,
                        icon: Users,
                        onSelect: () => setViewing(event),
                      },
                      ...(canWrite
                        ? ([
                            {
                              label: event.status === 'PUBLISHED' ? 'Dépublier' : 'Publier',
                              icon: Power,
                              onSelect: () => publish.mutate(event),
                            },
                            {
                              label: 'Supprimer',
                              icon: Trash2,
                              danger: true,
                              onSelect: () => setDeleting(event),
                            },
                          ] satisfies ActionMenuItem[])
                        : []),
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <EventDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        event={editing}
        onSaved={refresh}
        readOnly={!canWrite}
      />
      <RegistrationsDialog event={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title={`Supprimer « ${deleting?.title ?? ''} » ?`}
        description="L’événement disparaît de l’agenda du site. Les inscriptions déjà reçues restent dans les Demandes."
        confirmLabel="Supprimer l’événement"
        destructive
        pending={remove.isPending}
      />
    </AdminCard>
  );
}

/** Inscriptions d'un événement (demandes « Événement »), ouvertes dans les Demandes. */
function RegistrationsDialog({ event, onClose }: { event: AdminEvent | null; onClose: () => void }) {
  const detail = useQuery({
    queryKey: [...eventsKey, 'detail', event?.id],
    queryFn: () => data(browserApi.GET('/v1/admin/events/{id}', { params: { path: { id: event!.id } } })),
    enabled: event !== null,
  });
  const registrations = detail.data?.registrations;
  return (
    <Modal
      open={event !== null}
      onClose={onClose}
      title={event ? `Inscriptions · ${event.title}` : 'Inscriptions'}
      description={event ? seatsLabel(event) : undefined}
      maxWidth={600}
    >
      {detail.isError ? (
        <p role="alert" className="font-ui text-[14px] leading-5 text-feedback-error">
          {errorMessage(detail.error)}
        </p>
      ) : !registrations ? (
        <Skeleton className="h-40 w-full rounded-md" />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="Aucune inscription"
          text="Les inscriptions du site s’afficheront ici."
        />
      ) : (
        <ul className="flex flex-col">
          {registrations.map((registration) => (
            <li
              key={registration.id}
              className="flex items-center gap-3 border-b border-border-default py-3 first:pt-0 last:border-b-0 last:pb-0"
            >
              <ContactAvatar name={registration.contact.fullName} initials={registration.contact.initials} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/admin/demandes?id=${registration.id}` as Route}
                  className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main hover:underline"
                >
                  {registration.contact.fullName}
                </Link>
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  {registration.reference} · {formatAgo(registration.createdAt)}
                </span>
              </div>
              <RequestStatusBadge status={registration.status} />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
