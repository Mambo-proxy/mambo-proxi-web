'use client';

// Feuille de styles de Leaflet : chargée avec ce module, donc seulement avec la carte (hors du CSS initial du site).
import 'leaflet/dist/leaflet.css';
import type * as Leaflet from 'leaflet';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { GeoPoint, ServiceAreas, Zone } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { OSM_COPYRIGHT_URL, mapTiles } from '@/lib/geo/tiles';
import { DOUALA_CENTER, areaLatLngs, initialBounds, maxViewBounds, roundCoordinate } from '@/lib/geo/zones';
import { TONES } from './zone-tones';

type LeafletModule = typeof Leaflet;

/** Zone affichée sur la carte ; `details` : lignes ajoutées à l'info-bulle de ses quartiers (réponse, délai…). */
export type MapZone = Pick<Zone, 'key' | 'name' | 'tone' | 'quarters' | 'area'> & { details?: string[] };

export type MapAgency = { name: string; lat: number; lng: number };

/** Textes de la carte, fournis par l'appelant (site bilingue : `messages/*.json` ; back-office : français). */
export type MapLabels = {
  /** Nom accessible de la carte. */
  name: string;
  /** Mode d'emploi lu par les lecteurs d'écran (`aria-describedby`). */
  hint: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  closePopup: string;
  base: string;
  agency: string;
  /** Message affiché en survol quand la molette défile la page (Ctrl / ⌘ + molette pour zoomer). */
  wheel: string;
  wheelMac: string;
  /** Message affiché quand un seul doigt glisse sur la carte (écran tactile). */
  touch: string;
  /** Texte du lien de l'attribution OpenStreetMap (« contributeurs OpenStreetMap »). */
  attribution: string;
  newTab: string;
};

const MIN_ZOOM = 10;
/** Zoom au choix d'un quartier dans la recherche. */
const QUARTER_ZOOM = 15;

