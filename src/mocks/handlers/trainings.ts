import { http, HttpResponse } from 'msw';
import type { Training, TrainingCategory } from '@/lib/api/schema';

const LABELS: Record<TrainingCategory, { label: string; audience: string }> = {
  PROFESSIONNELS: { label: 'Professionnels', audience: 'Prestataires et entreprises' },
  ATELIERS: { label: 'Ateliers', audience: 'Particuliers et familles' },
  SENSIBILISATION: { label: 'Sensibilisation', audience: 'Familles et associations' },
};

function training(
  slug: string,
  title: string,
  category: TrainingCategory,
  icon: string,
  duration: string,
  format: string,
  location: string | null,
): Training {
  return {
    id: `trn_${slug.replaceAll('-', '_')}`,
    slug,
    title,
    category,
    categoryLabel: LABELS[category].label,
    audienceLabel: LABELS[category].audience,
    icon,
    duration,
    format,
    location,
    description: null,
  };
}

/** Catalogue simulé : les 6 formations de la maquette Formation (`66:6370`), dans le même ordre. */
export const trainings: Training[] = [
  training(
    'accueil-relation-client',
    'Accueil et relation client',
    'PROFESSIONNELS',
    'Users',
    '1 jour',
    'Présentiel',
    'Douala',
  ),
  training(
    'hygiene-securite-cuisine',
    'Hygiène et sécurité en cuisine',
    'PROFESSIONNELS',
    'Utensils',
    '2 jours',
    'Présentiel',
    'Douala',
  ),
  training(
    'entretien-logements',
    'Entretien professionnel des logements',
    'PROFESSIONNELS',
    'Wrench',
    '1 jour',
    'Présentiel',
    'Yaoundé',
  ),
  training(
    'gestion-locative-fondamentaux',
    'Gestion locative : les fondamentaux',
    'PROFESSIONNELS',
    'Building',
    '2 jours',
    'En ligne',
    null,
  ),
  training(
    'preparer-installation-cameroun',
    'Bien préparer son installation au Cameroun',
    'ATELIERS',
    'Plane',
    '2 heures',
    'En ligne',
    null,
  ),
  training(
    'accompagner-proche-age',
    'Accompagner un proche âgé à domicile',
    'SENSIBILISATION',
    'HouseHeart',
    '3 heures',
    'Présentiel',
    'Douala',
  ),
];

export const trainingHandlers = [
  http.get('*/v1/trainings', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    return HttpResponse.json(category ? trainings.filter((item) => item.category === category) : trainings);
  }),
];
