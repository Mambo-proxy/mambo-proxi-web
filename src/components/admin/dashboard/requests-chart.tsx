'use client';

import { useState } from 'react';
import { AdminCard, CardTitle } from '@/components/admin/ui/admin-ui';
import type { Dashboard } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';

const CHART_HEIGHT = 220;

/** Graduations « rondes » de l'axe vertical (maquette : 0, 5, 10, 15). */
function ticksFor(max: number): number[] {
  const step = max <= 20 ? 5 : max <= 60 ? 10 : max <= 150 ? 25 : 50;
  const top = Math.max(step, Math.ceil(max / step) * step);
  return Array.from({ length: top / step + 1 }, (_, index) => index * step);
}

const PERIOD_LABELS: Record<Dashboard['range'], { subtitle: string; point: (label: string) => string }> = {
  '7d': { subtitle: 'Par jour, toutes rubriques confondues', point: (label) => label },
  '30d': {
    subtitle: 'Par semaine, toutes rubriques confondues',
    point: (label) => label.replace(/^S/, 'Semaine '),
  },
  '12m': { subtitle: 'Par mois, toutes rubriques confondues', point: (label) => label },
};

/**
 * « Demandes reçues » (`85:10445`) : barres 30 px coins hauts 4 px `orange/300`, période en cours en orange plein ;
 * au survol, la barre passe en orange et une info-bulle sombre affiche la période et le nombre de demandes.
 * Les valeurs sont aussi données dans un tableau réservé aux lecteurs d'écran.
 */
export function RequestsChart({
  series,
  range,
}: {
  series: Dashboard['requestsSeries'];
  range: Dashboard['range'];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const ticks = ticksFor(Math.max(...series.map((point) => point.count), 1));
  const top = ticks.at(-1) ?? 1;
  const labels = PERIOD_LABELS[range];
  const highlighted = hovered ?? series.length - 1;

  return (
    <AdminCard aria-labelledby="requests-chart" className="flex min-w-0 flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <CardTitle id="requests-chart" title="Demandes reçues" subtitle={labels.subtitle} />
        <p className="flex items-center gap-2 font-ui text-[12px] leading-4 text-text-muted">
          <span aria-hidden className="size-2.5 rounded-[3px] bg-brand-primary" />
          Demandes
        </p>
      </div>

      <div aria-hidden className="relative pl-10" style={{ height: CHART_HEIGHT + 30 }}>
        {/* Graduations et lignes horizontales. */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute right-0 left-0 flex items-center gap-3"
            style={{ bottom: 30 + (tick / top) * CHART_HEIGHT - 8 }}
          >
            <span className="w-7 text-right font-ui text-[11px] leading-4 text-text-muted">{tick}</span>
            <span className="h-px flex-1 bg-border-default" />
          </div>
        ))}
        {/* Barres. */}
        <div
          className="absolute right-0 bottom-[30px] left-10 flex items-end justify-around"
          style={{ height: CHART_HEIGHT }}
        >
          {series.map((point, index) => (
            <div
              key={point.start}
              className="relative flex h-full w-[30px] items-end justify-center"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={cn(
                  'block w-full rounded-t-[4px] transition-colors duration-150',
                  index === highlighted ? 'bg-brand-primary' : 'bg-orange-300',
                )}
                style={{ height: `${(point.count / top) * 100}%` }}
              />
              {hovered === index && (
                <span
                  className="absolute z-10 flex flex-col rounded-[10px] bg-neutral-900 px-3 py-2 whitespace-nowrap"
                  style={{ bottom: `calc(${(point.count / top) * 100}% + 8px)` }}
                >
                  <span className="font-ui text-[11px] leading-4 text-neutral-300">
                    {labels.point(point.label)}
                  </span>
                  <span className="font-ui text-[14px] leading-5 font-semibold text-neutral-0">
                    {formatNumber(point.count)} demande{point.count > 1 ? 's' : ''}
                  </span>
                </span>
              )}
              <span className="absolute -bottom-[26px] font-ui text-[11px] leading-4 text-text-muted">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Demandes reçues ({labels.subtitle.toLowerCase()})</caption>
        <thead>
          <tr>
            <th scope="col">Période</th>
            <th scope="col">Demandes</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.start}>
              <th scope="row">{labels.point(point.label)}</th>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
