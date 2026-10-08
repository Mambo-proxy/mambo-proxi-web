import { http, HttpResponse } from 'msw';
import type { Review } from '@/lib/api/schema';
import { services } from '../data/catalogue';

type Seed = {
  author: string;
  city: string;
  service: string;
  /** Libellé du badge de service tel qu'il apparaît sur la maquette. */
  label?: string;
  text: string;
  rating?: number;
};

/** Les 6 avis de la maquette Avis clients (`68:7361`), du plus récent au plus ancien. */
const MAQUETTE: Seed[] = [
  {
    author: 'Aurélie K.',
    city: 'Paris → Douala',
    service: 'logement-temporaire',
    label: 'Logement temporaire',
    text: "Arrivée à Douala sans stress : logement prêt, chauffeur à l'aéroport et même les courses faites. On s'est sentis attendus.",
  },
  {
    author: 'Jean-Marc T.',
    city: 'Yaoundé',
    service: 'chef-prive',
    label: 'Chef privé',
    text: "Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable du début à la fin.",
  },
  {
    author: 'Sandrine M.',
    city: 'Lyon',
    service: 'gestion-locative',
    label: 'Gestion locative',
    text: 'Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.',
  },
  {
    author: 'Clarisse N.',
    city: 'Paris',
    service: 'portage-livraison-repas',
    label: 'Portage de repas',
    text: 'Ma mère reçoit ses repas chaque midi. Depuis Paris, je suis rassurée et toujours informée.',
  },
  {
    author: 'Patrick E.',
    city: 'Marseille',
    service: 'decouverte-cameroun',
    label: 'Découverte du Cameroun',
    text: 'La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé.',
  },
  {
    author: 'Hervé D.',
    city: 'Douala',
    service: 'reception-colis-courrier',
    label: 'Réception de colis',
    text: 'Colis reçu à l’agence, on m’a appelé le jour même et livré le lendemain. Très pro.',
  },
];

/** Avis complémentaires (provisoires) pour remplir la pagination de la maquette (`1 2 3 … 12`). */
const AUTHORS = [
  'Mireille A.',
  'Paul N.',
  'Estelle B.',
  'Yannick O.',
  'Nadège F.',
  'Thierry M.',
  'Laure B.',
  'Serge K.',
];
const CITIES = ['Douala', 'Yaoundé', 'Paris', 'Bruxelles', 'Lyon', 'Kribi', 'Montréal', 'Lille'];
const TEXTS = [
  'Une équipe réactive et à l’écoute : tout a été organisé comme convenu.',
  'Devis reçu rapidement, prestation soignée, je recommande sans hésiter.',
  'Un interlocuteur unique qui nous a tenus informés à chaque étape.',
  'Très bon accompagnement depuis la France, rien à redire.',
  'Prestataire ponctuel et professionnel, nous referons appel à Mambo.',
  'Service sérieux et humain, on se sent vraiment accompagné.',
];

const DAY = 24 * 60 * 60 * 1000;
const FIRST_DATE = Date.UTC(2026, 8, 12, 10);
/** Écarts en jours entre les avis de la maquette (12 sept., 3 sept., 28 août, 20 août, 9 août, 2 août). */
const MAQUETTE_OFFSETS = [0, 9, 15, 23, 34, 41];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .replace('.', '')
    .slice(0, 2)
    .toUpperCase();

function review(seed: Seed, index: number, date: number): Review {
  const service = services.find((item) => item.slug === seed.service) ?? services[0]!;
  return {
    id: `rev_${index + 1}`,
    authorName: seed.author,
    initials: initials(seed.author),
    city: seed.city,
    rating: seed.rating ?? 5,
    text: seed.text,
    service: {
      slug: service.slug,
      name: seed.label ?? service.shortName ?? service.name,
      categorySlug: service.category.slug,
      categoryName: service.category.name,
    },
    verified: true,
    featured: index < 3,
    date: new Date(date).toISOString(),
    reply: null,
  };
}

export const reviews: Review[] = [
  ...MAQUETTE.map((seed, index) => review(seed, index, FIRST_DATE - MAQUETTE_OFFSETS[index]! * DAY)),
  ...Array.from({ length: 66 }, (_, index) =>
    review(
      {
        author: AUTHORS[index % AUTHORS.length]!,
        city: CITIES[(index * 3) % CITIES.length]!,
        service: services[(index * 5) % services.length]!.slug,
        text: TEXTS[index % TEXTS.length]!,
        rating: index % 9 === 4 ? 4 : 5,
      },
      MAQUETTE.length + index,
      FIRST_DATE - (45 + index * 5) * DAY,
    ),
  ),
];

/** `GET /v1/reviews` : filtre par rubrique, service ou mise en avant, tri récent / mieux notés, pagination. */
export const reviewHandlers = [
  http.get('*/v1/reviews', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const category = query.get('category');
    const service = query.get('service');
    const featured = query.get('featured');
    const sort = query.get('sort') ?? 'recent';
    const page = Math.max(1, Number(query.get('page') ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(query.get('pageSize') ?? 12)));
    const list = reviews
      .filter(
        (item) =>
          (!category || item.service?.categorySlug === category) &&
          (!service || item.service?.slug === service) &&
          (featured === null || item.featured === (featured === 'true')),
      )
      .sort((a, b) => (sort === 'rating' ? b.rating - a.rating : 0) || b.date.localeCompare(a.date));
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    return HttpResponse.json({
      data: list.slice((page - 1) * pageSize, page * pageSize),
      meta: { page, pageSize, total: list.length, totalPages },
    });
  }),
];
