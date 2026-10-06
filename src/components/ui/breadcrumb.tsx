import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { Fragment } from 'react';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

export type BreadcrumbItem = { label: string; href?: Route };

/**
 * Fil d'Ariane (Devis `70:8185`) : liens Inter Regular 13/16 +1 % `text/muted`,
 * page courante Inter SemiBold `text/main`, chevron 14 px. Le dernier élément est la page courante.
 */
export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 font-ui text-[13px] leading-4 tracking-[0.01em]">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className={cn(current ? 'font-semibold text-text-main' : 'text-text-muted')}>
                {current || !item.href ? (
                  <span aria-current={current ? 'page' : undefined}>{frenchTypography(item.label)}</span>
                ) : (
                  <Link href={item.href} className="rounded-xs hover:text-text-main hover:underline">
                    {frenchTypography(item.label)}
                  </Link>
                )}
              </li>
              {!current && (
                <li aria-hidden className="text-text-subtle">
                  <ChevronRight size={14} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
