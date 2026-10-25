import type { MapLabels } from '@/components/sections/zones/zones-leaflet';
import type { AdminZone, GeoPoint, ZoneArea } from '@/lib/api/schema';
import { formatNumber } from '@/lib/format/number';
import { areaPolygons } from '@/lib/geo/zones';

/** Textes de la carte dans le back-office (en français, hors du site bilingue). */
export const ADMIN_MAP_LABELS: MapLabels = {
  name: 'Carte des zones d’intervention',
  hint: 'Cliquez sur la carte pour placer le quartier choisi, ou saisissez sa latitude et sa longitude. Flèches du clavier pour déplacer la carte, + et − pour zoomer ; à la molette, maintenez Ctrl (⌘ sur Mac).',
  zoomIn: 'Zoomer',
  zoomOut: 'Dézoomer',
  reset: 'Recentrer la carte',
  closePopup: 'Fermer l’info-bulle',
  base: 'Base de départ',
  agency: 'Agence',
  wheel: 'Maintenez Ctrl et faites défiler pour zoomer sur la carte.',
  wheelMac: 'Maintenez ⌘ et faites défiler pour zoomer sur la carte.',
  touch: 'Utilisez deux doigts pour déplacer la carte.',
  attribution: 'contributeurs OpenStreetMap',
  newTab: 'nouvel onglet',
};

const coordinate = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 6 });

/** « 4,0565 N · 9,732 E » (Douala : latitude nord, longitude est). */
export function pointLabel(point: GeoPoint): string {
  return `${coordinate(Math.abs(point.lat))}\u00A0${point.lat < 0 ? 'S' : 'N'} · ${coordinate(Math.abs(point.lng))}\u00A0${point.lng < 0 ? 'O' : 'E'}`;
}

/** « 1 polygone, 6 points », « 3 polygones, 21 points ». */
export function areaSummary(area: ZoneArea): string {
  const polygons = areaPolygons(area);
  const points = polygons.flat().reduce((total, ring) => total + Math.max(ring.length - 1, 0), 0);
  return `${polygons.length} polygone${polygons.length > 1 ? 's' : ''}, ${formatNumber(points)} point${points > 1 ? 's' : ''}`;
}

/**
 * Ligne secondaire d'une zone (`267:2066`) : « Cité SIC (base), Ndoghem, … » ; les quartiers non placés sont
 * résumés en « hors zone » et une zone sans délai est « sur devis » (« Bonabéri et hors zone · sur devis »).
 */
export function zoneSubline(zone: AdminZone): string {
  const listed = zone.quarters.filter((quarter) => quarter.coordinates != null || quarter.position != null);
  const offMap = zone.quarters.length - listed.length;
  const names = listed
    .map((quarter) => (quarter.isBase ? `${quarter.name} (base)` : quarter.name))
    .join(', ');
  const summary = offMap ? (names ? `${names} et hors zone` : 'Hors zone') : names || 'Aucun quartier';
  return zone.delay ? summary : `${summary} · sur devis`;
}

/** « 1 500 FCFA · masqué », « Dès 3 500 FCFA · masqué ». */
export function feeLabel(zone: AdminZone, showFees: boolean): string {
  if (!zone.fee) return '—';
  const amount = `${zone.fee.from ? 'Dès ' : ''}${formatNumber(zone.fee.amount)}\u00A0FCFA`;
  return showFees ? amount : `${amount} · masqué`;
}
