'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Briefcase, Download, Eye, Globe, Trash2, User, Users, UserX } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import { AdminCard, ContactAvatar, locationLabel } from '@/components/admin/ui/admin-ui';
import { EmptyState, FilterSelect, ListPagination, StatusTabs } from '@/components/admin/ui/filters';
import { change, KpiCard } from '@/components/admin/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { downloadBlob } from '@/lib/admin/download';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import type { AdminContactListItem, ContactProfile, ContactStats } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatIsoDate } from '@/lib/format/date';
import { formatNumber, formatPercent } from '@/lib/format/number';
import { ContactPanel, EraseContactDialog, exportContactData, useEraseContact } from './contact-panel';
import { INTEREST_OPTIONS, interestsLabel, NewsletterBadge } from './contact-labels';

export const contactsKey = ['contacts'] as const;

const PAGE_SIZE = 6;

type Tab = 'ALL' | ContactProfile;

/** Filtres lus dans l'adresse (`?profil=&district=&interest=&page=&id=`). */
function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const profile = params.get('profil');
  const filters = {
    profile: (profile === 'PARTICULIER' || profile === 'PROFESSIONNEL' ? profile : 'ALL') as Tab,
    district: params.get('district') ?? '',
    interest: params.get('interest') ?? '',
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    id: params.get('id'),
  };

  function update(
    changes: Partial<Record<'profil' | 'district' | 'interest' | 'page' | 'id', string | number | null>>,
  ) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      const empty =
        value === null ||
        value === '' ||
        (key === 'profil' && value === 'ALL') ||
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

/** Paramètres de la liste et de l'export (mêmes filtres). */
function listQuery(filters: ReturnType<typeof useFilters>['filters']) {
  return {
    profile: filters.profile === 'ALL' ? undefined : filters.profile,
    district: filters.district || undefined,
    interest: filters.interest || undefined,
  };
}

/** Bouton « Exporter (CSV) » de la barre supérieure (`93:23019`) : contacts filtrés. */
export function ExportContactsButton() {
  const { filters } = useFilters();
  const [pending, setPending] = useState(false);

  async function exportCsv() {
    setPending(true);
    try {
      const {
        data: blob,
        error,
        response,
      } = await browserApi.GET('/v1/admin/contacts/export.csv', {
        params: { query: listQuery(filters) },
        parseAs: 'blob',
      });
      if (!response.ok || !blob) throw toApiError(error, response);
      // Nom de l'API (`contacts-AAAA-MM-JJ.csv`, date de Douala) : `Content-Disposition` n'est pas lisible en CORS.
      downloadBlob(blob, `contacts-${formatIsoDate(Date.now())}.csv`);
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void exportCsv()}
      disabled={pending}
      className={topbarSecondaryClass}
    >
      <Download aria-hidden size={16} />
      Exporter (CSV)
    </button>
  );
}

/**
 * Contacts & inscrits (`93:23268`) : indicateurs, onglets par profil, filtres par quartier et par rubrique, tableau
 * paginé (6 par page), fiche contact en panneau (`?id=`).
 */
export function ContactsView() {
  const { filters, update } = useFilters();
  const query = { ...listQuery(filters), page: filters.page, pageSize: PAGE_SIZE, sort: '-createdAt' };
  const list = useQuery({
    queryKey: [...contactsKey, query],
    queryFn: () => data(browserApi.GET('/v1/admin/contacts', { params: { query } })),
    placeholderData: keepPreviousData,
  });
  const zones = useQuery({
    queryKey: ['zones'],
    queryFn: () => data(browserApi.GET('/v1/zones')),
    staleTime: Infinity,
  });
  const stats = list.data?.stats;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <ContactKpis stats={stats} />
      <div className="flex flex-wrap items-center gap-2">
        <StatusTabs<Tab>
          label="Profil des contacts"
          tabs={[
            { value: 'ALL', label: 'Tous', count: stats?.total },
            { value: 'PARTICULIER', label: 'Particuliers', count: stats?.individuals },
            { value: 'PROFESSIONNEL', label: 'Professionnels', count: stats?.professionals },
          ]}
          value={filters.profile}
          onChange={(profil) => update({ profil })}
          className="xl:mr-auto"
        />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <FilterSelect
            label="Quartier"
            value={filters.district}
            onChange={(event) => update({ district: event.target.value })}
          >
            <option value="">Tous les quartiers</option>
            {zones.data?.zones.map((zone) => (
              <optgroup key={zone.key} label={zone.name}>
                {zone.quarters.map((quarter) => (
                  <option key={quarter.name} value={quarter.name}>
                    {quarter.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Rubrique d’intérêt"
            value={filters.interest}
            onChange={(event) => update({ interest: event.target.value })}
          >
            <option value="">Toutes les rubriques</option>
            {INTEREST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      <AdminCard className="overflow-hidden" aria-busy={list.isFetching}>
        {list.isError && !list.data ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <p className="font-ui text-[15px] leading-6">Impossible de charger les contacts.</p>
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
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <Skeleton key={index} className="h-12 rounded-md" />
            ))}
          </div>
        ) : list.data.data.length === 0 ? (
          <EmptyState
            icon={<UserX size={24} />}
            title="Aucun contact"
            text="Aucun contact ne correspond à ces filtres."
          />
        ) : (
          <>
            <ContactsTable contacts={list.data.data} onOpen={(id) => update({ id })} selected={filters.id} />
            <ListPagination
              page={list.data.meta.page}
              pageSize={list.data.meta.pageSize}
              total={list.data.meta.total}
              totalPages={list.data.meta.totalPages}
              noun={list.data.meta.total > 1 ? 'contacts' : 'contact'}
              onPage={(page) => update({ page })}
            />
          </>
        )}
      </AdminCard>

      {filters.id && <ContactPanel id={filters.id} onClose={() => update({ id: null })} />}
    </div>
  );
}

/**
 * Indicateurs (`93:23025`) : contacts (évolution du mois), particuliers, professionnels / partenaires, part des
 * contacts à Douala et dans les environs.
 */
function ContactKpis({ stats }: { stats: ContactStats | undefined }) {
  if (!stats)
    return (
      <div aria-hidden className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg md:h-[156px]" />
        ))}
      </div>
    );
  const share = (count: number | undefined) => formatPercent(stats.total ? (count ?? 0) / stats.total : 0);
  const douala = share(stats.locations?.douala);
  const surroundings = share(stats.locations?.surroundings);
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      <KpiCard
        label="Contacts"
        icon={Users}
        value={formatNumber(stats.total)}
        change={change(stats.newThisMonth, (abs) => formatNumber(abs))}
        legend="ce mois-ci"
      />
      <KpiCard label="Particuliers" icon={User} value={formatNumber(stats.individuals)} />
      <KpiCard
        label="Professionnels / partenaires"
        icon={Briefcase}
        value={formatNumber(stats.professionals)}
      />
      <KpiCard
        label="Douala et environs"
        icon={Globe}
        value={
          <>
            <span aria-hidden>
              {douala} / {surroundings}
            </span>
            <span className="sr-only">
              {douala} à Douala, {surroundings} dans les environs
            </span>
          </>
        }
      />
    </div>
  );
}

