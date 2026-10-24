'use client';

import { CircleCheck, FileText, Star, Users } from 'lucide-react';
import { AdminCard, CardTitle } from '@/components/admin/ui/admin-ui';
import { change, KpiCard } from '@/components/admin/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReviewStats } from '@/lib/api/schema';
import { formatNumber, formatPercent, formatRating } from '@/lib/format/number';

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
