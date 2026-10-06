import { Check } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: ReactNode;
  /** Classe du libellé (consentements : Inter 14/20 `text/muted`). */
  labelClassName?: string;
};

/**
 * Case à cocher (formulaires) : 20 × 20, bordure 1,5 px `border/strong`, rayon 6 ;
 * cochée = fond orange + coche foncée. Jamais cochée par défaut pour un consentement (RGPD).
 */
export function Checkbox({ label, labelClassName, className, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn('group/checkbox flex cursor-pointer items-start gap-3', className)}>
      <span className="relative mt-px flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className={cn(
            'peer size-5 cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-border-strong bg-neutral-0',
            'transition-colors duration-150 checked:border-brand-primary checked:bg-brand-primary',
            'disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-feedback-error',
          )}
          {...props}
        />
        <Check
          aria-hidden
          size={14}
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto text-text-on-primary opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className={cn('font-ui text-[14px] leading-5 text-text-muted', labelClassName)}>{label}</span>
    </label>
  );
}
