import { http, HttpResponse } from 'msw';
import type { CurrentUser, Dashboard, Notification, RequestStatus, SidebarCounts } from '@/lib/api/schema';
import { toListItem, visibleAppointments, visibleRequests } from '../assignments';
import { appointmentsToConfirm } from '../data/admin-appointments';
import { unreadApplications } from '../data/admin-jobs';
import { reviewsToValidate } from '../data/admin-reviews';
import { can, checkPermissions } from '../permissions';
import { problem } from '../problem';
import { mockUser, requireSession, sessionUser } from '../session';
import { touchActivity } from '../team';

export { toListItem };

const HOUR = 60 * 60 * 1000;

/** Compteurs « à faire » qui ne dépendent pas des demandes (avis, candidatures, RDV, partenariats, inscrits). */
export const pendingCounts = {
  /** Avis au statut « À valider » (`data/admin-reviews.ts`). */
  get reviewsToValidate() {
    return reviewsToValidate();
  },
  /** Candidatures « Nouveau » (non lues) : calculé sur les candidatures simulées (`data/admin-jobs.ts`). */
  get unreadApplications() {
    return unreadApplications();
  },
  /** Rendez-vous « À confirmer » : calculé sur les rendez-vous simulés (`data/admin-appointments.ts`). */
  get appointmentsToConfirm() {
    return appointmentsToConfirm();
  },
  partnershipRequests: 1,
  newRegistrations: 5,
};

type Scope = Pick<CurrentUser, 'id' | 'role'> | null;

/** Périmètre complet (tests sans session). */
const FULL_SCOPE: Scope = { id: '', role: 'ADMIN' };

/**
 * Compteurs de la barre latérale, limités au périmètre des permissions (dossiers assignés pour un rôle
 * `…-assigned`, `0` sans permission).
 */
