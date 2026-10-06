import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Badge de statut (back-office `_data-summary` §2) : pilule px 10 py 4, pastille 6 px, Inter SemiBold 12.
 * Palettes : orange, vert, gris foncé, gris, gris clair ; rouge pour les refus et erreurs.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        orange: 'bg-orange-50 text-text-brand [--dot:var(--mp-color-brand-primary)]',
        green: 'bg-vert-50 text-vert-700 [--dot:var(--mp-color-vert-500)]',
        dark: 'bg-neutral-100 text-neutral-800 [--dot:var(--mp-color-neutral-800)]',
        gray: 'bg-neutral-100 text-text-muted [--dot:var(--mp-color-neutral-400)]',
        light: 'bg-neutral-100 text-text-subtle [--dot:var(--mp-color-neutral-300)]',
        red: 'bg-feedback-error-subtle text-feedback-error [--dot:var(--mp-color-feedback-error)]',
      },
    },
    defaultVariants: { tone: 'gray' },
  },
);

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { dot?: boolean };

export function Badge({ tone, dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--dot)" />}
      {children}
    </span>
  );
}
