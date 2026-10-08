import { http, HttpResponse } from 'msw';
import type {
  Dashboard,
  Notification,
  RequestDetail,
  RequestListItem,
  RequestStatus,
  SidebarCounts,
} from '@/lib/api/schema';
import { appointmentsToConfirm } from '../data/admin-appointments';
import { adminRequests } from '../data/admin-requests';
import { problem } from '../problem';
import { requireSession } from '../session';

const HOUR = 60 * 60 * 1000;

/** Compteurs « à faire » qui ne dépendent pas des demandes (avis, candidatures, RDV, partenariats, inscrits). */
export const pendingCounts = {
  reviewsToValidate: 4,
  unreadApplications: 2,
  /** Rendez-vous « À confirmer » : calculé sur les rendez-vous simulés (`data/admin-appointments.ts`). */
  get appointmentsToConfirm() {
    return appointmentsToConfirm();
  },
  partnershipRequests: 1,
  newRegistrations: 5,
};

export function sidebarCounts(): SidebarCounts {
  return {
    requests: adminRequests.filter((request) => request.status === 'NOUVELLE').length,
    appointments: pendingCounts.appointmentsToConfirm,
    reviews: pendingCounts.reviewsToValidate,
    applications: pendingCounts.unreadApplications,
  };
}

export function toListItem(request: RequestDetail): RequestListItem {
  const { id, reference, type, status, contact, service, category, subject, assignedTo, createdAt } = request;
  return { id, reference, type, status, contact, service, category, subject, assignedTo, createdAt };
}

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt);

/** Série du graphique « Demandes reçues » (maquette : S30 → S41, dernière semaine en cours). */
const WEEKLY = [5, 8, 6, 9, 11, 7, 10, 13, 12, 9, 14, 12];
const MONTHLY = [31, 28, 35, 40, 38, 44, 41, 47, 52, 49, 55, 53];

function isoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function series(range: Dashboard['range']): Dashboard['requestsSeries'] {
  const now = new Date();
  if (range === '12m')
    return MONTHLY.map((count, index) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
      return {
        label: start.toLocaleDateString('fr-FR', { month: 'short' }),
        start: start.toISOString().slice(0, 10),
        count,
      };
    });
  const values = range === '7d' ? [2, 1, 3, 2, 1, 2, 1] : WEEKLY;
  return values.map((count, index) => {
    const days = range === '7d' ? 6 - index : (11 - index) * 7;
    const start = new Date(now.getTime() - days * 86_400_000);
    const label =
      range === '7d'
        ? start.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
        : `S${isoWeek(start)}`;
    return { label, start: start.toISOString().slice(0, 10), count };
  });
}

const KPIS: Record<Dashboard['range'], Dashboard['kpis']> = {
  '7d': {
    newRequests: { value: 12, previous: 8, deltaPercent: 50, unit: null },
    quotesInProgress: { value: 18, previous: null, deltaPercent: null, unit: null },
    servicesCompleted: { value: 6, previous: 5, deltaPercent: 20, unit: null },
    satisfaction: { value: 4.9, previous: 4.8, deltaPercent: 2.1, unit: '/5' },
  },
  '30d': {
    newRequests: { value: 12, previous: 8, deltaPercent: 50, unit: null },
    quotesInProgress: { value: 18, previous: null, deltaPercent: null, unit: null },
    servicesCompleted: { value: 27, previous: 24, deltaPercent: 12, unit: null },
    satisfaction: { value: 4.8, previous: 4.7, deltaPercent: 2.1, unit: '/5' },
  },
  '12m': {
    newRequests: { value: 513, previous: 402, deltaPercent: 27.6, unit: null },
    quotesInProgress: { value: 18, previous: null, deltaPercent: null, unit: null },
    servicesCompleted: { value: 286, previous: 231, deltaPercent: 24, unit: null },
    satisfaction: { value: 4.8, previous: 4.6, deltaPercent: 4.3, unit: '/5' },
  },
};

const BY_CATEGORY: Dashboard['byCategory'] = [
  { slug: 'immobilier', name: 'Immobilier', count: 21, percent: 39.6 },
  { slug: 'experience', name: 'Expérience', count: 17, percent: 32.1 },
  { slug: 'services-de-proximite', name: 'Services de proximité', count: 9, percent: 17 },
  { slug: 'culture-evenementiel', name: 'Culture & événementiel', count: 6, percent: 11.3 },
];

