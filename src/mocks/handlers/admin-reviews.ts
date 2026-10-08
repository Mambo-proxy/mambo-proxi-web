import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  AdminReview,
  AdminSurveyQuestion,
  Problem,
  ReviewInput,
  ReviewStatus,
  SurveyQuestionInput,
} from '@/lib/api/schema';
import { jsonBody, mockId, paginate } from '../admin-utils';
import {
  adminReviews,
  removeFromSite,
  replaceSurveyQuestions,
  reviewStats,
  surveyQuestions,
  syncSite,
} from '../data/admin-reviews';
import { services } from '../data/catalogue';
import { problem } from '../problem';

const STATUSES: ReviewStatus[] = ['A_VALIDER', 'PUBLIE', 'MASQUE'];
const NOT_FOUND = 'Cet avis n’existe pas ou a été supprimé.';

const find = (id: string) => adminReviews.find((review) => review.id === id) ?? null;

/** Initiales d'un nom affiché (« Aurélie K. » → « AK »). */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .replace(/[^\p{L}]/gu, '')
    .slice(0, 2)
    .toUpperCase();

function validateReview(body: Partial<ReviewInput>): Problem['errors'] {
  const errors: NonNullable<Problem['errors']> = [];
  const author = body.authorName?.trim() ?? '';
  if (!author) errors.push({ path: 'authorName', message: 'Indiquez le nom affiché (ex. « Aurélie K. »).' });
  else if (author.length > 60) errors.push({ path: 'authorName', message: '60 caractères au maximum.' });
  if ((body.city ?? '').length > 80) errors.push({ path: 'city', message: '80 caractères au maximum.' });
  if (!Number.isInteger(body.rating) || (body.rating ?? 0) < 1 || (body.rating ?? 0) > 5)
    errors.push({ path: 'rating', message: 'Choisissez une note de 1 à 5 étoiles.' });
  const text = body.text?.trim() ?? '';
  if (text.length < 10) errors.push({ path: 'text', message: 'L’avis doit compter au moins 10 caractères.' });
  else if (text.length > 2000) errors.push({ path: 'text', message: '2 000 caractères au maximum.' });
  return errors;
}

function validateQuestions(list: SurveyQuestionInput[]): Problem['errors'] {
  const errors: NonNullable<Problem['errors']> = [];
  list.forEach((question, index) => {
    const label = question.label?.trim() ?? '';
    if (!label) errors.push({ path: `${index}.label`, message: 'Saisissez l’intitulé de la question.' });
    else if (label.length > 200)
      errors.push({ path: `${index}.label`, message: '200 caractères au maximum.' });
    const options = (question.options ?? []).filter((option) => option.trim());
    if (question.kind === 'CHOICE' && options.length < 2)
      errors.push({ path: `${index}.options`, message: 'Proposez au moins deux choix de réponse.' });
  });
  return errors;
}

