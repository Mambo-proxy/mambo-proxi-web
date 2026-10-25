import { describe, expect, it } from 'vitest';
import type { GeoJsonPolygon } from '@/lib/api/schema';
import { tilesOrigin } from './tiles';
import {
  areaLatLngs,
  initialBounds,
  isInCameroon,
  maxViewBounds,
  parseCoordinate,
  parseZoneArea,
  serviceAreasMap,
  validatePoint,
  validateZoneArea,
} from './zones';

const square: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [9.7, 4.0],
      [9.8, 4.0],
      [9.8, 4.1],
      [9.7, 4.1],
      [9.7, 4.0],
    ],
  ],
};

describe('géographie des zones', () => {
  it('contrôle l’emprise du Cameroun', () => {
    expect(isInCameroon({ lat: 4.05, lng: 9.7 })).toBe(true);
    expect(isInCameroon({ lat: 48.85, lng: 2.35 })).toBe(false);
    expect(validatePoint({ lat: 9.7, lng: 4.05 }, 'quarters.0.coordinates')).toEqual({
      path: 'quarters.0.coordinates',
      message: expect.stringContaining('hors du Cameroun'),
    });
    expect(validatePoint({ lat: 4.05, lng: 9.7 }, 'x')).toBeNull();
  });

  it('lit les coordonnées saisies avec une virgule ou un point', () => {
    expect(parseCoordinate('4,0565')).toBe(4.0565);
    expect(parseCoordinate(' 9.7321234567 ')).toBe(9.732123);
    expect(parseCoordinate('nord')).toBeNull();
    expect(parseCoordinate('')).toBeNull();
  });

  it('convertit un contour GeoJSON [lng, lat] pour Leaflet [lat, lng]', () => {
    expect(areaLatLngs(square)[0]![0]![0]).toEqual([4.0, 9.7]);
    expect(
      areaLatLngs({ type: 'MultiPolygon', coordinates: [square.coordinates, square.coordinates] }),
    ).toHaveLength(2);
  });

  it('calcule le cadrage : emprise de l’API, sinon contours et quartiers', () => {
    const zones = [
      { area: square, quarters: [{ coordinates: { lat: 4.2, lng: 9.75 } }, { coordinates: null }] },
    ];
    expect(initialBounds({ zones })).toEqual([
      { lat: 4.0, lng: 9.7 },
      { lat: 4.2, lng: 9.8 },
    ]);
    const map = serviceAreasMap(zones)!;
    expect(map.center).toEqual({ lat: 4.1, lng: 9.75 });
    expect(initialBounds({ zones, map })).toEqual(map.bounds);
    expect(initialBounds({ zones: [{ quarters: [] }] })).toBeNull();
  });

  it('garde une marge de déplacement autour d’une zone réduite à un point', () => {
    const [southWest, northEast] = maxViewBounds([
      { lat: 4.05, lng: 9.7 },
      { lat: 4.05, lng: 9.7 },
    ]);
    expect(northEast.lat - southWest.lat).toBeCloseTo(0.5);
    expect(northEast.lng - southWest.lng).toBeCloseTo(0.5);
  });

  it('valide les contours avec le chemin du point fautif', () => {
    expect(validateZoneArea(square)).toBeNull();
    expect(validateZoneArea({ type: 'Point', coordinates: [9.7, 4] })?.path).toBe('area');
    const outside = structuredClone(square);
    outside.coordinates[0]![2] = [2.35, 48.85];
    expect(validateZoneArea(outside)).toEqual({
      path: 'area.coordinates.0.2',
      message: 'Le point 3 du contour est hors du Cameroun.',
    });
    const open = { type: 'Polygon', coordinates: [square.coordinates[0]!.slice(0, 4)] };
    expect(validateZoneArea(open)?.message).toContain('fermé');
  });

  it('importe un GeoJSON collé : Feature, FeatureCollection, anneau fermé et orienté', () => {
    const ring = [
      [9.7, 4.0],
      [9.7, 4.1],
      [9.8, 4.1],
      [9.8, 4.0],
    ]; // sens des aiguilles d'une montre, non fermé
    const feature = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
    const result = parseZoneArea(JSON.stringify(feature));
    expect('area' in result && result.area.type).toBe('Polygon');
    if (!('area' in result) || result.area.type !== 'Polygon') return;
    const exterior = result.area.coordinates[0]!;
    expect(exterior).toHaveLength(5);
    expect(exterior[0]).toEqual(exterior.at(-1));
    expect(exterior[1]).toEqual([9.8, 4.0]);

    const collection = { type: 'FeatureCollection', features: [feature, feature] };
    const merged = parseZoneArea(JSON.stringify(collection));
    expect('area' in merged && merged.area.type).toBe('MultiPolygon');
  });

  it('explique les erreurs d’import', () => {
    expect(parseZoneArea('{ pas du json')).toEqual({ error: expect.stringContaining('JSON illisible') });
    expect(parseZoneArea('{"type":"Point","coordinates":[9.7,4]}')).toEqual({
      error: expect.stringContaining('Aucun polygone'),
    });
    const swapped = {
      type: 'Polygon',
      coordinates: [square.coordinates[0]!.map(([lng, lat]) => [lat, lng])],
    };
    expect(parseZoneArea(JSON.stringify(swapped))).toEqual({
      error: expect.stringContaining('inversées'),
    });
  });

  it('donne l’origine des tuiles pour la CSP', () => {
    expect(tilesOrigin('https://tile.openstreetmap.org/{z}/{x}/{y}.png')).toBe(
      'https://tile.openstreetmap.org',
    );
    expect(tilesOrigin('https://{s}.tiles.example.com/{z}/{x}/{y}.png?key=abc')).toBe(
      'https://*.tiles.example.com',
    );
    expect(tilesOrigin('/tuiles/{z}/{x}/{y}.png')).toBeNull();
  });
});