/**
 * Colonnes (`93:23091`) : Nom, Profil 120, Localisation 150, Intérêts 200, Demandes 90, Newsletter 110, actions ;
 * Intérêts et Demandes masqués sous 1 400 px, Profil et Localisation sous 1 024 px, cartes en mobile.
 */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_110px_40px] lg:max-[1399px]:grid-cols-[minmax(0,1fr)_120px_150px_110px_40px] min-[1400px]:grid-cols-[minmax(0,1fr)_120px_150px_200px_90px_110px_40px]';
const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';

function ContactsTable({
  contacts,
  selected,
  onOpen,
}: {
  contacts: AdminContactListItem[];
  selected: string | null;
  onOpen: (id: string) => void;
}) {
  const [erasing, setErasing] = useState<AdminContactListItem | null>(null);
  const erase = useEraseContact(() => setErasing(null));
  return (
    <div role="table" aria-label="Contacts">
      <div role="rowgroup" className="hidden md:block">
        <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
          <span role="columnheader" className={headerCell}>
            Nom
          </span>
          <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
            Profil
          </span>
          <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
            Localisation
          </span>
          <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
            Intérêts
          </span>
          <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
            Demandes
          </span>
          <span role="columnheader" className={headerCell}>
            Newsletter
          </span>
          <span role="columnheader" className="sr-only">
            Actions
          </span>
        </div>
      </div>
      <div role="rowgroup">
        {contacts.map((contact) => {
          const profile = contact.profile === 'PROFESSIONNEL' ? 'Professionnel' : 'Particulier';
          const location = locationLabel(contact.city, contact.country);
          return (
            <div
              key={contact.id}
              role="row"
              className={cn(
                COLUMNS,
                'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:items-center max-md:gap-3',
                selected === contact.id && 'bg-orange-50',
              )}
            >
              <div role="cell" className="flex min-w-0 items-center gap-2.5 max-md:flex-1">
                <ContactAvatar name={contact.fullName} initials={contact.initials} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => onOpen(contact.id)}
                    className="truncate text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                  >
                    {contact.fullName}
                  </button>
                  <span className="truncate font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                    <span className="lg:hidden">
                      {profile} · {location}
                    </span>
                    <span className="max-lg:hidden">{contact.email}</span>
                  </span>
                </div>
              </div>
              <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                {profile}
              </span>
              <span role="cell" className={cn(bodyCell, 'hidden truncate lg:block')}>
                {location}
              </span>
              <span role="cell" className={cn(bodyCell, 'hidden truncate min-[1400px]:block')}>
                {interestsLabel(contact.interests)}
              </span>
              <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                {formatNumber(contact.requestsCount)}
              </span>
              <span role="cell" className="shrink-0">
                <NewsletterBadge status={contact.newsletterStatus} />
              </span>
              <div role="cell" className="flex justify-end">
                <ActionMenu
                  label={`Actions pour ${contact.fullName}`}
                  items={[
                    { label: 'Voir la fiche', icon: Eye, onSelect: () => onOpen(contact.id) },
                    {
                      label: 'Exporter ses données',
                      icon: Download,
                      onSelect: () => void exportContactData(contact),
                    },
                    {
                      label: 'Effacer le contact',
                      icon: Trash2,
                      danger: true,
                      onSelect: () => setErasing(contact),
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>
      <EraseContactDialog contact={erasing} onClose={() => setErasing(null)} erase={erase} />
    </div>
  );
}
