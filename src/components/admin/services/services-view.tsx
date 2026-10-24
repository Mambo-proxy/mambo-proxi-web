'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Info,
  LayoutTemplate,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog, PublishStatusBadge } from '@/components/admin/editor/editor-ui';
import { DragHandle, SortableItem, SortableList, moveItem } from '@/components/admin/editor/sortable';
import { topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { ActionMenu, type ActionMenuItem } from '@/components/admin/ui/action-menu';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { paginationRange } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Visual } from '@/components/ui/visual';
import { adminRoutes } from '@/lib/admin/routes';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { AdminServiceListItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';
import { CategoriesDialog } from './categories-dialog';
import { openServicePreview, useServiceMutations } from './service-actions';
import {
  categoriesKey,
  categoryLabel,
  fetchCategories,
  runsByCategory,
  servicesKey,
  spliceOrder,
} from './service-utils';

/** Lignes par page (maquette : « Affichage de 9 sur 19 services »). */
const PAGE_SIZE = 9;

const editHref = (id: string) => `${adminRoutes.services}/${id}` as Route;

/** Rubrique et page lues dans l'adresse (`?category=&page=`). */
function useFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const filters = {
    category: params.get('category') ?? 'ALL',
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
  };
  function update(changes: { category?: string; page?: number }) {
    const next = new URLSearchParams(params.toString());
    if (changes.category !== undefined) {
      if (changes.category === 'ALL') next.delete('category');
      else next.set('category', changes.category);
      next.delete('page');
    }
    if (changes.page !== undefined) {
      if (changes.page === 1) next.delete('page');
      else next.set('page', String(changes.page));
    }
    const query = next.toString();
    // Filtres purement côté client : l'adresse est mise à jour sans aller-retour serveur (Next synchronise
    // `useSearchParams` avec l'historique natif).
    window.history.replaceState(null, '', `${pathname}${query ? `?${query}` : ''}`);
  }
  return { filters, update };
}

type Mutations = ReturnType<typeof useServiceMutations>;

/** Actions d'une ligne : aperçu, modifier, menu (monter, descendre, dupliquer, publier, supprimer). */
function RowActions({
  service,
  mutations,
  onMove,
  onDelete,
  canMove,
  compact,
}: {
  service: AdminServiceListItem;
  mutations: Mutations;
  onMove: (offset: -1 | 1) => void;
  onDelete: () => void;
  canMove: { up: boolean; down: boolean };
  /** Cartes (mobile) : aperçu et modification regroupés dans le menu « … ». */
  compact?: boolean;
}) {
  const published = service.status === 'PUBLISHED';
  const items: ActionMenuItem[] = [
    ...(compact
      ? [
          { label: 'Modifier', icon: Pencil, href: editHref(service.id) },
          { label: 'Aperçu (nouvel onglet)', icon: Eye, onSelect: () => void openServicePreview(service.id) },
        ]
      : []),
    { label: 'Monter dans la rubrique', icon: ArrowUp, onSelect: () => onMove(-1), disabled: !canMove.up },
    {
      label: 'Descendre dans la rubrique',
      icon: ArrowDown,
      onSelect: () => onMove(1),
      disabled: !canMove.down,
    },
    { label: 'Dupliquer', icon: Copy, onSelect: () => mutations.duplicate.mutate(service.id) },
    published
      ? { label: 'Dépublier', icon: EyeOff, onSelect: () => mutations.unpublish.mutate(service.id) }
      : { label: 'Publier', icon: Send, onSelect: () => mutations.publish.mutate(service.id) },
    published
      ? { label: 'Supprimer (dépublier d’abord)', icon: Trash2, onSelect: () => undefined, disabled: true }
      : { label: 'Supprimer', icon: Trash2, onSelect: onDelete, danger: true },
  ];
  const iconButton =
    'flex size-8 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main';
  if (compact) return <ActionMenu label={`Actions pour « ${service.name} »`} items={items} />;
  return (
    <div className="flex items-center justify-end gap-2.5">
      <button
        type="button"
        onClick={() => void openServicePreview(service.id)}
        aria-label={`Aperçu de la page « ${service.name} » (nouvel onglet)`}
        className={iconButton}
      >
        <Eye aria-hidden size={16} />
      </button>
      <Link href={editHref(service.id)} aria-label={`Modifier « ${service.name} »`} className={iconButton}>
        <Pencil aria-hidden size={16} />
      </Link>
      <ActionMenu label={`Autres actions pour « ${service.name} »`} items={items} />
    </div>
  );
}

