import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Puce de filtre / choix (Partenaires `65:5845`, rubriques `70:8249`) : pilule px 14 py 9 (40 px),
 * Inter Medium 14/20 +0,5 %, bordure `border/strong` ; sélectionnée = fond `neutral/900`, texte blanc + coche.
 */
export const chipVariants = cva(
  [
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px]',
    'font-ui text-[14px] leading-5 font-medium tracking-[0.005em] whitespace-nowrap',
    'transition-colors duration-150 ease-standard [&_svg]:size-4 [&_svg]:shrink-0',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      selected: {
        true: 'border-neutral-900 bg-neutral-900 text-neutral-0',
        false: 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
      },
    },
    defaultVariants: { selected: false },
  },
);

type ChipProps = ComponentProps<'button'> & { selected?: boolean };

/** Puce bascule (filtre) : `aria-pressed` reflète l'état sélectionné. */
export function Chip({ selected = false, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    >
      {selected && <Check aria-hidden strokeWidth={2.5} />}
      {children}
    </button>
  );
}
