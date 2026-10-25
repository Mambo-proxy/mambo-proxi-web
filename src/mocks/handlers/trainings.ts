import { http, HttpResponse } from 'msw';
import type { AdminTraining, Training, TrainingCategory } from '@/lib/api/schema';
import { langOf } from '../data/catalogue';

export const TRAINING_LABELS: Record<TrainingCategory, { label: string; audience: string }> = {
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
    categoryLabel: TRAINING_LABELS[category].label,
    audienceLabel: TRAINING_LABELS[category].audience,
    icon,
    duration,
    format,
    location,
    description: null,
  };
}

/** Catalogue simulé : les 6 formations de la maquette Formation (`66:6370`), dans le même ordre. */
const seeds: Training[] = [
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

/** Demandes reçues par formation (maquette « BO — Formations », `93:22608`). */
const REQUESTS: Record<string, number> = {
  'accueil-relation-client': 3,
  'hygiene-securite-cuisine': 2,
  'entretien-logements': 1,
  'gestion-locative-fondamentaux': 0,
  'preparer-installation-cameroun': 4,
  'accompagner-proche-age': 1,
};

/**
 * Formations du back-office : le site lit les formations publiées, dans l'ordre enregistré. Créer, modifier,
 * dépublier ou réordonner une formation dans le back-office met donc à jour `GET /v1/trainings`.
 */
export const adminTrainings: AdminTraining[] = seeds.map((item, index) => ({
  ...item,
  status: 'PUBLISHED',
  sortOrder: index,
  requestsCount: REQUESTS[item.slug] ?? 0,
}));

export const sortedTrainings = () => [...adminTrainings].sort((a, b) => a.sortOrder - b.sortOrder);

/** Formations publiées, sans les champs du back-office. */
function published(): Training[] {
  return sortedTrainings()
    .filter((item) => item.status === 'PUBLISHED')
    .map(
      ({
        id,
        slug,
        title,
        category,
        categoryLabel,
        audienceLabel,
        icon,
        duration,
        format,
        location,
        description,
      }) => ({
        id,
        slug,
        title,
        category,
        categoryLabel,
        audienceLabel,
        icon,
        duration,
        format,
        location,
        description,
      }),
    );
}

/** Textes anglais du catalogue (`?lang=en`), par formation. */
const LABELS_EN: Record<TrainingCategory, { label: string; audience: string }> = {
  PROFESSIONNELS: { label: 'Professionals', audience: 'Service providers and businesses' },
  ATELIERS: { label: 'Workshops', audience: 'Individuals and families' },
  SENSIBILISATION: { label: 'Awareness', audience: 'Families and associations' },
};

const EN: Record<string, { title: string; duration: string }> = {
  'accueil-relation-client': { title: 'Customer welcome and relations', duration: '1 day' },
  'hygiene-securite-cuisine': { title: 'Kitchen hygiene and safety', duration: '2 days' },
  'entretien-logements': { title: 'Professional home cleaning', duration: '1 day' },
  'gestion-locative-fondamentaux': { title: 'Property management: the basics', duration: '2 days' },
  'preparer-installation-cameroun': { title: 'Preparing your move to Cameroon', duration: '2 hours' },
  'accompagner-proche-age': { title: 'Caring for an elderly relative at home', duration: '3 hours' },
};

const FORMATS_EN: Record<string, string> = { Présentiel: 'In person', 'En ligne': 'Online' };

const inEnglish = (item: Training): Training => ({
  ...item,
  ...EN[item.slug],
  categoryLabel: LABELS_EN[item.category].label,
  audienceLabel: LABELS_EN[item.category].audience,
  format: FORMATS_EN[item.format] ?? item.format,
});

/** Formations publiées dans la langue demandée (catalogue du site et recherche globale). */
export function publicTrainings(lang: 'fr' | 'en'): Training[] {
  return lang === 'en' ? published().map(inEnglish) : published();
}

export const trainingHandlers = [
  http.get('*/v1/trainings', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const list = publicTrainings(langOf(request));
    return HttpResponse.json(category ? list.filter((item) => item.category === category) : list);
  }),
];
