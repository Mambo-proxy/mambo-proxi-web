import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  AdminApplication,
  AdminJobOffer,
  ApplicationStatus,
  JobOfferInput,
  JobOfferPatch,
  Problem,
  PublishStatus,
  SignedUrl,
} from '@/lib/api/schema';
import { jsonBody, mockId, paginate, slugify } from '../admin-utils';
import {
  adminApplications,
  adminJobOffers,
  removeFromSite,
  syncSite,
  type StoredJobOffer,
} from '../data/admin-jobs';
import { problem } from '../problem';

const STATUSES: PublishStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const APPLICATION_STATUSES: ApplicationStatus[] = ['NOUVEAU', 'LU', 'RETENU', 'REFUSE'];
const JOB_NOT_FOUND = 'Cette offre n’existe pas ou a été supprimée.';
const APPLICATION_NOT_FOUND = 'Cette candidature n’existe pas ou a été supprimée.';

/** Stockage simulé des CV : l'URL signée expire au bout de 5 minutes, comme l'API. */
export const CV_STORAGE_URL = 'https://fichiers.mamboproxi.com/cv';
const CV_URL_TTL = 5 * 60_000;

const findJob = (id: string) => adminJobOffers.find((offer) => offer.id === id) ?? null;
const findApplication = (id: string) => adminApplications.find((item) => item.id === id) ?? null;

/** Offre avec ses compteurs de candidatures (toutes / nouvelles). */
function withCounts(offer: StoredJobOffer): AdminJobOffer {
  const applications = adminApplications.filter((item) => item.job?.id === offer.id);
  return {
    ...offer,
    applicationsCount: applications.length,
    newApplicationsCount: applications.filter((item) => item.status === 'NOUVEAU').length,
  };
}

/** Candidature avec l'intitulé à jour de l'offre visée (conservé si l'offre a été supprimée). */
function withJobTitle(application: AdminApplication): AdminApplication {
  const offer = application.job ? findJob(application.job.id) : null;
  return offer ? { ...application, job: { id: offer.id, title: offer.title ?? '' } } : application;
}

/** Ordre de la liste : publiées (plus récentes d'abord), puis brouillons, puis archivées. */
const STATUS_ORDER: Record<PublishStatus, number> = { PUBLISHED: 2, DRAFT: 1, ARCHIVED: 0 };

function compareOffers(a: StoredJobOffer, b: StoredJobOffer) {
  const byStatus = STATUS_ORDER[b.status ?? 'DRAFT'] - STATUS_ORDER[a.status ?? 'DRAFT'];
  if (byStatus) return byStatus;
  return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
}

const LIMITS = {
  title: 120,
  city: 80,
  contractType: 40,
  startDate: 60,
  workingTime: 60,
  locationLabel: 120,
  schedule: 120,
};
const LIST_FIELDS = ['missions', 'profile', 'benefits'] as const;

/** Validation de l'offre complète (après fusion d'une modification), dont les exigences de publication. */
function validate(offer: StoredJobOffer, others: StoredJobOffer[]): Problem['errors'] {
  const errors: NonNullable<Problem['errors']> = [];
  const required = (path: string, value: string | null | undefined, message: string) => {
    if (!value?.trim()) errors.push({ path, message });
  };
  required('title', offer.title, 'Indiquez l’intitulé du poste.');
  required('city', offer.city, 'Indiquez le lieu du poste.');
  required('contractType', offer.contractType, 'Indiquez le type de contrat.');
  required('summary', offer.summary, 'Présentez le poste en quelques lignes.');
  for (const [path, max] of Object.entries(LIMITS)) {
    const value = offer[path as keyof typeof LIMITS];
    if (value && value.length > max) errors.push({ path, message: `${max} caractères au maximum.` });
  }
  if ((offer.summary ?? '').length > 1000)
    errors.push({ path: 'summary', message: '1 000 caractères au maximum.' });
  if (!/^[A-Z]{2}$/.test(offer.country ?? ''))
    errors.push({ path: 'country', message: 'Choisissez le pays.' });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(offer.slug ?? ''))
    errors.push({
      path: 'slug',
      message:
        'L’adresse ne peut contenir que des lettres minuscules sans accents, des chiffres et des tirets.',
    });
  else if (others.some((item) => item.slug === offer.slug))
    errors.push({ path: 'slug', message: 'Cette adresse est déjà utilisée par une autre offre.' });
  for (const path of LIST_FIELDS) {
    const list = offer[path] ?? [];
    if (list.length > 20) errors.push({ path, message: '20 éléments au maximum.' });
    list.forEach((item, index) => {
      if (!item.trim())
        errors.push({ path: `${path}.${index}`, message: 'Complétez ou supprimez cette ligne.' });
      else if (item.length > 300)
        errors.push({ path: `${path}.${index}`, message: '300 caractères au maximum.' });
    });
  }
  if (offer.salary && offer.salary.max !== null && offer.salary.max < offer.salary.min)
    errors.push({ path: 'salary.max', message: 'Le maximum doit être supérieur au minimum.' });
  if (offer.status === 'PUBLISHED' && !(offer.missions ?? []).length)
    errors.push({ path: 'missions', message: 'Ajoutez au moins une mission avant de publier l’offre.' });
  return errors;
}

