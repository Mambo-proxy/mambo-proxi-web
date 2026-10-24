'use client';

import { Minus, Plus, Search, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { ServiceAreas, Zone, ZoneQuarter } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { ZonesAside } from './zones-aside';
import { TONES } from './zone-tones';

/** Dimensions de la carte de la maquette (`290:31639`) : les positions des quartiers y sont exprimées de 0 à 1. */
const MAP_WIDTH = 760;
const MAP_HEIGHT = 540;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

export type Located = ZoneQuarter & { zone: Zone; position: { x: number; y: number } };

/** Quartiers placés sur la carte, avec leur zone. */
export function locatedQuarters(zones: Zone[]): Located[] {
  return zones
    .flatMap((zone) => zone.quarters.map((quarter) => ({ ...quarter, zone })))
    .filter((quarter): quarter is Located => quarter.position != null);
}

/** Recherche insensible à la casse, aux accents et aux tirets. */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-’']/g, ' ')
    .toLowerCase()
    .trim();
}

function clampOffset(offset: number, scale: number, size: number) {
  return Math.min(0, Math.max(offset, size - size * scale));
}

/**
 * Carte stylisée de Douala (Wouri, aires des zones, quartiers) : zoom (boutons, Ctrl + molette, double clic) et
 * déplacement (glisser, flèches du clavier). Les libellés de tous les quartiers s'affichent à partir de 768 px ;
 * sur la carte réduite (mobile), seuls ceux marqués `labelOnSmallMap`, puis tous en zoomant.
 */
