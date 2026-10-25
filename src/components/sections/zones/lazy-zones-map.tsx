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
 * Carte (Leaflet et sa feuille de styles) et recherche des zones chargées hors du JavaScript initial, à l'approche de
 * l'écran (1 000 px avant) : pas au repos de la page, Leaflet (~42 Ko) pèserait sur chaque visite de l'accueil, même
 * sans défilement jusqu'à la carte. Le titre, la légende et le lien sont rendus avec la page. Les tuiles
 * OpenStreetMap ne sont demandées qu'une fois la carte affichée.
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
      // Leaflet est demandé en même temps que le module de la carte (deux fichiers en parallèle, pas en cascade).
      void Promise.all([import('./zones-map'), import('leaflet')]).then(([module]) =>
        setLoadedMap(() => module.ZonesMap),
      );
    };
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && start(), {
      rootMargin: '1000px 0px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Le cadre d'attente reste affiché pendant le téléchargement du module (pas de saut de mise en page).
  return (
    <div ref={ref} data-zones-map>
      {LoadedMap ? <LoadedMap {...props} /> : <MapPlaceholder {...props} />}
    </div>
  );
}
