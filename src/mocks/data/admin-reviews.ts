import type { AdminReview, AdminSurveyQuestion, Review, ReviewStats } from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';
import { services } from './catalogue';
import { reviews as siteReviews } from '../handlers/reviews';

/**
 * Avis du back-office (`93:10935`). Les avis publiés sont ceux du site (`handlers/reviews.ts`, mêmes identifiants) :
 * publier, masquer, mettre en avant ou répondre met aussi à jour la liste lue par `GET /v1/reviews`.
 * S'y ajoutent les 4 avis à valider de la maquette et 9 avis masqués.
 */

type Answers = AdminReview['answers'];

const answers = (punctuality: string, information: string, recommendation: number): Answers => [
  { question: 'Ponctualité', answer: punctuality },
  { question: 'Information', answer: information },
  { question: 'Recommandation', answer: `${recommendation}/10` },
];

const YES = 'Oui, tout à fait';
const RATHER_YES = 'Plutôt oui';
const RATHER_NO = 'Plutôt non';

function serviceRef(slug: string, name?: string): AdminReview['service'] {
  const service = services.find((item) => item.slug === slug);
  return service ? { slug: service.slug, name: name ?? service.shortName ?? service.name } : null;
}

/** Avis publié du site → avis du back-office (réponses au questionnaire reconstituées). */
function fromSite(review: Review, index: number): AdminReview {
  // Recommandation : 10 ou 9 pour les 5 étoiles ; 8 ou 9 pour les 4 étoiles (92 % de notes 9–10 au total).
  const recommendation = review.rating === 5 ? (index % 3 === 1 ? 9 : 10) : index < 30 ? 8 : 9;
  const date = new Date(review.date).getTime();
  return {
    id: review.id,
    authorName: review.authorName,
    initials: review.initials,
    city: review.city ?? null,
    rating: review.rating,
    text: review.text,
    service: review.service ? { slug: review.service.slug, name: review.service.name } : null,
    requestReference: `MP-2026-${String(120 - (index % 90)).padStart(4, '0')}`,
    serviceDate: new Date(date - 2 * 86_400_000).toISOString(),
    status: 'PUBLIE',
    verified: review.verified,
    featured: review.featured ?? false,
    publishConsent: true,
    answers: answers(index % 7 === 3 ? RATHER_YES : YES, index % 5 === 2 ? RATHER_YES : YES, recommendation),
    reply: review.reply ?? null,
    publishedAt: new Date(date + 86_400_000).toISOString(),
    createdAt: review.date,
  };
}

type Seed = {
  id: string;
  author: string;
  initials: string;
  city: string;
  service: string;
  serviceName?: string;
  rating: number;
  text: string;
  consent: boolean;
  answers: Answers;
  reference: string;
  /** Prestation et réception de l'avis, en jours avant aujourd'hui. */
  servedDaysAgo: number;
  receivedDaysAgo: number;
};

function fromSeed(seed: Seed, status: AdminReview['status']): AdminReview {
  return {
    id: seed.id,
    authorName: seed.author,
    initials: seed.initials,
    city: seed.city,
    rating: seed.rating,
    text: seed.text,
    service: serviceRef(seed.service, seed.serviceName),
    requestReference: seed.reference,
    serviceDate: daysAgo(seed.servedDaysAgo),
    status,
    verified: true,
    featured: false,
    publishConsent: seed.consent,
    answers: seed.answers,
    reply: null,
    publishedAt: null,
    createdAt: daysAgo(seed.receivedDaysAgo, 2),
  };
}