export function sidebarCounts(user: Scope = FULL_SCOPE): SidebarCounts {
  return {
    requests: visibleRequests(user).filter((request) => request.status === 'NOUVELLE').length,
    appointments: visibleAppointments(user).filter((item) => item.status === 'A_CONFIRMER').length,
    reviews: can(user, 'reviews:moderate') ? pendingCounts.reviewsToValidate : 0,
    applications: can(user, 'applications:read') ? pendingCounts.unreadApplications : 0,
  };
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
  { slug: 'services-a-domicile', name: 'Services à domicile', count: 24, percent: 31.2 },
  { slug: 'immobilier', name: 'Immobilier', count: 21, percent: 27.3 },
  { slug: 'experience', name: 'Expérience', count: 17, percent: 22.1 },
  { slug: 'services-de-proximite', name: 'Services de proximité', count: 9, percent: 11.7 },
  { slug: 'culture-evenementiel', name: 'Culture & événementiel', count: 6, percent: 7.8 },
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

/** Notification utile au rôle (une candidature n'est pas signalée à un chargé de clientèle…). */
function allowed(user: CurrentUser, notification: Notification): boolean {
  switch (notification.kind) {
    case 'REQUEST':
    case 'PARTNERSHIP':
      return can(user, 'requests:read');
    case 'APPOINTMENT':
      return can(user, 'appointments:read');
    case 'REVIEW':
      return can(user, 'reviews:moderate');
    case 'APPLICATION':
      return can(user, 'applications:read');
    case 'REGISTRATION':
      return can(user, 'contacts:read');
    default:
      return true;
  }
}

/** Notifications par utilisateur : une assignation ne concerne que la personne assignée. */
const notificationState = new Map<string, Notification[]>();
let notificationSequence = 0;

function getNotifications(user: CurrentUser): Notification[] {
  let list = notificationState.get(user.id);
  if (!list) {
    list = notifications().filter((item) => allowed(user, item));
    // Démonstration : Paul Ngando (chargé de clientèle) a reçu une demande à traiter.
    if (user.id === 'usr_paul')
      list.unshift({
        id: 'ntf_assign_paul',
        kind: 'ASSIGNMENT',
        title: 'Demande assignée — Maison + Linge (MP-2026-0137)',
        link: '/admin/demandes?id=req_0137',
        readAt: null,
        createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
      });
    notificationState.set(user.id, list);
  }
  return list;
}

/** Notification `ASSIGNMENT` à la personne assignée (demande ou rendez-vous) ; s'assigner soi-même ne notifie pas. */
export function notifyAssignment(
  assigneeId: string,
  actorId: string | undefined,
  title: string,
  link: string,
) {
  const assignee = mockUser(assigneeId);
  if (!assignee || assigneeId === actorId) return;
  notificationSequence += 1;
  getNotifications(assignee).unshift({
    id: `ntf_assign_${notificationSequence}`,
    kind: 'ASSIGNMENT',
    title,
    link,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
};

export const adminCoreHandlers = [
  // Toute route du back-office exige une session (sinon 401, comme l'API), puis l'une des permissions de
  // l'opération (`x-permissions` du contrat, sinon 403). Chaque requête met à jour la dernière activité.
  http.all('*/v1/admin/*', ({ request }) => {
    const denied = requireSession(request);
    if (denied) return denied;
    const user = sessionUser(request)!;
    touchActivity(user.id);
    return checkPermissions(request, user) ?? undefined;
  }),

  http.get('*/v1/admin/sidebar-counts', ({ request }) =>
    HttpResponse.json(sidebarCounts(sessionUser(request))),
  ),

  // Indicateurs selon les permissions : dossiers assignés seulement pour un chargé de clientèle, blocs des demandes
  // vides sans permission sur les demandes (rédacteur).
  http.get('*/v1/admin/dashboard', ({ request }) => {
    const range = (new URL(request.url).searchParams.get('range') ?? '30d') as Dashboard['range'];
    if (!['7d', '30d', '12m'].includes(range)) return problem(400, 'Période inconnue.');
    const user = sessionUser(request);
    const counts = sidebarCounts(user);
    const fullScope = can(user, 'requests:read');
    const requests = visibleRequests(user);
    const scoped = (value: number) => ({ value, previous: null, deltaPercent: null, unit: null });
    const body: Dashboard = {
      range,
      kpis: fullScope
        ? {
            ...KPIS[range],
            newRequests: { ...KPIS[range].newRequests, value: range === '12m' ? 513 : counts.requests },
          }
        : {
            newRequests: scoped(counts.requests),
            quotesInProgress: scoped(
              requests.filter((item) => item.type === 'DEVIS' && item.status === 'EN_COURS').length,
            ),
            servicesCompleted: scoped(
              requests.filter((item) => item.status === 'PRESTATION_REALISEE').length,
            ),
            satisfaction: { ...KPIS[range].satisfaction, previous: null, deltaPercent: null },
          },
      requestsSeries: fullScope ? series(range) : series(range).map((point) => ({ ...point, count: 0 })),
      byCategory: fullScope ? BY_CATEGORY : [],
      latestRequests: [...requests].sort(byNewest).slice(0, 5).map(toListItem),
      todo: {
        reviewsToValidate: counts.reviews,
        unreadApplications: counts.applications,
        appointmentsToConfirm: counts.appointments,
        partnershipRequests: fullScope ? pendingCounts.partnershipRequests : 0,
        newRegistrations: can(user, 'contacts:read') ? pendingCounts.newRegistrations : 0,
      },
      surveys: { sent: 34, answered: 23, responseRate: 68 },
      newsletter: { subscribers: 1248, newThisPeriod: 56 },
      visits: { total: 4320, deltaPercent: null },
      sidebarCounts: counts,
    };
    return HttpResponse.json(body);
  }),

  http.get('*/v1/admin/notifications', ({ request }) => {
    const data = getNotifications(sessionUser(request)!);
    return HttpResponse.json({ data, unreadCount: data.filter((item) => !item.readAt).length });
  }),

  http.patch('*/v1/admin/notifications/read', async ({ request }) => {
    const user = sessionUser(request)!;
    const body = (await request.json()) as { ids?: string[] };
    const now = new Date().toISOString();
    notificationState.set(
      user.id,
      getNotifications(user).map((item) =>
        !body.ids || body.ids.includes(item.id) ? { ...item, readAt: item.readAt ?? now } : item,
      ),
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
    // Seuls les groupes accessibles avec les permissions de l'utilisateur sont renvoyés.
    const user = sessionUser(request);
    const scope = visibleRequests(user);
    const requests = scope
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
    const contacts = [
      ...new Map(
        (can(user, 'contacts:read') ? scope : []).map((item) => [item.contact.id, item.contact]),
      ).values(),
    ]
      .filter((contact) => normalize(`${contact.fullName} ${contact.email}`).includes(needle))
      .slice(0, 4)
      .map((contact) => ({
        id: contact.id,
        title: contact.fullName,
        subtitle: contact.email,
        href: `/admin/contacts?id=${contact.id}`,
      }));
    const groups = [
      { kind: 'requests' as const, label: 'Demandes', items: requests },
      { kind: 'contacts' as const, label: 'Contacts', items: contacts },
    ].filter((group) => group.items.length);
    return HttpResponse.json({ groups });
  }),
];
