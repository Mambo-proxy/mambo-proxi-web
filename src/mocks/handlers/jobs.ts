import { http, HttpResponse } from 'msw';
import type { JobOfferDetail } from '@/lib/api/schema';
import { langOf, normalize } from '../data/catalogue';
import { problem } from '../problem';

const DAY = 24 * 60 * 60 * 1000;

/** Date de publication relative à aujourd'hui (la maquette affiche « Publiée il y a 3 jours », « 1 semaine »…). */
const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const BENEFITS = [
  'Une équipe bienveillante et engagée',
  'Des formations régulières',
  'Des missions utiles, au service des familles',
];

/** Offres simulées : les 4 postes de la maquette Recrutement (`67:6899`), détail complet pour la première (`82:8945`). */
export const jobs: JobOfferDetail[] = [
  {
    id: 'job_coordinateur',
    slug: 'coordinateur-rice-de-services',
    title: 'Coordinateur·rice de services',
    city: 'Douala',
    country: 'CM',
    contractType: 'CDI',
    summary: 'Vous coordonnez les prestations de nos clients et le réseau de prestataires à Douala.',
    publishedAt: daysAgo(3),
    isNew: true,
    startDate: 'janvier 2027',
    workingTime: 'temps plein',
    locationLabel: 'Douala, Cameroun',
    description:
      'Au cœur de l’agence de Douala, vous coordonnez les demandes de nos clients, de la réception du besoin jusqu’au suivi de la prestation, avec notre réseau de prestataires.',
    missions: [
      'Analyser les demandes et préparer les devis',
      'Sélectionner et briefer les prestataires',
      'Suivre chaque prestation et informer le client',
      'Mettre à jour les dossiers dans l’outil de gestion',
    ],
    profile: [
      'Expérience en relation client ou coordination',
      'Sens de l’organisation et du service',
      'Aisance à l’écrit et à l’oral en français',
      'Maîtrise des outils numériques courants',
    ],
    benefits: BENEFITS,
    expiresAt: null,
  },
  {
    id: 'job_relation_clients',
    slug: 'charge-e-relation-clients',
    title: 'Chargé·e de relation clients',
    city: 'Douala · sur site',
    country: 'CM',
    contractType: 'CDD 12 mois',
    summary: 'Vous accompagnez nos clients depuis l’agence de Douala.',
    publishedAt: daysAgo(7),
    isNew: false,
    startDate: 'dès que possible',
    workingTime: 'temps plein',
    locationLabel: 'Douala, Cameroun, sur site',
    description:
      'À l’agence de Douala, vous êtes l’interlocuteur de nos clients : vous recueillez leurs besoins, les transmettez à l’équipe de coordination et les tenez informés à chaque étape.',
    missions: [
      'Accueillir les demandes par téléphone, WhatsApp et e-mail',
      'Qualifier les besoins et les transmettre à la coordination',
      'Informer les clients de l’avancement de leurs demandes',
    ],
    profile: [
      'Expérience en relation client',
      'Bonne connaissance de Douala et de ses quartiers',
      'Excellente expression écrite et orale',
    ],
    benefits: BENEFITS,
    expiresAt: null,
  },
  {
    id: 'job_entretien',
    slug: 'agent-e-entretien-logements',
    title: 'Agent·e d’entretien des logements',
    city: 'Yaoundé',
    country: 'CM',
    contractType: 'Temps partiel',
    summary: 'Vous assurez l’entretien des logements gérés par l’agence.',
    publishedAt: daysAgo(14),
    isNew: false,
    startDate: 'novembre 2026',
    workingTime: 'temps partiel',
    locationLabel: 'Yaoundé, Cameroun',
    description:
      'Vous assurez l’entretien régulier des logements gérés par l’agence à Yaoundé, entre deux locations ou à la demande des propriétaires.',
    missions: [
      'Nettoyer et préparer les logements',
      'Signaler les réparations à prévoir',
      'Contrôler l’état des lieux avec l’agence',
    ],
    profile: ['Expérience en entretien ou en hôtellerie', 'Rigueur et discrétion', 'Ponctualité'],
    benefits: BENEFITS,
    expiresAt: null,
  },
  {
    id: 'job_chauffeur',
    slug: 'chauffeur-euse-partenaire',
    title: 'Chauffeur·euse partenaire',
    city: 'Douala',
    country: 'CM',
    contractType: 'Freelance',
    summary: 'Vous réalisez des transferts et mises à disposition pour nos clients.',
    publishedAt: daysAgo(21),
    isNew: false,
    startDate: null,
    workingTime: null,
    locationLabel: 'Douala, Cameroun',
    description:
      'Avec votre véhicule ou un véhicule de nos partenaires, vous réalisez les transferts aéroport et les mises à disposition demandés par nos clients.',
    missions: [
      'Accueillir les clients à l’aéroport',
      'Assurer les trajets et mises à disposition',
      'Garder un véhicule propre et entretenu',
    ],
    profile: ['Permis B depuis plus de 3 ans', 'Bonne connaissance de Douala', 'Sens du service'],
    benefits: BENEFITS,
    expiresAt: null,
  },
];

