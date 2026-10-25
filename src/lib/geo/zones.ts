import type { GeoJsonPosition, GeoPoint, ServiceAreas, ZoneArea, ZoneQuarter } from '@/lib/api/schema';

/** Emprise du Cameroun contrôlée par l'API pour les coordonnées et les contours (contrat, `PATCH /v1/admin/zones`). */
export const CAMEROON = { minLat: 1.6, maxLat: 13.1, minLng: 8.4, maxLng: 16.2 } as const;

/** Centre de Douala : cadrage de repli quand aucune zone n'est géolocalisée. */
export const DOUALA_CENTER: GeoPoint = { lat: 4.05, lng: 9.7 };

/** Limites du contrat : 4 à 500 positions par anneau, 5 000 par zone. */
export const MAX_RING_POSITIONS = 500;
export const MAX_AREA_POSITIONS = 5000;

/** Emprise `[sud-ouest, nord-est]`. */
export type GeoBounds = [southWest: GeoPoint, northEast: GeoPoint];

export type GeoIssue = { path: string; message: string };

type Located = { quarters: Pick<ZoneQuarter, 'coordinates'>[]; area?: ZoneArea | null };

export function isInCameroon(point: GeoPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= CAMEROON.minLat &&
    point.lat <= CAMEROON.maxLat &&
    point.lng >= CAMEROON.minLng &&
    point.lng <= CAMEROON.maxLng
  );
}

/** 6 décimales au plus (≈ 0,1 m), comme le contrat. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/** Saisie d'une latitude ou d'une longitude : virgule ou point décimal ; `null` si vide ou illisible. */
export function parseCoordinate(text: string): number | null {
  const value = text.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(value)) return null;
  return roundCoordinate(Number(value));
}

/** Polygones d'un contour, toujours sous la forme `MultiPolygon` (polygone → anneaux → positions). */
export function areaPolygons(area: ZoneArea): GeoJsonPosition[][][] {
  return area.type === 'Polygon' ? [area.coordinates] : area.coordinates;
}

/** Sommets d'un contour, en `GeoPoint` (GeoJSON est en `[longitude, latitude]`). */
export function areaPoints(area: ZoneArea): GeoPoint[] {
  return areaPolygons(area)
    .flat(2)
    .map((position) =>
      Array.isArray(position)
        ? { lat: Number(position[1]), lng: Number(position[0]) }
        : { lat: NaN, lng: NaN },
    );
}

export function boundsOf(points: GeoPoint[]): GeoBounds | null {
  const valid = points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
  if (!valid.length) return null;
  const lats = valid.map((point) => point.lat);
  const lngs = valid.map((point) => point.lng);
  return [
    { lat: Math.min(...lats), lng: Math.min(...lngs) },
    { lat: Math.max(...lats), lng: Math.max(...lngs) },
  ];
}

/** Emprise élargie de `ratio` de chaque côté (0,5 : moitié de la hauteur et de la largeur en plus de chaque côté). */
export function padBounds([southWest, northEast]: GeoBounds, ratio: number): GeoBounds {
  const lat = (northEast.lat - southWest.lat) * ratio;
  const lng = (northEast.lng - southWest.lng) * ratio;
  return [
    { lat: southWest.lat - lat, lng: southWest.lng - lng },
    { lat: northEast.lat + lat, lng: northEast.lng + lng },
  ];
}

/** Points géolocalisés des zones : sommets des contours et quartiers placés. */
export function zonesPoints(zones: Located[]): GeoPoint[] {
  return zones.flatMap((zone) => [
    ...(zone.area ? areaPoints(zone.area) : []),
    ...zone.quarters.flatMap((quarter) => (quarter.coordinates ? [quarter.coordinates] : [])),
  ]);
}

/**
 * Cadrage initial de la carte : emprise calculée par l'API (`ServiceAreas.map.bounds`), sinon celle des contours et
 * des quartiers (et des points `extra`, l'agence par exemple) ; `null` si rien n'est géolocalisé.
 */
export function initialBounds(
  areas: { zones: Located[]; map?: ServiceAreas['map'] },
  extra: GeoPoint[] = [],
): GeoBounds | null {
  const bounds = areas.map?.bounds;
  if (bounds?.length === 2) return [bounds[0]!, bounds[1]!];
  return boundsOf([...zonesPoints(areas.zones), ...extra]);
}

