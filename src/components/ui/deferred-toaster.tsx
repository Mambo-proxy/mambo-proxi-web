'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Toaster = dynamic(() => import('./toaster').then((module) => module.Toaster), { ssr: false });

/**
 * Notifications chargées une fois la page au repos, hors du JavaScript initial : aucune n'est émise avant une
 * action de l'utilisateur, et sonner rejoue à son montage celles qui l'auraient précédé.
 */
export function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  return ready ? <Toaster /> : null;
}