/** Les 3 avis de la maquette (du plus récent au plus ancien), puis un 4e avis à valider. */
const TO_VALIDATE: Seed[] = [
  {
    id: 'rev_aurelie_k',
    author: 'Aurélie K.',
    initials: 'AK',
    city: 'Paris',
    service: 'logement-temporaire',
    serviceName: 'Logement temporaire',
    rating: 5,
    // Apostrophes droites, comme sur la maquette.
    text: "Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus.",
    consent: true,
    answers: answers(YES, YES, 10),
    reference: 'MP-2026-0127',
    servedDaysAgo: 6,
    receivedDaysAgo: 1,
  },
  {
    id: 'rev_herve_d',
    author: 'Hervé D.',
    initials: 'HD',
    city: 'Douala',
    service: 'reception-colis-courrier',
    serviceName: 'Réception de colis',
    rating: 4,
    text: 'Colis reçu à l’agence, on m’a appelé le jour même et livré le lendemain. Très pro.',
    consent: true,
    answers: answers(YES, RATHER_YES, 9),
    reference: 'MP-2026-0138',
    servedDaysAgo: 6,
    receivedDaysAgo: 2,
  },
  {
    id: 'rev_marc_o',
    author: 'Marc O.',
    initials: 'MO',
    city: 'Lyon',
    service: 'location-voiture',
    rating: 3,
    text: 'Bon chauffeur mais 20 minutes de retard à l’aéroport. Le reste était parfait.',
    consent: false,
    answers: answers(RATHER_NO, YES, 7),
    reference: 'MP-2026-0124',
    servedDaysAgo: 6,
    receivedDaysAgo: 3,
  },
  {
    id: 'rev_nadia_f',
    author: 'Nadia F.',
    initials: 'NF',
    city: 'Bruxelles',
    service: 'chef-prive',
    rating: 5,
    text: 'Un dîner d’anniversaire inoubliable : le chef a tout préparé chez nous et ma famille en parle encore.',
    consent: true,
    answers: answers(YES, YES, 10),
    reference: 'MP-2026-0122',
    servedDaysAgo: 8,
    receivedDaysAgo: 5,
  },
];

const HIDDEN: Seed[] = [
  [
    'Joël M.',
    'Yaoundé',
    'chef-prive',
    5,
    false,
    'Repas délicieux, merci à toute l’équipe pour l’organisation.',
  ],
  [
    'Inès B.',
    'Paris',
    'photographe',
    5,
    false,
    'Des photos magnifiques de notre mariage, livrées en temps et en heure.',
  ],
  [
    'Boris N.',
    'Douala',
    'gestion-locative',
    5,
    false,
    'Suivi sérieux de mon appartement, comptes rendus clairs chaque mois.',
  ],
  [
    'Grâce E.',
    'Lille',
    'livraison-courses-commandes',
    5,
    true,
    'Courses livrées chez ma tante le jour même. Parfait.',
  ],
  [
    'Serge A.',
    'Kribi',
    'decouverte-cameroun',
    5,
    false,
    'Très belle journée à Kribi, guide très sympathique.',
  ],
  [
    'Esther O.',
    'Bordeaux',
    'recherche-logement',
    4,
    false,
    'Logement trouvé en deux semaines, quelques visites en moins auraient suffi.',
  ],
  [
    'Paul K.',
    'Douala',
    'entretien-logements',
    3,
    true,
    'Ménage correct mais le prestataire est arrivé en retard deux fois.',
  ],
  [
    'Yannick T.',
    'Montréal',
    'massage-bien-etre',
    3,
    false,
    'Massage agréable, mais le rendez-vous a été décalé au dernier moment.',
  ],
  [
    'Laure M.',
    'Paris',
    'location-voiture',
    2,
    true,
    'Voiture propre mais chauffeur injoignable le premier jour.',
  ],
].map(([author, city, service, rating, consent, text], index) => {
  const name = String(author);
  const stars = Number(rating);
  return {
    id: `rev_masque_${index + 1}`,
    author: name,
    initials: name.replace(/[^A-ZÀ-Ý]/g, '').slice(0, 2),
    city: String(city),
    service: String(service),
    rating: stars,
    text: String(text),
    consent: Boolean(consent),
    answers:
      stars >= 5
        ? answers(YES, YES, 10)
        : stars === 4
          ? answers(RATHER_YES, YES, 9)
          : answers(RATHER_NO, RATHER_YES, stars === 3 ? 6 - (index % 2) : 3),
    reference: `MP-2026-${String(110 - index * 3).padStart(4, '0')}`,
    servedDaysAgo: 12 + index * 6,
    receivedDaysAgo: 10 + index * 6,
  } satisfies Seed;
});

export const adminReviews: AdminReview[] = [
  ...TO_VALIDATE.map((seed) => fromSeed(seed, 'A_VALIDER')),
  ...HIDDEN.map((seed) => fromSeed(seed, 'MASQUE')),
  ...siteReviews.map(fromSite),
];

/** Avis à valider (compteur de la barre latérale et du tableau de bord). */
export function reviewsToValidate(): number {
  return adminReviews.filter((review) => review.status === 'A_VALIDER').length;
}

