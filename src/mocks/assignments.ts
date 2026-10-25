import type { CurrentUser, RequestDetail, RequestListItem, RequestStatus } from '@/lib/api/schema';
import { adminAppointments, type MockAppointment } from './data/admin-appointments';
import { adminRequests } from './data/admin-requests';
import { assignedOnly, can } from './permissions';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type User = Pick<CurrentUser, 'id' | 'role'> | null | undefined;

/** Demande encore ouverte (`NOUVELLE`, `EN_COURS`) : seules celles-ci peuvent être en retard. */
export const isOpen = (status: RequestStatus) => status === 'NOUVELLE' || status === 'EN_COURS';

/** Échéance dépassée alors que la demande est encore ouverte (`RequestListItem.isOverdue`). */
export function isOverdue(request: Pick<RequestDetail, 'status' | 'dueAt'>, now = Date.now()): boolean {
  return isOpen(request.status) && !!request.dueAt && new Date(request.dueAt).getTime() < now;
}

/** Jour calendaire à Douala (UTC+1, sans heure d'été) : `2026-10-25`. */
export function doualaDay(date: string | number): string {
  return new Date(new Date(date).getTime() + HOUR).toISOString().slice(0, 10);
}

/** Détail renvoyé par l'API : `isOverdue` calculé à la lecture. */
export function withOverdue(request: RequestDetail): RequestDetail {
  return { ...request, isOverdue: isOverdue(request) };
}

export function toListItem(request: RequestDetail): RequestListItem {
  const { id, reference, type, status, contact, service, category, subject, assignedTo, dueAt, createdAt } =
    request;
  return {
    id,
    reference,
    type,
    status,
    contact,
    service,
    category,
    subject,
    assignedTo,
    dueAt: dueAt ?? null,
    isOverdue: isOverdue(request),
    createdAt,
  };
}

/** Demandes visibles : toutes (`requests:read`), celles qui lui sont assignées (`requests:read-assigned`), aucune sinon. */
export function visibleRequests(user: User): RequestDetail[] {
  if (can(user, 'requests:read')) return adminRequests;
  if (assignedOnly(user, 'requests')) return adminRequests.filter((item) => item.assignedTo?.id === user?.id);
  return [];
}

/** Rendez-vous visibles, selon la même règle (`appointments:read` / `appointments:read-assigned`). */
export function visibleAppointments(user: User): MockAppointment[] {
  if (can(user, 'appointments:read')) return adminAppointments;
  if (assignedOnly(user, 'appointments'))
    return adminAppointments.filter((item) => item.assignedTo?.id === user?.id);
  return [];
}

/** Filtre `assignee` : `me`, `none` ou identifiant d'un utilisateur ; absent = tout le monde. */
export function matchesAssignee(
  item: { assignedTo?: { id: string } | null },
  assignee: string | null,
  user: User,
): boolean {
  if (!assignee) return true;
  if (assignee === 'none') return !item.assignedTo;
  const id = assignee === 'me' ? user?.id : assignee;
  return item.assignedTo?.id === id;
}

/** Filtre `due` des demandes ouvertes : en retard, aujourd'hui (Douala), dans les 7 prochains jours. */
export function matchesDue(
  request: Pick<RequestDetail, 'status' | 'dueAt'>,
  due: string | null,
  now = Date.now(),
): boolean {
  if (!due) return true;
  if (!isOpen(request.status) || !request.dueAt) return false;
  const time = new Date(request.dueAt).getTime();
  if (due === 'overdue') return time < now;
  if (due === 'today') return doualaDay(time) === doualaDay(now);
  if (due === 'week') return time >= now && time < now + 7 * DAY;
  return true;
}

/** Ordre « le plus urgent d'abord » : en retard, puis par échéance (sans échéance en dernier). */
export function byUrgency(a: RequestDetail, b: RequestDetail, now = Date.now()): number {
  const overdue = Number(isOverdue(b, now)) - Number(isOverdue(a, now));
  if (overdue) return overdue;
  const due = (request: RequestDetail) =>
    request.dueAt ? new Date(request.dueAt).getTime() : Number.POSITIVE_INFINITY;
  return due(a) === due(b) ? 0 : due(a) - due(b);
}
