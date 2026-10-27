import type { AdminApplication, AdminJobOffer, ContactSummary, JobOfferDetail } from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';
import { jobs as siteJobs } from '../handlers/jobs';

/**
 * Recrutement du back-office (`93:21723`). Les offres publiées sont celles du site (`handlers/jobs.ts`, mêmes
 * identifiants) : publier, dépublier, modifier ou supprimer une offre met aussi à jour la liste lue par
 * `GET /v1/jobs`. S'y ajoute le brouillon « Assistant·e administratif·ve » de la maquette.
 */

/** Offre stockée : les compteurs de candidatures sont calculés à chaque réponse. */
export type StoredJobOffer = Omit<AdminJobOffer, 'applicationsCount' | 'newApplicationsCount'>;

const DAY = 86_400_000;

/** Échéance de l'offre de coordination (maquette : « Publiée le 2 oct. · expire le 2 déc. »). */
const plusDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * DAY).toISOString();

function fromSite(job: JobOfferDetail, index: number): StoredJobOffer {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    city: job.city,
    country: job.country,
    contractType: job.contractType,
    startDate: job.startDate ?? null,
    workingTime: job.workingTime ?? null,
    locationLabel: job.locationLabel ?? null,
    sectors: [...job.sectors],
    salary: job.salary ?? null,
    schedule: job.schedule ?? null,
    // Le contrat d'administration n'a qu'un texte de présentation (`summary`) : celui affiché sous « Le poste ».
    summary: job.description ?? job.summary,
    missions: [...job.missions],
    profile: [...job.profile],
    benefits: [...job.benefits],
    status: 'PUBLISHED',
    expiresAt: index === 0 ? plusDays(job.publishedAt, 61) : (job.expiresAt ?? null),
    publishedAt: job.publishedAt,
    createdAt: new Date(new Date(job.publishedAt).getTime() - 2 * DAY).toISOString(),
  };
}

export const adminJobOffers: StoredJobOffer[] = [
  ...siteJobs.map(fromSite),
  {
    id: 'job_assistant_administratif',
    slug: 'assistant-e-administratif-ve',
    title: 'Assistant·e administratif·ve',
    city: 'Douala',
    country: 'CM',
    contractType: 'Stage',
    startDate: 'janvier 2027',
    workingTime: 'temps plein',
    locationLabel: 'Douala, Cameroun',
    summary:
      'Vous épaulez l’équipe de l’agence de Douala dans le suivi administratif des dossiers clients et prestataires.',
    missions: ['Classer et mettre à jour les dossiers clients', 'Préparer les documents des prestataires'],
    profile: ['Formation en assistanat ou en gestion', 'Rigueur et sens de l’organisation'],
    benefits: [],
    status: 'DRAFT',
    expiresAt: null,
    publishedAt: null,
    createdAt: daysAgo(2),
  },
];

/** Offre de la liste publique (`JobOfferDetail`) à partir de l'offre du back-office. */
function toSite(offer: StoredJobOffer): JobOfferDetail {
  const publishedAt = offer.publishedAt ?? new Date().toISOString();
  return {
    id: offer.id,
    slug: offer.slug ?? offer.id,
    title: offer.title ?? '',
    city: offer.city ?? '',
    country: offer.country ?? 'CM',
    contractType: offer.contractType ?? '',
    summary: offer.summary ?? '',
    description: offer.summary ?? null,
    publishedAt,
    isNew: Date.now() - new Date(publishedAt).getTime() < 7 * DAY,
    startDate: offer.startDate ?? null,
    workingTime: offer.workingTime ?? null,
    locationLabel: offer.locationLabel ?? null,
    sectors: offer.sectors ?? [],
    salary: offer.salary ?? null,
    schedule: offer.schedule ?? null,
    missions: offer.missions ?? [],
    profile: offer.profile ?? [],
    benefits: offer.benefits ?? [],
    expiresAt: offer.expiresAt ?? null,
  };
}

