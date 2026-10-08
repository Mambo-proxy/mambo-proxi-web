'use client';

import { Check, Plus } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const chipBase =
  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-4 font-medium transition-colors [&_svg]:size-3.5';

/**
 * Puces à sélection multiple (`91:11052` services liés) : sélectionnée = fond et bordure `neutral/900`, coche,
 * texte blanc ; non sélectionnée = fond blanc, bordure `border/strong`. `aria-pressed` pour l'état.
 */
export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  /** N'afficher que les options sélectionnées, plus un bouton « + … » qui ouvre un sélecteur. */
  addLabel,
  onAdd,
}: {
  label: ReactNode;
  options: { value: T; label: ReactNode }[];
  value: T[];
  onChange: (value: T[]) => void;
  addLabel?: string;
  onAdd?: () => void;
}) {
  const labelId = useId();
  const visible = onAdd ? options.filter((option) => value.includes(option.value)) : options;
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {visible.map((option) => {
          const selected = value.includes(option.value);
          return (
            <ChipToggle
              key={option.value}
              selected={selected}
              onClick={() =>
                onChange(selected ? value.filter((item) => item !== option.value) : [...value, option.value])
              }
            >
              {option.label}
            </ChipToggle>
          );
        })}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={cn(chipBase, 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-50')}
          >
            <Plus aria-hidden />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function ChipToggle({
  selected,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        chipBase,
        selected
          ? 'border-neutral-900 bg-neutral-900 text-neutral-0 hover:bg-neutral-800'
          : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-50',
        className,
      )}
      {...props}
    >
      {selected && <Check aria-hidden />}
      {children}
    </button>
  );
}