/** `ServiceAreas.map` tel que l'API le calcule : centre et emprise des zones, zoom 12 (ville entière). */
export function serviceAreasMap(zones: Located[]): ServiceAreas['map'] {
  const bounds = boundsOf(zonesPoints(zones));
  if (!bounds) return null;
  const [southWest, northEast] = bounds;
  return {
    center: {
      lat: roundCoordinate((southWest.lat + northEast.lat) / 2),
      lng: roundCoordinate((southWest.lng + northEast.lng) / 2),
    },
    zoom: 12,
    bounds: [
      { lat: roundCoordinate(southWest.lat), lng: roundCoordinate(southWest.lng) },
      { lat: roundCoordinate(northEast.lat), lng: roundCoordinate(northEast.lng) },
    ],
  };
}

/** Coordonnées d'un quartier : nombres finis, dans l'emprise du Cameroun. */
export function validatePoint(point: unknown, path: string): GeoIssue | null {
  const value = point as Partial<GeoPoint> | null;
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof value.lat !== 'number' ||
    typeof value.lng !== 'number'
  )
    return { path, message: 'Saisissez une latitude et une longitude en degrés décimaux.' };
  if (!isInCameroon(value as GeoPoint))
    return { path, message: 'Ce point est hors du Cameroun : vérifiez la latitude et la longitude.' };
  return null;
}

function samePosition(a: GeoJsonPosition | undefined, b: GeoJsonPosition | undefined) {
  return !!a && !!b && a[0] === b[0] && a[1] === b[1];
}

/** Aire signée d'un anneau (formule du lacet) : positive dans le sens inverse des aiguilles d'une montre. */
function signedArea(ring: GeoJsonPosition[]) {
  let total = 0;
  for (let index = 0; index < ring.length - 1; index++) {
    const [x1 = 0, y1 = 0] = ring[index]!;
    const [x2 = 0, y2 = 0] = ring[index + 1]!;
    total += x1 * y2 - x2 * y1;
  }
  return total / 2;
}

/**
 * Contrôle d'un contour (mêmes règles que l'API) : `Polygon` ou `MultiPolygon`, anneaux fermés de 4 à 500 positions
 * `[longitude, latitude]`, 5 000 positions au plus, tous les points au Cameroun. Chemin du point fautif en notation
 * pointée (`area.coordinates.0.3`).
 */
export function validateZoneArea(value: unknown, path = 'area'): GeoIssue | null {
  const area = value as { type?: unknown; coordinates?: unknown } | null;
  if (typeof area !== 'object' || area === null || (area.type !== 'Polygon' && area.type !== 'MultiPolygon'))
    return { path, message: 'Le contour doit être un polygone GeoJSON (Polygon ou MultiPolygon).' };
  if (!Array.isArray(area.coordinates) || area.coordinates.length === 0)
    return { path, message: 'Le contour ne contient aucun point.' };
  const polygons = (area.type === 'Polygon' ? [area.coordinates] : area.coordinates) as unknown[];
  let total = 0;
  for (const [polygonIndex, polygon] of polygons.entries()) {
    const polygonPath =
      area.type === 'Polygon' ? `${path}.coordinates` : `${path}.coordinates.${polygonIndex}`;
    if (!Array.isArray(polygon) || polygon.length === 0)
      return { path: polygonPath, message: 'Chaque polygone doit avoir au moins un anneau.' };
    for (const [ringIndex, ring] of polygon.entries()) {
      const ringPath = `${polygonPath}.${ringIndex}`;
      if (!Array.isArray(ring) || ring.length < 4 || ring.length > MAX_RING_POSITIONS)
        return { path: ringPath, message: 'Chaque anneau doit compter de 4 à 500 points.' };
      for (const [index, position] of ring.entries()) {
        const [lng, lat] = Array.isArray(position) ? (position as unknown[]) : [];
        if (typeof lng !== 'number' || typeof lat !== 'number')
          return { path: `${ringPath}.${index}`, message: 'Chaque point doit être [longitude, latitude].' };
        if (!isInCameroon({ lat, lng }))
          return {
            path: `${ringPath}.${index}`,
            message: `Le point ${index + 1} du contour est hors du Cameroun.`,
          };
      }
      if (!samePosition(ring[0] as GeoJsonPosition, ring.at(-1) as GeoJsonPosition))
        return { path: ringPath, message: 'Chaque anneau doit être fermé (dernier point = premier point).' };
      total += ring.length;
    }
  }
  if (total > MAX_AREA_POSITIONS)
    return { path, message: 'Le contour dépasse 5 000 points : simplifiez-le avant de l’importer.' };
  return null;
}