function Thumb({ service }: { service: AdminServiceListItem }) {
  return (
    <Visual
      visual={service.visual}
      sizes="56px"
      className="h-[42px] w-14 shrink-0 rounded-[8px] bg-orange-100!"
    />
  );
}

/** Pied : « Affichage de 9 sur 19 services · 1 brouillon » et pagination 30 × 30 (`88:11230`). */
function Footer({
  shown,
  total,
  drafts,
  page,
  totalPages,
  onPage,
}: {
  shown: number;
  total: number;
  drafts: number;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  const button =
    'flex size-[30px] items-center justify-center rounded-sm border font-ui text-[12px] leading-4 font-semibold disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default px-5 py-3">
      <p className="font-ui text-[12px] leading-4 text-text-muted" aria-live="polite">
        Affichage de {formatNumber(shown)} sur {formatNumber(total)} service{total > 1 ? 's' : ''}
        {drafts > 0 && ` · ${drafts} brouillon${drafts > 1 ? 's' : ''}`}
      </p>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Page précédente"
            className={cn(button, 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50')}
          >
            <ChevronLeft aria-hidden size={14} />
          </button>
          {paginationRange(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`e${index}`} aria-hidden className="px-1 font-ui text-[12px] text-text-muted">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPage(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  button,
                  item === page
                    ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                    : 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50',
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Page suivante"
            className={cn(button, 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50')}
          >
            <ChevronRight aria-hidden size={14} />
          </button>
        </nav>
      )}
    </div>
  );
}

/**
 * Services (`88:10421`) : encart d'information, onglets par rubrique avec compteurs, tableau (poignée, service,
 * rubrique, demandes 30 j, statut, « Dans le menu », actions) paginé par 9, cartes sous 1 280 px. Les lignes se
 * réordonnent au glisser-déposer ou au clavier à l'intérieur de leur rubrique ; l'ordre est enregistré aussitôt.
 */
export function ServicesView() {
  const { filters, update } = useFilters();
  const [manageCategories, setManageCategories] = useState(false);
  const [toDelete, setToDelete] = useState<AdminServiceListItem | null>(null);
  const mutations = useServiceMutations();

  const categories = useQuery({
    queryKey: categoriesKey,
    queryFn: fetchCategories,
  });
  const category = filters.category === 'ALL' ? undefined : filters.category;
  const list = useQuery({
    queryKey: [...servicesKey, { category }],
    queryFn: () => data(browserApi.GET('/v1/admin/services', { params: { query: { category } } })),
    placeholderData: keepPreviousData,
  });

  const services = list.data?.data ?? [];
  const counts = list.data?.countsByCategory ?? {};
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const pageItems = services.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const runs = runsByCategory(pageItems);
  const drafts = services.filter((service) => service.status === 'DRAFT').length;

  const tabs = [
    { value: 'ALL', label: 'Tous', count: list.data ? total : undefined },
    ...(categories.data ?? []).map((item) => ({
      value: item.slug,
      label: categoryLabel(item, 'tab'),
      count: list.data ? (counts[item.slug] ?? 0) : undefined,
    })),
  ];

  const inCategory = (slug: string) => services.filter((service) => service.category.slug === slug);

  /** Déplacement dans une suite affichée : ordre complet de la rubrique recalculé puis envoyé. */
  function reorderRun(before: AdminServiceListItem[], after: AdminServiceListItem[]) {
    const scope = before[0]!.category.slug;
    mutations.reorder.mutate({ scope, ordered: spliceOrder(inCategory(scope), before, after) });
  }

  function move(service: AdminServiceListItem, offset: -1 | 1) {
    const scope = service.category.slug;
    const full = inCategory(scope);
    const index = full.findIndex((item) => item.id === service.id);
    const ordered = moveItem(full, index, offset);
    if (ordered !== full) mutations.reorder.mutate({ scope, ordered });
  }

  const canMove = (service: AdminServiceListItem) => {
    const full = inCategory(service.category.slug);
    const index = full.findIndex((item) => item.id === service.id);
    return { up: index > 0, down: index < full.length - 1 };
  };

  const menuSwitch = (service: AdminServiceListItem, suffix: string, hideLabel: boolean) => (
    <Switch
      id={`menu-${service.id}-${suffix}`}
      checked={service.showInMenu}
      onChange={(event) =>
        mutations.toggleMenu.mutate({ id: service.id, showInMenu: event.currentTarget.checked })
      }
      label={hideLabel ? `Afficher « ${service.name} » dans le menu` : 'Dans le menu'}
      hideLabel={hideLabel}
    />
  );

  const actions = (service: AdminServiceListItem, compact = false) => (
    <RowActions
      compact={compact}
      service={service}
      mutations={mutations}
      onMove={(offset) => move(service, offset)}
      onDelete={() => setToDelete(service)}
      canMove={canMove(service)}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-start gap-3 rounded-[14px] bg-orange-50 p-4 font-ui text-[14px] leading-5 text-orange-900">
        <Info aria-hidden size={18} className="mt-px shrink-0 text-text-brand" />
        Chaque service publié obtient automatiquement sa page, sa carte dans la rubrique et son entrée dans le
        menu. Glissez les lignes pour changer l’ordre d’affichage.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusTabs
          label="Rubriques"
          tabs={tabs}
          value={filters.category}
          onChange={(value) => update({ category: value })}
        />
        <button
          type="button"
          onClick={() => setManageCategories(true)}
          className={cn(topbarSecondaryClass, 'py-[9px]')}
        >
          <LayoutTemplate aria-hidden />
          Gérer les rubriques
        </button>
      </div>

      <AdminCard className="overflow-hidden" aria-busy={list.isFetching}>
        {list.isError && !list.data ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <p className="font-ui text-[15px] leading-6">Impossible de charger les services.</p>
            <button type="button" onClick={() => void list.refetch()} className={topbarSecondaryClass}>
              Réessayer
            </button>
          </div>
        ) : !list.data ? (
          <div aria-hidden className="flex flex-col gap-2 p-5">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-14 rounded-md" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="Aucun service dans cette rubrique"
            text="Ajoutez un premier service : il sera créé en brouillon, à publier quand il est prêt."
            action={
              <Link href={adminRoutes.newService} className={cn(topbarActionClass, 'mt-2')}>
                <Plus aria-hidden />
                Ajouter un service
              </Link>
            }
          />
        ) : (
          <>
            {/* Sous 1 280 px : cartes. */}
            <div className="xl:hidden">
              {runs.map((run, index) => (
                <SortableList
                  key={`${run[0]!.id}-cards`}
                  items={run}
                  getId={(service) => service.id}
                  getLabel={(service) => service.name}
                  onReorder={(next) => reorderRun(run, next)}
                  className={cn(
                    'divide-y divide-border-default',
                    index > 0 && 'border-t border-border-default',
                  )}
                  renderItem={(service) => (
                    <SortableItem
                      key={service.id}
                      id={service.id}
                      className="flex items-start gap-2 bg-neutral-0 py-3.5 pr-3 pl-2 sm:pr-4 sm:pl-3"
                    >
                      <DragHandle label={service.name} className="mt-1.5" />
                      <Thumb service={service} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1 pl-1">
                        <Link
                          href={editHref(service.id)}
                          className="truncate rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main"
                        >
                          {service.name}
                        </Link>
                        <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                          {categoryLabel(service.category)} · {service.requests30d} demande
                          {service.requests30d > 1 ? 's' : ''} (30 j)
                        </span>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 whitespace-nowrap">
                          <PublishStatusBadge status={service.status} />
                          {menuSwitch(service, 'm', false)}
                        </div>
                      </div>
                      <div className="shrink-0">{actions(service, true)}</div>
                    </SortableItem>
                  )}
                />
              ))}
            </div>

            {/* Desktop : tableau (`88:10603`), une liste réordonnable (`tbody`) par rubrique. */}
            <table className="hidden w-full table-fixed border-collapse font-ui text-[14px] leading-5 text-text-main xl:table">
              <caption className="sr-only">
                Services, par rubrique et dans l’ordre d’affichage du site
              </caption>
              <thead>
                <tr className="bg-neutral-50 text-left text-[12px] leading-4 text-text-muted">
                  <th scope="col" className="w-[52px] py-3 pl-3.5">
                    <span className="sr-only">Ordre</span>
                  </th>
                  <th scope="col" className="py-3 pl-1 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="w-[150px] py-3 pl-4 font-semibold min-[1400px]:w-[186px]">
                    Rubrique
                  </th>
                  <th scope="col" className="w-[124px] py-3 pl-4 font-semibold min-[1400px]:w-[136px]">
                    Demandes (30 j)
                  </th>
                  <th scope="col" className="w-[120px] py-3 pl-4 font-semibold min-[1400px]:w-[136px]">
                    Statut
                  </th>
                  <th scope="col" className="w-[116px] py-3 pl-4 font-semibold min-[1400px]:w-[126px]">
                    Dans le menu
                  </th>
                  <th scope="col" className="w-[146px] py-3 pr-5 pl-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              {runs.map((run) => (
                <SortableList
                  key={run[0]!.id}
                  as="tbody"
                  items={run}
                  getId={(service) => service.id}
                  getLabel={(service) => service.name}
                  onReorder={(next) => reorderRun(run, next)}
                  renderItem={(service) => (
                    <SortableItem
                      key={service.id}
                      id={service.id}
                      as="tr"
                      className="h-[71px] border-t border-border-default bg-neutral-0 hover:bg-neutral-50"
                    >
                      <td className="py-3.5 pl-3.5">
                        <DragHandle label={service.name} />
                      </td>
                      <td className="max-w-0 py-3.5 pl-1">
                        <div className="flex items-center gap-2.5">
                          <Thumb service={service} />
                          <div className="flex min-w-0 flex-col">
                            <Link
                              href={editHref(service.id)}
                              className="truncate rounded-xs font-semibold text-text-main"
                            >
                              {service.name}
                            </Link>
                            <span className="truncate text-[12px] leading-4 text-text-muted">
                              {service.path}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="truncate py-3.5 pl-4">{categoryLabel(service.category)}</td>
                      <td className="py-3.5 pl-4">{formatNumber(service.requests30d)}</td>
                      <td className="py-3.5 pl-4">
                        <PublishStatusBadge status={service.status} />
                      </td>
                      <td className="py-3.5 pl-4">{menuSwitch(service, 'd', true)}</td>
                      <td className="py-3.5 pr-5 pl-4">{actions(service)}</td>
                    </SortableItem>
                  )}
                />
              ))}
            </table>
            <Footer
              shown={pageItems.length}
              total={services.length}
              drafts={drafts}
              page={page}
              totalPages={totalPages}
              onPage={(next) => update({ page: next })}
            />
          </>
        )}
      </AdminCard>

      <CategoriesDialog open={manageCategories} onClose={() => setManageCategories(false)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Supprimer ce service ?"
        description={
          toDelete
            ? `« ${toDelete.name} » sera définitivement supprimé, avec sa page. Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer le service"
        destructive
        pending={mutations.remove.isPending}
        onConfirm={() => {
          if (toDelete)
            mutations.remove.mutate(toDelete, {
              onSettled: () => setToDelete(null),
            });
        }}
      />
    </div>
  );
}
