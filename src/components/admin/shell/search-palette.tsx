'use client';

import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Search } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useId, useRef, useState } from 'react';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { cn } from '@/lib/cn';
import { useAdmin } from './admin-context';
import { navFor } from './nav';

type ResultItem = { id: string; title: string; subtitle?: string | null; href: string; group: string };

/** Champ « Rechercher… ⌘K » de la barre supérieure (`85:10363`) : ouvre la palette. */
export function SearchTrigger() {
  const { setSearchOpen } = useAdmin();
  return (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      aria-keyshortcuts="Control+K Meta+K"
      className="flex h-[42px] w-[260px] items-center gap-2 rounded-[10px] border border-border-default bg-neutral-50 px-3.5 text-left font-ui text-[14px] leading-5 text-text-muted hover:bg-neutral-100"
    >
      <Search aria-hidden size={16} />
      <span className="flex-1">Rechercher…</span>
      <kbd className="font-ui text-[12px] leading-4 text-text-muted">⌘K</kbd>
    </button>
  );
}

/**
 * Palette de recherche (non maquettée) : ⌘K / Ctrl+K partout dans le back-office. Sans saisie, raccourcis vers
 * les écrans ; à partir de 2 caractères, recherche globale (demandes, contacts, services, offres, pages).
 * Flèches haut/bas, Entrée pour ouvrir, Échap pour fermer.
 */
export function SearchPalette() {
  const { user, searchOpen, setSearchOpen } = useAdmin();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const deferred = useDeferredValue(query.trim());

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (searchOpen && !element.open) {
      element.showModal();
      input.current?.focus();
    }
    if (!searchOpen && element.open) element.close();
  }, [searchOpen]);

  const results = useQuery({
    queryKey: ['search', deferred],
    queryFn: () => data(browserApi.GET('/v1/admin/search', { params: { query: { q: deferred } } })),
    enabled: searchOpen && deferred.length >= 2,
    staleTime: 10_000,
  });

  const items: ResultItem[] =
    deferred.length >= 2
      ? (results.data?.groups ?? []).flatMap((group) =>
          group.items.map((item) => ({ ...item, group: group.label })),
        )
      : navFor(user.role).flatMap((group) =>
          group.items.map((item) => ({
            id: item.href,
            title: item.label,
            href: item.href,
            group: 'Aller à',
          })),
        );

  // Regroupement pour l'affichage, en gardant l'index global (navigation au clavier).
  const groups: { label: string; slug: string; items: { item: ResultItem; index: number }[] }[] = [];
  items.forEach((item, index) => {
    let group = groups.at(-1);
    if (group?.label !== item.group) {
      group = { label: item.group, slug: `g${groups.length}`, items: [] };
      groups.push(group);
    }
    group.items.push({ item, index });
  });

  function close() {
    setSearchOpen(false);
    setQuery('');
    setActive(0);
  }

  function open(item: ResultItem | undefined) {
    if (!item) return;
    close();
    router.push(item.href as Route);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(items.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      open(items[active]);
    }
  }

  const status =
    deferred.length >= 2 && !results.isFetching && items.length === 0
      ? `Aucun résultat pour « ${deferred} ».`
      : null;

  return (
    <dialog
      ref={dialog}
      aria-label="Recherche dans le back-office"
      onClose={close}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto mt-[12vh] w-[min(640px,calc(100vw-32px))] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-surface-overlay"
    >
      <div className="flex max-h-[70dvh] flex-col overflow-hidden rounded-lg border border-border-default bg-neutral-0 shadow-4">
        <div className="flex items-center gap-3 border-b border-border-default px-4">
          <Search aria-hidden size={18} className="text-icon-default" />
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Rechercher une demande, un contact, un service…"
            placeholder="Rechercher une demande, un contact, un service…"
            className="h-14 flex-1 bg-transparent font-ui text-[16px] leading-6 text-text-main placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="rounded-[6px] border border-border-default px-1.5 py-0.5 font-ui text-[11px] leading-4 text-text-muted">
            Échap
          </kbd>
        </div>
        <div id={listId} role="listbox" aria-label="Résultats" className="overflow-y-auto p-2">
          {groups.map((group) => (
            <div key={group.label} role="group" aria-labelledby={`${listId}-${group.slug}`}>
              <p
                id={`${listId}-${group.slug}`}
                className="px-3 pt-2 pb-1 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-muted uppercase"
              >
                {group.label}
              </p>
              {group.items.map(({ item, index }) => (
                <div
                  key={item.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => open(item)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5',
                    index === active && 'bg-orange-50',
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-ui text-[14px] leading-5 font-medium text-text-main">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  {index === active && <CornerDownLeft aria-hidden size={16} className="text-icon-default" />}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p
          role="status"
          className={cn('px-5 pb-5 font-ui text-[14px] leading-5 text-text-muted', !status && 'sr-only')}
        >
          {status}
        </p>
      </div>
    </dialog>
  );
}