/** Reflète une offre sur le site : présente et à jour si publiée, retirée sinon. */
export function syncSite(offer: StoredJobOffer) {
  const index = siteJobs.findIndex((job) => job.id === offer.id);
  if (offer.status !== 'PUBLISHED') {
    if (index >= 0) siteJobs.splice(index, 1);
    return;
  }
  const next = toSite(offer);
  if (index >= 0) siteJobs[index] = next;
  else {
    siteJobs.push(next);
    siteJobs.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}

export function removeFromSite(id: string) {
  const index = siteJobs.findIndex((job) => job.id === id);
  if (index >= 0) siteJobs.splice(index, 1);
}

type Seed = {
  name: string;
  city: string;
  country?: string;
  phone: string;
  email: string;
  /** Identifiant de l'offre, ou `null` pour une candidature spontanée. */
  job: string | null;
  status: AdminApplication['status'];
  days: number;
  hours?: number;
  message?: string;
  size: number;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Candidatures (14) : les 4 « Dernières candidatures » de la maquette, puis 10 plus anciennes. Répartition par offre :
 * coordination 6 (dont 2 nouvelles), relation clients 3, entretien 3, chauffeur 1, spontanée 1.
 */
const SEEDS: Seed[] = [
  {
    name: 'Grace Nkoulou',
    city: 'Douala',
    phone: '+237691234567',
    email: 'grace.nkoulou@email.cm',
    job: 'job_coordinateur',
    status: 'NOUVEAU',
    days: 0,
    hours: 1,
    message:
      'Coordinatrice d’événements depuis quatre ans à Douala, je connais bien le réseau de prestataires de la ville. Je serais ravie de mettre cette expérience au service de vos clients.',
    size: 186_000,
  },
  {
    name: 'Yannick Tchoua',
    city: 'Douala',
    phone: '+237677889900',
    email: 'yannick.tchoua@email.cm',
    job: 'job_coordinateur',
    status: 'NOUVEAU',
    days: 1,
    hours: 2,
    message:
      'Après trois ans en agence de voyages, je souhaite rejoindre une équipe tournée vers la diaspora. Disponible dès janvier.',
    size: 241_000,
  },
  {
    name: 'Amélie Moreau',
    city: 'Akwa',
    phone: '+237699112233',
    email: 'amelie.moreau@email.cm',
    job: null,
    status: 'LU',
    days: 3,
    message:
      'Chargée de projets événementiels à Akwa, j’aimerais rejoindre votre équipe, quel que soit le poste.',
    size: 312_000,
  },
  {
    name: 'Boris Essomba',
    city: 'Yaoundé',
    phone: '+237655443322',
    email: 'boris.essomba@email.cm',
    job: 'job_entretien',
    status: 'RETENU',
    days: 6,
    message: 'J’ai travaillé deux ans dans un hôtel de Yaoundé comme agent d’entretien.',
    size: 98_000,
  },
  {
    name: 'Nadège Kamdem',
    city: 'Lyon',
    country: 'FR',
    phone: '+33645127788',
    email: 'nadege.kamdem@email.fr',
    job: 'job_relation_clients',
    status: 'LU',
    days: 7,
    size: 205_000,
  },
  {
    name: 'Sandrine Mbarga',
    city: 'Douala',
    phone: '+237699112233',
    email: 'sandrine.mbarga@email.cm',
    job: 'job_coordinateur',
    status: 'LU',
    days: 8,
    size: 176_000,
  },
  {
    name: 'Olivier Mballa',
    city: 'Paris',
    country: 'FR',
    phone: '+33678451230',
    email: 'olivier.mballa@email.fr',
    job: 'job_relation_clients',
    status: 'LU',
    days: 9,
    size: 228_000,
  },
  {
    name: 'Samuel Nkodo',
    city: 'Douala',
    phone: '+237670123456',
    email: 'samuel.nkodo@email.cm',
    job: 'job_chauffeur',
    status: 'LU',
    days: 9,
    hours: 5,
    message: 'Chauffeur VTC depuis cinq ans, véhicule personnel récent.',
    size: 84_000,
  },
  {
    name: 'Patrick Ewane',
    city: 'Douala',
    phone: '+237699887766',
    email: 'patrick.ewane@email.cm',
    job: 'job_coordinateur',
    status: 'RETENU',
    days: 10,
    size: 264_000,
  },
  {
    name: 'Josiane Abena',
    city: 'Yaoundé',
    phone: '+237677001122',
    email: 'josiane.abena@email.cm',
    job: 'job_entretien',
    status: 'LU',
    days: 11,
    size: 91_000,
  },
  {
    name: 'Christelle Ngo',
    city: 'Yaoundé',
    phone: '+237655667788',
    email: 'christelle.ngo@email.cm',
    job: 'job_coordinateur',
    status: 'REFUSE',
    days: 12,
    size: 199_000,
  },
  {
    name: 'Laure Dikoume',
    city: 'Bruxelles',
    country: 'BE',
    phone: '+32470123456',
    email: 'laure.dikoume@email.be',
    job: 'job_relation_clients',
    status: 'REFUSE',
    days: 13,
    size: 233_000,
  },
  {
    name: 'Hervé Fotso',
    city: 'Douala',
    phone: '+237691556677',
    email: 'herve.fotso@email.cm',
    job: 'job_coordinateur',
    status: 'LU',
    days: 15,
    size: 187_000,
  },
  {
    name: 'Martine Owona',
    city: 'Yaoundé',
    phone: '+237670998877',
    email: 'martine.owona@email.cm',
    job: 'job_entretien',
    status: 'REFUSE',
    days: 16,
    size: 102_000,
  },
];

const slug = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

function fromSeed(seed: Seed, index: number): AdminApplication {
  const id = `app_${String(index + 1).padStart(2, '0')}`;
  const offer = seed.job ? adminJobOffers.find((item) => item.id === seed.job) : null;
  const contact: ContactSummary = {
    id: `ctc_${slug(seed.name).toLowerCase()}`,
    fullName: seed.name,
    initials: initials(seed.name),
    email: seed.email,
    phone: seed.phone,
    city: seed.city,
    country: seed.country ?? 'CM',
    profile: 'PARTICULIER',
  };
  return {
    id,
    requestId: `req_cand_${index + 1}`,
    reference: `MP-2026-${String(150 - index).padStart(4, '0')}`,
    status: seed.status,
    job: offer ? { id: offer.id, title: offer.title ?? '' } : null,
    jobTitle: offer ? (offer.title ?? '') : null,
    contact,
    message: seed.message ?? null,
    cv: {
      id: `file_cv_${index + 1}`,
      fileName: `CV-${slug(seed.name)}.pdf`,
      mimeType: 'application/pdf',
      size: seed.size,
    },
    createdAt: daysAgo(seed.days, seed.hours ?? 3),
  };
}

export const adminApplications: AdminApplication[] = SEEDS.map(fromSeed);

/** Candidatures non lues (statut « Nouveau ») : compteur de la barre latérale et du tableau de bord. */
export function unreadApplications(): number {
  return adminApplications.filter((application) => application.status === 'NOUVEAU').length;
}
