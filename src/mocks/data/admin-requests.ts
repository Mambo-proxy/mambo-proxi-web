import type {
  ContactPreference,
  ContactSummary,
  RequestDetail,
  RequestStatus,
  RequestType,
} from '@/lib/api/schema';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Date relative au moment présent, à l'heure donnée (heure de Douala = UTC+1). */
function at(daysAgo: number, hour: number, minute: number): string {
  const date = new Date(Date.now() - daysAgo * DAY);
  date.setUTCHours(hour - 1, minute, 0, 0);
  return date.toISOString();
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

type Seed = {
  firstName: string;
  lastName: string;
  city: string;
  country: 'FR' | 'CM' | 'BE';
  service: string;
  serviceSlug: string;
  category: 'experience' | 'immobilier' | 'services-de-proximite' | 'culture-evenementiel';
  status: RequestStatus;
  createdAt: string;
  type?: RequestType;
  preference?: ContactPreference;
  message?: string;
  fields?: [string, string][];
};

const CATEGORY_NAMES = {
  experience: 'Expérience',
  immobilier: 'Immobilier',
  'services-de-proximite': 'Services de proximité',
  'culture-evenementiel': 'Culture & événementiel',
} as const;

/** Les 8 demandes de la maquette Demandes (`87:10970`), puis des demandes de démonstration. */
const SEEDS: Seed[] = [
  {
    firstName: 'Aurélie',
    lastName: 'Kamga',
    city: 'Paris',
    country: 'FR',
    service: 'Chef privé',
    serviceSlug: 'chef-prive',
    category: 'experience',
    status: 'NOUVELLE',
    createdAt: hoursAgo(2),
    preference: 'WHATSAPP',
    message: 'Dîner pour les 60 ans de ma mère, cuisine camerounaise revisitée, un invité végétarien.',
    fields: [
      ['Date souhaitée', 'Samedi 14 nov. 2026'],
      ['Ville', 'Douala'],
      ['Personnes', '12'],
      ['Occasion', 'Anniversaire'],
    ],
  },
  {
    firstName: 'Patrick',
    lastName: 'Essomba',
    city: 'Marseille',
    country: 'FR',
    service: 'Découverte du Cameroun',
    serviceSlug: 'decouverte-du-cameroun',
    category: 'culture-evenementiel',
    status: 'NOUVELLE',
    createdAt: hoursAgo(5),
    preference: 'EMAIL',
    message: 'Nous venons en famille en décembre et souhaitons découvrir Kribi et Limbé pendant une semaine.',
    fields: [
      ['Période', 'Du 20 au 27 déc. 2026'],
      ['Personnes', '4'],
    ],
  },
  {
    firstName: 'Ruth',
    lastName: 'Atangana',
    city: 'Bruxelles',
    country: 'BE',
    service: 'Logement temporaire',
    serviceSlug: 'logement-temporaire',
    category: 'immobilier',
    status: 'NOUVELLE',
    createdAt: at(1, 18, 5),
    preference: 'WHATSAPP',
    message: 'Appartement meublé à Bonapriso pour un mois, à partir de janvier.',
    fields: [
      ['Ville', 'Douala'],
      ['Arrivée', '5 janv. 2027'],
      ['Durée', '1 mois'],
    ],
  },
  {
    firstName: 'Sandrine',
    lastName: 'Mballa',
    city: 'Lyon',
    country: 'FR',
    service: 'Gestion locative',
    serviceSlug: 'gestion-locative',
    category: 'immobilier',
    status: 'EN_COURS',
    createdAt: at(1, 11, 30),
    preference: 'TELEPHONE',
    message: 'Je cherche quelqu’un pour gérer la location de mon appartement à Yaoundé.',
    fields: [
      ['Ville', 'Yaoundé'],
      ['Type de bien', 'Appartement T3'],
    ],
  },
  {
    firstName: 'Hervé',
    lastName: 'Din',
    city: 'Douala',
    country: 'CM',
    service: 'Réception de colis',
    serviceSlug: 'reception-de-colis',
    category: 'services-de-proximite',
    status: 'PRESTATION_REALISEE',
    createdAt: at(1, 9, 2),
    preference: 'WHATSAPP',
    message: 'Réception de deux colis envoyés depuis Paris, à garder jusqu’à mon passage.',
  },
  {
    firstName: 'Clarisse',
    lastName: 'Ngo',
    city: 'Paris',
    country: 'FR',
    service: 'Portage de repas',
    serviceSlug: 'portage-de-repas',
    category: 'services-de-proximite',
    status: 'EN_COURS',
    createdAt: at(2, 15, 44),
    preference: 'TELEPHONE',
    message: 'Repas du midi pour mon père à Bonamoussadi, du lundi au vendredi.',
  },
  {
    firstName: 'Jean-Marc',
    lastName: 'Tchoumi',
    city: 'Yaoundé',
    country: 'CM',
    service: 'Chef privé',
    serviceSlug: 'chef-prive',
    category: 'experience',
    status: 'PRESTATION_REALISEE',
    createdAt: at(3, 20, 10),
    preference: 'WHATSAPP',
  },
  {
    firstName: 'Laure',
    lastName: 'Bekolo',
    city: 'Douala',
    country: 'CM',
    service: 'Services événementiels',
    serviceSlug: 'services-evenementiels',
    category: 'experience',
    status: 'CLOTUREE',
    createdAt: at(4, 13, 25),
    preference: 'EMAIL',
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
];
const PLACES: [string, Seed['country']][] = [
  ['Paris', 'FR'],
  ['Douala', 'CM'],
  ['Lille', 'FR'],
  ['Yaoundé', 'CM'],
  ['Bordeaux', 'FR'],
  ['Kribi', 'CM'],
];
const SERVICES: [string, string, Seed['category']][] = [
  ['Chef privé', 'chef-prive', 'experience'],
  ['Location de voiture avec chauffeur', 'location-voiture-chauffeur', 'experience'],
  ['Gestion locative', 'gestion-locative', 'immobilier'],
  ['Suivi de chantier', 'suivi-de-chantier', 'immobilier'],
  ['Courses et livraisons', 'courses-et-livraisons', 'services-de-proximite'],
  ['Massage à domicile', 'massage-a-domicile', 'experience'],
  ['Découverte du Cameroun', 'decouverte-du-cameroun', 'culture-evenementiel'],
];

/** 58 demandes au total : 12 nouvelles, 18 en cours, 21 réalisées, 7 clôturées (maquette). */
const REMAINING: RequestStatus[] = [
  ...Array<RequestStatus>(12 - 3).fill('NOUVELLE'),
  ...Array<RequestStatus>(18 - 2).fill('EN_COURS'),
  ...Array<RequestStatus>(21 - 2).fill('PRESTATION_REALISEE'),
  ...Array<RequestStatus>(7 - 1).fill('CLOTUREE'),
];

const OTHER_TYPES: RequestType[] = ['CONTACT', 'INFORMATION', 'RENDEZ_VOUS'];

const generated: Seed[] = REMAINING.map((status, index) => {
  const [city, country] = PLACES[index % PLACES.length]!;
  const [service, serviceSlug, category] = SERVICES[index % SERVICES.length]!;
  return {
    firstName: FIRST_NAMES[index % FIRST_NAMES.length]!,
    lastName: LAST_NAMES[(index * 3) % LAST_NAMES.length]!,
    city,
    country,
    service,
    serviceSlug,
    category,
    status,
    // Les nouvelles sont récentes ; les autres s'étalent sur les deux derniers mois.
    createdAt: at(status === 'NOUVELLE' ? 5 + (index % 3) : 5 + index, 8 + (index % 10), (index * 7) % 60),
    type: index % 6 === 5 ? OTHER_TYPES[index % OTHER_TYPES.length] : 'DEVIS',
    preference: (['WHATSAPP', 'EMAIL', 'TELEPHONE'] as const)[index % 3],
  };
});

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

function toDetail(seed: Seed, index: number): RequestDetail {
  const number = 142 - index;
  const reference = `MP-2026-${String(number).padStart(4, '0')}`;
  const contact: ContactSummary = {
    id: `ctc_${slugify(seed.firstName)}_${slugify(seed.lastName)}`,
    fullName: `${seed.firstName} ${seed.lastName}`,
    initials: `${seed.firstName[0]}${seed.lastName[0]}`.toUpperCase(),
    email: `${slugify(seed.firstName).slice(0, 8)}.${slugify(seed.lastName)[0]}@email.com`,
    phone: seed.country === 'CM' ? '+237699123456' : seed.country === 'BE' ? '+32470123456' : '+33612345678',
    country: seed.country,
    city: seed.city,
    profile: 'PARTICULIER',
  };
  const type = seed.type ?? 'DEVIS';
  const categoryName = CATEGORY_NAMES[seed.category];
  const received = seed.createdAt;
  const history: RequestDetail['history'] = [
    {
      id: `${reference}-1`,
      kind: 'RECEIVED',
      label: 'Demande reçue via le formulaire',
      actor: null,
      data: null,
      createdAt: received,
    },
    {
      id: `${reference}-2`,
      kind: 'ACK_SENT',
      label: 'Accusé de réception envoyé au client',
      actor: null,
      data: null,
      createdAt: received,
    },
  ];
  if (seed.status !== 'NOUVELLE')
    history.push({
      id: `${reference}-3`,
      kind: 'STATUS_CHANGED',
      label: 'Statut : Nouvelle → En cours',
      actor: { id: 'usr_mireille', name: 'Mireille Bell', initials: 'MB' },
      data: null,
      createdAt: new Date(new Date(received).getTime() + 3 * HOUR).toISOString(),
    });
  return {
    id: `req_${String(number).padStart(4, '0')}`,
    reference,
    type,
    status: seed.status,
    contact,
    service:
      type === 'DEVIS' ? { id: `svc_${seed.serviceSlug}`, name: seed.service, slug: seed.serviceSlug } : null,
    category: { slug: seed.category, name: categoryName },
    subject:
      type === 'DEVIS'
        ? seed.service
        : type === 'RENDEZ_VOUS'
          ? 'Rendez-vous à l’agence'
          : 'Demande d’information',
    assignedTo: null,
    createdAt: received,
    contactPreference: seed.preference ?? 'EMAIL',
    message: seed.message ?? `Bonjour, je souhaite un devis pour : ${seed.service.toLowerCase()}.`,
    fields: [['Rubrique', categoryName] as [string, string], ...(seed.fields ?? [['Ville', seed.city]])].map(
      ([label, value]) => ({ key: slugify(label), label, value }),
    ),
    payload: {},
    notes: [],
    history,
    attachments: [],
    consentAt: received,
    survey: null,
    whatsappUrl: null,
    completedAt: null,
    closedAt: null,
    updatedAt: received,
  };
}

/** Demandes simulées (état modifiable pendant la session : statut, notes, historique). */
export const adminRequests: RequestDetail[] = [...SEEDS, ...generated].map(toDetail);
