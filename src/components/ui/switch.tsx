import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SwitchProps = Omit<ComponentProps<'input'>, 'type' | 'role'> & {
  label: ReactNode;
  /** Masque le libellé visuellement (tableaux du back-office) tout en le gardant pour les lecteurs d'écran. */
  hideLabel?: boolean;
};

/** Interrupteur du back-office : 40 × 24, activé `vert/500` #7DB928, désactivé `border/strong` #CFCAC3. */
export function Switch({ label, hideLabel = false, className, id, ...props }: SwitchProps) {
  return (
    <label htmlFor={id} className={cn('inline-flex cursor-pointer items-center gap-3', className)}>
      <span className="relative inline-flex h-6 w-10 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={cn(
            'peer h-6 w-10 cursor-pointer appearance-none rounded-full bg-border-strong transition-colors duration-150',
            'checked:bg-vert-500 disabled:cursor-not-allowed disabled:opacity-40',
          )}
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-neutral-0 shadow-1 transition-transform duration-150 ease-standard peer-checked:translate-x-4"
        />
      </span>
      <span className={cn('font-ui text-[14px] leading-5 text-text-main', hideLabel && 'sr-only')}>
        {label}
      </span>
    </label>
  );
}
