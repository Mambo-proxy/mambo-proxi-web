'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Libellé raccourci affiché en mobile (< 768 px), ex. « Particulier » (Inscription mobile `70:10933`). */
  shortLabel?: ReactNode;
};

type SegmentedTabsProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nom accessible du groupe (ex. « Profil »). */
  label: string;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Onglets segmentés (Inscription `70:10703`, Contact `69:7808`) : pilule `neutral/100`, p 4, gap 4 ;
 * onglet px 16 py 9 Inter SemiBold 14/20 ; actif fond blanc + `elevation/1`.
 * Sémantique de groupe radio : flèches gauche/droite, Début/Fin.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  fullWidth = false,
  className,
}: SegmentedTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    const option = options[(index + options.length) % options.length];
    if (!option) return;
    onChange(option.value);
    refs.current[(index + options.length) % options.length]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex max-w-full gap-1 rounded-full bg-neutral-100 p-1',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'min-w-0 cursor-pointer truncate rounded-full px-4 py-[9px] font-ui text-[14px] leading-5 font-semibold tracking-[0.005em]',
              'transition-[background-color,box-shadow,color] duration-150 ease-standard',
              fullWidth && 'flex-1',
              active ? 'bg-neutral-0 text-text-main shadow-1' : 'text-text-muted hover:text-text-main',
            )}
          >
            {option.shortLabel ? (
              <>
                <span className="md:hidden">{option.shortLabel}</span>
                <span className="hidden md:inline">{option.label}</span>
              </>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}
