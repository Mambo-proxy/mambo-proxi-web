'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { Modal } from '@/components/ui/modal';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { AdminCategory } from '@/lib/api/schema';
import { DragHandle, SortableItem, SortableList } from '../editor/sortable';
import { categoriesKey, servicesKey } from './service-ui';

/** Dialogue « Gérer les rubriques » (`88:10597`) : ordre du menu et libellé de chaque rubrique. */
export function ManageCategoriesDialog({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: AdminCategory[];
}) {
  const client = useQueryClient();
  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      data(
        browserApi.PATCH('/v1/admin/categories/reorder', {
          body: { ids },
        }),
      ),
    onSuccess: () => {
      toast.success('Ordre des rubriques enregistré.');
      void client.invalidateQueries({ queryKey: categoriesKey });
      void client.invalidateQueries({ queryKey: servicesKey });
    },
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      data(
        browserApi.PATCH('/v1/admin/categories/{id}', { params: { path: { id } }, body: { name } as never }),
      ),
    onSuccess: () => {
      toast.success('Rubrique renommée.');
      void client.invalidateQueries({ queryKey: categoriesKey });
      void client.invalidateQueries({ queryKey: servicesKey });
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gérer les rubriques"
      description="Glissez les rubriques pour changer leur ordre sur le site. Le nom s’enregistre à la sortie du champ."
      maxWidth={560}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50"
          >
            Fermer
          </button>
        </div>
      }
    >
      <SortableList
        items={categories}
        getId={(category) => category.id}
        getLabel={(category) => category.name ?? category.id}
        onReorder={(next) => reorder.mutate(next.map((category) => category.id))}
        className="flex flex-col gap-2"
        renderItem={(category) => (
          <SortableItem
            key={category.id}
            id={category.id}
            className="flex items-center gap-2 rounded-md border border-border-default bg-neutral-0 p-2"
          >
            <DragHandle label={category.name ?? category.id} />
            <input
              aria-label={`Nom de la rubrique ${category.name ?? category.id}`}
              defaultValue={category.name ?? category.id}
              onBlur={(event) => {
                const name = event.target.value.trim();
                if (name && name !== category.name) rename.mutate({ id: category.id, name });
              }}
              className="min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-2 py-1.5 font-ui text-[14px] leading-5 text-text-main hover:border-border-default focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset"
            />
            <span className="shrink-0 pr-1 font-ui text-[12px] leading-4 text-text-muted">
              {category.serviceCount} service{category.serviceCount > 1 ? 's' : ''}
            </span>
          </SortableItem>
        )}
      />
    </Modal>
  );
}
