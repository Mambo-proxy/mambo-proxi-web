import type { AdminContactListItem, CategoryRef, SubscriberStatus } from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';

const CATEGORIES = {
  domicile: { slug: 'services-a-domicile', name: 'Services à domicile' },
  experience: { slug: 'experience', name: 'Expérience' },
  immobilier: { slug: 'immobilier', name: 'Immobilier' },
  proximite: { slug: 'services-de-proximite', name: 'Services de proximité' },
  culture: { slug: 'culture-evenementiel', name: 'Culture & événementiel' },
} satisfies Record<string, CategoryRef>;

type Category = keyof typeof CATEGORIES;

type Seed = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  professional?: boolean;
  organization?: string;
  interests: Category[];
  requestsCount: number;
  newsletter: SubscriberStatus | null;
  createdAt: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

function contact(seed: Seed): AdminContactListItem {
  return {
    id: seed.id,
    fullName: seed.fullName,
    initials: initials(seed.fullName),
    email: seed.email,
    phone: seed.phone,
    country: seed.country,
    city: seed.city,
    profile: seed.professional ? 'PROFESSIONNEL' : 'PARTICULIER',
    organization: seed.organization ?? null,
    interests: seed.interests.map((key) => CATEGORIES[key]),
    requestsCount: seed.requestsCount,
    newsletterStatus: seed.newsletter,
    source: seed.requestsCount ? 'Formulaire de devis' : 'Inscription à la newsletter',
    createdAt: seed.createdAt,
  };
}

/**
 * Les 6 contacts de la maquette « BO — Contacts & inscrits » (`93:23122`), du plus récent au plus ancien.
 * Aurélie Kamga et Sandrine Mballa sont aussi les clientes des demandes simulées (mêmes identifiants).
 */
const MAQUETTE: Seed[] = [
  {
    id: 'ctc_aurelie_kamga',
    fullName: 'Aurélie Kamga',
    email: 'aurelie.k@email.com',
    phone: '+237699123456',
    city: 'Bonapriso, Douala',
    country: 'CM',
    interests: ['immobilier', 'proximite'],
    requestsCount: 3,
    newsletter: 'CONFIRME',
    createdAt: daysAgo(0, 2),
  },
  {
    id: 'ctc_saveurs_de_douala',
    fullName: 'Saveurs de Douala',
    email: 'contact@saveurs-dla.cm',
    phone: '+237677451200',
    city: 'Douala',
    country: 'CM',
    professional: true,
    organization: 'Saveurs de Douala',
    interests: ['experience'],
    requestsCount: 0,
    newsletter: 'CONFIRME',
    createdAt: daysAgo(1, 4),
  },
  {
    id: 'ctc_patrick_essama',
    fullName: 'Patrick Essama',
    email: 'p.essama@email.com',
    phone: '+237691224455',
    city: 'Akwa, Douala',
    country: 'CM',
    interests: ['culture'],
    requestsCount: 1,
    newsletter: null,
    createdAt: daysAgo(2, 1),
  },
  {
    id: 'ctc_sandrine_mballa',
    fullName: 'Sandrine Mballa',
    email: 's.mballa@email.com',
    phone: '+237699123456',
    city: 'Kotto, Douala',
    country: 'CM',
    interests: ['immobilier'],
    requestsCount: 2,
    newsletter: 'CONFIRME',
    createdAt: daysAgo(3, 6),
  },
  {
    id: 'ctc_studio_lumiere',
    fullName: 'Studio Lumière',
    email: 'hello@studiolumiere.cm',
    phone: '+237655781020',
    city: 'Yaoundé',
    country: 'CM',
    professional: true,
    organization: 'Studio Lumière',
    interests: ['experience'],
    requestsCount: 0,
    newsletter: null,
    createdAt: daysAgo(4, 3),
  },
  {
    id: 'ctc_herve_dikoume',
    fullName: 'Hervé Dikoume',
    email: 'h.dikoume@email.com',
    phone: '+237670998877',
    city: 'Douala',
    country: 'CM',
    interests: ['proximite'],
    requestsCount: 4,
    newsletter: 'CONFIRME',
    createdAt: daysAgo(5, 2),
  },
];

