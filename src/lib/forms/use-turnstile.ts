'use client';

import { useCallback, useState } from 'react';
import { createTurnstileWidget, type TurnstileRenderOptions } from './turnstile';

/** Clé publique Turnstile ; absente en développement, sur mocks et dans les tests (jeton vide). */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

/** Caché par défaut ; pendant un défi interactif, panneau fixe en bas de l'écran. */
const VISIBLE_CLASSES = [
  'hidden',
  'data-[turnstile=visible]:fixed data-[turnstile=visible]:inset-x-4 data-[turnstile=visible]:bottom-4',
  'data-[turnstile=visible]:z-50 data-[turnstile=visible]:mx-auto data-[turnstile=visible]:block',
  'data-[turnstile=visible]:max-w-[400px]',
].join(' ');

/**
 * Widget Turnstile invisible d'un formulaire public. `widgetProps` se pose sur un `<div>` placé dans le `<form>` :
 * caché tant que Cloudflare ne demande pas d'interaction, il déclenche le chargement du script au premier focus
 * dans le formulaire. `token()` donne le jeton à joindre à l'envoi (chaîne vide sans clé ou en cas d'échec).
 */
export function useTurnstile({ theme }: { theme?: TurnstileRenderOptions['theme'] } = {}) {
  const [widget] = useState(() => createTurnstileWidget({ siteKey: SITE_KEY, theme }));

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !SITE_KEY) return;
      widget.attach(node);
      const form = node.closest('form');
      const prepare = () => widget.prepare();
      form?.addEventListener('focusin', prepare, { once: true });
      return () => {
        form?.removeEventListener('focusin', prepare);
        widget.detach();
      };
    },
    [widget],
  );

  return {
    /**
     * Conteneur du widget : sans effet sur la mise en page tant qu'aucune interaction n'est demandée ; le défi
     * s'affiche alors en bas de l'écran, pour rester visible quelle que soit la place du conteneur dans le formulaire.
     */
    widgetProps: { ref, className: VISIBLE_CLASSES } as const,
    token: widget.token,
  };
}
