'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Eye,
  GraduationCap,
  Pencil,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog, PublishStatusBadge } from '@/components/admin/editor/editor-ui';
import { moveItem } from '@/components/admin/editor/sortable';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import { AdminCard, locationLabel, RequestStatusBadge } from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminTraining, AdminTrainingRequest } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';
import { TrainingDialog } from './training-dialog';
import { formatLabel, requestedTraining, TRAINING_CATEGORY_LABELS, trainingSection } from './training-labels';

export const trainingsKey = ['trainings', 'admin'] as const;
const trainingRequestsKey = ['training-requests'] as const;

/** Catalogue public, ouvert par l'action « Voir sur le site ». */
const PUBLIC_TRAININGS_PAGE = '/formation#catalogue';

type Tab = 'catalogue' | 'demandes';

function useTab() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get('onglet') === 'demandes' ? 'demandes' : 'catalogue';
  function setTab(next: Tab) {
    router.replace(`${pathname}${next === 'demandes' ? '?onglet=demandes' : ''}` as Route, { scroll: false });
  }
  return [tab, setTab] as const;
}

function useRefreshTrainings() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: trainingsKey });
}

/** Bouton « Nouvelle formation » de la barre supérieure (`93:22594`) ; absent sans `content:write`. */
export function NewTrainingButton() {
  const canWrite = useCan()('content:write');
  const [open, setOpen] = useState(false);
  const refresh = useRefreshTrainings();
  if (!canWrite) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={topbarActionClass}>
        <Plus aria-hidden />
        Nouvelle formation
      </button>
      <TrainingDialog open={open} onClose={() => setOpen(false)} training={null} onSaved={refresh} />
    </>
  );
}

/**
 * Formations (`93:22873`) : onglets « Catalogue » / « Demandes de formation » (`?onglet=demandes`), tableau du
 * catalogue (ordre, publication), demandes de formation récentes.
 */
export function TrainingsView() {
  const [tab, setTab] = useTab();
  const trainings = useQuery({
    queryKey: trainingsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/trainings')),
  });
  const requests = useQuery({
    queryKey: trainingRequestsKey,
    queryFn: () =>
      data(browserApi.GET('/v1/admin/training-requests', { params: { query: { pageSize: 50 } } })),
  });

  return (
    <div className="flex flex-col gap-6">
      <ReadOnlyNotice permission="content:write" />
      <StatusTabs
        label="Catalogue et demandes"
        tabs={[
          { value: 'catalogue', label: 'Catalogue', count: trainings.data?.length },
          { value: 'demandes', label: 'Demandes de formation', count: requests.data?.meta.total },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'catalogue' ? (
        <>
          <TrainingsTable trainings={trainings.data} error={trainings.isError && !trainings.data} />
          <section aria-labelledby="training-requests-recent" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="training-requests-recent"
                className="font-ui text-[16px] leading-6 font-semibold text-text-main"
              >
                Demandes de formation récentes
              </h2>
              <button
                type="button"
                onClick={() => setTab('demandes')}
                className="inline-flex items-center gap-1.5 font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
              >
                Tout voir
                <ArrowRight aria-hidden size={16} />
              </button>
            </div>
            <TrainingRequestsTable
              label="Demandes de formation récentes"
              requests={requests.data?.data.slice(0, 3)}
              error={requests.isError && !requests.data}
            />
          </section>
        </>
      ) : (
        <TrainingRequestsTable
          label="Demandes de formation"
          requests={requests.data?.data}
          error={requests.isError && !requests.data}
        />
      )}
    </div>
  );
}

/**
 * Colonnes (`93:22609`) : Formation, Catégorie 150, Durée 90, Format 160, Demandes 90, Statut 110, actions 110 ;
 * Catégorie et Demandes masquées sous 1 400 px, Durée et Format sous 1 024 px, cartes en mobile.
 */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_110px_110px] lg:max-[1399px]:grid-cols-[minmax(0,1fr)_90px_160px_110px_110px] min-[1400px]:grid-cols-[minmax(0,1fr)_150px_90px_160px_90px_110px_110px]';
