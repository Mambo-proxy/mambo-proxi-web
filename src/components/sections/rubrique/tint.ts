/**
 * Pastille d'icône selon la teinte de la rubrique (maquettes rubrique : Expérience orange pâle, Immobilier gris clair,
 * Proximité vert pâle, Culture sombre avec icône orange).
 */
const BADGES: Record<string, string> = {
  'orange-50': 'bg-orange-50 text-text-brand',
  'neutral-100': 'bg-neutral-100 text-neutral-700',
  'vert-50': 'bg-vert-50 text-vert-700',
  'neutral-900': 'bg-neutral-900 text-brand-primary',
};

export function tintBadge(tint: string): string {
  return BADGES[tint] ?? BADGES['orange-50']!;
}
