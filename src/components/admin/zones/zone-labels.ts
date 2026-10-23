import type { AdminZone } from '@/lib/api/schema';
import { formatNumber } from '@/lib/format/number';

/**
 * Ligne secondaire d'une zone (`267:2066`) : « Cité SIC (base), Ndoghem, … » ; les quartiers hors carte sont
 * résumés en « hors zone » et une zone sans délai est « sur devis » (« Bonabéri et hors zone · sur devis »).
 */
export function zoneSubline(zone: AdminZone): string {
  const listed = zone.quarters.filter((quarter) => quarter.position != null);
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
