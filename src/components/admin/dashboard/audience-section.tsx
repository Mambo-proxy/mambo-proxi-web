'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye, MousePointerClick, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AdminCard, CardTitle, CompactSegmented } from '@/components/admin/ui/admin-ui';
import { change, KpiCard } from '@/components/admin/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { AnalyticsSummary } from '@/lib/api/schema';
import { formatNumber, formatPercent } from '@/lib/format/number';
import { AudienceChart, count } from './audience-chart';

type Period = AnalyticsSummary['period'];

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
];

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
};

const percentChange = (value: number | null | undefined) =>
  change(value == null ? null : Math.round(value), (abs) => `${formatNumber(abs)}\u202F%`);

/** « Clics par action » : barres orange sur piste `neutral/100` (comme « Demandes par rubrique »), part du total. */
function ActionBars({ actions, period }: { actions: AnalyticsSummary['actions']; period: string }) {
  const rows = actions.filter((row) => row.count > 0);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <AdminCard aria-labelledby="audience-actions" className="flex flex-col gap-[18px] self-start p-5 md:p-6">
      <CardTitle id="audience-actions" level={3} title="Clics par action" subtitle={period} />
      {rows.length === 0 ? (
        <p className="font-ui text-[14px] leading-5 text-text-muted">Aucun clic mesuré sur la période.</p>
      ) : (
        <ul className="flex flex-col gap-[18px]">
          {rows.map((row) => (
            <li key={row.action} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 font-ui text-[14px] leading-5 text-text-main">
                <span>{row.label ?? row.action}</span>
                <span>
                  <span className="font-semibold">{formatNumber(row.count)}</span>
                  <span className="text-text-muted"> · {formatPercent(row.count / total)}</span>
                </span>
              </div>
              <span aria-hidden className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <span
                  className="block h-full rounded-full bg-brand-primary"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

/** « Pages les plus vues » : tableau en desktop, liste en mobile ; adresse interne (française) sous le titre. */
function TopPages({ pages, period }: { pages: AnalyticsSummary['topPages']; period: string }) {
  return (
    <AdminCard aria-labelledby="audience-pages" className="flex min-w-0 flex-col gap-4 p-5 md:p-6">
      <CardTitle id="audience-pages" level={3} title="Pages les plus vues" subtitle={period} />
      {pages.length === 0 ? (
        <p className="font-ui text-[14px] leading-5 text-text-muted">Aucune page vue sur la période.</p>
      ) : (
        <>
          <ol className="flex flex-col md:hidden">
            {pages.map((page) => (
              <li
                key={page.path}
                className="flex items-center justify-between gap-3 border-b border-border-default py-2.5 last:border-b-0"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
                    {page.title}
                  </span>
                  <span className="truncate font-ui text-[12px] leading-4 text-text-muted">{page.path}</span>
                </span>
                <span className="shrink-0 font-ui text-[13px] leading-5 text-text-main">
                  {count(page.pageViews, 'vue', 'vues')}
                </span>
              </li>
            ))}
          </ol>
          <div
            role="region"
            aria-labelledby="audience-pages"
            tabIndex={0}
            className="overflow-x-auto focus-visible:focus-ring max-md:hidden"
          >
            <table className="w-full min-w-[520px] border-collapse font-ui text-[14px] leading-5 text-text-main">
              <thead>
                <tr className="border-b border-border-default text-left text-[12px] leading-4 font-semibold text-text-muted">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">
                    Page
                  </th>
                  <th scope="col" className="w-[110px] py-2.5 pl-4 text-right font-semibold">
                    Pages vues
                  </th>
                  <th scope="col" className="w-[110px] py-2.5 pl-4 text-right font-semibold">
                    Visiteurs
                  </th>
                  <th scope="col" className="w-[110px] py-2.5 pl-4 text-right font-semibold">
                    Clics
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.path} className="border-b border-border-default last:border-b-0">
                    <th scope="row" className="py-3 pr-4 text-left font-normal">
                      <span className="flex flex-col">
                        <span className="font-semibold">{page.title}</span>
                        <span className="text-[12px] leading-4 text-text-muted">{page.path}</span>
                      </span>
                    </th>
                    <td className="py-3 pl-4 text-right">{formatNumber(page.pageViews)}</td>
                    <td className="py-3 pl-4 text-right">{formatNumber(page.visitors)}</td>
                    <td className="py-3 pl-4 text-right">{formatNumber(page.actions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminCard>
  );
}

function AudienceSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg last:max-lg:col-span-2 md:h-[156px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[696fr_400fr]">
        <Skeleton className="h-[362px] rounded-lg" />
        <Skeleton className="h-[362px] rounded-lg max-xl:hidden" />
      </div>
    </div>
  );
}

/**
 * Section « Audience » du tableau de bord (permission `analytics:read`) : mesure d'audience interne du site
 * (`GET /v1/admin/analytics/summary`) sur 7, 30 ou 90 jours — visiteurs uniques (avec consentement), pages vues,
 * clics sur les actions, visites par jour, clics par action, pages les plus vues. Écran non maquetté, construit
 * avec les cartes et indicateurs du tableau de bord. `aside` : carte affichée à côté des pages les plus vues (équipe
 * connectée).
 */
export function AudienceSection({ aside }: { aside?: ReactNode }) {
  const [period, setPeriod] = useState<Period>('30d');
  const query = useQuery({
    queryKey: ['analytics-summary', period],
    queryFn: () => data(browserApi.GET('/v1/admin/analytics/summary', { params: { query: { period } } })),
    placeholderData: (previous) => previous,
  });
  const summary = query.data;
  const label = PERIOD_LABELS[period];
  const consentRate = summary?.totals.consentRate;

  return (
    <section aria-labelledby="audience" className="flex flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2
            id="audience"
            className="font-ui text-[15px] leading-6 font-semibold text-text-main md:text-[18px] md:leading-7"
          >
            Audience
          </h2>
          <p className="font-ui text-[13px] leading-5 text-text-muted">
            Mesure interne du site, sans cookie · {label}
          </p>
        </div>
        <CompactSegmented
          label="Période de l’audience"
          value={period}
          options={PERIODS}
          onChange={setPeriod}
        />
      </div>

      {query.isError && !summary ? (
        <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
          <p className="font-ui text-[15px] leading-6 text-text-main">
            Impossible de charger les statistiques d’audience pour le moment.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-[10px] border border-border-strong px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold"
          >
            Réessayer
          </button>
        </AdminCard>
      ) : !summary ? (
        <AudienceSkeleton />
      ) : null}
      {/* Statistiques indisponibles : la carte latérale reste affichée seule. */}
      {!summary && aside && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[696fr_400fr]">{aside}</div>}
      {summary && (
        <div aria-busy={query.isFetching} className="flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-3">
            <KpiCard
              label="Visiteurs uniques"
              icon={Users}
              value={formatNumber(summary.totals.visitors.value ?? 0)}
              change={percentChange(summary.totals.visitors.deltaPercent)}
              legend="avec consentement"
            />
            <KpiCard
              label="Pages vues"
              icon={Eye}
              value={formatNumber(summary.totals.pageViews.value ?? 0)}
              change={percentChange(summary.totals.pageViews.deltaPercent)}
              legend="vs période précédente"
            />
            <div className="max-lg:col-span-2">
              <KpiCard
                label="Clics sur les actions"
                icon={MousePointerClick}
                value={formatNumber(summary.totals.actions.value ?? 0)}
                change={percentChange(summary.totals.actions.deltaPercent)}
                legend="devis, WhatsApp, appels…"
              />
            </div>
          </div>
          {consentRate != null && (
            <p className="-mt-1 font-ui text-[12px] leading-4 text-text-muted md:-mt-2">
              Visiteurs uniques comptés seulement avec consentement ({formatPercent(consentRate / 100)} des
              pages vues) ; pages vues et clics comptés anonymement pour tous les visiteurs.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[696fr_400fr]">
            <AudienceChart series={summary.series} period={label} />
            <ActionBars actions={summary.actions} period={label} />
          </div>

          {aside ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[696fr_400fr] xl:items-start">
              <TopPages pages={summary.topPages} period={label} />
              {aside}
            </div>
          ) : (
            <TopPages pages={summary.topPages} period={label} />
          )}
        </div>
      )}
    </section>
  );
}
