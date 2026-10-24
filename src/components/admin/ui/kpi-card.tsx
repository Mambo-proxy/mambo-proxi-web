'use client';

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { cn } from '@/lib/cn';

export type Change = { text: string; up: boolean };

/** Évolution d'un indicateur (« +0,1 », « +3 pts », « +64 ») ; rien si l'API ne la fournit pas. */
export function change(value: number | null | undefined, format: (abs: number) => string): Change | null {
  if (value == null) return null;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return { text: `${sign}${format(Math.abs(value))}`, up: value >= 0 };
}

/**
 * Carte d'indicateur des écrans Avis clients (`93:11084`) et Contacts & inscrits (`93:23025`) : libellé, icône
 * dans une pastille 32, valeur Fraunces 32, évolution et légende (masquées en mobile).
 */
export function KpiCard({
  label,
  icon: Icon,
  value,
  change,
  legend,
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
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
