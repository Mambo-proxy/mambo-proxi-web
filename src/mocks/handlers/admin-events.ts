import { http, HttpResponse } from 'msw';
import type { AdminEvent, EventFields, IllustrationScene, RequestListItem } from '@/lib/api/schema';
import { jsonBody, mockId, slugify } from '../admin-utils';
import { adminRequests } from '../data/admin-requests';
import { problem } from '../problem';
import { toListItem } from './admin-core';
import { adminMedia } from './admin-media';
import { agendaEvents, type StoredEvent } from './events';

type Registration = { request: (typeof adminRequests)[number]; seats: number };

/** Inscriptions d'un événement : demandes `EVENEMENT` dont le formulaire porte son adresse (`eventSlug`). */
function registrationsOf(event: StoredEvent): Registration[] {
  return adminRequests
    .filter((request) => request.type === 'EVENEMENT' && request.payload?.eventSlug === event.slug)
    .map((request) => ({ request, seats: Number(request.payload?.seats ?? 1) || 1 }));
}

function toAdmin(event: StoredEvent): AdminEvent {
  const registrations = registrationsOf(event);
  const seatsTaken = registrations.reduce((sum, item) => sum + item.seats, 0);
  return {
    ...event,
    registrationsCount: registrations.length,
    seatsTaken,
    remainingPlaces: event.capacity == null ? null : Math.max(0, event.capacity - seatsTaken),
  };
}

const isPast = (event: StoredEvent, now = Date.now()) => Date.parse(event.endsAt ?? event.startsAt) < now;

function validate(body: EventFields, current: StoredEvent | null) {
  const errors: { path: string; message: string }[] = [];
  if (body.title !== undefined && !body.title.trim())
    errors.push({ path: 'title', message: 'Saisissez le titre de l’événement.' });
  if (body.startsAt !== undefined && Number.isNaN(Date.parse(body.startsAt)))
    errors.push({ path: 'startsAt', message: 'Choisissez la date et l’heure de début.' });
  const startsAt = body.startsAt ?? current?.startsAt;
  if (body.endsAt && startsAt && Date.parse(body.endsAt) <= Date.parse(startsAt))
    errors.push({ path: 'endsAt', message: 'La fin doit être après le début.' });
  if (body.city !== undefined && !body.city.trim())
    errors.push({ path: 'city', message: 'Saisissez la ville.' });
  if (body.tag !== undefined && !body.tag.trim())
    errors.push({ path: 'tag', message: 'Saisissez le type (ex. « Concert »).' });
  if (body.capacity != null && (!Number.isInteger(body.capacity) || body.capacity < 1))
    errors.push({
      path: 'capacity',
      message: 'Indiquez un nombre de places supérieur à 0, ou laissez vide.',
    });
  if (current && body.capacity != null && body.capacity < toAdmin(current).seatsTaken)
    errors.push({
      path: 'capacity',
      message: `${toAdmin(current).seatsTaken} places sont déjà réservées : la capacité ne peut pas être inférieure.`,
    });
  if (body.slug && agendaEvents.some((item) => item.slug === body.slug && item !== current))
    errors.push({ path: 'slug', message: 'Cette adresse est déjà utilisée par un autre événement.' });
  return errors.length ? problem(422, 'L’événement n’a pas pu être enregistré.', errors) : null;
}

/** Applique les champs reçus ; `illustration` et `imageId` composent le visuel. */
function apply(event: StoredEvent, body: EventFields) {
  const { illustration, imageId, ...fields } = body;
  const defined = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  Object.assign(event, defined);
  if (body.title !== undefined) event.title = body.title.trim();
  if (illustration) event.visual = { ...event.visual, illustration };
  if (imageId !== undefined) {
    const media = adminMedia.find((item) => item.id === imageId);
    event.visual = {
      ...event.visual,
      image: media
        ? {
            id: media.id,
            url: media.url,
            width: media.width,
            height: media.height,
            alt: media.alt,
            focalPoint: media.focalPoint,
            variants: media.variants,
          }
        : null,
      alt: media?.alt ?? '',
    };
  }
}

const find = (id: unknown) => agendaEvents.find((item) => item.id === id);

/** Back-office — Agenda (`/v1/admin/events*`). */
export const adminEventHandlers = [
  http.get('*/v1/admin/events', ({ request }) => {
    const period = new URL(request.url).searchParams.get('period') ?? 'upcoming';
    const list = agendaEvents
      .filter((event) => period === 'all' || (period === 'past' ? isPast(event) : !isPast(event)))
      // À venir : le plus proche d'abord ; passés : le plus récent d'abord.
      .sort((a, b) => (period === 'upcoming' ? 1 : -1) * a.startsAt.localeCompare(b.startsAt));
    return HttpResponse.json(list.map(toAdmin));
  }),

  http.post('*/v1/admin/events', async ({ request }) => {
    const body = await jsonBody<EventFields>(request);
    const required: EventFields = {
      ...body,
      title: body.title?.trim() ?? '',
      startsAt: body.startsAt ?? '',
      city: body.city ?? '',
      tag: body.tag ?? '',
    };
    const error = validate(required, null);
    if (error) return error;
    const event: StoredEvent = {
      id: mockId('evt'),
      slug: body.slug || slugify(required.title!),
      title: required.title!,
      startsAt: required.startsAt!,
      endsAt: null,
      city: required.city!.trim(),
      place: null,
      tag: required.tag!.trim(),
      visual: { illustration: (body.illustration ?? 'evenement') as IllustrationScene, image: null, alt: '' },
      description: null,
      capacity: null,
      remainingPlaces: null,
      limited: false,
      status: 'DRAFT',
    };
    apply(event, body);
    agendaEvents.push(event);
    return HttpResponse.json(toAdmin(event), { status: 201 });
  }),

  http.get('*/v1/admin/events/:id', ({ params }) => {
    const event = find(params.id);
    if (!event) return problem(404, 'Cet événement n’existe plus.');
    const registrations: RequestListItem[] = registrationsOf(event)
      .map((item) => toListItem(item.request))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json({ ...toAdmin(event), registrations });
  }),

  http.patch('*/v1/admin/events/:id', async ({ request, params }) => {
    const event = find(params.id);
    if (!event) return problem(404, 'Cet événement n’existe plus.');
    const body = await jsonBody<EventFields>(request);
    const error = validate(body, event);
    if (error) return error;
    apply(event, body);
    return HttpResponse.json(toAdmin(event));
  }),

  http.delete('*/v1/admin/events/:id', ({ params }) => {
    const index = agendaEvents.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cet événement n’existe plus.');
    agendaEvents.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
