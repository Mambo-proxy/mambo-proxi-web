import type { Completeness, FaqItem, IconTextItem, StepItem } from '@/lib/api/schema';

/** Largeur minimale de la photo principale « en haute définition » (1600 px conseillés). */
export const HD_WIDTH = 1600;

export type CompletenessInput = {
  name: string;
  /** Rubrique choisie (identifiant ou slug : seule la présence compte). */
  categoryId: string | null | undefined;
  tagline: string;
  summary: string;
  audiences: string[];
  steps: StepItem[];
  advantages: IconTextItem[];
  faq: FaqItem[];
  relatedServiceIds: string[];
  cover: { width: number } | null;
};

const filled = (value: string | null | undefined) => (value ?? '').trim().length > 0;

/**
 * Indicateur « Page complète à 86 % » (`91:11184`) : 6 sections du formulaire et la photo principale en haute
 * définition, mêmes critères que `GET /v1/admin/services/{id}/completeness`. Calculé en direct pendant la saisie.
 */
export function serviceCompleteness(input: CompletenessInput): Completeness {
  const criteria: Completeness['criteria'] = [
    {
      key: 'general',
      label: 'Informations générales',
      done:
        input.name.trim().length >= 2 &&
        filled(input.categoryId) &&
        filled(input.tagline) &&
        filled(input.summary),
    },
    { key: 'audiences', label: 'Public', done: input.audiences.some(filled) },
    {
      key: 'steps',
      label: 'Étapes',
      done: input.steps.some((step) => filled(step.title)),
    },
    {
      key: 'advantages',
      label: 'Avantages',
      done: input.advantages.some((item) => filled(item.title)),
    },
    {
      key: 'faq',
      label: 'Questions fréquentes',
      done: input.faq.some((item) => filled(item.question) && filled(item.answer)),
    },
    { key: 'related', label: 'Services liés', done: input.relatedServiceIds.length > 0 },
    {
      key: 'coverImage',
      label: 'Photo principale en haute définition',
      done: !!input.cover && input.cover.width >= HD_WIDTH,
    },
  ];
  const done = criteria.filter((item) => item.done).length;
  return { percent: Math.round((done / criteria.length) * 100), criteria };
}
