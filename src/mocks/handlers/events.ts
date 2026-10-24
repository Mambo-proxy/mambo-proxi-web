import { http, HttpResponse } from 'msw';
import type { Event, PublishStatus } from '@/lib/api/schema';
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

const events: Event[] = [
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

/** Événement de l'agenda avec son statut de publication (partagé avec le back-office). */
export type StoredEvent = Event & { status: PublishStatus };

/**
 * Agenda du back-office : les 5 sorties du site (publiées), deux sorties passées et un brouillon. Le site ne
 * montre que les événements publiés à venir.
 */
export const agendaEvents: StoredEvent[] = [
  ...events.map((event): StoredEvent => ({ ...event, status: 'PUBLISHED' })),
  {
    id: 'evt_contes',
    slug: 'soiree-contes-akwa',
    title: 'Soirée contes et musique à Akwa',
    startsAt: '2026-10-10T17:30:00.000Z',
    endsAt: '2026-10-10T20:30:00.000Z',
    city: 'Douala',
    place: 'Akwa',
    tag: 'Culture',
    visual: { illustration: 'culture', image: null, alt: '' },
    description: 'Contes du Littoral et musique traditionnelle, en famille.',
    capacity: 30,
    remainingPlaces: null,
    limited: false,
    status: 'PUBLISHED',
  },
  {
    id: 'evt_ndole',
    slug: 'atelier-cuisine-ndole',
    title: 'Atelier cuisine : le ndolé',
    startsAt: '2026-09-12T09:00:00.000Z',
    endsAt: '2026-09-12T13:00:00.000Z',
    city: 'Douala',
    place: 'Bonapriso',
    tag: 'Gastronomie',
    visual: { illustration: 'chef', image: null, alt: '' },
    description: 'Préparer le ndolé avec une cheffe, puis le déguster ensemble.',
    capacity: 12,
    remainingPlaces: null,
    limited: true,
    status: 'PUBLISHED',
  },
  {
    id: 'evt_festival',
    slug: 'festival-arts-douala',
    title: 'Festival des arts de Douala',
    startsAt: '2027-01-16T15:00:00.000Z',
    endsAt: null,
    city: 'Douala',
    place: 'Bonanjo',
    tag: 'Festival',
    visual: { illustration: 'evenement', image: null, alt: '' },
    description: null,
    capacity: 200,
    remainingPlaces: null,
    limited: false,
    status: 'DRAFT',
  },
];

/** Événements publiés à venir, du plus proche au plus lointain (agenda du site). */
export function publishedEvents(now = Date.now()): Event[] {
  return agendaEvents
    .filter((event) => event.status === 'PUBLISHED' && Date.parse(event.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((event): Event => {
      const copy: Partial<StoredEvent> = { ...event };
      delete copy.status;
      return copy as Event;
    });
}

export const eventHandlers = [
  http.get('*/v1/events', ({ request }) => {
    const query = new URL(request.url).searchParams;
    const limit = Number(query.get('limit') ?? query.get('pageSize') ?? agendaEvents.length);
    const list = publishedEvents();
    const data = list.slice(0, limit);
    return HttpResponse.json({
      data,
      meta: { page: 1, pageSize: limit, total: list.length, totalPages: Math.ceil(list.length / limit) },
    });
  }),
];