/** Back-office — Avis clients et questions du questionnaire (`/v1/admin/reviews*`, `/v1/admin/survey-questions`). */
export const adminReviewHandlers: HttpHandler[] = [
  http.get('*/v1/admin/reviews/stats', () => HttpResponse.json(reviewStats())),

  http.get('*/v1/admin/reviews', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') as ReviewStatus | null;
    const service = params.get('service');
    // Compteurs des onglets : filtre de service appliqué, statut ignoré.
    const base = adminReviews
      .filter((review) => !service || review.service?.slug === service)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const counts = Object.fromEntries(
      STATUSES.map((value) => [value, base.filter((review) => review.status === value).length]),
    ) as Record<ReviewStatus, number>;
    const list = status ? base.filter((review) => review.status === status) : base;
    return HttpResponse.json({ ...paginate(list, params), counts });
  }),

  http.post('*/v1/admin/reviews', async ({ request }) => {
    const body = await jsonBody<Partial<ReviewInput>>(request);
    const errors = validateReview(body);
    if (errors?.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const service = body.serviceId ? services.find((item) => item.id === body.serviceId) : null;
    const status = body.status ?? 'A_VALIDER';
    const now = new Date().toISOString();
    const authorName = body.authorName!.trim();
    const review: AdminReview = {
      id: mockId('rev'),
      authorName,
      initials: initialsOf(authorName),
      city: body.city?.trim() || null,
      rating: body.rating!,
      text: body.text!.trim(),
      service: service ? { slug: service.slug, name: service.shortName ?? service.name } : null,
      requestReference: null,
      serviceDate: body.date ?? null,
      status,
      // Témoignage saisi par l'équipe : « non vérifié », publication autorisée par le client hors questionnaire.
      verified: false,
      featured: false,
      publishConsent: true,
      answers: [],
      reply: null,
      publishedAt: status === 'PUBLIE' ? now : null,
      createdAt: body.date ?? now,
    };
    adminReviews.unshift(review);
    syncSite(review);
    return HttpResponse.json(review, { status: 201 });
  }),

  http.patch('*/v1/admin/reviews/:id', async ({ request, params }) => {
    const review = find(String(params.id));
    if (!review) return problem(404, NOT_FOUND);
    const body = await jsonBody<{ status?: ReviewStatus; featured?: boolean; serviceId?: string | null }>(
      request,
    );
    if (body.status === 'PUBLIE' && !review.publishConsent)
      return problem(
        409,
        'Le client n’a pas autorisé la publication de cet avis. Il reste consultable en suivi interne.',
      );
    const status = body.status ?? review.status;
    if (body.featured && status !== 'PUBLIE')
      return problem(409, 'Seul un avis publié peut être mis en avant sur l’accueil.');
    if (body.status && body.status !== review.status) {
      review.status = body.status;
      review.publishedAt = body.status === 'PUBLIE' ? new Date().toISOString() : review.publishedAt;
      if (body.status !== 'PUBLIE') review.featured = false;
    }
    if (body.featured !== undefined) review.featured = body.featured;
    if (body.serviceId !== undefined) {
      const service = body.serviceId ? services.find((item) => item.id === body.serviceId) : null;
      review.service = service ? { slug: service.slug, name: service.shortName ?? service.name } : null;
    }
    syncSite(review);
    return HttpResponse.json(review);
  }),

  http.delete('*/v1/admin/reviews/:id', ({ params }) => {
    const index = adminReviews.findIndex((review) => review.id === String(params.id));
    if (index < 0) return problem(404, NOT_FOUND);
    if (adminReviews[index]!.verified)
      return problem(409, 'Seuls les avis ajoutés manuellement peuvent être supprimés. Masquez cet avis.');
    adminReviews.splice(index, 1);
    removeFromSite(String(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/reviews/:id/reply', async ({ request, params }) => {
    const review = find(String(params.id));
    if (!review) return problem(404, NOT_FOUND);
    const { reply } = await jsonBody<{ reply?: string | null }>(request);
    const text = reply?.trim() ?? '';
    if (text.length > 2000)
      return problem(422, 'La réponse est trop longue.', [
        { path: 'reply', message: '2 000 caractères au maximum.' },
      ]);
    review.reply = text || null;
    syncSite(review);
    return HttpResponse.json(review);
  }),

  http.get('*/v1/admin/survey-questions', () => HttpResponse.json(surveyQuestions)),

  http.put('*/v1/admin/survey-questions', async ({ request }) => {
    const body = await jsonBody<SurveyQuestionInput[]>(request);
    if (!Array.isArray(body)) return problem(400, 'Liste de questions attendue.');
    if (body.length > 10) return problem(422, 'Le questionnaire compte 10 questions au maximum.');
    if (body.filter((question) => question.active).length > 5)
      return problem(422, 'Le questionnaire compte 5 questions actives au maximum.');
    const errors = validateQuestions(body);
    if (errors?.length) return problem(422, 'Certaines questions sont à corriger.', errors);
    const next: AdminSurveyQuestion[] = body.map((question, index) => ({
      id: question.id || mockId('q'),
      order: index + 1,
      kind: question.kind,
      label: question.label.trim(),
      helpText: question.helpText?.trim() || null,
      options: question.kind === 'TEXT' ? [] : (question.options ?? []).map((option) => option.trim()),
      required: question.required,
      active: question.active,
    }));
    replaceSurveyQuestions(next);
    return HttpResponse.json(surveyQuestions);
  }),
];
