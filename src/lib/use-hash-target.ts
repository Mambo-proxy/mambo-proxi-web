'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const readHash = () => window.location.hash;
const noHash = () => '';

/**
 * Ancre visée par l'adresse (`/formation#accueil-relation-client` → `accueil-relation-client`), `null` sans ancre.
 * Complète `:target`, que les navigations du routeur (`history.pushState`) ne mettent pas à jour : l'ancre est relue
 * à l'arrivée sur la page puis à chaque changement d'ancre. Toujours `null` au prérendu.
 */
export function useHashTarget(): string | null {
  const hash = useSyncExternalStore(subscribe, readHash, noHash);
  if (hash.length <= 1) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

/** Défilement vers un élément ciblé, sans animation si l'utilisateur a demandé de les réduire. */
export function scrollToTarget(element: Element | null) {
  if (!element) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
