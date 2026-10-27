'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Handshake, Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MediaThumb } from '@/components/admin/editor/media-picker';
import { DragHandle, SortableItem, SortableList } from '@/components/admin/editor/sortable';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import {
  AdminCard,
  CompactSegmented,
  ContactAvatar,
  locationLabel,
  RequestStatusBadge,
} from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminPartner, PartnerCategory, RequestListItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format/date';
import { PARTNER_CATEGORY_LABELS, PartnerDialog } from './partner-dialog';
import { mergeOrder } from './partner-order';

export const partnersKey = ['partners', 'admin'] as const;
const partnerRequestsKey = ['requests', { type: 'PARTENARIAT' }] as const;

type Tab = 'logos' | 'demandes';
type Filter = PartnerCategory | 'TOUS';

function useTab() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get('onglet') === 'demandes' ? 'demandes' : 'logos';
  function setTab(next: Tab) {
    router.replace(`${pathname}${next === 'demandes' ? '?onglet=demandes' : ''}` as Route, { scroll: false });
  }
  return [tab, setTab] as const;
}

function useRefreshPartners() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: partnersKey });
}

const listPartners = () => data(browserApi.GET('/v1/admin/partners'));
const listPartnerRequests = () =>
  data(browserApi.GET('/v1/admin/requests', { params: { query: { type: 'PARTENARIAT', pageSize: 50 } } }));

/** Bouton « Ajouter un partenaire » de la barre supérieure (`93:22291`). */
export function AddPartnerButton() {
  // Absent sans `content:write`.
  const canWrite = useCan()('content:write');
  const [open, setOpen] = useState(false);
  const refresh = useRefreshPartners();
  if (!canWrite) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={topbarActionClass}>
        <Plus aria-hidden />
        Ajouter un partenaire
      </button>
      <PartnerDialog open={open} onClose={() => setOpen(false)} partner={null} onSaved={refresh} />
    </>
  );
}

/**
 * Partenaires (`93:22449`) : onglets « Logos affichés » / « Demandes de partenariat » (`?onglet=demandes`), filtre
 * par catégorie, grille de logos réordonnable (poignée, interrupteur d'affichage), tuile « Ajouter un logo ».
 */
