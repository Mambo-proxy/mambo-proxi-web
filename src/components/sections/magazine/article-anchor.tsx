'use client';

import { useEffect } from 'react';
import { scrollToTarget, useHashTarget } from '@/lib/use-hash-target';

const ARTICLE_PREFIX = 'article-';

/** Ancre d'un article du Magazine (`/magazine#article-art_1`), adresse des résultats de la recherche. */
export function articleAnchor(id: string): string {
  return `${ARTICLE_PREFIX}${id}`;
}

/**
 * Arrivée sur `/magazine#article-{id}` : la carte de l'article porte l'ancre (`articleAnchor`) et l'attribut
 * `data-targeted` posé ici (complément de `:target`, que les navigations du routeur ne mettent pas à jour), pour sa
 * mise en évidence. Tant que la page n'affiche pas la carte de l'article (l'édition en ligne ne liste que ses thèmes),
 * la page défile jusqu'aux thèmes du numéro (`fallbackId`).
 */
export function ArticleAnchor({ fallbackId }: { fallbackId: string | null }) {
  const target = useHashTarget();

  useEffect(() => {
    if (!target?.startsWith(ARTICLE_PREFIX)) return;
    const element = document.getElementById(target) ?? (fallbackId && document.getElementById(fallbackId));
    if (!element) return;
    element.setAttribute('data-targeted', 'true');
    const frame = requestAnimationFrame(() => scrollToTarget(element));
    return () => {
      cancelAnimationFrame(frame);
      element.removeAttribute('data-targeted');
    };
  }, [target, fallbackId]);

  return null;
}