function notifications(): Notification[] {
  const now = Date.now();
  const at = (hours: number) => new Date(now - hours * HOUR).toISOString();
  return [
    {
      id: 'ntf_1',
      kind: 'REQUEST',
      title: 'Nouvelle demande de devis — Chef privé (MP-2026-0142)',
      link: '/admin/demandes?id=req_0142',
      readAt: null,
      createdAt: at(2),
    },
    {
      id: 'ntf_2',
      kind: 'REQUEST',
      title: 'Nouvelle demande de devis — Découverte du Cameroun (MP-2026-0141)',
      link: '/admin/demandes?id=req_0141',
      readAt: null,
      createdAt: at(5),
    },
    {
      id: 'ntf_3',
      kind: 'REVIEW',
      title: 'Nouvel avis à valider — 5 étoiles pour Chef privé',
      link: '/admin/avis',
      readAt: null,
      createdAt: at(20),
    },
    {
      id: 'ntf_4',
      kind: 'APPOINTMENT',
      title: 'Rendez-vous à confirmer — Sandrine M., jeudi 14:00',
      link: '/admin/rendez-vous',
      readAt: at(10),
      createdAt: at(26),
    },
    {
      id: 'ntf_5',
      kind: 'APPLICATION',
      title: 'Nouvelle candidature — Coordinateur·rice de services',
      link: '/admin/recrutement',
      readAt: at(30),
      createdAt: at(50),
    },
  ];
}

let notificationState: Notification[] | null = null;
const getNotifications = () => (notificationState ??= notifications());

const STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
};

export const adminCoreHandlers = [
  // Toute route du back-office exige une session (sinon 401, comme l'API).
  http.all('*/v1/admin/*', ({ request }) => requireSession(request) ?? undefined),

  http.get('*/v1/admin/sidebar-counts', () => HttpResponse.json(sidebarCounts())),

  http.get('*/v1/admin/dashboard', ({ request }) => {
    const range = (new URL(request.url).searchParams.get('range') ?? '30d') as Dashboard['range'];
    if (!['7d', '30d', '12m'].includes(range)) return problem(400, 'Période inconnue.');
    const body: Dashboard = {
      range,
      kpis: {
        ...KPIS[range],
        newRequests: { ...KPIS[range].newRequests, value: range === '12m' ? 513 : sidebarCounts().requests },
      },
      requestsSeries: series(range),
      byCategory: BY_CATEGORY,
      latestRequests: [...adminRequests].sort(byNewest).slice(0, 5).map(toListItem),
      todo: { ...pendingCounts },
      surveys: { sent: 34, answered: 23, responseRate: 68 },
      newsletter: { subscribers: 1248, newThisPeriod: 56 },
      visits: { total: 4320, deltaPercent: null },
      sidebarCounts: sidebarCounts(),
    };
    return HttpResponse.json(body);
  }),

  http.get('*/v1/admin/notifications', () => {
    const data = getNotifications();
    return HttpResponse.json({ data, unreadCount: data.filter((item) => !item.readAt).length });
  }),

  http.patch('*/v1/admin/notifications/read', async ({ request }) => {
    const body = (await request.json()) as { ids?: string[] };
    const now = new Date().toISOString();
    notificationState = getNotifications().map((item) =>
      !body.ids || body.ids.includes(item.id) ? { ...item, readAt: item.readAt ?? now } : item,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/search', ({ request }) => {
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase();
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const needle = normalize(q);
    const requests = adminRequests
      .filter((item) =>
        normalize(`${item.reference} ${item.contact.fullName} ${item.subject ?? ''}`).includes(needle),
      )
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        title: `${item.reference} · ${item.contact.fullName}`,
        subtitle: `${item.subject ?? ''} · ${STATUS_LABELS[item.status]}`,
        href: `/admin/demandes?id=${item.id}`,
      }));
    const contacts = [...new Map(adminRequests.map((item) => [item.contact.id, item.contact])).values()]
      .filter((contact) => normalize(`${contact.fullName} ${contact.email}`).includes(needle))
      .slice(0, 4)
      .map((contact) => ({
        id: contact.id,
        title: contact.fullName,
        subtitle: contact.email,
        href: `/admin/contacts/${contact.id}`,
      }));
    const groups = [
      { kind: 'requests' as const, label: 'Demandes', items: requests },
      { kind: 'contacts' as const, label: 'Contacts', items: contacts },
    ].filter((group) => group.items.length);
    return HttpResponse.json({ groups });
  }),
];
