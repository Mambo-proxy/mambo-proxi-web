'use client';

import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { paginationRange } from '@/components/ui/pagination';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';

/**
 * Filtre déroulant du back-office (Demandes `87:10955`) : bouton blanc, bordure `border/default`, rayon 10,
 * padding 9/12, Inter Medium 13/20, chevron 14. Liste native (accessible, adaptée au mobile).
 */
export function FilterSelect({
  label,
  className,
  children,
  ...props
}: ComponentProps<'select'> & { label: string; children: ReactNode }) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={label}
        className="h-[40px] w-full cursor-pointer appearance-none rounded-[10px] border border-border-default bg-neutral-0 py-[9px] pr-8 pl-3 font-ui text-[13px] leading-5 font-medium text-text-main hover:bg-neutral-50 focus-visible:border-brand-primary"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        size={14}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-icon-default"
      />
    </div>
  );
}

/** Champ de recherche d'une liste (même gabarit que les filtres), avec bouton d'effacement. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        size={14}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-icon-default"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="h-[40px] w-full rounded-[10px] border border-border-default bg-neutral-0 pr-8 pl-8 font-ui text-[13px] leading-5 text-text-main placeholder:text-text-muted focus-visible:border-brand-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100"
        >
          <X aria-hidden size={14} />
        </button>
      )}
    </div>
  );
}

type StatusTab<T extends string> = { value: T; label: string; count?: number };

/**
 * Onglets de statut avec compteurs (Demandes `87:10934`) : conteneur `neutral/100` rayon 12 padding 4 ; onglet
 * padding 7/12 rayon 9, Inter 13/20 ; compteur en pilule (orange sur l'onglet actif). Défilement horizontal en
 * mobile.
 */
export function StatusTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  className,
}: {
  label: string;
  tabs: StatusTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('max-w-full overflow-x-auto', className)}>
      <div role="tablist" aria-label={label} className="flex w-max gap-1 rounded-md bg-neutral-100 p-1">
        {tabs.map((tab, index) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => {
                const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (!delta) return;
                event.preventDefault();
                const next = tabs[(index + delta + tabs.length) % tabs.length];
                if (!next) return;
                onChange(next.value);
                (
                  event.currentTarget.parentElement?.children[tabs.indexOf(next)] as HTMLElement | undefined
                )?.focus();
              }}
              className={cn(
                'flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 font-ui text-[13px] leading-5 tracking-[0.005em] whitespace-nowrap',
                active
                  ? 'bg-neutral-0 font-semibold text-text-main shadow-1'
                  : 'font-medium text-text-muted hover:text-text-main',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-[7px] py-px font-ui text-[11px] leading-4 font-semibold',
                    active ? 'bg-orange-50 text-orange-700' : 'bg-neutral-200 text-text-muted',
                  )}
                >
                  {formatNumber(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Pied de liste paginée (Demandes `87:11116`) : « Affichage de 1 à 8 sur 58 demandes » et boutons 30 × 30 rayon 8
 * (page courante en noir).
 */
export function ListPagination({
  page,
  pageSize,
  total,
  totalPages,
  noun,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Nom au pluriel, ex. « demandes ». */
  noun: string;
  onPage: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const button =
    'flex size-[30px] items-center justify-center rounded-sm border font-ui text-[12px] leading-4 font-semibold disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default px-5 py-3">
      <p className="font-ui text-[12px] leading-4 text-text-muted" aria-live="polite">
        Affichage de {formatNumber(from)} à {formatNumber(to)} sur {formatNumber(total)} {noun}
      </p>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Page précédente"
            className={cn(button, 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50')}
          >
            <ChevronLeft aria-hidden size={14} />
          </button>
          {paginationRange(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`e${index}`} aria-hidden className="px-1 font-ui text-[12px] text-text-muted">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPage(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  button,
                  item === page
                    ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                    : 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50',
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Page suivante"
            className={cn(button, 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50')}
          >
            <ChevronRight aria-hidden size={14} />
          </button>
        </nav>
      )}
    </div>
  );
}

/** État vide d'une liste : icône, message et action éventuelle. */
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-icon-default"
      >
        {icon}
      </span>
      <p className="font-ui text-[15px] leading-6 font-semibold text-text-main">{title}</p>
      {text && <p className="max-w-[360px] font-ui text-[14px] leading-5 text-text-muted">{text}</p>}
      {action}
    </div>
  );
}
