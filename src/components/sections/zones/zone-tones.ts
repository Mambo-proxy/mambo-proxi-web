import type { Zone } from '@/lib/api/schema';

export type Tone = Zone['tone'];

/** Couleur et opacité des aires (cercles flous de 62 px autour de chaque quartier) et des points, par zone. */
export const TONES: Record<Tone, { color: string; area: number; dot: string }> = {
  zone1: { color: 'var(--mp-color-map-zone-1)', area: 0.18, dot: 'bg-map-zone-1' },
  zone2: { color: 'var(--mp-color-map-zone-2)', area: 0.18, dot: 'bg-map-zone-2' },
  zone3: { color: 'var(--mp-color-map-zone-3)', area: 0.06, dot: 'bg-map-zone-3' },
  special: { color: 'var(--mp-color-map-zone-special)', area: 0.06, dot: 'bg-map-zone-special' },
};
