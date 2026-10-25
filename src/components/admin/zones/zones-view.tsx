'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, MapPin, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { moveItem } from '@/components/admin/editor/sortable';
import { compactInputClass } from '@/components/admin/magazine/magazine-ui';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { ZonesLeafletMap } from '@/components/sections/zones/zones-leaflet';
import { TONES } from '@/components/sections/zones/zone-tones';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminZone, ZoneQuarter } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';
import { ADMIN_MAP_LABELS, feeLabel, pointLabel, zoneSubline } from './zone-labels';
import { ZoneDialog } from './zone-dialog';

export const zonesKey = ['zones', 'admin'] as const;

/** Page publique des zones, ouverte par l'action « Aperçu ». */
const PUBLIC_ZONES_PAGE = '/zones-d-intervention';

function useTab() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = params.get('onglet') === 'quartiers' ? 'quartiers' : 'zones';
  function setTab(next: 'zones' | 'quartiers') {
    router.replace(`${pathname}${next === 'quartiers' ? '?onglet=quartiers' : ''}` as Route, {
      scroll: false,
    });
  }
  return [tab, setTab] as const;
}

function useRefreshZones() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: zonesKey });
}

/** Bouton « Nouvelle zone » de la barre supérieure (`267:2034`). */
export function NewZoneButton() {
  const [open, setOpen] = useState(false);
  const refresh = useRefreshZones();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={topbarActionClass}>
        <Plus aria-hidden />
        Nouvelle zone
      </button>
      <ZoneDialog open={open} onClose={() => setOpen(false)} zone={null} onSaved={refresh} />
    </>
  );
}

/**
 * Zones d'intervention (`267:1934`) : onglets « Zones » / « Quartiers », tableau, information, aperçu de la carte.
 * L'aperçu reprend la carte OpenStreetMap du site (Leaflet, chargé à la demande) en mode figé : il montre les
 * contours et les positions réellement enregistrés, que la saisie au clic de la fiche d'une zone modifie.
 */
export function ZonesView() {
  const [tab, setTab] = useTab();
  const zones = useQuery({ queryKey: zonesKey, queryFn: () => data(browserApi.GET('/v1/admin/zones')) });
  const list = zones.data?.zones;
  const quartersCount = list?.reduce((total, zone) => total + zone.quarters.length, 0);
  const activeZones = useMemo(() => list?.filter((zone) => zone.active), [list]);

  return (
    <div className="flex flex-col gap-6">
      <StatusTabs
        label="Zones et quartiers"
        tabs={[
          { value: 'zones', label: 'Zones', count: list?.length },
          { value: 'quartiers', label: 'Quartiers', count: quartersCount },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'zones' ? (
        <>
          <ZonesTable
            zones={list}
            showFees={zones.data?.showFees ?? false}
            error={zones.isError && !zones.data}
          />
          <p className="rounded-md bg-orange-50 px-4 py-3 font-ui text-[14px] leading-5 text-orange-800">
            Les tarifs indicatifs restent masqués sur le site tant que l’option « Afficher les tarifs » est
            désactivée dans les Paramètres. Pour placer les quartiers et dessiner le contour d’une zone,
            ouvrez-la avec « Modifier » (clic sur la carte, coordonnées ou fichier GeoJSON).
          </p>
          <section aria-labelledby="zones-map-preview" className="flex flex-col gap-4">
            <h2
              id="zones-map-preview"
              className="font-brand text-[20px] leading-[30px] font-semibold text-text-main"
            >
              Aperçu de la carte
            </h2>
            {activeZones ? (
              <div className="flex flex-col gap-2.5">
                <ZonesLeafletMap
                  zones={activeZones}
                  labels={ADMIN_MAP_LABELS}
                  mode="static"
                  className="xl:w-full"
                />
                <p className="font-ui text-[13px] leading-[18px] text-text-muted">
                  Aperçu des zones actives : contours et quartiers placés. Sur le site : carte interactive
                  (zoom, déplacement, info-bulles) reliée à la recherche de quartier.
                </p>
              </div>
            ) : (
              <Skeleton className="aspect-[760/540] w-full rounded-xl" />
            )}
          </section>
        </>
      ) : (
        <QuartersTable zones={list} />
      )}
    </div>
  );
}

/** Colonnes (`267:2048`) : Zone, Délai moyen 150, Quartiers 90, Tarif indicatif 160, Demandes 90, Statut 110, actions 110. */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_90px_110px_110px] lg:max-[1399px]:grid-cols-[minmax(0,1fr)_120px_90px_110px_110px] min-[1400px]:grid-cols-[minmax(0,1fr)_150px_90px_160px_90px_110px_110px]';
const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';

