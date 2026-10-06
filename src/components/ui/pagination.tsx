import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

export type PageItem = number | 'ellipsis';

/**
 * Pages à afficher : la première, la dernière, la page courante et ses voisines,
 * séparées par « … » (maquette Avis clients : `1 2 3 … 12`).
 */
export function paginationRange(current: number, total: number): PageItem[] {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const start = current >= total ? total - 2 : Math.max(2, current - 1);
  const end = current <= 1 ? 3 : Math.min(total - 1, current + 1);
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return [
    1,
    ...(start > 2 ? (['ellipsis'] as const) : []),
    ...middle,
    ...(end < total - 1 ? (['ellipsis'] as const) : []),
    total,
  ];
}

type PaginationProps = {
  page: number;
  totalPages: number;
  /** URL d'une page (ex. `?page=2` en conservant les filtres). */
  hrefFor: (page: number) => Route;
  className?: string;
};

const cell =
  'flex size-10 items-center justify-center rounded-md border font-ui text-[14px] leading-5 font-medium tabular-nums';

/** Pagination (Avis clients `68:7508`) : cases 40 × 40 rayon 12, page active fond `neutral/900`. */
export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {paginationRange(page, totalPages).map((item, index) => (
          <li key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              <span aria-hidden className={cn(cell, 'border-border-default bg-neutral-0 text-text-subtle')}>
                …
              </span>
            ) : item === page ? (
              <span
                aria-current="page"
                className={cn(cell, 'border-neutral-900 bg-neutral-900 text-neutral-0')}
              >
                <span className="sr-only">Page{'\u00A0'}</span>
                {item}
              </span>
            ) : (
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                className={cn(cell, 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-100')}
              >
                {item}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
