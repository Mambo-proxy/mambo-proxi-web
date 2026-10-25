import type { ServiceAreas, ZoneArea } from '@/lib/api/schema';
import { serviceAreasMap } from '@/lib/geo/zones';
import operations from './contract-examples.json';

const examples = operations.find((operation) => operation.operationId === 'getServiceAreas')?.examples;

/**
 * Contours de démonstration des zones (GeoJSON `[longitude, latitude]`, anneaux extérieurs dans le sens inverse des
 * aiguilles d'une montre), tracés grossièrement autour des quartiers de l'exemple du contrat : la zone 1 garde le
 * contour du contrat (autour de Cité SIC) ; la zone 2 couvre le centre au bord du Wouri (Akwa, Deïdo, New Bell)
 * jusqu'à Ndogbong ; la zone 3 est en trois morceaux (Bonamoussadi, Kotto et Lendi au nord-est ; Bonanjo et
 * Bonapriso au bord du fleuve ; PK14 et Yassa au sud-est) ; la zone spéciale couvre Bonabéri, sur la rive ouest.
 * Les contours se chevauchent par endroits, comme des aires de desserte autour de la base de départ.
 */
export const ZONE_AREAS: Record<string, ZoneArea> = {
  'zone-2': {
    type: 'Polygon',
    coordinates: [
      [
        [9.69, 4.068],
        [9.688, 4.04],
        [9.705, 4.028],
        [9.742, 4.03],
        [9.753, 4.045],
        [9.75, 4.06],
        [9.725, 4.07],
        [9.69, 4.068],
      ],
    ],
  },
  'zone-3': {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [9.728, 4.098],
          [9.735, 4.086],
          [9.748, 4.09],
          [9.758, 4.086],
          [9.76, 4.064],
          [9.764, 4.052],
          [9.78, 4.052],
          [9.783, 4.075],
          [9.768, 4.112],
          [9.745, 4.115],
          [9.728, 4.098],
        ],
      ],
      [
        [
          [9.682, 4.04],
          [9.684, 4.016],
          [9.7, 4.012],
          [9.706, 4.024],
          [9.698, 4.038],
          [9.682, 4.04],
        ],
      ],
      [
        [
          [9.788, 4.05],
          [9.786, 4.0],
          [9.815, 3.998],
          [9.825, 4.048],
          [9.788, 4.05],
        ],
      ],
    ],
  },
  'zone-speciale': {
    type: 'Polygon',
    coordinates: [
      [
        [9.64, 4.1],
        [9.632, 4.07],
        [9.648, 4.048],
        [9.672, 4.052],
        [9.68, 4.075],
        [9.668, 4.098],
        [9.64, 4.1],
      ],
    ],
  },
};

/** Exemple du contrat complété : contour de chaque zone et cadrage de la carte recalculé comme le fait l'API. */
function withAreas(areas: ServiceAreas): ServiceAreas {
  const zones = areas.zones.map((zone) => ({ ...zone, area: zone.area ?? ZONE_AREAS[zone.key] ?? null }));
  return { ...areas, zones, map: serviceAreasMap(zones) };
}

/** `GET /v1/zones` : quartiers géolocalisés (coordonnées de l'exemple du contrat), contours et cadrage. */
export const serviceAreas = withAreas(examples?.default as ServiceAreas);
export const serviceAreasEn = withAreas((examples?.en ?? examples?.default) as ServiceAreas);