function ZonesTable({
  zones,
  showFees,
  error,
}: {
  zones: AdminZone[] | undefined;
  showFees: boolean;
  error: boolean;
}) {
  const client = useQueryClient();
  const refresh = useRefreshZones();
  const [editing, setEditing] = useState<AdminZone | null>(null);
  const [deleting, setDeleting] = useState<AdminZone | null>(null);

  const reorder = useMutation({
    mutationFn: (ids: string[]) => data(browserApi.PATCH('/v1/admin/zones/reorder', { body: { ids } })),
    onMutate: (ids) => {
      client.setQueryData(zonesKey, (current: { zones: AdminZone[]; showFees: boolean } | undefined) =>
        current
          ? {
              ...current,
              zones: ids.map((id) => current.zones.find((zone) => zone.id === id)!).filter(Boolean),
            }
          : current,
      );
    },
    onSettled: refresh,
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const toggle = useMutation({
    mutationFn: (zone: AdminZone) =>
      data(
        browserApi.PATCH('/v1/admin/zones/{id}', {
          params: { path: { id: zone.id } },
          body: { active: !zone.active } as never,
        }),
      ),
    onSuccess: (zone) => {
      toast.success(
        zone.active ? 'Zone activée sur le site.' : 'Zone désactivée : elle n’apparaît plus sur le site.',
      );
      refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => data(browserApi.DELETE('/v1/admin/zones/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Zone supprimée.');
      refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const iconButton =
    'flex size-8 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main';

  return (
    <AdminCard className="overflow-hidden">
      <div role="table" aria-label="Zones d’intervention">
        <div role="rowgroup" className="hidden md:block">
          <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
            <span role="columnheader" className={headerCell}>
              Zone
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Délai moyen
            </span>
            <span role="columnheader" className={headerCell}>
              Quartiers
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Tarif indicatif
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
                icon={<MapPin size={24} />}
                title="Zones indisponibles"
                text="Le chargement a échoué."
              />
            </div>
          ) : !zones ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
                <Skeleton className="h-9 w-full rounded-sm" />
              </div>
            ))
          ) : zones.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<MapPin size={24} />}
                title="Aucune zone"
                text="Ajoutez une zone avec « Nouvelle zone »."
              />
            </div>
          ) : (
            zones.map((zone, index) => (
              <div
                key={zone.id}
                role="row"
                className={cn(
                  COLUMNS,
                  'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-2.5',
                )}
              >
                <div role="cell" className="flex min-w-0 items-center gap-2.5 max-md:w-full">
                  <span aria-hidden className={cn('size-3.5 shrink-0 rounded-full', TONES[zone.tone].dot)} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setEditing(zone)}
                      className="text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                    >
                      {zone.name}
                    </button>
                    <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                      {zoneSubline(zone)}
                    </span>
                  </div>
                </div>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {zone.delay ?? 'Sur devis'}
                </span>
                <span role="cell" className={cn(bodyCell, 'max-md:text-[13px] max-md:text-text-muted')}>
                  <span className="md:hidden">Quartiers : </span>
                  {zone.quarters.length}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  {feeLabel(zone, showFees)}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
                  {formatNumber(zone.requestsCount)}
                </span>
                <span role="cell" className="max-md:hidden">
                  <ZoneStatus active={zone.active} />
                </span>
                <div role="cell" className="flex items-center justify-end gap-2.5 max-md:ml-auto">
                  <span className="md:hidden">
                    <ZoneStatus active={zone.active} />
                  </span>
                  <a
                    href={PUBLIC_ZONES_PAGE}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Voir ${zone.name} sur le site (nouvel onglet)`}
                    title="Voir sur le site"
                    className={iconButton}
                  >
                    <Eye aria-hidden size={16} />
                  </a>
                  <button
                    type="button"
                    aria-label={`Modifier ${zone.name}`}
                    title="Modifier"
                    className={iconButton}
                    onClick={() => setEditing(zone)}
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  <ActionMenu
                    label={`Actions pour ${zone.name}`}
                    items={[
                      {
                        label: 'Monter',
                        icon: ArrowUp,
                        disabled: index === 0,
                        onSelect: () => reorder.mutate(moveItem(zones, index, -1).map((item) => item.id)),
                      },
                      {
                        label: 'Descendre',
                        icon: ArrowDown,
                        disabled: index === zones.length - 1,
                        onSelect: () => reorder.mutate(moveItem(zones, index, 1).map((item) => item.id)),
                      },
                      {
                        label: zone.active ? 'Désactiver' : 'Activer',
                        icon: Power,
                        onSelect: () => toggle.mutate(zone),
                      },
                      {
                        label: 'Supprimer',
                        icon: Trash2,
                        danger: true,
                        disabled: zone.quarters.length > 0,
                        onSelect: () => setDeleting(zone),
                      },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ZoneDialog open={editing !== null} onClose={() => setEditing(null)} zone={editing} onSaved={refresh} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title={`Supprimer « ${deleting?.name ?? ''} » ?`}
        description="La zone disparaît du site et du back-office."
        confirmLabel="Supprimer la zone"
        destructive
        pending={remove.isPending}
      />
    </AdminCard>
  );
}

/** Statut d'une zone (`267:2076`) : « Active » (vert) ou « Inactive » (gris). */
function ZoneStatus({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
        active ? 'bg-vert-50 text-vert-700' : 'bg-neutral-100 text-text-muted',
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 shrink-0 rounded-full', active ? 'bg-vert-500' : 'bg-neutral-500')}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/** Onglet « Quartiers » (non maquetté) : chaque quartier, sa zone (modifiable) et sa position sur la carte. */
function QuartersTable({ zones }: { zones: AdminZone[] | undefined }) {
  const refresh = useRefreshZones();
  const [removing, setRemoving] = useState<{ zone: AdminZone; quarter: ZoneQuarter } | null>(null);

  const update = useMutation({
    mutationFn: ({ zone, quarters }: { zone: AdminZone; quarters: ZoneQuarter[]; message: string }) =>
      data(
        browserApi.PATCH('/v1/admin/zones/{id}', {
          params: { path: { id: zone.id } },
          body: { quarters } as never,
        }),
      ),
    onSuccess: (_zone, { message }) => {
      setRemoving(null);
      toast.success(message);
      refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  if (!zones)
    return (
      <AdminCard className="flex flex-col gap-2 p-5">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-sm" />
        ))}
      </AdminCard>
    );

  const rows = zones.flatMap((zone) => zone.quarters.map((quarter) => ({ zone, quarter })));

  return (
    <AdminCard className="overflow-hidden">
      <table className="w-full border-collapse">
        <caption className="sr-only">Quartiers desservis</caption>
        <thead className="max-md:sr-only">
          <tr className="border-b border-border-default bg-neutral-50 text-left">
            <th scope="col" className={cn(headerCell, 'px-5 py-3')}>
              Quartier
            </th>
            <th scope="col" className={cn(headerCell, 'px-2 py-3')}>
              Zone
            </th>
            <th scope="col" className={cn(headerCell, 'px-2 py-3 max-lg:hidden')}>
              Position sur la carte
            </th>
            <th scope="col" className="w-14 px-3 py-3 md:px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ zone, quarter }) => (
            <tr key={`${zone.id}-${quarter.name}`} className="border-b border-border-default last:border-b-0">
              <th scope="row" className="py-3 pr-2 pl-4 text-left font-normal md:px-5">
                <span className="block font-ui text-[14px] leading-5 font-semibold text-text-main">
                  {quarter.name}
                  {quarter.isBase && <span className="font-normal text-text-muted"> · base de départ</span>}
                </span>
                {quarter.detail && (
                  <span className="block font-ui text-[12px] leading-4 text-text-muted">
                    {quarter.detail}
                  </span>
                )}
              </th>
              <td className="px-2 py-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', TONES[zone.tone].dot)} />
                  <select
                    aria-label={`Zone de ${quarter.name}`}
                    value={zone.id}
                    disabled={update.isPending}
                    onChange={(event) => {
                      const target = zones.find((item) => item.id === event.target.value);
                      if (!target || target.id === zone.id) return;
                      update.mutate({
                        zone: target,
                        quarters: [...target.quarters, quarter],
                        message: `${quarter.name} déplacé vers « ${target.name} ».`,
                      });
                    }}
                    className={cn(
                      compactInputClass,
                      'w-[136px] truncate py-2 pr-2 pl-2.5 sm:w-auto sm:max-w-[220px] sm:px-3.5',
                    )}
                  >
                    {zones.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </span>
              </td>
              <td className={cn(bodyCell, 'px-2 py-3 whitespace-nowrap max-lg:hidden')}>
                {quarter.coordinates ? (
                  pointLabel(quarter.coordinates)
                ) : (
                  <span className="text-text-muted">Non placé</span>
                )}
              </td>
              <td className="px-3 py-3 text-right md:px-5">
                <ActionMenu
                  label={`Actions pour ${quarter.name}`}
                  items={[
                    {
                      label: 'Retirer de la zone',
                      icon: Trash2,
                      danger: true,
                      onSelect: () => setRemoving({ zone, quarter }),
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() =>
          removing &&
          update.mutate({
            zone: removing.zone,
            quarters: removing.zone.quarters.filter((quarter) => quarter !== removing.quarter),
            message: `${removing.quarter.name} retiré des zones d’intervention.`,
          })
        }
        title={`Retirer « ${removing?.quarter.name ?? ''} » ?`}
        description="Le quartier n’apparaîtra plus sur la carte, dans la recherche ni dans les formulaires du site."
        confirmLabel="Retirer le quartier"
        destructive
        pending={update.isPending}
      />
    </AdminCard>
  );
}