const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';
const iconButton =
  'flex size-8 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main';

function TrainingsTable({ trainings, error }: { trainings: AdminTraining[] | undefined; error: boolean }) {
  const client = useQueryClient();
  const refresh = useRefreshTrainings();
  // Sans `content:write` : fiches consultées, ni ordre, ni publication, ni suppression.
  const canWrite = useCan()('content:write');
  const [editing, setEditing] = useState<AdminTraining | null>(null);
  const [deleting, setDeleting] = useState<AdminTraining | null>(null);

  const reorder = useMutation({
    mutationFn: (list: AdminTraining[]) =>
      data(browserApi.PATCH('/v1/admin/trainings/reorder', { body: { ids: list.map((item) => item.id) } })),
    onMutate: (list) => client.setQueryData(trainingsKey, list),
    onSettled: refresh,
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const publish = useMutation({
    mutationFn: (training: AdminTraining) =>
      data(
        browserApi.PATCH('/v1/admin/trainings/{id}', {
          params: { path: { id: training.id } },
          body: { status: training.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } as never,
        }),
      ),
    onSuccess: (training) => {
      toast.success(
        training.status === 'PUBLISHED'
          ? 'Formation publiée sur le site.'
          : 'Formation dépubliée : elle n’apparaît plus sur le site.',
      );
      refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.DELETE('/v1/admin/trainings/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Formation supprimée.');
      refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  return (
    <AdminCard className="overflow-hidden">
      <div role="table" aria-label="Catalogue des formations">
        <div role="rowgroup" className="hidden md:block">
          <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
            <span role="columnheader" className={headerCell}>
              Formation
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Catégorie
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Durée
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Format
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Demandes
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
                icon={<GraduationCap size={24} />}
                title="Formations indisponibles"
                text="Le chargement a échoué."
              />
            </div>
          ) : !trainings ? (
            Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            ))
          ) : trainings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<GraduationCap size={24} />}
                title="Aucune formation"
                text={
                  canWrite
                    ? 'Ajoutez une formation avec « Nouvelle formation ».'
                    : 'Les formations du catalogue apparaîtront ici.'
                }
              />
            </div>
          ) : (
            trainings.map((training, index) => (
              <div
                key={training.id}
                role="row"
                className={cn(
                  COLUMNS,
                  'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-2.5',
                )}
              >
                <div role="cell" className="flex min-w-0 flex-col gap-0.5 max-md:w-full">
                  <button
                    type="button"
                    onClick={() => setEditing(training)}
                    className="text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                  >
                    {training.title}
                  </button>
                  <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                    {trainingSection(training.category)}
                    <span className="lg:hidden">
                      {' '}
                      · {training.duration} · {formatLabel(training)}
                    </span>
                  </span>
                </div>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  {TRAINING_CATEGORY_LABELS[training.category]}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {training.duration}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {formatLabel(training)}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  {formatNumber(training.requestsCount)}
                </span>
                <span role="cell" className="max-md:hidden">
                  <PublishStatusBadge status={training.status} />
                </span>
                <div role="cell" className="flex items-center justify-end gap-2.5 max-md:ml-auto">
                  <span className="mr-auto md:hidden">
                    <PublishStatusBadge status={training.status} />
                  </span>
                  <a
                    href={PUBLIC_TRAININGS_PAGE}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Voir ${training.title} sur le site (nouvel onglet)`}
                    title="Voir sur le site"
                    className={iconButton}
                  >
                    <Eye aria-hidden size={16} />
                  </a>
                  <button
                    type="button"
                    aria-label={`${canWrite ? 'Modifier' : 'Consulter'} ${training.title}`}
                    title={canWrite ? 'Modifier' : 'Consulter'}
                    className={iconButton}
                    onClick={() => setEditing(training)}
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  {canWrite && (
                    <ActionMenu
                      label={`Actions pour ${training.title}`}
                      items={[
                        {
                          label: 'Monter',
                          icon: ArrowUp,
                          disabled: index === 0,
                          onSelect: () => reorder.mutate(moveItem(trainings, index, -1)),
                        },
                        {
                          label: 'Descendre',
                          icon: ArrowDown,
                          disabled: index === trainings.length - 1,
                          onSelect: () => reorder.mutate(moveItem(trainings, index, 1)),
                        },
                        {
                          label: training.status === 'PUBLISHED' ? 'Dépublier' : 'Publier',
                          icon: Power,
                          onSelect: () => publish.mutate(training),
                        },
                        {
                          label: 'Supprimer',
                          icon: Trash2,
                          danger: true,
                          onSelect: () => setDeleting(training),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <TrainingDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        training={editing}
        onSaved={refresh}
        readOnly={!canWrite}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title={`Supprimer « ${deleting?.title ?? ''} » ?`}
        description="La formation disparaît du catalogue du site. Les demandes déjà reçues restent dans les Demandes."
        confirmLabel="Supprimer la formation"
        destructive
        pending={remove.isPending}
      />
    </AdminCard>
  );
}

/**
 * Colonnes des demandes (`93:22813`) : Structure, Formation souhaitée 280, Participants 110, Période 140, Statut 110 ;
 * Participants masqué sous 1 400 px, Formation et Période sous 1 024 px, cartes en mobile.
 */
const REQUEST_COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_110px] lg:max-[1399px]:grid-cols-[minmax(0,1fr)_220px_140px_110px] min-[1400px]:grid-cols-[minmax(0,1fr)_280px_110px_140px_110px]';

function TrainingRequestsTable({
  label,
  requests,
  error,
}: {
  label: string;
  requests: AdminTrainingRequest[] | undefined;
  error: boolean;
}) {
  return (
    <AdminCard className="overflow-hidden">
      <div role="table" aria-label={label}>
        <div role="rowgroup" className="hidden md:block">
          <div
            role="row"
            className={cn(REQUEST_COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}
          >
            <span role="columnheader" className={headerCell}>
              Structure
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Formation souhaitée
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Participants
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Période
            </span>
            <span role="columnheader" className={headerCell}>
              Statut
            </span>
          </div>
        </div>
        <div role="rowgroup">
          {error ? (
            <div className="p-6">
              <EmptyState
                icon={<GraduationCap size={24} />}
                title="Demandes indisponibles"
                text="Le chargement a échoué."
              />
            </div>
          ) : !requests ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            ))
          ) : requests.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<GraduationCap size={24} />}
                title="Aucune demande de formation"
                text="Les demandes envoyées depuis la page Formation du site apparaîtront ici."
              />
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                role="row"
                className={cn(
                  REQUEST_COLUMNS,
                  'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:items-start max-md:justify-between max-md:gap-3',
                )}
              >
                <div role="cell" className="flex min-w-0 flex-col gap-0.5">
                  <Link
                    href={`${adminRoutes.requests}?type=FORMATION&id=${request.id}` as Route}
                    className="font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                  >
                    {request.organization ?? request.contact.fullName}
                  </Link>
                  <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                    {request.contact.fullName} ·{' '}
                    {locationLabel(request.contact.city, request.contact.country)}
                  </span>
                  <span className="font-ui text-[12px] leading-4 text-text-muted lg:hidden">
                    {requestedTraining(request)} · {request.participants} participant
                    {request.participants > 1 ? 's' : ''}
                    {request.period && ` · ${request.period}`}
                  </span>
                </div>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {requestedTraining(request)}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  {formatNumber(request.participants)}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {request.period ?? '—'}
                </span>
                <span role="cell" className="shrink-0">
                  <RequestStatusBadge status={request.status} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminCard>
  );
}
