'use client';

import { Ellipsis, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type ActionMenuItem =
  | { label: string; icon?: LucideIcon; href: string; external?: boolean; danger?: boolean }
  | { label: string; icon?: LucideIcon; onSelect: () => void; danger?: boolean; disabled?: boolean };

/**
 * Menu « … » d'une ligne ou d'un panneau (bouton icône 32 × 32 rayon 8, ou 38 × 38 bordé) : liste d'actions au
 * clavier (flèches, Échap), fermée au clic extérieur.
 */
export function ActionMenu({
  label,
  items,
  variant = 'ghost',
  align = 'end',
}: {
  /** Nom accessible du bouton, ex. « Actions pour la demande MP-2026-0142 ». */
  label: string;
  items: ActionMenuItem[];
  variant?: 'ghost' | 'outline';
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) button.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const entries = [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const index = entries.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      entries[(index + delta + entries.length) % entries.length]?.focus();
    } else if (event.key === 'Tab') setOpen(false);
  }

  const itemClass = (danger?: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left font-ui text-[14px] leading-5 outline-none',
      'hover:bg-neutral-50 focus-visible:bg-neutral-100 aria-disabled:pointer-events-none aria-disabled:opacity-40',
      danger ? 'text-feedback-error' : 'text-text-main',
    );

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center justify-center text-icon-default hover:text-text-main',
          variant === 'ghost'
            ? 'size-8 rounded-sm hover:bg-neutral-100'
            : 'size-[38px] rounded-[10px] border border-border-strong bg-neutral-0 hover:bg-neutral-50',
        )}
      >
        <Ellipsis aria-hidden size={16} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={cn(
            'absolute top-full z-40 mt-1 flex min-w-[220px] flex-col rounded-md border border-border-default bg-neutral-0 p-1 shadow-4',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon aria-hidden size={16} className="shrink-0" />}
                {item.label}
              </>
            );
            if ('href' in item)
              return item.external || !item.href.startsWith('/') ? (
                <a
                  key={item.label}
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href}
                  className={itemClass(item.danger)}
                  onClick={() => close(false)}
                  {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={item.label}
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href as Route}
                  className={itemClass(item.danger)}
                  onClick={() => close(false)}
                >
                  {content}
                </Link>
              );
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.disabled || undefined}
                className={itemClass(item.danger)}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
