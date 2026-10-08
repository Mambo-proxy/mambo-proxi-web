import { http, HttpResponse } from 'msw';
import type { JobOfferDetail } from '@/lib/api/schema';
import { normalize } from '../data/catalogue';
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
    id: 'job_relation_diaspora',
    slug: 'charge-e-relation-clients-diaspora',
    title: 'Chargé·e de relation clients diaspora',
    city: 'France · télétravail',
    country: 'FR',
    contractType: 'CDD 12 mois',
    summary: 'Vous accompagnez nos clients de la diaspora depuis la France.',
    publishedAt: daysAgo(7),
    isNew: false,
    startDate: 'dès que possible',
    workingTime: 'temps plein',
    locationLabel: 'France, en télétravail',
    description:
      'Depuis la France, vous êtes l’interlocuteur de nos clients de la diaspora : vous recueillez leurs besoins, les transmettez à l’agence et les tenez informés à chaque étape.',
    missions: [
      'Accueillir les demandes par téléphone, WhatsApp et e-mail',
      'Qualifier les besoins et les transmettre à l’agence',
      'Informer les clients de l’avancement de leurs demandes',
    ],
    profile: [
      'Expérience en relation client',
      'Connaissance du Cameroun et de la diaspora',
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

export const jobHandlers = [
  http.get('*/v1/jobs', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const city = query.get('city');
    const contract = query.get('contract');
    const search = query.get('q') ? normalize(query.get('q') ?? '') : null;
    const list = jobs
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

  http.get('*/v1/jobs/:slug', ({ params }) => {
    const job = jobs.find((item) => item.slug === params.slug);
    return job ? HttpResponse.json(job) : problem(404, "Cette offre n'existe pas ou n'est plus publiée.");
  }),
];