/** Questionnaires envoyés (taux de réponse : avis issus du questionnaire / questionnaires envoyés). */
const SURVEYS_SENT = 125;

const recommendationOf = (review: AdminReview) => {
  const answer = review.answers?.find((item) => item.question === 'Recommandation')?.answer;
  const value = answer ? Number.parseInt(answer, 10) : Number.NaN;
  return Number.isFinite(value) ? value : null;
};

/** Indicateurs calculés sur l'ensemble des avis reçus (tous statuts). */
export function reviewStats(): ReviewStats {
  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const review of adminReviews) distribution[String(review.rating) as keyof typeof distribution] += 1;
  const total = adminReviews.length;
  const scores = adminReviews.map(recommendationOf).filter((value): value is number => value !== null);
  const verified = adminReviews.filter((review) => review.verified).length;
  return {
    average: total ? adminReviews.reduce((sum, review) => sum + review.rating, 0) / total : 0,
    published: adminReviews.filter((review) => review.status === 'PUBLIE').length,
    toValidate: reviewsToValidate(),
    hidden: adminReviews.filter((review) => review.status === 'MASQUE').length,
    responseRate: Math.round((verified / SURVEYS_SENT) * 100),
    surveysSent: SURVEYS_SENT,
    recommendationRate: scores.length
      ? Math.round((scores.filter((value) => value >= 9).length / scores.length) * 100)
      : null,
    npsAverage: scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null,
    distribution,
  };
}

/** Avis du back-office → avis publié du site (`Review`). */
function toSiteReview(review: AdminReview): Review {
  const service = review.service ? services.find((item) => item.slug === review.service?.slug) : null;
  return {
    id: review.id,
    authorName: review.authorName,
    initials: review.initials ?? review.authorName.slice(0, 2).toUpperCase(),
    city: review.city ?? null,
    rating: review.rating,
    text: review.text,
    service:
      review.service && service
        ? {
            slug: review.service.slug,
            name: review.service.name,
            categorySlug: service.category.slug,
            categoryName: service.category.name,
          }
        : null,
    verified: review.verified,
    featured: review.featured,
    date: review.createdAt,
    reply: review.reply ?? null,
  };
}

/** Répercute un avis modifié sur la liste publique : présent si publié, retiré sinon. */
export function syncSite(review: AdminReview) {
  const index = siteReviews.findIndex((item) => item.id === review.id);
  if (review.status !== 'PUBLIE') {
    if (index >= 0) siteReviews.splice(index, 1);
    return;
  }
  const next = toSiteReview(review);
  if (index >= 0) siteReviews[index] = next;
  else siteReviews.push(next);
}

export function removeFromSite(id: string) {
  const index = siteReviews.findIndex((item) => item.id === id);
  if (index >= 0) siteReviews.splice(index, 1);
}

/**
 * Questions du questionnaire de satisfaction (`93:11304`), dans l'ordre de la maquette. Les choix reprennent ceux
 * du questionnaire public (`PublicSurvey` du contrat).
 */
export const surveyQuestions: AdminSurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    kind: 'STARS',
    label: 'Note globale (1 à 5 étoiles)',
    helpText: null,
    options: ['Très décevant', 'Décevant', 'Correct', 'Très bien', 'Excellent'],
    required: true,
    active: true,
  },
  {
    id: 'q2',
    order: 2,
    kind: 'CHOICE',
    label: 'Ponctualité et professionnalisme',
    helpText: null,
    options: [YES, RATHER_YES, RATHER_NO, 'Non, pas du tout'],
    required: false,
    active: true,
  },
  {
    id: 'q3',
    order: 3,
    kind: 'CHOICE',
    label: 'Qualité de l’information',
    helpText: null,
    options: [YES, RATHER_YES, RATHER_NO, 'Non, pas du tout'],
    required: false,
    active: true,
  },
  {
    id: 'q4',
    order: 4,
    kind: 'NPS',
    label: 'Recommandation (0 à 10)',
    helpText: null,
    options: ['Pas du tout probable', 'Très probable'],
    required: false,
    active: true,
  },
  {
    id: 'q5',
    order: 5,
    kind: 'TEXT',
    label: 'Commentaire libre',
    helpText: null,
    options: [],
    required: false,
    active: true,
  },
];

export function replaceSurveyQuestions(next: AdminSurveyQuestion[]) {
  surveyQuestions.splice(0, surveyQuestions.length, ...next);
}