const FIRST_NAMES = [
  'Marie',
  'Paul',
  'Esther',
  'Joël',
  'Nadia',
  'Serge',
  'Grâce',
  'Yannick',
  'Inès',
  'Boris',
  'Carine',
  'Jules',
];
const LAST_NAMES = [
  'Fotso',
  'Nkoulou',
  'Abena',
  'Mbarga',
  'Tchakounté',
  'Eyenga',
  'Manga',
  'Owona',
  'Kuete',
  'Nana',
  'Ebongue',
  'Ndjock',
];
const ORGANIZATIONS = [
  'Traiteur',
  'Agence',
  'Résidences',
  'Transports',
  'Studio',
  'Atelier',
  'Cabinet',
  'Services',
];
const QUARTERS = [
  'Akwa',
  'Bonapriso',
  'Bonanjo',
  'Bonamoussadi',
  'Makèpè',
  'Kotto',
  'Deïdo',
  'Logpom',
  'Bali',
  'Cité SIC',
];
const SURROUNDINGS = ['Yaoundé', 'Kribi', 'Limbé', 'Buea', 'Édéa', 'Bafoussam'];
const ELSEWHERE: [string, string][] = [
  ['Paris', 'FR'],
  ['Bruxelles', 'BE'],
  ['Lyon', 'FR'],
  ['Montréal', 'CA'],
];
const INTERESTS: Category[][] = [
  ['domicile'],
  ['immobilier'],
  ['experience'],
  ['proximite'],
  ['culture'],
  ['domicile', 'proximite'],
];
const NEWSLETTER: (SubscriberStatus | null)[] = [
  'CONFIRME',
  null,
  'CONFIRME',
  null,
  'EN_ATTENTE',
  'CONFIRME',
  'DESINSCRIT',
];

/**
 * Totaux de la maquette : 1 486 contacts dont 174 professionnels, 64 ce mois-ci, 58 % à Douala et 39 % dans les
 * environs. Les 1 480 contacts générés complètent les 6 de la maquette (5 à Douala, 1 dans les environs).
 */
const TOTAL = 1486;
const PROFESSIONALS = 174;
const NEW_THIS_MONTH = 64;

const GENERATED = TOTAL - MAQUETTE.length;

const generated: Seed[] = Array.from({ length: GENERATED }, (_, index) => {
  const professional = index < PROFESSIONALS - 2;
  const first = FIRST_NAMES[index % FIRST_NAMES.length]!;
  const last = LAST_NAMES[(index * 7) % LAST_NAMES.length]!;
  // Répartition exacte de la maquette (58 % Douala, 39 % environs, 3 % ailleurs, contacts de la maquette
  // compris) : 857, 579 et 44 contacts générés, mélangés par une permutation (7919 premier avec 1 480).
  const place = (index * 7919) % GENERATED;
  const douala = place < 857;
  const surroundings = !douala && place < 857 + 579;
  const [city, country] = douala
    ? [`${QUARTERS[index % QUARTERS.length]}, Douala`, 'CM']
    : surroundings
      ? [SURROUNDINGS[index % SURROUNDINGS.length]!, 'CM']
      : ELSEWHERE[index % ELSEWHERE.length]!;
  const organization = professional ? `${ORGANIZATIONS[index % ORGANIZATIONS.length]} ${last}` : undefined;
  return {
    id: `ctc_gen_${index + 1}`,
    fullName: organization ?? `${first} ${last}`,
    email: `${organization ? 'contact' : first.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}.${index + 1}@email.com`,
    phone: country === 'CM' ? '+237699000000' : '+33612345678',
    city,
    country,
    professional,
    organization,
    interests: INTERESTS[index % INTERESTS.length]!,
    requestsCount: index % 4 === 0 ? 1 + (index % 3) : 0,
    newsletter: NEWSLETTER[index % NEWSLETTER.length]!,
    // Les 58 premiers après la maquette sont de ce mois-ci (64 au total), les autres s'étalent sur deux ans.
    createdAt: index < NEW_THIS_MONTH - MAQUETTE.length ? daysAgo(6 + (index % 14)) : daysAgo(40 + index / 2),
  };
});

/** Contacts simulés (état modifiable pendant la session : effacement). */
export const adminContacts: AdminContactListItem[] = [...MAQUETTE, ...generated].map(contact);

/** Contact situé à Douala (ville « Douala » ou « Quartier, Douala »). */
export const inDouala = (item: Pick<AdminContactListItem, 'city'>) => /(^|,\s*)Douala$/.test(item.city ?? '');
