import { http, HttpResponse } from 'msw';
import type { Event } from '@/lib/api/schema';
import operations from '../data/contract-examples.json';

type EventsPage = { data: Event[] };

/** Agenda simulé : les 3 événements du contrat (maquette Culture) suivis de 2 sorties supplémentaires. */
const contractEvents = (
  operations.find((operation) => operation.operationId === 'listEvents')?.examples.default as EventsPage
).data;

export const events: Event[] = [
  ...contractEvents,
  {
    id: 'evt_jazz',
    slug: 'soiree-jazz-bonapriso',
    title: 'Soirée jazz à Bonapriso',
    startsAt: '2026-12-12T19:00:00.000Z',
    endsAt: null,
    city: 'Douala',
    place: 'Bonapriso',
    tag: 'Concert',
    visual: { illustration: 'evenement', image: null, alt: '' },
    description: null,
    capacity: 60,
    remainingPlaces: 25,
    limited: false,
  },
  {
    id: 'evt_marche_noel',
    slug: 'marche-artisanal-yaounde',
    title: 'Marché artisanal de fin d’année',
    startsAt: '2026-12-19T09:00:00.000Z',
    endsAt: null,
    city: 'Yaoundé',
    place: 'Bastos',
    tag: 'Artisanat',
    visual: { illustration: 'marche', image: null, alt: '' },
    description: null,
    capacity: null,
    remainingPlaces: null,
    limited: false,
  },
];

export const eventHandlers = [
  http.get('*/v1/events', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const limit = Number(query.get('limit') ?? query.get('pageSize') ?? events.length);
    const data = events.slice(0, limit);
    return HttpResponse.json({
      data,
      meta: { page: 1, pageSize: limit, total: events.length, totalPages: Math.ceil(events.length / limit) },
    });
  }),
];