/** Couleur effective d'une variable CSS (`var(--mp-color-map-zone-1)`) pour les tracés SVG de Leaflet. */
function cssColor(value: string) {
  const name = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  return (name && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || value;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function element(tag: string, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Repère d'un quartier : pastille aux couleurs de la zone, plus grande pour la base de départ, halo si choisi.
 * Zone cliquable de 24 px au moins (cible tactile), pastille centrée de 14 px (20 pour la base).
 */
function quarterIcon(L: LeafletModule, zone: MapZone, base: boolean, selected: boolean) {
  const dot = base ? 20 : 14;
  const size = 24;
  const color = TONES[zone.tone].color;
  const halo = selected ? `box-shadow: 0 0 0 6px color-mix(in srgb, ${color} 30%, transparent);` : '';
  return L.divIcon({
    className: 'zones-map-marker',
    html: `<span class="flex size-full items-center justify-center"><span class="block rounded-full border-[3px] border-neutral-0 shadow-1" style="width: ${dot}px; height: ${dot}px; background: ${color}; ${halo}"></span></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    tooltipAnchor: [0, -size / 2],
  });
}

/**
 * Info-bulles : largeur limitée à la place libre (marges de Leaflet, 44 px, et colonne des boutons de zoom en haut à
 * droite, 56 px) et recentrage à l'écart de ces boutons, qui sinon recouvrent la croix de fermeture en mobile.
 */
function popupOptions(map: Leaflet.Map, reduced: boolean): Leaflet.PopupOptions {
  return {
    maxWidth: Math.max(160, Math.min(260, map.getSize().x - 16 - 56 - 44)),
    autoPan: !reduced,
    autoPanPaddingTopLeft: [16, 16],
    autoPanPaddingBottomRight: [56, 16],
  };
}

/** Repère de l'agence : épingle orange (pictogramme `MapPin`). */
function agencyIcon(L: LeafletModule) {
  return L.divIcon({
    className: 'zones-map-marker',
    html: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" style="fill: var(--mp-color-brand-primary); stroke: var(--mp-color-neutral-0); stroke-width: 1.6"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" style="fill: var(--mp-color-neutral-0)"/></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
    tooltipAnchor: [0, -26],
  });
}

/** Info-bulle d'un quartier (nœuds DOM, textes insérés comme texte) : nom, zone, base de départ, détails. */
function quarterPopup(name: string, zone: MapZone, base: boolean, labels: MapLabels) {
  const root = element('div', 'flex flex-col gap-1.5 font-ui');
  root.append(element('div', 'text-[15px] leading-5 font-semibold text-text-main', name));
  const zoneLine = element('div', 'flex items-center gap-2 text-[13px] leading-4 font-medium text-text-main');
  zoneLine.append(element('span', cn('size-2.5 shrink-0 rounded-full', TONES[zone.tone].dot)), zone.name);
  root.append(zoneLine);
  if (base) root.append(element('div', 'text-[13px] leading-4 font-semibold text-text-brand', labels.base));
  for (const detail of zone.details ?? [])
    root.append(element('div', 'text-[13px] leading-[18px] text-text-muted', detail));
  return root;
}

/**
 * Carte interactive des zones (Leaflet, fond OpenStreetMap) : contours des zones, repères des quartiers (base de
 * départ mise en avant) et de l'agence, info-bulles. Leaflet est importé à la demande, côté navigateur seulement.
 * - `interactive` : déplacement (souris, flèches du clavier ; deux doigts sur écran tactile), zoom par les boutons,
 *   + / −, double clic, Ctrl / ⌘ + molette (ou molette après un clic sur la carte) — la molette seule fait défiler
 *   la page. `selected` centre la carte sur ce quartier et ouvre son info-bulle.
 * - `static` : aperçu figé (back-office), sans déplacement ni info-bulles.
 * - `onPick` : saisie d'un point au clic (back-office) ; `onMarkerClick` choisit un quartier existant.
 * Sans tuiles (réseau indisponible), contours et repères restent affichés sur le fond `map/land`.
 */
export function ZonesLeafletMap({
  zones,
  labels,
  view,
  agency,
  selected = null,
  mode = 'interactive',
  onPick,
  onMarkerClick,
  className,
}: {
  zones: MapZone[];
  labels: MapLabels;
  /** Cadrage calculé par l'API (`ServiceAreas.map`) ; sinon emprise des zones. */
  view?: ServiceAreas['map'];
  agency?: MapAgency | null;
  /** Nom du quartier choisi (recherche, quartier en cours de saisie). */
  selected?: string | null;
  mode?: 'interactive' | 'static';
  onPick?: (point: GeoPoint) => void;
  onMarkerClick?: (name: string) => void;
  /** Largeur du cadre (760 px en desktop par défaut). */
  className?: string;
}) {
  const hintId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<{ L: LeafletModule; map: Leaflet.Map } | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [hint, setHint] = useState<'wheel' | 'touch' | null>(null);
  const markers = useRef(new Map<string, Leaflet.Marker>());
  const home = useRef<() => void>(() => {});
  // Valeurs lues par les gestionnaires Leaflet, créés une seule fois.
  const latest = useRef({ zones, view, agency, labels, onPick, onMarkerClick });
  useEffect(() => {
    latest.current = { zones, view, agency, labels, onPick, onMarkerClick };
  });

  const interactive = mode === 'interactive';

  // Création de la carte (une fois) : import de Leaflet, fond de carte, cadrage, gestes.
  useEffect(() => {
    const container = containerRef.current;
    const markerMap = markers.current;
    if (!container) return;
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    let hintTimer: number | undefined;
    const cleanups: (() => void)[] = [];

    void import('leaflet').then((module) => {
      if (cancelled) return;
      const L = ((module as { default?: LeafletModule }).default ?? module) as LeafletModule;
      const reduced = prefersReducedMotion();
      // Écran tactile : un doigt fait défiler la page, deux doigts déplacent et zooment la carte.
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const target = L.map(container, {
        zoomControl: false,
        attributionControl: false,
        minZoom: MIN_ZOOM,
        maxZoom: mapTiles.maxZoom,
        dragging: interactive && !coarse,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        scrollWheelZoom: interactive,
        boxZoom: false,
        keyboard: interactive,
        zoomAnimation: !reduced,
        fadeAnimation: !reduced,
        markerZoomAnimation: !reduced,
        inertia: !reduced,
        maxBoundsViscosity: 0.8,
      });
      map = target;
      // Tuiles chargées pour la vue affichée seulement (pas de préchargement au-delà d'une rangée).
      L.tileLayer(mapTiles.url, { maxZoom: mapTiles.maxZoom, minZoom: MIN_ZOOM, keepBuffer: 1 }).addTo(
        target,
      );

      const { zones: initialZones, view: initialView, agency: initialAgency } = latest.current;
      const bounds = initialBounds(
        { zones: initialZones, map: initialView },
        initialAgency ? [initialAgency] : [],
      );
      home.current = () => {
        const animate = !prefersReducedMotion();
        if (bounds)
          target.fitBounds(
            [
              [bounds[0].lat, bounds[0].lng],
              [bounds[1].lat, bounds[1].lng],
            ],
            { padding: [16, 16], maxZoom: QUARTER_ZOOM, animate },
          );
        else {
          const center = initialView?.center ?? DOUALA_CENTER;
          target.setView([center.lat, center.lng], initialView?.zoom ?? 12, { animate });
        }
      };
      home.current();
      if (bounds) {
        const [southWest, northEast] = maxViewBounds(bounds);
        target.setMaxBounds([
          [southWest.lat, southWest.lng],
          [northEast.lat, northEast.lng],
        ]);
      }

      const flash = (kind: 'wheel' | 'touch') => {
        setHint(kind);
        window.clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => setHint(null), 1600);
      };
      if (interactive) {
        // Molette : zoom avec Ctrl / ⌘ (ou après un clic sur la carte) ; sinon la page défile.
        let engaged = false;
        const onWheel = (event: WheelEvent) => {
          if (event.ctrlKey || event.metaKey || engaged) return;
          // Leaflet écoute le même conteneur : l'événement ne lui parvient pas.
          event.stopImmediatePropagation();
          flash('wheel');
        };
        const engage = () => (engaged = true);
        const release = () => (engaged = false);
        const onTouchMove = (event: TouchEvent) => {
          if (coarse && event.touches.length === 1) flash('touch');
        };
        container.addEventListener('wheel', onWheel, { capture: true, passive: true });
        container.addEventListener('mousedown', engage);
        container.addEventListener('mouseleave', release);
        container.addEventListener('touchmove', onTouchMove, { passive: true });
        cleanups.push(() => {
          container.removeEventListener('wheel', onWheel, { capture: true });
          container.removeEventListener('mousedown', engage);
          container.removeEventListener('mouseleave', release);
          container.removeEventListener('touchmove', onTouchMove);
        });
      }
      target.on('zoomend', () => setZoom(target.getZoom()));
      target.on('click', (event: Leaflet.LeafletMouseEvent) =>
        latest.current.onPick?.({
          lat: roundCoordinate(event.latlng.lat),
          lng: roundCoordinate(event.latlng.lng),
        }),
      );
      // Bouton de fermeture des info-bulles : libellé dans la langue de la page.
      target.on('popupopen', (event: Leaflet.PopupEvent) => {
        const close = event.popup.getElement()?.querySelector('.leaflet-popup-close-button');
        close?.setAttribute('aria-label', latest.current.labels.closePopup);
        close?.setAttribute('title', latest.current.labels.closePopup);
      });
      if (latest.current.onPick) container.style.cursor = 'crosshair';
      // Feuille de styles chargée avec le module : dimensions relues une fois la mise en page stabilisée.
      requestAnimationFrame(() => target.invalidateSize());
      setZoom(target.getZoom());
      setLeaflet({ L, map: target });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(hintTimer);
      cleanups.forEach((cleanup) => cleanup());
      markerMap.clear();
      map?.remove();
      setLeaflet(null);
    };
    // La carte est créée une fois ; les données sont mises à jour par l'effet suivant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contours, repères et info-bulles, redessinés quand les données ou le quartier choisi changent.
  useEffect(() => {
    if (!leaflet) return;
    const { L, map } = leaflet;
    const group = L.layerGroup().addTo(map);
    const clickable = interactive || !!onMarkerClick;
    const reduced = prefersReducedMotion();
    markers.current.clear();

    for (const zone of zones) {
      if (!zone.area) continue;
      const color = cssColor(TONES[zone.tone].color);
      L.polygon(areaLatLngs(zone.area), {
        interactive: false,
        color,
        weight: 2,
        opacity: 0.85,
        fillColor: color,
        fillOpacity: Math.max(TONES[zone.tone].area, 0.08),
        dashArray: zone.tone === 'special' ? '6 6' : undefined,
      }).addTo(group);
    }

    for (const zone of zones)
      for (const quarter of zone.quarters) {
        if (!quarter.coordinates) continue;
        const isSelected = quarter.name === selected;
        const marker = L.marker([quarter.coordinates.lat, quarter.coordinates.lng], {
          icon: quarterIcon(L, zone, quarter.isBase, isSelected),
          keyboard: false,
          interactive: clickable,
          riseOnHover: true,
          zIndexOffset: isSelected ? 1000 : quarter.isBase ? 500 : 0,
        });
        if (interactive && !onMarkerClick)
          marker.bindPopup(
            () => quarterPopup(quarter.name, zone, quarter.isBase, labels),
            popupOptions(map, reduced),
          );
        if (onMarkerClick) marker.on('click', () => onMarkerClick(quarter.name));
        // Nom au survol ; libellé permanent pour la base de départ.
        if (clickable || quarter.isBase)
          marker.bindTooltip(quarter.isBase ? (quarter.mapLabel ?? quarter.name) : quarter.name, {
            direction: 'top',
            permanent: quarter.isBase,
            className: 'font-ui text-[12px] font-semibold text-text-main',
          });
        marker.addTo(group);
        marker.getElement()?.setAttribute('data-quarter', quarter.name);
        markers.current.set(quarter.name, marker);
      }

    if (agency) {
      const marker = L.marker([agency.lat, agency.lng], {
        icon: agencyIcon(L),
        keyboard: false,
        interactive,
        zIndexOffset: 800,
      });
      if (interactive) {
        const content = element('div', 'flex flex-col gap-1 font-ui');
        content.append(
          element('div', 'text-[15px] leading-5 font-semibold text-text-main', agency.name),
          element('div', 'text-[13px] leading-4 text-text-muted', labels.agency),
        );
        marker.bindPopup(content, popupOptions(map, reduced));
        marker.bindTooltip(agency.name, { direction: 'top', className: 'font-ui text-[12px] font-semibold' });
      }
      marker.addTo(group);
      marker.getElement()?.setAttribute('data-agency', '');
    }

    return () => {
      group.remove();
    };
  }, [leaflet, zones, agency, selected, labels, interactive, onMarkerClick]);

  // Quartier choisi : la carte s'y centre (sans animation si l'utilisateur les réduit), puis ouvre son info-bulle.
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (!leaflet) return;
    const { map } = leaflet;
    const marker = selected ? markers.current.get(selected) : undefined;
    if (!selected) {
      if (previous.current) map.closePopup();
      previous.current = null;
      return;
    }
    previous.current = selected;
    if (!marker) return;
    const target = marker.getLatLng();
    const nextZoom = Math.max(map.getZoom(), QUARTER_ZOOM);
    const open = () => {
      if (marker.getPopup()) marker.openPopup();
    };
    if (map.getCenter().distanceTo(target) < 1 && map.getZoom() === nextZoom) open();
    else {
      map.once('moveend', open);
      if (prefersReducedMotion()) map.setView(target, nextZoom, { animate: false });
      else map.flyTo(target, nextZoom, { duration: 0.8 });
    }
  }, [leaflet, selected]);

  const control =
    'flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-0 text-text-main shadow-1 transition-colors hover:bg-neutral-100 focus-visible:focus-ring disabled:cursor-default disabled:opacity-40';
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

  return (
    <div className={cn('relative isolate w-full shrink-0 xl:w-[760px]', className)}>
      <div
        ref={containerRef}
        role={interactive ? 'group' : 'img'}
        aria-label={labels.name}
        aria-describedby={interactive ? hintId : undefined}
        // Fond `map/land` sous les tuiles (et à leur place si elles ne chargent pas) ; en ligne pour primer sur
        // la feuille de styles de Leaflet.
        style={{ background: 'var(--mp-color-map-land)' }}
        className="aspect-[760/540] w-full rounded-[11px] font-ui focus-visible:focus-ring md:rounded-xl"
      />
      {interactive && (
        <p id={hintId} className="sr-only">
          {labels.hint}
        </p>
      )}
      {interactive && leaflet && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 md:top-4 md:right-4">
          <button
            type="button"
            onClick={() => leaflet.map.zoomIn()}
            disabled={zoom !== null && zoom >= leaflet.map.getMaxZoom()}
            aria-label={labels.zoomIn}
            title={labels.zoomIn}
            className={control}
          >
            <Plus aria-hidden size={16} />
          </button>
          <button
            type="button"
            onClick={() => leaflet.map.zoomOut()}
            disabled={zoom !== null && zoom <= leaflet.map.getMinZoom()}
            aria-label={labels.zoomOut}
            title={labels.zoomOut}
            className={control}
          >
            <Minus aria-hidden size={16} />
          </button>
          <button
            type="button"
            onClick={() => home.current()}
            aria-label={labels.reset}
            title={labels.reset}
            className={control}
          >
            <LocateFixed aria-hidden size={15} />
          </button>
        </div>
      )}
      {hint && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center rounded-[11px] bg-neutral-900/55 p-6 md:rounded-xl"
        >
          <p className="max-w-[320px] text-center font-ui text-[15px] leading-[1.4] font-semibold text-neutral-0">
            {hint === 'touch' ? labels.touch : isMac ? labels.wheelMac : labels.wheel}
          </p>
        </div>
      )}
      <p className="absolute right-0 bottom-0 z-[1000] rounded-tl-md rounded-br-[11px] bg-neutral-0/90 px-2 py-0.5 font-ui text-[11px] leading-4 text-text-main md:rounded-br-xl">
        ©{' '}
        <a
          href={OSM_COPYRIGHT_URL}
          target="_blank"
          rel="noopener"
          className="rounded-xs underline hover:text-text-brand"
        >
          {labels.attribution}
          <span className="sr-only"> ({labels.newTab})</span>
        </a>
        {mapTiles.credit && ` · ${mapTiles.credit}`}
      </p>
    </div>
  );
}
