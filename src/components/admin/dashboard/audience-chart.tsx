'use client';

import { useState, type PointerEvent } from 'react';
import { AdminCard, CardTitle } from '@/components/admin/ui/admin-ui';
import type { AnalyticsSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatDayMonth, formatWeekdayDate } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';

const CHART_HEIGHT = 220;
/** Repère de l'abscisse (largeur arbitraire : le tracé s'étire à la largeur de la carte). */
const WIDTH = 1000;

/** Graduations « rondes » de l'axe vertical (1, 2 ou 5 × 10ⁿ, 4 intervalles environ). */
function ticksFor(max: number): number[] {
  const raw = Math.max(1, max) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 5, 10].find((factor) => factor * magnitude >= raw) ?? 10) * magnitude;
  const top = Math.max(step, Math.ceil(max / step) * step);
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

/** « 1 page vue », « 1 240 pages vues ». */
export const count = (value: number, one: string, many: string) =>
  `${formatNumber(value)}\u00A0${value > 1 ? many : one}`;

/** Date `2026-10-24` interprétée à midi UTC : même jour affiché quel que soit le fuseau. */
const noon = (date: string) => `${date}T12:00:00.000Z`;

/**
 * « Visites par jour » : pages vues (aire orange) et visiteurs uniques (ligne verte) sur la période ; au survol, un
 * repère vertical et une info-bulle sombre (comme « Demandes reçues ») donnent les valeurs du jour. Les valeurs sont
 * aussi données dans un tableau réservé aux lecteurs d'écran.
 */
export function AudienceChart({ series, period }: { series: AnalyticsSummary['series']; period: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const ticks = ticksFor(Math.max(...series.map((point) => point.pageViews), 1));
  const top = ticks.at(-1) ?? 1;
  const last = Math.max(1, series.length - 1);
  const x = (index: number) => (index / last) * WIDTH;
  const y = (value: number) => CHART_HEIGHT - (value / top) * CHART_HEIGHT;
  const line = (key: 'pageViews' | 'visitors') =>
    series
      .map((point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`)
      .join('');
  const area = `${line('pageViews')}L${WIDTH},${CHART_HEIGHT}L0,${CHART_HEIGHT}Z`;
  // 6 dates au plus sous l'axe, réparties sur la période.
  const labelEvery = Math.max(1, Math.ceil(series.length / 6));
  const point = hovered == null ? null : series[hovered];

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
    setHovered(Math.min(series.length - 1, Math.max(0, Math.round(ratio * last))));
  }

  return (
    <AdminCard aria-labelledby="audience-chart" className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CardTitle id="audience-chart" level={3} title="Visites par jour" subtitle={period} />
        <div className="flex items-center gap-4 font-ui text-[12px] leading-4 text-text-muted">
          <p className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-[3px] bg-brand-primary" />
            Pages vues
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-3 rounded-full bg-vert-600" />
            Visiteurs uniques
          </p>
        </div>
      </div>

      <div aria-hidden className="relative pl-12" style={{ height: CHART_HEIGHT + 30 }}>
        {/* Graduations et lignes horizontales. */}
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute right-0 left-0 flex items-center gap-3"
            style={{ bottom: 30 + (tick / top) * CHART_HEIGHT - 8 }}
          >
            <span className="w-9 text-right font-ui text-[11px] leading-4 text-text-muted">
              {formatNumber(tick)}
            </span>
            <span className="h-px flex-1 bg-border-default" />
          </div>
        ))}

        <div
          className="absolute right-0 bottom-[30px] left-12 touch-none"
          style={{ height: CHART_HEIGHT }}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            <path d={area} className="fill-orange-50" />
            <path
              d={line('pageViews')}
              fill="none"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className="stroke-brand-primary"
            />
            <path
              d={line('visitors')}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="stroke-vert-600"
            />
          </svg>

          {point && hovered != null && (
            <>
              <span
                className="absolute top-0 bottom-0 w-px bg-neutral-900/30"
                style={{ left: `${(hovered / last) * 100}%` }}
              />
              <span
                className="absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-neutral-0 bg-brand-primary"
                style={{ left: `${(hovered / last) * 100}%`, bottom: `${(point.pageViews / top) * 100}%` }}
              />
              <span
                className="absolute z-10 flex flex-col rounded-[10px] bg-neutral-900 px-3 py-2 whitespace-nowrap"
                style={{
                  bottom: `calc(${(point.pageViews / top) * 100}% + 12px)`,
                  ...(hovered / last > 0.6
                    ? { right: `${(1 - hovered / last) * 100}%` }
                    : { left: `${(hovered / last) * 100}%` }),
                }}
              >
                <span className="font-ui text-[11px] leading-4 text-neutral-300">
                  {formatWeekdayDate(noon(point.date))}
                </span>
                <span className="font-ui text-[14px] leading-5 font-semibold text-neutral-0">
                  {count(point.pageViews, 'page vue', 'pages vues')}
                </span>
                <span className="font-ui text-[12px] leading-4 text-neutral-300">
                  {count(point.visitors, 'visiteur', 'visiteurs')} · {count(point.actions, 'clic', 'clics')}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Dates sous l'axe. */}
        <div className="absolute right-0 bottom-0 left-12 h-4">
          {series.map((item, index) => {
            const isLast = index === series.length - 1;
            // Dernier jour toujours affiché ; la date régulière qui le précède de trop près est omise.
            const shown = isLast || (index % labelEvery === 0 && series.length - 1 - index >= labelEvery / 2);
            if (!shown) return null;
            return (
              <span
                key={item.date}
                className={cn(
                  'absolute font-ui text-[11px] leading-4 whitespace-nowrap text-text-muted',
                  index === 0 ? '' : isLast ? '-translate-x-full' : '-translate-x-1/2',
                )}
                style={{ left: `${(index / last) * 100}%` }}
              >
                {formatDayMonth(noon(item.date))}
              </span>
            );
          })}
        </div>
      </div>

      <div className="sr-only">
        <table>
          <caption>Visites par jour ({period.toLowerCase()})</caption>
          <thead>
            <tr>
              <th scope="col">Jour</th>
              <th scope="col">Pages vues</th>
              <th scope="col">Visiteurs uniques</th>
              <th scope="col">Clics sur les actions</th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => (
              <tr key={item.date}>
                <th scope="row">{formatWeekdayDate(noon(item.date))}</th>
                <td>{item.pageViews}</td>
                <td>{item.visitors}</td>
                <td>{item.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
