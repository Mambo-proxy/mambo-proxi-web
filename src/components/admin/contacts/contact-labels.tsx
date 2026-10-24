import { StatusPill } from '@/components/admin/editor/editor-ui';
import type { CategoryRef, SubscriberStatus } from '@/lib/api/schema';

/** Intérêts tels qu'affichés dans le tableau (`93:23112`) : « Proximité » pour les services de proximité. */
const SHORT_INTEREST: Record<string, string> = { 'services-de-proximite': 'Proximité' };

export function interestsLabel(interests: CategoryRef[]): string {
  return interests.map((category) => SHORT_INTEREST[category.slug] ?? category.name).join(', ') || '—';
}

/** Rubriques du filtre « Toutes les rubriques ». */
export const INTEREST_OPTIONS = [
  { value: 'services-a-domicile', label: 'Services à domicile' },
  { value: 'experience', label: 'Expérience' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'services-de-proximite', label: 'Services de proximité' },
  { value: 'culture-evenementiel', label: 'Culture & événementiel' },
];

/** Abonnement à la newsletter (`93:23117`) : « Abonné » (vert), « Non » (gris), en attente, désinscrit. */
export function NewsletterBadge({ status }: { status: SubscriberStatus | null | undefined }) {
  if (status === 'CONFIRME') return <StatusPill tone="success">Abonné</StatusPill>;
  if (status === 'EN_ATTENTE') return <StatusPill tone="warning">En attente</StatusPill>;
  if (status === 'DESINSCRIT') return <StatusPill tone="muted">Désinscrit</StatusPill>;
  return <StatusPill tone="neutral">Non</StatusPill>;
}
