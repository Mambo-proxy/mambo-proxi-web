'use client';

import { Copy, Eye, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { Switch } from '@/components/ui/switch';
import { Visual } from '@/components/ui/visual';
import { adminRoutes } from '@/lib/admin/routes';
import type { AdminServiceListItem } from '@/lib/api/schema';
import { formatNumber } from '@/lib/format/number';
import { DragHandle, SortableItem } from '../editor/sortable';
import { ActionMenu } from '../ui/action-menu';
import { ServiceStatusBadge } from './service-ui';

const iconButton =
  'flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main';

export type ServiceActions = {
  onPreview: (service: AdminServiceListItem) => void;
  onToggleMenu: (service: AdminServiceListItem, showInMenu: boolean) => void;
  onDuplicate: (service: AdminServiceListItem) => void;
  onToggleStatus: (service: AdminServiceListItem) => void;
  onDelete: (service: AdminServiceListItem) => void;
};

function RowActions({ service, actions }: { service: AdminServiceListItem; actions: ServiceActions }) {
  const published = service.status === 'PUBLISHED';
  return (
    <div className="flex items-center justify-end gap-2.5">
      <button
        type="button"
        aria-label={`Aperçu de la page ${service.name}`}
        onClick={() => actions.onPreview(service)}
        className={iconButton}
      >
        <Eye aria-hidden size={16} />
      </button>
      <Link
        href={`${adminRoutes.services}/${service.id}` as Route}
        aria-label={`Modifier ${service.name}`}
        className={iconButton}
      >
        <Pencil aria-hidden size={16} />
      </Link>
      <ActionMenu
        label={`Actions pour ${service.name}`}
        items={[
          { label: 'Dupliquer', icon: Copy, onSelect: () => actions.onDuplicate(service) },
          published
            ? { label: 'Dépublier', icon: Undo2, onSelect: () => actions.onToggleStatus(service) }
            : { label: 'Publier', icon: Send, onSelect: () => actions.onToggleStatus(service) },
          { label: 'Supprimer', icon: Trash2, danger: true, onSelect: () => actions.onDelete(service) },
        ]}
      />
    </div>
  );
}

/** Ligne du tableau des services (`88:10603`) : poignée, vignette, nom et URL, rubrique, demandes, statut, menu, actions. */
export function ServiceRow({ service, actions }: { service: AdminServiceListItem; actions: ServiceActions }) {
  return (
    <SortableItem
      as="tr"
      id={service.id}
      className="border-b border-border-default bg-neutral-0 last:border-b-0 hover:bg-neutral-50/60"
    >
      <td className="w-10 py-3.5 pl-5">
        <DragHandle label={service.name} className="-ml-2" />
      </td>
      <td className="py-3.5 pr-4 pl-1">
        <div className="flex min-w-0 items-center gap-3">
          <Visual
            visual={service.visual}
            sizes="56px"
            className="h-[42px] w-14 shrink-0 rounded-sm bg-orange-100"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
              {service.name}
            </span>
            <span className="truncate font-ui text-[12px] leading-4 text-text-subtle">{service.path}</span>
          </span>
          {service.isDemo && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-ui text-[11px] leading-4 font-semibold text-text-muted">
              Démo
            </span>
          )}
        </div>
      </td>
      <td className="w-[170px] px-4 py-3.5 font-ui text-[14px] leading-5 text-text-main">
        {service.category.name}
      </td>
      <td className="w-[120px] px-4 py-3.5 font-ui text-[14px] leading-5 text-text-main">
        {formatNumber(service.requests30d)}
      </td>
      <td className="w-[120px] px-4 py-3.5">
        <ServiceStatusBadge status={service.status} />
      </td>
      <td className="w-[110px] px-4 py-3.5">
        <Switch
          id={`menu-${service.id}`}
          checked={service.showInMenu}
          hideLabel
          label={`Afficher ${service.name} dans le menu`}
          onChange={(event) => actions.onToggleMenu(service, event.target.checked)}
        />
      </td>
      <td className="w-[130px] py-3.5 pr-5 pl-4">
        <RowActions service={service} actions={actions} />
      </td>
    </SortableItem>
  );
}

/** Carte d'un service en mobile (le tableau est masqué sous 768 px). */
export function ServiceCard({
  service,
  actions,
}: {
  service: AdminServiceListItem;
  actions: ServiceActions;
}) {
  return (
    <li className="flex flex-col gap-3 border-b border-border-default p-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Visual visual={service.visual} sizes="56px" className="h-[42px] w-14 shrink-0 rounded-sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">{service.name}</span>
          <span className="truncate font-ui text-[12px] leading-4 text-text-subtle">{service.path}</span>
        </div>
        <ServiceStatusBadge status={service.status} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-ui text-[12px] leading-4 text-text-muted">
          {service.category.name} · {formatNumber(service.requests30d)} demande
          {service.requests30d > 1 ? 's' : ''} (30 j)
        </p>
        <div className="flex items-center gap-2">
          <Switch
            id={`menu-card-${service.id}`}
            checked={service.showInMenu}
            hideLabel
            label={`Afficher ${service.name} dans le menu`}
            onChange={(event) => actions.onToggleMenu(service, event.target.checked)}
          />
          <RowActions service={service} actions={actions} />
        </div>
      </div>
    </li>
  );
}
