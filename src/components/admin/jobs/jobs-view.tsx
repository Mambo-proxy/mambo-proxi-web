'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, FilterSelect, ListPagination, StatusTabs } from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { AdminApplication, ApplicationStatus, PaginationMeta } from '@/lib/api/schema';
import { ApplicationDialog, applicationsKey } from './application-dialog';
import { ApplicationsTable } from './applications-table';
import { APPLICATION_STATUS_LABELS, SPONTANEOUS, type JobOffer } from './labels';
import { offerEditorHref, OffersTable } from './offers-table';
import { jobsKey } from './use-offer-actions';

/** Lien « Nouvelle offre » de la barre supérieure (`93:21778`). */
export const newOfferHref = offerEditorHref('nouvelle');

const PAGE_SIZE = 10;
/** « Dernières candidatures » de l'onglet Offres (maquette : 4 lignes). */
const LATEST = 4;

type Tab = 'offres' | 'candidatures';
type Filters = {
  tab: Tab;
  status: ApplicationStatus | null;
  job: string | null;
  page: number;
  /** Candidature ouverte. */
  id: string | null;
};

/** Filtres lus dans l'adresse (`?onglet=candidatures&offre=…&statut=…&page=…&candidature=…`). */
function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = params.get('statut');
  const filters: Filters = {
    tab: params.get('onglet') === 'candidatures' ? 'candidatures' : 'offres',
    status: status && status in APPLICATION_STATUS_LABELS ? (status as ApplicationStatus) : null,
    job: params.get('offre'),
    page: Math.max(1, Number(params.get('page')) || 1),
    id: params.get('candidature'),
  };
  function update(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    const query = new URLSearchParams();
    if (merged.tab === 'candidatures') {
      query.set('onglet', 'candidatures');
      if (merged.job) query.set('offre', merged.job);
      if (merged.status) query.set('statut', merged.status);
      if (merged.page > 1) query.set('page', String(merged.page));
    }
    if (merged.id) query.set('candidature', merged.id);
    const search = query.toString();
    router.replace(`${pathname}${search ? `?${search}` : ''}` as Route, { scroll: false });
  }
  return [filters, update] as const;
}

/** Recrutement (`93:21723`) : onglets « Offres » / « Candidatures », offres, dernières candidatures, détail. */
export function JobsView() {
  const [filters, update] = useFilters();
  const offers = useQuery({
    queryKey: jobsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/jobs')) as Promise<JobOffer[]>,
  });
  const applications = useQuery({
    queryKey: [...applicationsKey, filters.tab, filters.job, filters.status, filters.page],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/applications', {
          params: {
            query:
              filters.tab === 'offres'
                ? { pageSize: LATEST }
                : {
                    job: filters.job ?? undefined,
                    status: filters.status ?? undefined,
                    page: filters.page,
                    pageSize: PAGE_SIZE,
                  },
          },
        }),
      ),
  });
  // Compteur de l'onglet : toutes les candidatures, quels que soient les filtres.
  const total = useQuery({
    queryKey: [...applicationsKey, 'total'],
    queryFn: () => data(browserApi.GET('/v1/admin/applications', { params: { query: { pageSize: 1 } } })),
  });

  return (
    <div className="flex flex-col gap-6">
      <StatusTabs
        label="Recrutement"
        tabs={[
          { value: 'offres', label: 'Offres', count: offers.data?.length },
          { value: 'candidatures', label: 'Candidatures', count: total.data?.meta.total },
        ]}
        value={filters.tab}
        onChange={(tab) => update({ tab, page: 1, job: null, status: null })}
      />

      {filters.tab === 'offres' ? (
        <>
          <AdminCard aria-label="Offres d’emploi" className="overflow-hidden">
            {offers.data ? (
              offers.data.length ? (
                <OffersTable
                  offers={offers.data}
                  onApplications={(job) => update({ tab: 'candidatures', job, status: null, page: 1 })}
                />
              ) : (
                <EmptyState
                  icon={<Briefcase size={24} />}
                  title="Aucune offre pour le moment"
                  text="Créez une offre : elle s’affichera sur la page Recrutement du site une fois publiée."
                />
              )
            ) : offers.isError ? (
              <p role="alert" className="p-6 font-ui text-[14px] leading-5">
                Impossible de charger les offres.
              </p>
            ) : (
              <ListSkeleton />
            )}
          </AdminCard>

          <section aria-labelledby="latest-applications" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="latest-applications"
                className="font-ui text-[16px] leading-6 font-semibold tracking-[-0.005em] text-text-main"
              >
                Dernières candidatures
              </h2>
              <button
                type="button"
                onClick={() => update({ tab: 'candidatures', job: null, status: null, page: 1 })}
                className="inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
              >
                Toutes les candidatures
                <ArrowRight aria-hidden size={16} />
              </button>
            </div>
            <AdminCard className="overflow-hidden">
              <ApplicationsBody
                query={applications}
                caption="Dernières candidatures"
                onOpen={(id) => update({ id })}
              />
            </AdminCard>
          </section>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FilterSelect
              label="Offre"
              value={filters.job ?? ''}
              onChange={(event) => update({ job: event.target.value || null, page: 1 })}
              className="sm:w-72"
            >
              <option value="">Toutes les offres</option>
              {offers.data?.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title}
                </option>
              ))}
              <option value={SPONTANEOUS}>Candidatures spontanées</option>
            </FilterSelect>
            <FilterSelect
              label="Statut"
              value={filters.status ?? ''}
              onChange={(event) =>
                update({ status: (event.target.value || null) as ApplicationStatus | null, page: 1 })
              }
              className="sm:w-48"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]).map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]}
                </option>
              ))}
            </FilterSelect>
          </div>
          <AdminCard aria-label="Candidatures" className="overflow-hidden">
            <ApplicationsBody query={applications} caption="Candidatures" onOpen={(id) => update({ id })} />
            {applications.data && applications.data.meta.total > 0 && (
              <ListPagination
                page={applications.data.meta.page}
                pageSize={applications.data.meta.pageSize}
                total={applications.data.meta.total}
                totalPages={applications.data.meta.totalPages}
                noun="candidatures"
                onPage={(page) => update({ page })}
              />
            )}
          </AdminCard>
        </>
      )}

      <ApplicationDialog id={filters.id} onClose={() => update({ id: null })} />
    </div>
  );
}

function ApplicationsBody({
  query,
  caption,
  onOpen,
}: {
  query: UseQueryResult<{ data: AdminApplication[]; meta: PaginationMeta }>;
  caption: string;
  onOpen: (id: string) => void;
}) {
  if (query.data)
    return query.data.data.length ? (
      <ApplicationsTable applications={query.data.data} caption={caption} onOpen={onOpen} />
    ) : (
      <EmptyState
        icon={<Users size={24} />}
        title="Aucune candidature"
        text="Les candidatures envoyées depuis le site apparaîtront ici."
      />
    );
  if (query.isError)
    return (
      <p role="alert" className="p-6 font-ui text-[14px] leading-5">
        Impossible de charger les candidatures.
      </p>
    );
  return <ListSkeleton />;
}

function ListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3 p-5">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}
