import type { AdminTraining, AdminTrainingRequest, TrainingCategory } from '@/lib/api/schema';

export const TRAINING_CATEGORY_LABELS: Record<TrainingCategory, string> = {
  PROFESSIONNELS: 'Professionnels',
  ATELIERS: 'Ateliers',
  SENSIBILISATION: 'Sensibilisation',
};

/** Public par défaut d'une catégorie (repris à la création, modifiable). */
export const TRAINING_AUDIENCES: Record<TrainingCategory, string> = {
  PROFESSIONNELS: 'Prestataires et entreprises',
  ATELIERS: 'Particuliers et familles',
  SENSIBILISATION: 'Familles et associations',
};

/** Section de la page Formation où paraît la formation (sous-titre de la ligne, `93:22627`). */
export function trainingSection(category: TrainingCategory): string {
  return category === 'PROFESSIONNELS' ? 'Formation des professionnels' : 'Ateliers & sensibilisation';
}

/** « Présentiel · Douala », « En ligne ». */
export function formatLabel(training: Pick<AdminTraining, 'format' | 'location'>): string {
  return training.location ? `${training.format} · ${training.location}` : training.format;
}

/** Formation souhaitée : titre du catalogue ou formation « Autre » saisie par le demandeur. */
export function requestedTraining(request: Pick<AdminTrainingRequest, 'training' | 'otherTraining'>): string {
  return request.training?.title ?? request.otherTraining ?? 'Autre formation';
}
