'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AdminCard,
  ContactAvatar,
  RequestStatusBadge,
  locationLabel,
  shortName,
} from '@/components/admin/ui/admin-ui';
import {
  EmptyState,
  FilterSelect,
  ListPagination,
  SearchField,
  StatusTabs,
} from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { RequestListItem, RequestStatus, RequestType } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatStamp } from '@/lib/format/date';
import { RequestPanel } from './request-panel';

const PAGE_SIZE = 8;

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  DEVIS: 'Devis',
  CONTACT: 'Contact',
  INFORMATION: 'Information',
  INSCRIPTION: 'Inscription',
  FORMATION: 'Formation',
  CANDIDATURE: 'Candidature',
  PARTENARIAT: 'Partenariat',
  EVENEMENT: 'Événement',
  RENDEZ_VOUS: 'Rendez-vous',
};

/** Libellés courts des rubriques dans la liste (maquette : « Culture », « Proximité »). */
const SHORT_CATEGORY: Record<string, string> = {
  'culture-evenementiel': 'Culture',
  'services-de-proximite': 'Proximité',
};

const CATEGORIES = [
  { value: 'experience', label: 'Expérience' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'services-de-proximite', label: 'Services de proximité' },
  { value: 'culture-evenementiel', label: 'Culture & événementiel' },
];

const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'BE', label: 'Belgique' },
];

const PERIODS = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '365', label: '12 derniers mois' },
  { value: 'all', label: 'Toutes les dates' },
];

type Status = RequestStatus | 'ALL';

const TABS: { value: Status; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'NOUVELLE', label: 'Nouvelles' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'PRESTATION_REALISEE', label: 'Prestation réalisée' },
  { value: 'CLOTUREE', label: 'Clôturées' },
];

/** Filtres lus dans l'adresse (`?status=&type=&category=&country=&period=&q=&page=&id=`). */
function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = {
    status: (params.get('status') ?? 'ALL') as Status,
    type: params.get('type') ?? '',
    category: params.get('category') ?? '',
    country: params.get('country') ?? '',
    period: params.get('period') ?? '30',
    q: params.get('q') ?? '',
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    id: params.get('id'),
  };

  function update(changes: Partial<Record<keyof typeof filters, string | number | null>>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      const empty =
        value === null ||
        value === '' ||
        (key === 'status' && value === 'ALL') ||
        (key === 'period' && value === '30') ||
        (key === 'page' && value === 1);
      if (empty) next.delete(key);
      else next.set(key, String(value));
    }
    // Un changement de filtre ramène à la première page.
    if (!('page' in changes) && !('id' in changes)) next.delete('page');
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}` as Route, { scroll: false });
  }

  return { filters, update };
}

/** Bornes de la période choisie (`from`). */
function fromDate(period: string): string | undefined {
  if (period === 'all') return undefined;
  const days = Number(period) || 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function RequestRow({
  request,
  selected,
  onOpen,
}: {
  request: RequestListItem;
  selected: boolean;
  onOpen: () => void;
}) {
  const category = request.category ? (SHORT_CATEGORY[request.category.slug] ?? request.category.name) : null;
  return (
    <tr
      onClick={onOpen}
      className={cn(
        'cursor-pointer border-b border-border-default last:border-b-0',
        selected ? 'bg-orange-50' : 'bg-neutral-0 hover:bg-neutral-50',
      )}
    >
      <td className="max-w-0 py-3.5 pl-5">
        <div className="flex items-center gap-3">
          <ContactAvatar name={request.contact.fullName} initials={request.contact.initials} />
          <div className="flex min-w-0 flex-col">
            {/* Lien = action au clavier ; la ligne entière reste cliquable à la souris. */}
            <a
              href={`?id=${request.id}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onOpen();
              }}
              aria-current={selected ? 'true' : undefined}
              className="truncate rounded-xs font-semibold"
            >
              {shortName(request.contact.fullName)}
              <span className="sr-only"> — demande {request.reference}</span>
            </a>
            <span className="truncate text-[12px] leading-4 text-text-muted">
              {locationLabel(request.contact.city, request.contact.country)}
            </span>
          </div>
        </div>
      </td>
      <td className="max-w-0 py-3.5 pl-4">
        <div className="flex flex-col">
          <span className="truncate font-semibold">
            {request.subject ?? REQUEST_TYPE_LABELS[request.type]}
          </span>
          <span className="truncate text-[12px] leading-4 text-text-muted">
            {request.type === 'DEVIS' ? (category ?? '') : REQUEST_TYPE_LABELS[request.type]}
          </span>
        </div>
      </td>
      <td className="py-3.5 pl-4 whitespace-nowrap">{formatStamp(request.createdAt)}</td>
      <td className="py-3.5 pr-5 pl-4">
        <RequestStatusBadge status={request.status} />
      </td>
    </tr>
  );
}

/**
 * Demandes (`87:10782`) : onglets de statut avec compteurs, filtres (type, rubrique, pays, période), recherche,
 * tableau paginé (8 par page), panneau de détail à droite (en surimpression sous 1280 px). L'adresse reflète les
 * filtres et la demande ouverte.
 */
