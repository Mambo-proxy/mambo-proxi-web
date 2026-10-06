'use client';

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

/** Jour au format `AAAA-MM-JJ` (format des disponibilités de l'API). */
export type DateKey = string;

const toKey = (date: Date): DateKey => format(date, 'yyyy-MM-dd');
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

type CalendarProps = {
  /** Premier jour du mois affiché. */
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: DateKey | null;
  onSelect: (date: DateKey) => void;
  /** Jour sélectionnable (disponibilités du mois) ; les autres sont désactivés. */
  isAvailable: (date: DateKey) => boolean;
  /** Bornes de navigation (mois inclus). */
  minMonth?: Date;
  maxMonth?: Date;
  className?: string;
};

/**
 * Calendrier de prise de rendez-vous (Contact `69:7903`) : carte blanche rayon 20, p 20, gap 12 ;
 * mois Inter SemiBold 16/24 ; grille lundi → dimanche, jours ronds 36 × 36 (Inter Medium 14/20) ;
 * désactivé `text/disabled`, sélectionné fond `brand/primary`. Grille ARIA : flèches, Début/Fin, Page préc./suiv.
 */
export function Calendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  isAvailable,
  minMonth,
  maxMonth,
  className,
}: CalendarProps) {
  const gridRef = useRef<HTMLTableElement>(null);
  const firstAvailable = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
    .map(toKey)
    .find(isAvailable);
  const [focused, setFocused] = useState<DateKey | null>(null);
  const focusKey =
    focused && isSameMonth(parseISO(focused), month)
      ? focused
      : selected && isSameMonth(parseISO(selected), month)
        ? selected
        : (firstAvailable ?? toKey(startOfMonth(month)));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
  });
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const canGoBack = !minMonth || startOfMonth(month) > startOfMonth(minMonth);
  const canGoForward = !maxMonth || startOfMonth(month) < startOfMonth(maxMonth);

  function moveFocus(key: DateKey) {
    const target = parseISO(key);
    if (!isSameMonth(target, month)) {
      const next = startOfMonth(target);
      if ((next < month && !canGoBack) || (next > month && !canGoForward)) return;
      onMonthChange(next);
    }
    setFocused(key);
    requestAnimationFrame(() =>
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus(),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: Date) {
    const steps: Record<string, () => Date> = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => startOfWeek(day, WEEK_OPTIONS),
      End: () => endOfWeek(day, WEEK_OPTIONS),
      PageUp: () => addMonths(day, -1),
      PageDown: () => addMonths(day, 1),
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    moveFocus(toKey(step()));
  }

  const monthLabel = format(month, 'MMMM yyyy', { locale: fr });

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[20px] border border-border-default bg-neutral-0 p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label="Mois précédent"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-icon-default hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft aria-hidden size={18} />
        </button>
        <p
          aria-live="polite"
          className="font-ui text-[16px] leading-6 font-semibold text-text-main first-letter:uppercase"
        >
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={!canGoForward}
          aria-label="Mois suivant"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-icon-default hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight aria-hidden size={18} />
        </button>
      </div>
      <table
        ref={gridRef}
        role="grid"
        aria-label={monthLabel}
        className="w-full border-separate border-spacing-y-1.5"
      >
        <thead>
          <tr>
            {weeks[0]?.map((day) => (
              <th
                key={toKey(day)}
                scope="col"
                abbr={format(day, 'EEEE', { locale: fr })}
                className="pb-1 font-ui text-[12px] leading-4 font-medium text-text-muted"
              >
                {format(day, 'EEEEE', { locale: fr }).toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={toKey(week[0] ?? month)}>
              {week.map((day) => {
                const key = toKey(day);
                if (!isSameMonth(day, month)) return <td key={key} />;
                const available = isAvailable(key);
                const isSelected = key === selected;
                return (
                  <td key={key} className="text-center">
                    <button
                      type="button"
                      data-day={key}
                      tabIndex={key === focusKey ? 0 : -1}
                      aria-disabled={!available || undefined}
                      aria-pressed={isSelected}
                      aria-label={format(day, 'EEEE d MMMM yyyy', { locale: fr })}
                      onClick={() => available && onSelect(key)}
                      onKeyDown={(event) => onKeyDown(event, day)}
                      onFocus={() => setFocused(key)}
                      className={cn(
                        'mx-auto flex size-9 items-center justify-center rounded-full font-ui text-[14px] leading-5 font-medium tabular-nums',
                        'transition-colors duration-150',
                        isSelected
                          ? 'bg-brand-primary text-neutral-900'
                          : available
                            ? 'cursor-pointer text-text-main hover:bg-neutral-100'
                            : 'cursor-not-allowed text-text-disabled',
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
