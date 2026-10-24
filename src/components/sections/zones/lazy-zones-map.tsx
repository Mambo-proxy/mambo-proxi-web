'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { ZonesAside } from './zones-aside';
import type { ZonesMap as ZonesMapComponent } from './zones-map';

type Props = ComponentProps<typeof ZonesMapComponent>;

/** Cadre de la carte (fond `map/land`, mêmes proportions) et colonne de droite, recherche en attente. */
function MapPlaceholder({ areas, link }: Props) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
      <div className="aspect-[760/540] w-full shrink-0 rounded-[11px] bg-map-land md:rounded-xl xl:w-[760px]" />
      <ZonesAside areas={areas} link={link}>
        <div className="h-[48px] rounded-md border border-border-strong bg-neutral-0" />
      </ZonesAside>
    </div>
  );
}

/**
 * Carte et recherche des zones chargées hors du JavaScript initial : dès que la page est au repos, ou plus tôt à
 * l'approche de l'écran (600 px avant). Le titre, la légende et le lien sont rendus avec la page.
 */
export function LazyZonesMap(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [LoadedMap, setLoadedMap] = useState<typeof ZonesMapComponent | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      void import('./zones-map').then((module) => setLoadedMap(() => module.ZonesMap));
    };
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && start(), {
      rootMargin: '600px 0px',
    });
    observer.observe(node);
    const idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(start, { timeout: 4000 })
        : window.setTimeout(start, 2000);
    return () => {
      observer.disconnect();
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  // Le cadre d'attente reste affiché pendant le téléchargement du module (pas de saut de mise en page).
  return <div ref={ref}>{LoadedMap ? <LoadedMap {...props} /> : <MapPlaceholder {...props} />}</div>;
}
