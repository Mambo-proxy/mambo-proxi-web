'use client';

import { ChevronDown } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

/** Tri des avis (`68:7357`) : pilule bordée, Inter Medium 14/20 ; le choix recharge la liste à la page 1. */
export function SortSelect({ value, baseQuery }: { value: 'recent' | 'rating'; baseQuery: string }) {
  const router = useRouter();
  return (
    <label className="relative inline-flex self-start">
      <span className="sr-only">Trier les avis</span>
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(baseQuery);
          if (event.target.value === 'rating') params.set('tri', 'notes');
          else params.delete('tri');
          params.delete('page');
          const query = params.toString();
          router.replace(`/avis-clients${query ? `?${query}` : ''}#avis` as Route, { scroll: false });
        }}
        className="cursor-pointer appearance-none rounded-full border border-border-strong bg-transparent py-2.5 pr-10 pl-4 font-ui text-[14px] leading-5 font-medium text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
      >
        <option value="recent">Plus récents</option>
        <option value="rating">Mieux notés</option>
      </select>
      <ChevronDown
        aria-hidden
        size={16}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-text-main"
      />
    </label>
  );
}
