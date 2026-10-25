import { describe, expect, it } from 'vitest';
import type { AdminZone } from '@/lib/api/schema';
import { areaSummary, feeLabel, pointLabel, zoneSubline } from './zone-labels';

const zone = {
  delay: '30–45 min',
  fee: { amount: 1500, currency: 'XAF', from: false },
  quarters: [
    { name: 'Cité SIC', isBase: true, labelOnSmallMap: true, position: { x: 0.5, y: 0.5 } },
    { name: 'Ndoghem', isBase: false, labelOnSmallMap: false, position: { x: 0.7, y: 0.8 } },
    { name: 'Autres', isBase: false, labelOnSmallMap: false, position: null },
  ],
} as AdminZone;

describe('libellés des zones', () => {
  it('résume les quartiers et le hors zone, « sur devis » sans délai', () => {
    expect(zoneSubline(zone)).toBe('Cité SIC (base), Ndoghem et hors zone');
    expect(zoneSubline({ ...zone, delay: null })).toBe('Cité SIC (base), Ndoghem et hors zone · sur devis');
  });

  it('affiche le tarif indicatif masqué comme sur la maquette', () => {
    expect(feeLabel(zone, false)).toBe('1\u202f500\u00A0FCFA · masqué');
    expect(feeLabel(zone, true)).toBe('1\u202f500\u00A0FCFA');
    expect(feeLabel({ ...zone, fee: { amount: 3500, currency: 'XAF', from: true } }, false)).toBe(
      'Dès 3\u202f500\u00A0FCFA · masqué',
    );
    expect(feeLabel({ ...zone, fee: null }, false)).toBe('—');
  });

  it('compte un quartier placé par ses coordonnées, sans position sur la carte stylisée', () => {
    const placed = {
      ...zone,
      quarters: [
        { name: 'Bali', isBase: false, labelOnSmallMap: false, coordinates: { lat: 4.04, lng: 9.69 } },
      ],
    } as AdminZone;
    expect(zoneSubline(placed)).toBe('Bali');
  });

  it('affiche les coordonnées et le résumé d’un contour', () => {
    expect(pointLabel({ lat: 4.0565, lng: 9.732 })).toBe('4,0565\u00A0N · 9,732\u00A0E');
    expect(
      areaSummary({
        type: 'Polygon',
        coordinates: [
          [
            [9.7, 4],
            [9.8, 4],
            [9.8, 4.1],
            [9.7, 4],
          ],
        ],
      }),
    ).toBe('1 polygone, 3 points');
  });
});
