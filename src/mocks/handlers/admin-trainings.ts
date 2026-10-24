import { http, HttpResponse } from 'msw';
import type { AdminTraining, AdminTrainingRequest, RequestStatus, TrainingFields } from '@/lib/api/schema';
import { jsonBody, mockId, paginate, slugify } from '../admin-utils';
import { adminRequests } from '../data/admin-requests';
import { problem } from '../problem';
import { adminTrainings, sortedTrainings, TRAINING_LABELS } from './trainings';

const CATEGORIES = Object.keys(TRAINING_LABELS);

function validate(body: TrainingFields, current: AdminTraining | null) {
  const errors: { path: string; message: string }[] = [];
  if (body.title !== undefined && !body.title.trim())
    errors.push({ path: 'title', message: 'Saisissez le titre de la formation.' });
  if (body.category !== undefined && !CATEGORIES.includes(body.category))
    errors.push({ path: 'category', message: 'Choisissez une catégorie.' });
  if (body.duration !== undefined && !body.duration.trim())
    errors.push({ path: 'duration', message: 'Saisissez la durée (ex. « 1 jour »).' });
  if (body.format !== undefined && !body.format.trim())
    errors.push({ path: 'format', message: 'Saisissez le format (ex. « Présentiel »).' });
  if (body.slug && adminTrainings.some((item) => item.slug === body.slug && item !== current))
    errors.push({ path: 'slug', message: 'Cette adresse est déjà utilisée par une autre formation.' });
  return errors.length ? problem(422, 'La formation n’a pas pu être enregistrée.', errors) : null;
}

/** Applique les champs reçus (création ou PATCH) et recalcule les libellés de la catégorie. */
function apply(training: AdminTraining, body: TrainingFields) {
  const fields = Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
  Object.assign(training, fields);
  if (body.title !== undefined) training.title = body.title.trim();
  if (body.category !== undefined) {
    training.categoryLabel = TRAINING_LABELS[body.category].label;
    if (body.audienceLabel === undefined) training.audienceLabel = TRAINING_LABELS[body.category].audience;
  }
}

/** Demande de type `FORMATION` → ligne de `GET /v1/admin/training-requests`. */
function toTrainingRequest(request: (typeof adminRequests)[number]): AdminTrainingRequest {
  const payload = (request.payload ?? {}) as {
    organization?: string;
    trainingSlug?: string;
    participants?: number;
    period?: string;
  };
  const training = adminTrainings.find((item) => item.slug === payload.trainingSlug);
  return {
    id: request.id,
    reference: request.reference,
    status: request.status,
    organization: payload.organization ?? null,
    contact: request.contact,
    training: training ? { id: training.id, slug: training.slug, title: training.title } : null,
    otherTraining: training ? null : (request.subject ?? null),
    participants: payload.participants ?? 1,
    period: payload.period ?? null,
    createdAt: request.createdAt,
  };
}

/** Back-office — Formations (`/v1/admin/trainings*`, `/v1/admin/training-requests`). */
export const adminTrainingHandlers = [
  http.get('*/v1/admin/trainings', () => HttpResponse.json(sortedTrainings())),

  http.post('*/v1/admin/trainings', async ({ request }) => {
    const body = await jsonBody<TrainingFields>(request);
    const title = body.title?.trim() ?? '';
    const error = validate(
      {
        ...body,
        title,
        category: body.category ?? ('' as never),
        duration: body.duration ?? '',
        format: body.format ?? '',
      },
      null,
    );
    if (error) return error;
    const category = body.category!;
    const training: AdminTraining = {
      id: mockId('trn'),
      slug: body.slug || slugify(title),
      title,
      category,
      categoryLabel: TRAINING_LABELS[category].label,
      audienceLabel: TRAINING_LABELS[category].audience,
      icon: 'GraduationCap',
      duration: '',
      format: '',
      location: null,
      description: null,
      status: 'DRAFT',
      sortOrder: Math.max(-1, ...adminTrainings.map((item) => item.sortOrder)) + 1,
      requestsCount: 0,
    };
    apply(training, { ...body, slug: training.slug });
    adminTrainings.push(training);
    return HttpResponse.json(training, { status: 201 });
  }),

  http.patch('*/v1/admin/trainings/reorder', async ({ request }) => {
    const { ids = [] } = await jsonBody<{ ids?: string[] }>(request);
    ids.forEach((id, index) => {
      const training = adminTrainings.find((item) => item.id === id);
      if (training) training.sortOrder = index;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/admin/trainings/:id', async ({ request, params }) => {
    const training = adminTrainings.find((item) => item.id === params.id);
    if (!training) return problem(404, 'Cette formation n’existe plus.');
    const body = await jsonBody<TrainingFields>(request);
    const error = validate(body, training);
    if (error) return error;
    apply(training, body);
    return HttpResponse.json(training);
  }),

  http.delete('*/v1/admin/trainings/:id', ({ params }) => {
    const index = adminTrainings.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cette formation n’existe plus.');
    adminTrainings.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/training-requests', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') as RequestStatus | null;
    const list = adminRequests
      .filter((item) => item.type === 'FORMATION' && (!status || item.status === status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toTrainingRequest);
    return HttpResponse.json(paginate(list, params));
  }),
];
