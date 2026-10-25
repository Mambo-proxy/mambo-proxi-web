'use client';

import { useEffect, useRef } from 'react';

/** Écart entre deux éléments et nombre d'éléments décalés au plus (comme la cascade de `Reveal`). */
const STEP_MS = 50;
const MAX_STAGGERED = 6;

/**
 * Réapparition échelonnée des éléments d'une liste quand `key` change (filtre choisi) : fondu + translation de 8 px,
 * 280 ms, 50 ms d'écart entre éléments. Les éléments ne sont pas démontés (la région `aria-live` de la liste annonce
 * les mêmes changements qu'avant) et seuls `opacity` et `transform` sont animés (Web Animations, sans décalage de mise
 * en page). Rien au premier affichage, ni si l'utilisateur a demandé de réduire les animations.
 */
export function useStaggerIn<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    const list = ref.current;
    if (!list || typeof list.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const animations = Array.from(list.children, (child, index) =>
      child.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'none' },
        ],
        {
          duration: 280,
          delay: Math.min(index, MAX_STAGGERED) * STEP_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        },
      ),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [key]);

  return ref;
}