export function PartnersView() {
  const [selectedTab, setTab] = useTab();
  const [filter, setFilter] = useState<Filter>('TOUS');
  // `GET /v1/admin/requests` exige `requests:read` (ou `requests:read-assigned`) : sans elle (rédacteur), pas
  // d'onglet des demandes.
  const canReadRequests = useCan()('requests:read', 'requests:read-assigned');
  const tab: Tab = canReadRequests ? selectedTab : 'logos';
  const partners = useQuery({ queryKey: partnersKey, queryFn: listPartners });
  const requests = useQuery({
    queryKey: partnerRequestsKey,
    queryFn: listPartnerRequests,
    enabled: canReadRequests,
  });

  return (
    <div className="flex flex-col gap-6">
      <ReadOnlyNotice permission="content:write" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusTabs
          label="Logos et demandes"
          tabs={[
            { value: 'logos', label: 'Logos affichés', count: partners.data?.length },
            ...(canReadRequests
              ? [
                  {
                    value: 'demandes' as const,
                    label: 'Demandes de partenariat',
                    count: requests.data?.meta.total,
                  },
                ]
              : []),
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'logos' && (
          <div className="max-w-full overflow-x-auto">
            <CompactSegmented<Filter>
              label="Catégorie"
              value={filter}
              onChange={setFilter}
              className="w-max"
              options={[
                { value: 'TOUS', label: 'Tous' },
                ...(Object.keys(PARTNER_CATEGORY_LABELS) as PartnerCategory[]).map((category) => ({
                  value: category,
                  label: PARTNER_CATEGORY_LABELS[category],
                })),
              ]}
            />
          </div>
        )}
      </div>
      {tab === 'logos' ? (
        <PartnersGrid partners={partners.data} filter={filter} error={partners.isError && !partners.data} />
      ) : (
        <PartnerRequests requests={requests.data?.data} error={requests.isError && !requests.data} />
      )}
    </div>
  );
}

function PartnersGrid({
  partners,
  filter,
  error,
}: {
  partners: AdminPartner[] | undefined;
  filter: Filter;
  error: boolean;
}) {
  const client = useQueryClient();
  const refresh = useRefreshPartners();
  // Sans `content:write` : logos consultés, ni ordre, ni affichage, ni ajout.
  const canWrite = useCan()('content:write');
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [adding, setAdding] = useState(false);

  const reorder = useMutation({
    mutationFn: (list: AdminPartner[]) =>
      data(
        browserApi.PATCH('/v1/admin/partners/reorder', { body: { ids: list.map((partner) => partner.id) } }),
      ),
    onMutate: (list) => client.setQueryData(partnersKey, list),
    onSettled: refresh,
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const toggle = useMutation({
    mutationFn: (partner: AdminPartner) =>
      data(
        browserApi.PATCH('/v1/admin/partners/{id}', {
          params: { path: { id: partner.id } },
          body: { visible: !partner.visible } as never,
        }),
      ),
    onMutate: (partner) =>
      client.setQueryData(partnersKey, (current: AdminPartner[] | undefined) =>
        current?.map((item) => (item.id === partner.id ? { ...item, visible: !item.visible } : item)),
      ),
    onSuccess: (partner) =>
      toast.success(
        partner.visible
          ? `${partner.name} est affiché sur le site.`
          : `${partner.name} n’est plus affiché sur le site.`,
      ),
    onSettled: refresh,
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const gridClass = 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4';

  if (error)
    return (
      <AdminCard className="p-6">
        <EmptyState
          icon={<Handshake size={24} />}
          title="Partenaires indisponibles"
          text="Le chargement a échoué."
        />
      </AdminCard>
    );
  if (!partners)
    return (
      <div aria-hidden className={gridClass}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-[220px] rounded-lg" />
        ))}
      </div>
    );

  const visible = filter === 'TOUS' ? partners : partners.filter((partner) => partner.category === filter);

  return (
    <>
      <SortableList
        items={visible}
        layout="grid"
        getId={(partner) => partner.id}
        getLabel={(partner) => partner.name}
        onReorder={(list) => reorder.mutate(mergeOrder(partners, list))}
        disabled={!canWrite}
        className={gridClass}
        after={
          canWrite && (
            <li>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex size-full min-h-[160px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-neutral-50 p-4 text-center transition-colors hover:bg-neutral-100 md:min-h-[236px]"
              >
                <Plus aria-hidden size={22} className="mb-1 text-icon-default" />
                <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                  Ajouter un logo
                </span>
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  PNG ou SVG, fond transparent
                </span>
              </button>
            </li>
          )
        }
        renderItem={(partner) => (
          <SortableItem key={partner.id} id={partner.id}>
            <PartnerCard
              partner={partner}
              canWrite={canWrite}
              onEdit={() => setEditing(partner)}
              onToggle={() => toggle.mutate(partner)}
            />
          </SortableItem>
        )}
      />
      <PartnerDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        partner={editing}
        onSaved={refresh}
        readOnly={!canWrite}
      />
      <PartnerDialog
        open={adding}
        onClose={() => setAdding(false)}
        partner={null}
        defaultCategory={filter === 'TOUS' ? null : filter}
        onSaved={refresh}
      />
    </>
  );
}

/**
 * Carte d'un logo (`93:22316`) : 266 × 220, padding 16 ; poignée et interrupteur, zone du logo 84 px `neutral/50`,
 * nom (ouvre la modale) et badge de catégorie.
 */
function PartnerCard({
  partner,
  canWrite,
  onEdit,
  onToggle,
}: {
  partner: AdminPartner;
  /** Sans `content:write` : interrupteur figé, la fiche s'ouvre en consultation. */
  canWrite: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <AdminCard className="flex h-full flex-col gap-3 p-3 md:p-4">
      <div className="flex h-6 items-center justify-between">
        <DragHandle label={partner.name} className="-ml-2 [&_svg]:size-4" />
        <Switch
          label={`Afficher ${partner.name} sur le site`}
          hideLabel
          checked={partner.visible}
          disabled={!canWrite}
          onChange={onToggle}
        />
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`${canWrite ? 'Modifier' : 'Consulter'} ${partner.name}`}
        className={cn(
          'flex h-[72px] items-center justify-center overflow-hidden rounded-md bg-neutral-50 transition-opacity hover:opacity-80 md:h-[84px]',
          !partner.visible && 'opacity-60',
        )}
      >
        {partner.logo ? (
          <MediaThumb
            image={partner.logo}
            className="size-full bg-transparent [&_img]:object-contain! [&_img]:p-3"
          />
        ) : (
          <span className="font-ui text-[14px] leading-5 font-medium text-text-muted">Logo</span>
        )}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
      >
        {partner.name}
      </button>
      <span className="w-fit rounded-[6px] bg-neutral-100 px-2 py-[3px] font-ui text-[12px] leading-4 text-text-muted">
        {partner.categoryLabel}
      </span>
    </AdminCard>
  );
}

/**
 * Onglet « Demandes de partenariat » (non maquetté) : demandes « Devenir partenaire » reçues par le site, ouvertes
 * dans le panneau de détail des Demandes.
 */
function PartnerRequests({ requests, error }: { requests: RequestListItem[] | undefined; error: boolean }) {
  if (error)
    return (
      <AdminCard className="p-6">
        <EmptyState
          icon={<Handshake size={24} />}
          title="Demandes indisponibles"
          text="Le chargement a échoué."
        />
      </AdminCard>
    );
  if (!requests)
    return (
      <AdminCard className="flex flex-col gap-2 p-5">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-sm" />
        ))}
      </AdminCard>
    );
  if (requests.length === 0)
    return (
      <AdminCard className="p-6">
        <EmptyState
          icon={<Handshake size={24} />}
          title="Aucune demande de partenariat"
          text="Les demandes envoyées depuis la page Partenaires du site apparaîtront ici."
        />
      </AdminCard>
    );
  return (
    <AdminCard className="overflow-hidden">
      <ul aria-label="Demandes de partenariat">
        {requests.map((request) => (
          <li key={request.id} className="border-b border-border-default last:border-b-0">
            <Link
              href={`${adminRoutes.requests}?type=PARTENARIAT&id=${request.id}` as Route}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-50 md:px-5"
            >
              <ContactAvatar name={request.contact.fullName} initials={request.contact.initials} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
                  {request.subject ?? 'Demande de partenariat'}
                </span>
                <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                  {request.contact.fullName} · {locationLabel(request.contact.city, request.contact.country)}{' '}
                  · {formatRelative(request.createdAt)}
                </span>
              </span>
              <RequestStatusBadge status={request.status} />
              <ChevronRight aria-hidden size={16} className="shrink-0 text-icon-default max-md:hidden" />
            </Link>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
