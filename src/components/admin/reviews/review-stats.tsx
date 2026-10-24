'use client';

import { CircleCheck, FileText, Star, TrendingDown, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { AdminCard, CardTitle } from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReviewStats } from '@/lib/api/schema';
import { formatNumber, formatPercent, formatRating } from '@/lib/format/number';
import { cn } from '@/lib/cn';

type Change = { text: string; up: boolean };

/** Évolution sur 30 jours (« +0,1 », « +3 pts ») ; rien si l'API ne la fournit pas. */
function change(value: number | null | undefined, format: (abs: number) => string): Change | null {
  if (value == null) return null;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return { text: `${sign}${format(Math.abs(value))}`, up: value >= 0 };
}

function KpiCard({
  label,
  icon: Icon,
  value,
  change,
  legend,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  change?: Change | null;
  legend?: string;
}) {
  const Trend = change?.up === false ? TrendingDown : TrendingUp;
  return (
    <AdminCard className="flex flex-col gap-1.5 p-3.5 md:min-h-[156px] md:gap-3 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-ui text-[12px] leading-4 text-text-muted md:text-[13px] md:leading-5 md:font-medium">
          {label}
        </p>
        <span
          aria-hidden
          className="flex items-center justify-center text-icon-default md:size-8 md:rounded-[9px] md:bg-neutral-50"
        >
          <Icon className="size-3.5 md:size-4" />
        </span>
      </div>
      <p className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-text-main md:text-[32px] md:leading-[38px]">
        {value}
      </p>
      {(change || legend) && (
        <p className="flex items-center gap-2 font-ui text-[12px] leading-4 text-text-muted max-md:hidden">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 font-semibold',
                change.up ? 'bg-vert-50 text-vert-700' : 'bg-orange-50 text-orange-700',
              )}
            >
              <Trend aria-hidden size={12} />
              {change.text}
            </span>
          )}
          {legend}
        </p>
      )}
    </AdminCard>
  );
}

/**
 * Indicateurs des avis (`93:11084`) : note moyenne, recommandation (notes de 9 ou 10), taux de réponse au
 * questionnaire, avis publiés, avec l'évolution sur 30 jours. Même carte que les KPI du tableau de bord ; 2 colonnes
 * en mobile.
 */
export function ReviewKpis({ stats }: { stats: ReviewStats | undefined }) {
  if (!stats)
    return (
      <div aria-hidden className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg md:h-[156px]" />
        ))}
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
      <KpiCard
        label="Note moyenne"
        icon={Star}
        value={`${formatRating(stats.average)} / 5`}
        change={change(stats.averageDelta, formatRating)}
        legend="sur 30 jours"
      />
      <KpiCard
        label="Recommandation"
        icon={Users}
        value={stats.recommendationRate == null ? '—' : formatPercent(stats.recommendationRate / 100)}
        change={change(stats.recommendationDelta, (abs) => `${formatNumber(Math.round(abs))}\u00A0pts`)}
        legend="notes de 9 ou 10"
      />
      <KpiCard label="Taux de réponse" icon={FileText} value={formatPercent(stats.responseRate / 100)} />
      <KpiCard label="Avis publiés" icon={CircleCheck} value={formatNumber(stats.published)} />
    </div>
  );
}

/** « Répartition des notes » (`93:11334`) : barres orange sur piste `neutral/100`, pourcentages. */
export function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const rows = (['5', '4', '3', '2', '1'] as const).map((note) => ({
    note,
    count: stats.distribution[note],
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <AdminCard aria-labelledby="rating-distribution" className="flex flex-col gap-3 p-[22px]">
      <CardTitle
        id="rating-distribution"
        title="Répartition des notes"
        subtitle={`${formatNumber(total)} avis`}
      />
      <ul className="flex flex-col gap-2.5">
        {rows.map((row) => {
          const ratio = total ? row.count / total : 0;
          return (
            <li key={row.note} className="flex items-center gap-2.5 font-ui text-[12px] leading-4">
              <span className="sr-only">
                {row.note} étoile{row.note === '1' ? '' : 's'}
                {'\u00A0'}: {formatPercent(ratio)} ({row.count} avis)
              </span>
              <span aria-hidden className="w-6 shrink-0 font-semibold text-text-main">
                {row.note}
                {'\u00A0'}★
              </span>
              <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <span
                  className="block h-full rounded-full bg-brand-primary"
                  style={{ width: `${ratio * 100}%` }}
                />
              </span>
              <span aria-hidden className="w-9 shrink-0 text-right text-text-muted">
                {formatPercent(ratio)}
              </span>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}
