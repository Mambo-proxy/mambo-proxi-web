'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, LayoutGrid, PackageSearch } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EmptyState, ListPagination, StatusTabs } from '@/components/admin/ui/filters';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { SortableList } from '@/components/admin/editor/sortable';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminServiceListItem } from '@/lib/api/schema';
import { formatNumber } from '@/lib/format/number';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { ServiceCard, ServiceRow, type ServiceActions } from './service-row';
import { categoriesKey, servicesKey } from './service-ui';

const PAGE_SIZE = 9;
const ALL = 'all';

/** Filtre de rubrique et page lus dans l'adresse (`?rubrique=&page=`). */
function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  return {
    category: params.get('rubrique') ?? ALL,
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
    update(changes: Partial<{ category: string; page: number }>) {
      const next = new URLSearchParams(params.toString());
      if ('category' in changes) {
        if (changes.category && changes.category !== ALL) next.set('rubrique', changes.category);
        else next.delete('rubrique');
        next.delete('page');
      }
      if ('page' in changes) {
        if (changes.page && changes.page > 1) next.set('page', String(changes.page));
        else next.delete('page');
      }
      const query = next.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}` as Route, { scroll: false });
    },
  };
}

/**
 * Services (`88:10421`) : encart d'information, onglets par rubrique avec compteurs, gestion des rubriques,
 * tableau réordonnable (vignette, URL, rubrique, demandes sur 30 jours, statut, présence au menu, actions) et
 * pagination. En mobile, chaque service devient une carte.
 */
export function ServicesView() {
  const { category, page, update } = useFilters();
  const client = useQueryClient();
  const [manageOpen, setManageOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminServiceListItem | null>(null);

  const list = useQuery({
    queryKey: [...servicesKey, { category, page }],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/services', {
          params: {
            query: {
              category: category === ALL ? undefined : category,
            },
          },
        }),
      ),
    placeholderData: keepPreviousData,
  });
  const categories = useQuery({
    queryKey: categoriesKey,
    queryFn: () => data(browserApi.GET('/v1/admin/categories')),
    staleTime: Infinity,
  });
  const drafts = useQuery({
    queryKey: [...servicesKey, 'drafts'],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/services', {
          params: { query: { status: 'DRAFT' } },
        }),
      ),
    staleTime: 30_000,
  });

  const refresh = () => {
    void client.invalidateQueries({ queryKey: servicesKey });
    void client.invalidateQueries({ queryKey: categoriesKey });
  };

  const toggleMenu = useMutation({
    mutationFn: ({ service, showInMenu }: { service: AdminServiceListItem; showInMenu: boolean }) =>
      data(
        browserApi.PATCH('/v1/admin/services/{id}', {
          params: { path: { id: service.id } },
          body: { showInMenu } as never,
        }),
      ),
    onSuccess: (_, { service, showInMenu }) => {
      toast.success(
        showInMenu
          ? `« ${service.name} » apparaît dans le menu.`
          : `« ${service.name} » n’apparaît plus dans le menu.`,
      );
      refresh();
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (service: AdminServiceListItem) =>
      data(
        service.status === 'PUBLISHED'
          ? browserApi.POST('/v1/admin/services/{id}/unpublish', { params: { path: { id: service.id } } })
          : browserApi.POST('/v1/admin/services/{id}/publish', { params: { path: { id: service.id } } }),
      ),
    onSuccess: (_, service) => {
      toast.success(
        service.status === 'PUBLISHED'
          ? `« ${service.name} » repasse en brouillon.`
          : `« ${service.name} » est publié.`,
      );
      refresh();
    },
  });

  const duplicate = useMutation({
    mutationFn: (service: AdminServiceListItem) =>
      data(browserApi.POST('/v1/admin/services/{id}/duplicate', { params: { path: { id: service.id } } })),
    onSuccess: (copy) => {
      toast.success(`« ${copy.name} » a été créé en brouillon.`);
      refresh();
    },
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      data(
        browserApi.PATCH('/v1/admin/services/reorder', {
          body: { ids, scope: category === ALL ? null : category },
        }),
      ),
    onSuccess: () => {
      toast.success('Ordre des services enregistré.');
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (service: AdminServiceListItem) =>
      data(browserApi.DELETE('/v1/admin/services/{id}', { params: { path: { id: service.id } } })),
    onSuccess: (_, service) => {
      toast.success(`« ${service.name} » a été supprimé.`);
      setPendingDelete(null);
      refresh();
    },
  });

  async function preview(service: AdminServiceListItem) {
    try {
      const token = await data(
        browserApi.GET('/v1/admin/services/{id}/preview-token', { params: { path: { id: service.id } } }),
      );
      window.open(token.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const actions: ServiceActions = {
    onPreview: (service) => void preview(service),
    onToggleMenu: (service, showInMenu) => toggleMenu.mutate({ service, showInMenu }),
    onDuplicate: (service) => duplicate.mutate(service),
    onToggleStatus: (service) => toggleStatus.mutate(service),
    onDelete: (service) => setPendingDelete(service),
  };

  const all = list.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = all.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const counts = list.data?.countsByCategory ?? {};
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const tabs = [
    { value: ALL, label: 'Tous', count: total },
    ...(categories.data ?? []).map((item) => ({
      value: item.slug ?? '',
      label: item.name ?? '',
      count: counts[item.slug ?? ''] ?? 0,
    })),
  ];
  const draftCount = drafts.data?.data.length ?? 0;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-start gap-3 rounded-[14px] bg-orange-50 p-4">
        <Info aria-hidden size={18} className="mt-0.5 shrink-0 text-text-brand" />
        <p className="font-ui text-[14px] leading-5 text-orange-900">
          Chaque service publié obtient automatiquement sa page, sa carte dans la rubrique et son entrée dans
          le menu. Glissez les lignes pour changer l’ordre d’affichage.
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <StatusTabs
          label="Rubrique des services"
          tabs={tabs}
          value={category}
          onChange={(value) => update({ category: value })}
          className="xl:mr-auto"
        />
        <button
          type="button"
          onClick={() => setManageOpen(true)}
          disabled={!categories.data}
          className={topbarSecondaryClass}
        >
          <LayoutGrid aria-hidden />
          Gérer les rubriques
        </button>
      </div>

      <AdminCard aria-busy={list.isFetching} className="overflow-hidden">
        {list.isError && !list.data ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <p className="font-ui text-[15px] leading-6">Impossible de charger les services.</p>
            <button type="button" onClick={() => void list.refetch()} className={topbarSecondaryClass}>
              Réessayer
            </button>
          </div>
        ) : !list.data ? (
          <div className="flex flex-col gap-3 p-5" aria-hidden>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-[52px] rounded-sm" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={24} />}
            title="Aucun service dans cette rubrique"
            text="Ajoutez un service ou choisissez une autre rubrique."
          />
        ) : (
          <>
            <table className="hidden w-full table-fixed border-collapse md:table">
              <caption className="sr-only">
                Services du site, réordonnables au glisser-déposer ou au clavier
              </caption>
              <thead>
                <tr className="border-b border-border-default bg-neutral-50 text-left font-ui text-[12px] leading-4 text-text-muted">
                  <th scope="col" className="w-10 py-3 pl-5">
                    <span className="sr-only">Ordre</span>
                  </th>
                  <th scope="col" className="py-3 pr-4 pl-1 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="w-[170px] px-4 py-3 font-semibold">
                    Rubrique
                  </th>
                  <th scope="col" className="w-[120px] px-4 py-3 font-semibold">
                    Demandes (30 j)
                  </th>
                  <th scope="col" className="w-[120px] px-4 py-3 font-semibold">
                    Statut
                  </th>
                  <th scope="col" className="w-[110px] px-4 py-3 font-semibold">
                    Dans le menu
                  </th>
                  <th scope="col" className="w-[130px] py-3 pr-5 pl-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <SortableList
                as="tbody"
                items={rows}
                getId={(service) => service.id}
                getLabel={(service) => service.name}
                onReorder={(next) => reorder.mutate(next.map((service) => service.id))}
                renderItem={(service) => <ServiceRow key={service.id} service={service} actions={actions} />}
              />
            </table>
            <ul className="md:hidden">
              {rows.map((service) => (
                <ServiceCard key={service.id} service={service} actions={actions} />
              ))}
            </ul>
          </>
        )}
        {list.data && (
          <ListPagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={all.length}
            totalPages={totalPages}
            noun="services"
            summary={
              <>
                Affichage de {formatNumber(rows.length)} sur {formatNumber(all.length)} service
                {all.length > 1 ? 's' : ''}
                {draftCount > 0 && ` · ${formatNumber(draftCount)} brouillon${draftCount > 1 ? 's' : ''}`}
              </>
            }
            onPage={(value) => update({ page: value })}
          />
        )}
      </AdminCard>

      <ManageCategoriesDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        categories={categories.data ?? []}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Supprimer ce service ?"
        description={
          pendingDelete
            ? `« ${pendingDelete.name} » sera supprimé. Cette action est définitive ; un service publié doit d’abord être dépublié.`
            : undefined
        }
        confirmLabel="Supprimer"
        destructive
        pending={remove.isPending}
      />
    </div>
  );
}