/** Champs modifiables reçus (les champs inconnus ou calculés sont ignorés). */
function pickFields(body: JobOfferPatch): Partial<StoredJobOffer> {
  const keys = [
    'title',
    'slug',
    'city',
    'country',
    'contractType',
    'startDate',
    'workingTime',
    'locationLabel',
    'sectors',
    'salary',
    'schedule',
    'summary',
    'missions',
    'profile',
    'benefits',
    'status',
    'expiresAt',
  ] as const;
  return Object.fromEntries(keys.filter((key) => key in body).map((key) => [key, body[key]]));
}

/** PDF d'une page (contenu de démonstration des CV simulés). */
function demoPdf(name: string) {
  const text = `Curriculum vitae - ${name}`.replace(/[()\\]/g, '');
  const stream = `BT /F1 18 Tf 72 760 Td (${text}) Tj ET`;
  return [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${stream.length} >> stream`,
    stream,
    'endstream endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    'trailer << /Root 1 0 R >>',
    '%%EOF',
  ].join('\n');
}

/** Back-office — Recrutement : offres et candidatures (`/v1/admin/jobs*`, `/v1/admin/applications*`). */
export const adminJobHandlers: HttpHandler[] = [
  http.get('*/v1/admin/jobs', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status') as PublishStatus | null;
    const list = adminJobOffers
      .filter((offer) => !status || offer.status === status)
      .sort(compareOffers)
      .map(withCounts);
    return HttpResponse.json(list);
  }),

  http.post('*/v1/admin/jobs', async ({ request }) => {
    const body = await jsonBody<Partial<JobOfferInput>>(request);
    const now = new Date().toISOString();
    const status = body.status ?? 'DRAFT';
    const offer: StoredJobOffer = {
      id: mockId('job'),
      title: body.title?.trim() ?? '',
      slug: body.slug?.trim() || slugify(body.title ?? ''),
      city: body.city?.trim() ?? '',
      country: body.country ?? 'CM',
      contractType: body.contractType?.trim() ?? '',
      startDate: body.startDate?.trim() || null,
      workingTime: body.workingTime?.trim() || null,
      locationLabel: body.locationLabel?.trim() || null,
      sectors: body.sectors ?? [],
      salary: body.salary ?? null,
      schedule: body.schedule?.trim() || null,
      summary: body.summary?.trim() ?? '',
      missions: body.missions ?? [],
      profile: body.profile ?? [],
      benefits: body.benefits ?? [],
      status,
      expiresAt: body.expiresAt ?? null,
      publishedAt: status === 'PUBLISHED' ? now : null,
      createdAt: now,
    };
    const errors = validate(offer, adminJobOffers);
    if (errors?.length) return problem(422, 'Certains champs sont à corriger.', errors);
    adminJobOffers.unshift(offer);
    syncSite(offer);
    return HttpResponse.json(withCounts(offer), { status: 201 });
  }),

  http.get('*/v1/admin/jobs/:id', ({ params }) => {
    const offer = findJob(String(params.id));
    return offer ? HttpResponse.json(withCounts(offer)) : problem(404, JOB_NOT_FOUND);
  }),

  http.patch('*/v1/admin/jobs/:id', async ({ request, params }) => {
    const offer = findJob(String(params.id));
    if (!offer) return problem(404, JOB_NOT_FOUND);
    const changes = pickFields(await jsonBody<JobOfferPatch>(request));
    if (!Object.keys(changes).length) return problem(400, 'Aucune modification à enregistrer.');
    if (changes.status && !STATUSES.includes(changes.status)) return problem(400, 'Statut inconnu.');
    const next: StoredJobOffer = { ...offer, ...changes };
    const errors = validate(
      next,
      adminJobOffers.filter((item) => item.id !== offer.id),
    );
    if (errors?.length) return problem(422, 'Certains champs sont à corriger.', errors);
    if (next.status === 'PUBLISHED' && !next.publishedAt) next.publishedAt = new Date().toISOString();
    Object.assign(offer, next);
    syncSite(offer);
    return HttpResponse.json(withCounts(offer));
  }),

  http.delete('*/v1/admin/jobs/:id', ({ params }) => {
    const index = adminJobOffers.findIndex((offer) => offer.id === String(params.id));
    if (index < 0) return problem(404, JOB_NOT_FOUND);
    adminJobOffers.splice(index, 1);
    removeFromSite(String(params.id));
    // Les candidatures sont conservées (avec l'intitulé de l'offre au moment de la suppression).
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/applications', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') as ApplicationStatus | null;
    const job = params.get('job');
    const list = adminApplications
      .filter(
        (item) =>
          (!status || item.status === status) &&
          (!job || (job === 'spontaneous' ? item.job === null : item.job?.id === job)),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(withJobTitle);
    return HttpResponse.json(paginate(list, params));
  }),

  // Ouvrir une candidature non lue la passe au statut « Lu » (contrat : `adminGetApplication`).
  http.get('*/v1/admin/applications/:id', ({ params }) => {
    const application = findApplication(String(params.id));
    if (!application) return problem(404, APPLICATION_NOT_FOUND);
    if (application.status === 'NOUVEAU') application.status = 'LU';
    return HttpResponse.json(withJobTitle(application));
  }),

  http.patch('*/v1/admin/applications/:id', async ({ request, params }) => {
    const application = findApplication(String(params.id));
    if (!application) return problem(404, APPLICATION_NOT_FOUND);
    const { status } = await jsonBody<{ status?: ApplicationStatus }>(request);
    if (!status || !APPLICATION_STATUSES.includes(status))
      return problem(422, 'Statut inconnu.', [{ path: 'status', message: 'Choisissez un statut.' }]);
    application.status = status;
    return HttpResponse.json(withJobTitle(application));
  }),

  http.get('*/v1/admin/applications/:id/cv', ({ params }) => {
    const application = findApplication(String(params.id));
    if (!application) return problem(404, APPLICATION_NOT_FOUND);
    const expiresAt = new Date(Date.now() + CV_URL_TTL).toISOString();
    const body: SignedUrl = {
      url: `${CV_STORAGE_URL}/${application.id}/${encodeURIComponent(application.cv.fileName)}?expires=${encodeURIComponent(expiresAt)}&signature=${Math.random().toString(36).slice(2, 12)}`,
      fileName: application.cv.fileName,
      expiresAt,
    };
    return HttpResponse.json(body);
  }),

  // Fichier servi par l'URL signée (stockage objet simulé).
  http.get(`${CV_STORAGE_URL}/:id/:file`, ({ request, params }) => {
    const application = findApplication(String(params.id));
    const expires = new URL(request.url).searchParams.get('expires');
    if (!application) return new HttpResponse('Fichier introuvable.', { status: 404 });
    if (!expires || new Date(expires).getTime() < Date.now())
      return new HttpResponse('Lien expiré.', { status: 403 });
    return new HttpResponse(demoPdf(application.contact.fullName), {
      headers: {
        'Content-Type': application.cv.mimeType,
        'Content-Disposition': `attachment; filename="${application.cv.fileName}"`,
      },
    });
  }),
];
