import { http, HttpResponse } from 'msw';
import type { Event } from '@/lib/api/schema';
import operations from '../data/contract-examples.json';

type EventsPage = { data: Event[] };

/** Photos des événements de la maquette Culture (`61:5931`), servies comme médias du back-office. */
const photos: Record<string, { file: string; width: number; height: number }> = {
  evt_saveurs: { file: 'chef-2', width: 1536, height: 1024 },
  evt_lobe: { file: 'culture-randonnee', width: 1536, height: 1024 },
  evt_artisans: { file: 'culture-artisans', width: 1536, height: 1024 },
};

/** Agenda simulé : les 3 événements du contrat (maquette Culture) suivis de 2 sorties supplémentaires. */
const contractEvents = (
  operations.find((operation) => operation.operationId === 'listEvents')?.examples.default as EventsPage
).data.map((event): Event => {
  const photo = photos[event.id];
  if (!photo) return event;
  const { file, width, height } = photo;
  const image = { id: `photo-${file}`, url: `/photos/${file}.png`, width, height, variants: [] };
  return { ...event, visual: { ...event.visual, image } };
});

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
