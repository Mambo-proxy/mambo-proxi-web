'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { PendingClick, PendingView } from '@/lib/analytics/tracker';

type Started = ReturnType<(typeof import('@/lib/analytics/tracker'))['startTracker']>;

/** État partagé par la page : un seul suivi, même si le gabarit est remonté. */
let started: Started | null = null;
let loading = false;
let lastPathname: string | null = null;
const pendingViews: PendingView[] = [];
const pendingClicks: PendingClick[] = [];

/**
 * Mesure d'audience interne (`POST /v1/analytics/events`) : page vue à chaque changement de page (premier
 * chargement et navigations de l'App Router ; les seuls changements de paramètres — filtres, tri — ne comptent
 * pas) et clics sur les actions (délégation, `src/lib/analytics/classify.ts`). Le module de suivi est chargé une
 * fois la page au repos, hors du JavaScript initial ; les pages vues et clics antérieurs sont mémorisés ici et
 * rejoués. Aucun rendu.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Effet rejoué à l'identique (mode strict, remontage) : une seule page vue.
    if (pathname === lastPathname) return;
    lastPathname = pathname;
    if (started) started.tracker.pageView(pathname);
    else pendingViews.push({ pathname, at: Date.now() });
  }, [pathname]);

  useEffect(() => {
    if (started || loading) return;
    const remember = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      pendingClicks.push({ target: event.target, pathname: window.location.pathname, at: Date.now() });
    };
    document.addEventListener('click', remember, true);
    document.addEventListener('auxclick', remember, true);
    const stopRemembering = () => {
      document.removeEventListener('click', remember, true);
      document.removeEventListener('auxclick', remember, true);
    };

    const load = () => {
      loading = true;
      import('@/lib/analytics/tracker')
        .then(({ startTracker }) => {
          stopRemembering();
          started ??= startTracker({ views: pendingViews.splice(0), clicks: pendingClicks.splice(0) });
        })
        .catch(() => {
          // Module indisponible (hors ligne, déploiement en cours) : la page fonctionne sans mesure.
          stopRemembering();
        });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => {
        window.cancelIdleCallback(id);
        if (!loading) stopRemembering();
      };
    }
    const id = window.setTimeout(load, 2000);
    return () => {
      window.clearTimeout(id);
      if (!loading) stopRemembering();
    };
  }, []);

  return null;
}
