import type { Zone } from '@/lib/api/schema';

export type Tone = Zone['tone'];

/** Couleur des contours et des repères, opacité du remplissage des contours (carte OpenStreetMap) et pastille de légende, par zone. */
export const TONES: Record<Tone, { color: string; area: number; dot: string }> = {
  zone1: { color: 'var(--mp-color-map-zone-1)', area: 0.18, dot: 'bg-map-zone-1' },
  zone2: { color: 'var(--mp-color-map-zone-2)', area: 0.18, dot: 'bg-map-zone-2' },
  zone3: { color: 'var(--mp-color-map-zone-3)', area: 0.06, dot: 'bg-map-zone-3' },
  special: { color: 'var(--mp-color-map-zone-special)', area: 0.06, dot: 'bg-map-zone-special' },
};