/** Géométries `Polygon` / `MultiPolygon` d'un objet GeoJSON (géométrie, `Feature` ou `FeatureCollection`). */
function polygonsOf(value: unknown): GeoJsonPosition[][][] | null {
  const object = value as {
    type?: string;
    coordinates?: unknown;
    geometry?: unknown;
    features?: unknown[];
  } | null;
  if (typeof object !== 'object' || object === null) return null;
  if (object.type === 'Feature') return polygonsOf(object.geometry);
  if (object.type === 'FeatureCollection' && Array.isArray(object.features)) {
    const parts = object.features.map(polygonsOf);
    return parts.length && parts.every(Boolean) ? parts.flatMap((part) => part!) : null;
  }
  if (object.type === 'Polygon' && Array.isArray(object.coordinates))
    return [object.coordinates as GeoJsonPosition[][]];
  if (object.type === 'MultiPolygon' && Array.isArray(object.coordinates))
    return object.coordinates as GeoJsonPosition[][][];
  return null;
}

/** Anneau normalisé : `[longitude, latitude]` arrondis (altitude retirée), fermé, orienté selon la RFC 7946. */
function normalizeRing(ring: unknown, exterior: boolean): GeoJsonPosition[] {
  if (!Array.isArray(ring)) return [];
  const positions = ring.map((position) =>
    Array.isArray(position) && typeof position[0] === 'number' && typeof position[1] === 'number'
      ? [roundCoordinate(position[0]), roundCoordinate(position[1])]
      : position,
  ) as GeoJsonPosition[];
  if (positions.length >= 3 && !samePosition(positions[0], positions.at(-1)))
    positions.push([...positions[0]!]);
  const counterClockwise = signedArea(positions) > 0;
  return counterClockwise === exterior ? positions : positions.reverse();
}

/**
 * Contour collé ou importé dans le back-office (GeoJSON de geojson.io, uMap, QGIS…) : accepte une géométrie, une
 * `Feature` ou une `FeatureCollection` de polygones (fusionnés en `MultiPolygon`), ferme les anneaux, arrondit les
 * coordonnées et oriente les anneaux ; puis contrôle avec les règles de l'API.
 */
export function parseZoneArea(text: string): { area: ZoneArea } | { error: string } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: 'Ce texte n’est pas du GeoJSON valide (JSON illisible).' };
  }
  const polygons = polygonsOf(json);
  if (!polygons?.length)
    return { error: 'Aucun polygone trouvé : importez un contour Polygon ou MultiPolygon.' };
  const normalized = polygons.map((polygon) =>
    Array.isArray(polygon) ? polygon.map((ring, index) => normalizeRing(ring, index === 0)) : polygon,
  );
  const area: ZoneArea =
    normalized.length === 1
      ? { type: 'Polygon', coordinates: normalized[0]! }
      : { type: 'MultiPolygon', coordinates: normalized };
  const issue = validateZoneArea(area);
  if (issue) {
    // Erreur fréquente : coordonnées saisies en [latitude, longitude].
    const points = areaPoints(area);
    const swapped =
      !points.every(isInCameroon) &&
      points.every((point) => isInCameroon({ lat: point.lng, lng: point.lat }));
    return {
      error: swapped
        ? 'Les coordonnées semblent inversées : GeoJSON attend [longitude, latitude].'
        : issue.message,
    };
  }
  return { area };
}

/** Contour au format Leaflet (`L.polygon`) : polygones → anneaux → `[latitude, longitude]`. */
export function areaLatLngs(area: ZoneArea): [lat: number, lng: number][][][] {
  return areaPolygons(area).map((polygon) =>
    polygon.map((ring) => ring.map(([lng = NaN, lat = NaN]) => [lat, lng] as [number, number])),
  );
}

/**
 * Limites de déplacement de la carte : l'emprise doublée de chaque côté, et au moins `minHalfSpan` degrés autour de
 * son centre (≈ 28 km pour 0,25°), pour qu'une zone réduite à un point laisse la ville accessible.
 */
export function maxViewBounds(bounds: GeoBounds, minHalfSpan = 0.25): GeoBounds {
  const [southWest, northEast] = padBounds(bounds, 1);
  const center = { lat: (southWest.lat + northEast.lat) / 2, lng: (southWest.lng + northEast.lng) / 2 };
  const halfLat = Math.max((northEast.lat - southWest.lat) / 2, minHalfSpan);
  const halfLng = Math.max((northEast.lng - southWest.lng) / 2, minHalfSpan);
  return [
    { lat: center.lat - halfLat, lng: center.lng - halfLng },
    { lat: center.lat + halfLat, lng: center.lng + halfLng },
  ];
}
