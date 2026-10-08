'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminService, AdminServiceListItem } from '@/lib/api/schema';
import { categoriesKey, serviceBody, serviceKey, servicesKey } from './service-utils';

type ListData = { data: AdminServiceListItem[]; countsByCategory: Record<string, number> };

/**
 * Aperçu de la page complète (`GET …/preview-token`) dans un nouvel onglet. L'onglet est ouvert avant la requête
 * (sinon le navigateur le bloque), puis dirigé vers l'adresse d'aperçu.
 */
export async function openServicePreview(id: string, opened?: Window | null) {
  const tab = opened === undefined ? window.open('', '_blank') : opened;
  try {
    const token = await data(
      browserApi.GET('/v1/admin/services/{id}/preview-token', { params: { path: { id } } }),
    );
    if (tab) {
      tab.opener = null;
      tab.location.href = token.url;
    } else window.open(token.url, '_blank', 'noopener');
  } catch (error) {
    tab?.close();
    toast.error(errorMessage(error));
  }
}

/** Actions d'une ligne de la liste (et du menu de l'éditeur) : dupliquer, publier, dépublier, supprimer… */
export function useServiceMutations() {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: servicesKey });
    void client.invalidateQueries({ queryKey: categoriesKey });
  };
  const store = (service: AdminService) => client.setQueryData(serviceKey(service.id), service);

  /** Mise à jour optimiste des listes en cache (toutes rubriques). */
  function patchLists(update: (list: AdminServiceListItem[]) => AdminServiceListItem[]) {
    const snapshots = client.getQueriesData<ListData>({ queryKey: servicesKey });
    for (const [key, value] of snapshots)
      if (value) client.setQueryData<ListData>(key, { ...value, data: update(value.data) });
    return snapshots;
  }
  const restore = (snapshots: [readonly unknown[], ListData | undefined][]) => {
    for (const [key, value] of snapshots) client.setQueryData(key, value);
  };

  const duplicate = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.POST('/v1/admin/services/{id}/duplicate', { params: { path: { id } } })),
    onSuccess: (copy) => {
      store(copy);
      refresh();
      toast.success(`Service dupliqué : « ${copy.name} » (brouillon).`);
    },
  });

  const publish = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.POST('/v1/admin/services/{id}/publish', { params: { path: { id } } })),
    onSuccess: (service) => {
      store(service);
      refresh();
      toast.success(`« ${service.name} » est publié.`);
    },
  });

  const unpublish = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.POST('/v1/admin/services/{id}/unpublish', { params: { path: { id } } })),
    onSuccess: (service) => {
      store(service);
      refresh();
      toast.success(`« ${service.name} » est repassé en brouillon.`);
    },
  });

  const remove = useMutation({
    mutationFn: (service: Pick<AdminServiceListItem, 'id' | 'name'>) =>
      data(browserApi.DELETE('/v1/admin/services/{id}', { params: { path: { id: service.id } } })),
    onSuccess: (_result, service) => {
      client.removeQueries({ queryKey: serviceKey(service.id) });
      refresh();
      toast.success(`« ${service.name} » a été supprimé.`);
    },
  });

  const toggleMenu = useMutation({
    mutationFn: ({ id, showInMenu }: { id: string; showInMenu: boolean }) =>
      data(
        browserApi.PATCH('/v1/admin/services/{id}', {
          params: { path: { id } },
          body: serviceBody({ showInMenu }),
        }),
      ),
    onMutate: async ({ id, showInMenu }) => {
      await client.cancelQueries({ queryKey: servicesKey });
      return patchLists((list) => list.map((item) => (item.id === id ? { ...item, showInMenu } : item)));
    },
    onError: (error, _variables, snapshots) => {
      if (snapshots) restore(snapshots);
      toast.error(errorMessage(error));
    },
    onSuccess: (service) => {
      store(service);
      toast.success(
        service.showInMenu
          ? `« ${service.name} » apparaît dans le menu${service.status === 'PUBLISHED' ? '' : ' (dès sa publication)'}.`
          : `« ${service.name} » est retiré du menu.`,
      );
    },
    onSettled: refresh,
  });

  /** Nouvel ordre d'une rubrique (`PATCH /v1/admin/services/reorder`, portée = slug de la rubrique). */
  const reorder = useMutation({
    mutationFn: ({ scope, ordered }: { scope: string; ordered: AdminServiceListItem[] }) =>
      data(
        browserApi.PATCH('/v1/admin/services/reorder', {
          body: { scope, ids: ordered.map((item) => item.id) },
        }),
      ),
    onMutate: async ({ scope, ordered }) => {
      await client.cancelQueries({ queryKey: servicesKey });
      return patchLists((list) => {
        let cursor = 0;
        const inList = new Set(list.map((item) => item.id));
        const visible = ordered.filter((item) => inList.has(item.id));
        return list.map((item) => (item.category.slug === scope ? (visible[cursor++] ?? item) : item));
      });
    },
    onError: (error, _variables, snapshots) => {
      if (snapshots) restore(snapshots);
      toast.error(`L’ordre n’a pas pu être enregistré. ${errorMessage(error)}`);
    },
    onSuccess: () => toast.success('Ordre d’affichage enregistré.'),
    onSettled: refresh,
  });

  return { duplicate, publish, unpublish, remove, toggleMenu, reorder };
}