export function RequestsView() {
  const { filters, update } = useFilters();
  const [search, setSearch] = useState(filters.q);

  // Recherche appliquée après une courte pause de saisie.
  useEffect(() => {
    if (search === filters.q) return;
    const timer = window.setTimeout(() => update({ q: search }), 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const query = {
    status: filters.status === 'ALL' ? undefined : filters.status,
    type: (filters.type || undefined) as RequestType | undefined,
    category: filters.category || undefined,
    country: filters.country || undefined,
    from: fromDate(filters.period),
    q: filters.q || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
    sort: '-createdAt',
  };
  const list = useQuery({
    queryKey: ['requests', { ...query, from: filters.period }],
    queryFn: () => data(browserApi.GET('/v1/admin/requests', { params: { query } })),
    placeholderData: keepPreviousData,
  });
  const counts = list.data?.counts;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusTabs
          label="Statut des demandes"
          tabs={TABS.map((tab) => ({ ...tab, count: counts?.[tab.value] }))}
          value={filters.status}
          onChange={(status) => update({ status })}
          className="xl:mr-auto"
        />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <FilterSelect
            label="Type de demande"
            value={filters.type}
            onChange={(event) => update({ type: event.target.value })}
          >
            <option value="">Tous les types</option>
            {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Rubrique"
            value={filters.category}
            onChange={(event) => update({ category: event.target.value })}
          >
            <option value="">Toutes les rubriques</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Pays"
            value={filters.country}
            onChange={(event) => update({ country: event.target.value })}
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Période"
            value={filters.period}
            onChange={(event) => update({ period: event.target.value })}
          >
            {PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </FilterSelect>
          <SearchField
            value={search}
            onChange={setSearch}
            label="Rechercher une demande"
            placeholder="Nom, e-mail, référence…"
            className="col-span-2 sm:w-[220px]"
          />
        </div>
      </div>

      <div className={cn('grid items-start gap-5', filters.id && 'xl:grid-cols-[minmax(0,1fr)_420px]')}>
        <AdminCard className="overflow-hidden" aria-busy={list.isFetching}>
          {list.isError && !list.data ? (
            <div role="alert" className="flex flex-col items-start gap-3 p-6">
              <p className="font-ui text-[15px] leading-6">Impossible de charger les demandes.</p>
              <button
                type="button"
                onClick={() => void list.refetch()}
                className="rounded-[10px] border border-border-strong px-3.5 py-2.5 font-ui text-[14px] font-semibold"
              >
                Réessayer
              </button>
            </div>
          ) : !list.data ? (
            <div aria-hidden className="flex flex-col gap-2 p-5">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-12 rounded-md" />
              ))}
            </div>
          ) : list.data.data.length === 0 ? (
            <EmptyState
              icon={<Inbox size={24} />}
              title="Aucune demande"
              text="Aucune demande ne correspond à ces filtres. Essayez une autre période ou un autre statut."
            />
          ) : (
            <>
              {/* Mobile : cartes. */}
              <ul className="divide-y divide-border-default md:hidden">
                {list.data.data.map((request) => (
                  <li key={request.id}>
                    <button
                      type="button"
                      onClick={() => update({ id: request.id })}
                      className={cn(
                        'flex w-full items-center gap-3 p-4 text-left',
                        filters.id === request.id && 'bg-orange-50',
                      )}
                    >
                      <ContactAvatar
                        name={request.contact.fullName}
                        initials={request.contact.initials}
                        size={38}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-ui text-[14px] leading-5 font-semibold">
                          {shortName(request.contact.fullName)}
                        </span>
                        <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                          {request.subject ?? REQUEST_TYPE_LABELS[request.type]} ·{' '}
                          {formatStamp(request.createdAt)}
                        </span>
                      </span>
                      <RequestStatusBadge status={request.status} />
                    </button>
                  </li>
                ))}
              </ul>
              {/* Desktop : tableau (`87:10970`). */}
              <table className="hidden w-full table-fixed border-collapse font-ui text-[14px] leading-5 text-text-main md:table">
                <caption className="sr-only">Demandes, de la plus récente à la plus ancienne</caption>
                <thead>
                  <tr className="border-b border-border-default bg-neutral-50 text-left text-[12px] leading-4 text-text-muted">
                    <th scope="col" className="py-3 pl-5 font-semibold">
                      Client
                    </th>
                    <th scope="col" className="w-[37%] py-3 pl-4 font-semibold lg:w-[200px]">
                      Service
                    </th>
                    <th scope="col" className="w-[126px] py-3 pl-4 font-semibold">
                      Reçue le
                    </th>
                    <th scope="col" className="w-[170px] py-3 pr-5 pl-4 font-semibold">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.data.map((request) => (
                    <RequestRow
                      key={request.id}
                      request={request}
                      selected={filters.id === request.id}
                      onOpen={() => update({ id: request.id })}
                    />
                  ))}
                </tbody>
              </table>
              <ListPagination
                page={list.data.meta.page}
                pageSize={list.data.meta.pageSize}
                total={list.data.meta.total}
                totalPages={list.data.meta.totalPages}
                noun={list.data.meta.total > 1 ? 'demandes' : 'demande'}
                onPage={(page) => update({ page })}
              />
            </>
          )}
        </AdminCard>

        {filters.id && <RequestPanel id={filters.id} onClose={() => update({ id: null })} />}
      </div>
    </div>
  );
}

/** Paramètres d'export (mêmes filtres que la liste). */
export function useExportQuery() {
  const params = useSearchParams();
  const status = params.get('status');
  const type = params.get('type');
  const period = params.get('period') ?? '30';
  return {
    status: (status || undefined) as RequestStatus | undefined,
    type: (type || undefined) as RequestType | undefined,
    from: fromDate(period),
  };
}
