'use client';

import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Panneau de recherche chargé à la demande : ni le panneau ni le client de l'API ne font partie du JavaScript initial
 * des pages. Le module est préchargé au survol ou au focus du bouton, et chargé au premier clic ou raccourci.
 */
const loadSearchDialog = () => import('./search-dialog');
const SearchDialog = dynamic(() => loadSearchDialog().then((module) => module.SearchDialog), {
  ssr: false,
});

function preloadSearchDialog() {
  void loadSearchDialog();
}

/** Champ de saisie ou zone éditable : `/` y reste un caractère. */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * État de la recherche globale du site, et raccourcis clavier : `/` (hors champ de saisie) ou `Ctrl+K` / `⌘K`.
 * Les raccourcis sont ignorés tant qu'une autre fenêtre modale est ouverte (menu mobile, modale d'un formulaire).
 */
export function useSiteSearch() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const show = useCallback(() => {
    setRequested(true);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.altKey) return;
      const command = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !isEditable(event.target);
      if (!command && !slash) return;
      if (document.querySelector('dialog[open]:not([data-site-search])')) return;
      event.preventDefault();
      show();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [show]);

  return { open, requested, show, close };
}

/** Panneau de recherche, monté seulement après la première demande d'ouverture. */
export function SiteSearchDialog({
  search,
}: {
  search: Pick<ReturnType<typeof useSiteSearch>, 'open' | 'requested' | 'close'>;
}) {
  return search.requested ? <SearchDialog open={search.open} onClose={search.close} /> : null;
}

type SearchButtonProps = { onOpen: () => void; open: boolean; className?: string };

/** Loupe de l'en-tête (40 × 40) : ouvre le panneau de recherche. */
export function SearchButton({ onOpen, open, className }: SearchButtonProps) {
  const t = useTranslations('search');
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={preloadSearchDialog}
      onFocus={preloadSearchDialog}
      aria-label={t('open')}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-keyshortcuts="/ Control+K Meta+K"
      className={cn(
        'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default text-text-main transition-colors hover:bg-neutral-100',
        className,
      )}
    >
      <Search aria-hidden size={19} />
    </button>
  );
}

/** Entrée « Rechercher sur le site » du menu mobile (champ factice qui ouvre le panneau de recherche). */
export function SearchMenuEntry({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations('search');
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={preloadSearchDialog}
      onFocus={preloadSearchDialog}
      aria-haspopup="dialog"
      className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full border border-border-default bg-neutral-50 px-4 text-left font-ui text-[15px] leading-6 text-text-muted"
    >
      <Search aria-hidden size={19} className="shrink-0 text-icon-default" />
      {t('open')}
    </button>
  );
}
