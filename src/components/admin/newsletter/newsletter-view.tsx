'use client';

import { useQuery } from '@tanstack/react-query';
import { Download, Eye, LogOut, Mail, MousePointerClick, Users } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState } from '@/components/admin/ui/filters';
import { change, KpiCard } from '@/components/admin/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { downloadBlob } from '@/lib/admin/download';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import type { Campaign, NewsletterStats } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber, formatPercent, formatSmallPercent } from '@/lib/format/number';
import { CampaignComposer, campaignsKey, PreviewDialog } from './campaign-composer';
import { CampaignStatusBadge, campaignSubline, isEditable, openRate } from './campaign-labels';

const NEW = 'nouveau';

/** Envoi ouvert dans le compositeur (`?envoi=<id>`, ou `?envoi=nouveau-<jeton>` : un jeton par « Nouvel envoi »). */
function useSelection() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selected = params.get('envoi');
  function select(next: string | null) {
    router.replace(`${pathname}${next ? `?envoi=${next}` : ''}` as Route, { scroll: false });
  }
  return [selected, select] as const;
}

/** Actions de la barre supérieure (`94:11755`) : « Exporter les inscrits » et « Nouvel envoi ». */
export function NewsletterHeaderActions() {
  const [, select] = useSelection();
  const [pending, setPending] = useState(false);

  async function exportCsv() {
    setPending(true);
    try {
      const {
        data: blob,
        error,
        response,
      } = await browserApi.GET('/v1/admin/subscribers/export.csv', {
        parseAs: 'blob',
      });
      if (!response.ok || !blob) throw toApiError(error, response);
      downloadBlob(blob, `inscrits-newsletter-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void exportCsv()}
        disabled={pending}
        className={topbarSecondaryClass}
      >
        <Download aria-hidden size={16} />
        Exporter les inscrits
      </button>
      <button type="button" onClick={() => select(`${NEW}-${Date.now()}`)} className={topbarActionClass}>
        <Mail aria-hidden />
        Nouvel envoi
      </button>
    </>
  );
}

/**
 * Newsletter (`94:11838`) : indicateurs, envois (programmés, envoyés, brouillons) et compositeur ; par défaut, le
 * compositeur ouvre le prochain envoi programmé ou le dernier brouillon.
 */
export function NewsletterView() {
  const [selected, select] = useSelection();
  // Brouillon créé depuis « Nouvel envoi » : l'adresse passe à `?envoi=<id>` mais le compositeur garde sa saisie
  // (clé du jeton qui l'a créé).
  const [adopted, setAdopted] = useState<{ id: string; key: string } | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const campaigns = useQuery({
    queryKey: campaignsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/campaigns')),
  });
  const list = campaigns.data?.data;
  const fallback = list?.find(isEditable) ?? null;
  const isNew = selected?.startsWith(NEW) ?? false;
  const current = isNew ? null : (list?.find((item) => item.id === selected) ?? (selected ? null : fallback));
  const key = isNew ? selected! : selected && selected === adopted?.id ? adopted.key : (current?.id ?? NEW);

  return (
    <div className="flex flex-col gap-6">
      <NewsletterKpis stats={campaigns.data?.stats} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section aria-labelledby="campaigns-title" className="flex min-w-0 flex-col gap-4">
          <h2 id="campaigns-title" className="font-ui text-[16px] leading-6 font-semibold text-text-main">
            Envois
          </h2>
          <CampaignsTable
            campaigns={list}
            error={campaigns.isError && !campaigns.data}
            selected={current?.id ?? null}
            onOpen={(campaign) => (isEditable(campaign) ? select(campaign.id) : setPreviewing(campaign.id))}
          />
        </section>
        {list ? (
          <div className="xl:sticky xl:top-[107px]">
            <CampaignComposer
              key={key}
              campaign={current}
              onCreated={(id) => {
                if (!id) {
                  setAdopted(null);
                  select(null);
                  return;
                }
                setAdopted({ id, key });
                select(id);
              }}
            />
          </div>
        ) : (
          <Skeleton className="h-[640px] rounded-lg" />
        )}
      </div>
      <PreviewDialog open={previewing !== null} id={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

/** Indicateurs (`94:11690`) : inscrits (évolution du mois), taux d'ouverture (dernier envoi), clic, désinscriptions. */
function NewsletterKpis({ stats }: { stats: NewsletterStats | undefined }) {
  if (!stats)
    return (
      <div aria-hidden className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg md:h-[156px]" />
        ))}
      </div>
    );
  const percent = (value: number | null | undefined) => (value == null ? '—' : formatPercent(value / 100));
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      <KpiCard
        label="Inscrits"
        icon={Users}
        value={formatNumber(stats.subscribers)}
        change={change(stats.newThisMonth, (abs) => formatNumber(abs))}
        legend="ce mois-ci"
      />
      <KpiCard
        label="Taux d’ouverture"
        icon={Eye}
        value={percent(stats.averageOpenRate)}
        change={change(stats.lastOpenRateDelta, (abs) => `${formatNumber(Math.round(abs))}\u00A0pts`)}
        legend="dernier envoi"
      />
      <KpiCard label="Taux de clic" icon={MousePointerClick} value={percent(stats.averageClickRate)} />
      <KpiCard
        label="Désinscriptions"
        icon={LogOut}
        value={stats.unsubscribeRate == null ? '—' : formatSmallPercent(stats.unsubscribeRate / 100)}
      />
    </div>
  );
}

/** Colonnes (`94:11703`) : Objet, Destinataires 120, Ouverture 90, Statut 120 ; cartes en mobile. */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_120px] lg:grid-cols-[minmax(0,1fr)_120px_90px_120px]';
const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';

function CampaignsTable({
  campaigns,
  error,
  selected,
  onOpen,
}: {
  campaigns: Campaign[] | undefined;
  error: boolean;
  selected: string | null;
  onOpen: (campaign: Campaign) => void;
}) {
  return (
    <AdminCard className="overflow-hidden">
      <div role="table" aria-label="Envois de la newsletter">
        <div role="rowgroup" className="hidden md:block">
          <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
            <span role="columnheader" className={headerCell}>
              Objet
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Destinataires
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Ouverture
            </span>
            <span role="columnheader" className={headerCell}>
              Statut
            </span>
          </div>
        </div>
        <div role="rowgroup">
          {error ? (
            <div className="p-6">
              <EmptyState
                icon={<Mail size={24} />}
                title="Envois indisponibles"
                text="Le chargement a échoué."
              />
            </div>
          ) : !campaigns ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-4 last:border-b-0">
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            ))
          ) : campaigns.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Mail size={24} />} title="Aucun envoi" text="Rédigez votre premier envoi." />
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                role="row"
                className={cn(
                  COLUMNS,
                  'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:items-start max-md:justify-between max-md:gap-3',
                  selected === campaign.id && 'bg-orange-50',
                )}
              >
                <div role="cell" className="flex min-w-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => onOpen(campaign)}
                    aria-label={
                      isEditable(campaign)
                        ? `Modifier « ${campaign.subject} »`
                        : `Aperçu de « ${campaign.subject} »`
                    }
                    className="text-left font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
                  >
                    {campaign.subject}
                  </button>
                  <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                    {campaignSubline(campaign)}
                    {campaign.recipients > 0 && (
                      <span className="lg:hidden">
                        {' '}
                        · {formatNumber(campaign.recipients)} destinataires
                        {campaign.status === 'ENVOYEE' && ` · ${openRate(campaign)} d’ouverture`}
                      </span>
                    )}
                  </span>
                </div>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {campaign.recipients > 0 ? formatNumber(campaign.recipients) : '—'}
                </span>
                <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
                  {openRate(campaign)}
                </span>
                <span role="cell" className="shrink-0">
                  <CampaignStatusBadge status={campaign.status} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminCard>
  );
}
