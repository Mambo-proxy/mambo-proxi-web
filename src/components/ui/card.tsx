import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Carte : fond blanc, bordure `border/default`. Rayons des maquettes : 20 (calendrier, note),
 * 24 (cartes avis, services), 28 (formulaires, témoignages, newsletter).
 */
export const cardVariants = cva('border bg-neutral-0', {
  variants: {
    radius: { md: 'rounded-[20px]', lg: 'rounded-xl', xl: 'rounded-[28px]' },
    padding: { none: '', sm: 'p-5', md: 'p-7', lg: 'p-8', xl: 'p-10' },
    tone: {
      default: 'border-border-default',
      muted: 'border-border-default bg-neutral-50',
      dark: 'border-neutral-800 bg-neutral-800 text-neutral-0',
    },
    elevated: { true: 'shadow-2' },
  },
  defaultVariants: { radius: 'lg', padding: 'md', tone: 'default' },
});

type CardProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>;

export function Card({ className, radius, padding, tone, elevated, ...props }: CardProps) {
  return <div className={cn(cardVariants({ radius, padding, tone, elevated }), className)} {...props} />;
}