export function DoualaMap({
  quarters,
  selected,
  className,
  interactive = true,
}: {
  quarters: Located[];
  selected: string | null;
  /** Largeur du cadre (760 px en desktop par défaut ; aperçu du back-office : pleine largeur). */
  className?: string;
  /** `false` : aperçu du back-office (sans zoom ni déplacement). */
  interactive?: boolean;
}) {
  const t = useTranslations('zones');
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });

  function zoom(factor: number, focus?: { x: number; y: number }) {
    const frame = frameRef.current;
    if (!frame) return;
    const { width, height } = frame.getBoundingClientRect();
    setView((current) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor));
      const fx = focus?.x ?? width / 2;
      const fy = focus?.y ?? height / 2;
      const x = fx - ((fx - current.x) / current.scale) * scale;
      const y = fy - ((fy - current.y) / current.scale) * scale;
      return { scale, x: clampOffset(x, scale, width), y: clampOffset(y, scale, height) };
    });
  }

  function pan(dx: number, dy: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const { width, height } = frame.getBoundingClientRect();
    setView((current) => ({
      ...current,
      x: clampOffset(current.x + dx, current.scale, width),
      y: clampOffset(current.y + dy, current.scale, height),
    }));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (view.scale === 1 || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, originX: view.x, originY: view.y };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    const frame = frameRef.current;
    if (!start || !frame) return;
    const { width, height } = frame.getBoundingClientRect();
    setView((current) => ({
      ...current,
      x: clampOffset(start.originX + event.clientX - start.x, current.scale, width),
      y: clampOffset(start.originY + event.clientY - start.y, current.scale, height),
    }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = 40;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      pan(...move);
    } else if (event.key === '+' || event.key === '=') {
      zoom(1.4);
    } else if (event.key === '-') {
      zoom(1 / 1.4);
    }
  }

  const zoomed = view.scale > 1.4;
  const control =
    'flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-0 text-text-main shadow-1 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:opacity-40';

  return (
    <div className={cn('relative w-full shrink-0 xl:w-[760px]', className)}>
      <div
        ref={frameRef}
        role={interactive ? 'group' : 'img'}
        aria-roledescription={interactive ? t('mapLabel') : undefined}
        aria-label={interactive ? t('mapHint') : t('mapLabel')}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? () => (drag.current = null) : undefined}
        onPointerCancel={interactive ? () => (drag.current = null) : undefined}
        onDoubleClick={
          interactive
            ? (event) => {
                const box = event.currentTarget.getBoundingClientRect();
                zoom(1.6, { x: event.clientX - box.left, y: event.clientY - box.top });
              }
            : undefined
        }
        onWheel={
          interactive
            ? (event) => {
                if (!event.ctrlKey) return;
                event.preventDefault();
                const box = event.currentTarget.getBoundingClientRect();
                zoom(event.deltaY < 0 ? 1.2 : 1 / 1.2, {
                  x: event.clientX - box.left,
                  y: event.clientY - box.top,
                });
              }
            : undefined
        }
        className={cn(
          'relative aspect-[760/540] w-full overflow-hidden rounded-[11px] bg-map-land select-none md:rounded-xl',
          interactive && 'touch-pan-y focus-visible:focus-ring',
          interactive && view.scale > 1 && 'cursor-grab touch-none active:cursor-grabbing',
        )}
      >
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          <svg
            aria-hidden
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <defs>
              <filter id="zone-area-blur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            {/* Le Wouri et sa rive ouest (tracés de la maquette). */}
            <path
              d="M150 0C210 90 170 170 205 250C235 330 170 420 120 540H0V300C40 200 70 120 40 0H150Z"
              fill="var(--mp-color-map-water)"
            />
            <path d="M40 0C70 120 40 200 0 300V0H40Z" fill="var(--mp-color-map-bank)" />
            <g filter="url(#zone-area-blur)">
              {quarters.map((quarter) => {
                const tone = TONES[quarter.zone.tone];
                return (
                  <circle
                    key={`aire-${quarter.name}`}
                    cx={quarter.position.x * MAP_WIDTH}
                    cy={quarter.position.y * MAP_HEIGHT}
                    r={62}
                    fill={tone.color}
                    fillOpacity={tone.area}
                  />
                );
              })}
            </g>
            {quarters.map((quarter) => {
              const tone = TONES[quarter.zone.tone];
              const isSelected = quarter.name === selected;
              return (
                <g key={`point-${quarter.name}`}>
                  {isSelected && (
                    <circle
                      cx={quarter.position.x * MAP_WIDTH}
                      cy={quarter.position.y * MAP_HEIGHT}
                      r={14}
                      fill={tone.color}
                      fillOpacity={0.25}
                    />
                  )}
                  <circle
                    cx={quarter.position.x * MAP_WIDTH}
                    cy={quarter.position.y * MAP_HEIGHT}
                    r={quarter.isBase ? 6.5 : 4.5}
                    fill={tone.color}
                    stroke="var(--mp-color-neutral-0)"
                    strokeWidth={3}
                  />
                </g>
              );
            })}
          </svg>
          <span
            aria-hidden
            className="absolute top-[25.86%] left-[19.56%] -translate-1/2 rotate-70 font-ui text-[9px] font-medium text-map-water-label md:text-[13px]"
          >
            {t('wouri')}
          </span>
          {quarters.map((quarter) => {
            const isSelected = quarter.name === selected;
            const visibleOnSmall =
              !interactive || quarter.labelOnSmallMap || quarter.isBase || isSelected || zoomed;
            return (
              <span
                key={`libelle-${quarter.name}`}
                aria-hidden
                style={{ left: `${quarter.position.x * 100}%`, top: `${quarter.position.y * 100}%` }}
                className={cn(
                  'absolute ml-2 -translate-y-1/2 font-ui text-[9px] whitespace-nowrap text-text-main md:ml-3 md:text-[12px]',
                  quarter.isBase || isSelected ? 'font-semibold md:text-[13px]' : 'font-medium',
                  !visibleOnSmall && 'max-md:hidden',
                )}
              >
                {quarter.mapLabel ?? quarter.name}
              </span>
            );
          })}
        </div>
      </div>
      {interactive && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 md:top-4 md:right-4">
          <button
            type="button"
            onClick={() => zoom(1.4)}
            disabled={view.scale >= MAX_SCALE}
            aria-label={t('zoomIn')}
            className={control}
          >
            <Plus aria-hidden size={16} />
          </button>
          <button
            type="button"
            onClick={() => zoom(1 / 1.4)}
            disabled={view.scale <= MIN_SCALE}
            aria-label={t('zoomOut')}
            className={control}
          >
            <Minus aria-hidden size={16} />
          </button>
          {view.scale > 1 && (
            <button
              type="button"
              onClick={() => setView({ scale: 1, x: 0, y: 0 })}
              aria-label={t('reset')}
              className={control}
            >
              <Undo2 aria-hidden size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Recherche d'un quartier (liste de suggestions au clavier) et réponse : zone et conditions d'intervention. */
function QuarterSearch({
  quarters,
  onSelect,
  selected,
}: {
  quarters: (ZoneQuarter & { zone: Zone })[];
  onSelect: (name: string | null) => void;
  selected: (ZoneQuarter & { zone: Zone }) | null;
}) {
  const t = useTranslations('zones');
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return quarters
      .filter((quarter) => quarter.position || quarter.detail)
      .filter((quarter) => normalize(quarter.name).includes(needle))
      .sort(
        (a, b) =>
          Number(!normalize(a.name).startsWith(needle)) - Number(!normalize(b.name).startsWith(needle)),
      )
      .slice(0, 6);
  }, [query, quarters]);

  function choose(quarter: ZoneQuarter & { zone: Zone }) {
    setQuery(quarter.name);
    setOpen(false);
    onSelect(quarter.name);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && matches.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % matches.length);
    } else if (event.key === 'ArrowUp' && matches.length) {
      event.preventDefault();
      setActive((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const match = matches[active] ?? matches[0];
      if (match) choose(match);
      else if (query.trim()) {
        setOpen(false);
        onSelect(null);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const listId = `${id}-suggestions`;
  const showList = open && matches.length > 0 && !(matches.length === 1 && matches[0]?.name === query);
  const notFound = query.trim() !== '' && !open && !selected;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <label htmlFor={`${id}-champ`} className="sr-only">
          {t('searchLabel')}
        </label>
        <div className="flex items-center gap-2.5 rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 leading-[18px] focus-within:focus-ring">
          <Search aria-hidden size={18} className="shrink-0 text-icon-default" />
          <input
            id={`${id}-champ`}
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList ? `${listId}-${active}` : undefined}
            autoComplete="off"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
              onSelect(null);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="min-w-0 flex-1 bg-transparent font-ui text-[15px] leading-[18px] text-text-main outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:cursor-pointer"
          />
        </div>
        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t('suggestions')}
            className="absolute inset-x-0 top-full z-10 mt-1.5 flex flex-col gap-0.5 rounded-md border border-border-default bg-neutral-0 p-1.5 shadow-3"
          >
            {matches.map((quarter, index) => (
              <li
                key={quarter.name}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onPointerDown={(event) => {
                  event.preventDefault();
                  choose(quarter);
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 font-ui text-[14px] text-text-main',
                  index === active && 'bg-neutral-50',
                )}
              >
                <span
                  aria-hidden
                  className={cn('size-2.5 shrink-0 rounded-full', TONES[quarter.zone.tone].dot)}
                />
                {quarter.name}
                <span className="ml-auto text-[12px] text-text-muted">{quarter.zone.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div aria-live="polite">
        {selected && (
          <div className="flex flex-col gap-1.5 rounded-md bg-map-result px-[18px] py-4 font-ui">
            <p className="text-[15px] leading-[1.2] font-semibold text-text-main">
              {frenchTypography(t('result', { quarter: selected.name, zone: selected.zone.name }))}
            </p>
            <p className="text-[14px] leading-[1.2] text-neutral-700">
              {frenchTypography(selected.zone.result)}
            </p>
          </div>
        )}
        {notFound && (
          <div className="flex flex-col gap-1.5 rounded-md bg-map-result px-[18px] py-4 font-ui">
            <p className="text-[15px] leading-[1.2] font-semibold text-text-main">
              {frenchTypography(t('notFoundTitle', { query: query.trim() }))}
            </p>
            <p className="text-[14px] leading-[1.2] text-neutral-700">
              {frenchTypography(t('notFoundText'))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Carte et recherche des zones d'intervention (accueil `290:31638`, page Zones) : carte 760 × 540 rayon 24 à gauche,
 * colonne « Trouvez votre quartier » (gap 20) : recherche, réponse, légende, lien facultatif. Empilées en mobile
 * (carte réduite 350 px, rayon 11, gap 24).
 */
export function ZonesMap({ areas, link }: { areas: ServiceAreas; link?: React.ReactNode }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const quarters = useMemo(
    () => areas.zones.flatMap((zone) => zone.quarters.map((quarter) => ({ ...quarter, zone }))),
    [areas.zones],
  );
  const located = quarters.filter((quarter): quarter is Located => quarter.position != null);
  const selected = quarters.find((quarter) => quarter.name === selectedName) ?? null;

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
      <DoualaMap quarters={located} selected={selectedName} />
      <ZonesAside areas={areas} link={link}>
        <QuarterSearch quarters={quarters} selected={selected} onSelect={setSelectedName} />
      </ZonesAside>
    </div>
  );
}