const BENEFITS_EN = ['A caring and committed team', 'Regular training', 'Meaningful work, serving families'];

/** Offres en anglais (`?lang=en`), par offre : textes rédigés pour le site. */
const EN: Record<string, Partial<JobOfferDetail>> = {
  'coordinateur-rice-de-services': {
    title: 'Service coordinator',
    city: 'Douala',
    contractType: 'Permanent',
    summary: 'You coordinate our clients’ services and our network of providers in Douala.',
    startDate: 'January 2027',
    workingTime: 'full time',
    locationLabel: 'Douala, Cameroon',
    description:
      'At the heart of the Douala agency, you coordinate our clients’ requests, from the first enquiry to the follow-up of the service, with our network of providers.',
    missions: [
      'Review requests and prepare quotes',
      'Select and brief service providers',
      'Follow up on each service and keep the client informed',
      'Keep records up to date in the management tool',
    ],
    profile: [
      'Experience in customer relations or coordination',
      'Strong organisational skills and a sense of service',
      'Good written and spoken French',
      'Comfortable with everyday digital tools',
    ],
  },
  'charge-e-relation-clients': {
    title: 'Customer relations officer',
    city: 'Douala · on site',
    contractType: '12-month fixed-term',
    summary: 'You look after our clients from the Douala agency.',
    startDate: 'as soon as possible',
    workingTime: 'full time',
    locationLabel: 'Douala, Cameroon, on site',
    description:
      'At the Douala agency, you are our clients’ point of contact: you gather their needs, pass them on to the coordination team and keep them informed at every step.',
    missions: [
      'Handle requests by phone, WhatsApp and e-mail',
      'Qualify needs and pass them on to the coordination team',
      'Keep clients informed of the progress of their requests',
    ],
    profile: [
      'Experience in customer relations',
      'Good knowledge of Douala and its neighbourhoods',
      'Excellent written and spoken communication',
    ],
  },
  'agent-e-entretien-logements': {
    title: 'Home cleaning agent',
    contractType: 'Part time',
    summary: 'You clean and look after the homes managed by the agency.',
    startDate: 'November 2026',
    workingTime: 'part time',
    locationLabel: 'Yaoundé, Cameroon',
    description:
      'You carry out regular cleaning of the homes managed by the agency in Yaoundé, between two lets or at the owners’ request.',
    missions: [
      'Clean and prepare the homes',
      'Report any repairs needed',
      'Check inventories with the agency',
    ],
    profile: ['Experience in cleaning or hospitality', 'Thorough and discreet', 'Punctual'],
  },
  'chauffeur-euse-partenaire': {
    title: 'Partner driver',
    summary: 'You provide transfers and chauffeur services for our clients.',
    locationLabel: 'Douala, Cameroon',
    description:
      'With your own vehicle or one of our partners’ vehicles, you provide the airport transfers and chauffeur services our clients book.',
    missions: [
      'Welcome clients at the airport',
      'Drive clients on their trips and bookings',
      'Keep the vehicle clean and well maintained',
    ],
    profile: ['Driving licence held for more than 3 years', 'Good knowledge of Douala', 'A sense of service'],
  },
};

const jobsEn: JobOfferDetail[] = jobs.map((job) => ({ ...job, ...EN[job.slug], benefits: BENEFITS_EN }));

export const jobHandlers = [
  http.get('*/v1/jobs', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const city = query.get('city');
    const contract = query.get('contract');
    const search = query.get('q') ? normalize(query.get('q') ?? '') : null;
    const list = (langOf(request) === 'en' ? jobsEn : jobs)
      .filter(
        (job) =>
          (!city || job.city.startsWith(city)) &&
          (!contract || job.contractType.startsWith(contract)) &&
          (!search || normalize(`${job.title} ${job.summary}`).includes(search)),
      )
      .map(({ id, slug, title, city: jobCity, country, contractType, summary, publishedAt, isNew }) => ({
        id,
        slug,
        title,
        city: jobCity,
        country,
        contractType,
        summary,
        publishedAt,
        isNew,
      }));
    return HttpResponse.json(list);
  }),

  http.get('*/v1/jobs/:slug', ({ params, request }) => {
    const job = (langOf(request) === 'en' ? jobsEn : jobs).find((item) => item.slug === params.slug);
    return job ? HttpResponse.json(job) : problem(404, "Cette offre n'existe pas ou n'est plus publiée.");
  }),
];
