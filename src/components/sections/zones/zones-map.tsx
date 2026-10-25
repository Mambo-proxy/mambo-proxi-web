'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ServiceAreas, Zone, ZoneQuarter } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { ZonesAside } from './zones-aside';
import { ZonesLeafletMap, type MapAgency, type MapLabels, type MapZone } from './zones-leaflet';
import { TONES } from './zone-tones';

/** Recherche insensible à la casse, aux accents et aux tirets. */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-’']/g, ' ')
    .toLowerCase()
    .trim();
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
      .filter((quarter) => quarter.coordinates || quarter.position || quarter.detail)
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
 * Carte et recherche des zones d'intervention (accueil `290:31638`, page Zones, Contact) : carte interactive
 * OpenStreetMap 760 × 540 rayon 24 à gauche, colonne « Trouvez votre quartier » (gap 20) : recherche, réponse,
 * légende, lien facultatif. Empilées en mobile (carte réduite 350 px, rayon 11, gap 24). La recherche (et la liste
 * des quartiers de la page Zones) reste l'accès principal : choisir un quartier centre la carte et ouvre son
 * info-bulle.
 */
export function ZonesMap({
  areas,
  link,
  agency,
}: {
  areas: ServiceAreas;
  link?: ReactNode;
  /** Agence (`SiteSettings.agency`), placée sur la carte si elle a des coordonnées. */
  agency?: MapAgency | null;
}) {
  const t = useTranslations('zones');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const quarters = useMemo(
    () => areas.zones.flatMap((zone) => zone.quarters.map((quarter) => ({ ...quarter, zone }))),
    [areas.zones],
  );
  const selected = quarters.find((quarter) => quarter.name === selectedName) ?? null;
  const zones = useMemo<MapZone[]>(
    () => areas.zones.map((zone) => ({ ...zone, details: [frenchTypography(zone.result)] })),
    [areas.zones],
  );
  const labels = useMemo<MapLabels>(
    () => ({
      name: t('mapLabel'),
      hint: frenchTypography(t('mapHint')),
      zoomIn: t('zoomIn'),
      zoomOut: t('zoomOut'),
      reset: t('reset'),
      closePopup: t('closePopup'),
      base: t('base'),
      agency: t('agency'),
      wheel: frenchTypography(t('wheelHint')),
      wheelMac: frenchTypography(t('wheelHintMac')),
      touch: frenchTypography(t('touchHint')),
      attribution: t('attribution'),
      newTab: t('newTab'),
    }),
    [t],
  );

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
      <ZonesLeafletMap
        zones={zones}
        view={areas.map}
        agency={agency}
        labels={labels}
        selected={selected?.coordinates ? selected.name : null}
      />
      <ZonesAside areas={areas} link={link}>
        <QuarterSearch quarters={quarters} selected={selected} onSelect={setSelectedName} />
      </ZonesAside>
    </div>
  );
}
