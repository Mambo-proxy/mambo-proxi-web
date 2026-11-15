'use client';

import { useEffect, useRef } from 'react';

export const UNSAVED_CHANGES_MESSAGE =
  'Des modifications ne sont pas enregistrées. Quitter la page et les perdre ?';

type GuardOptions = {
  /**
   * Éditeurs à sauvegarde automatique : enregistrement tenté avant de suivre le lien (`true` : enregistré). En cas
   * d'échec, confirmation demandée.
   */
  save?: () => Promise<boolean>;
};

/** Lien interne suivi par un clic gauche simple, vers une autre page (pas une simple ancre). */
function internalLink(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return anchor;
}

/**
 * Modifications non enregistrées : confirmation avant de fermer ou recharger l'onglet (`beforeunload`) et avant de
 * suivre un lien interne du back-office (menu, fil d'Ariane…), que `beforeunload` ne couvre pas avec le routeur de
 * Next.js. Le clic est intercepté en phase de capture, avant le gestionnaire de `<Link>`.
 */
export function useUnsavedChangesGuard(dirty: boolean, { save }: GuardOptions = {}) {
  const saveRef = useRef(save);
  // Clic relancé après l'enregistrement : suivi sans nouvelle interception.
  const replaying = useRef(false);
  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      if (replaying.current) return;
      const anchor = internalLink(event);
      if (!anchor) return;
      const persist = saveRef.current;
      if (!persist) {
        if (window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      void persist().then((saved) => {
        if (!saved && !window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
        replaying.current = true;
        try {
          anchor.click();
        } finally {
          replaying.current = false;
        }
      });
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);
}
