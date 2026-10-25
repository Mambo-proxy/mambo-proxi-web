import { http, HttpResponse } from 'msw';
import type { MyTasks, TeamMemberPresence, TeamPresence } from '@/lib/api/schema';
import { byUrgency, doualaDay, isOpen, isOverdue, toListItem } from '../assignments';
import { adminAppointments } from '../data/admin-appointments';
import { adminRequests } from '../data/admin-requests';
import { ROLE_DEFINITIONS, can } from '../permissions';
import { sessionUser } from '../session';
import { ONLINE_WINDOW_MINUTES, adminUsers, isAssignable, isOnline, userRefOf } from '../team';

const DAY = 24 * 60 * 60 * 1000;

/** Rendez-vous encore à venir (à confirmer, confirmé ou autre créneau proposé). */
const upcomingStatuses = new Set(['A_CONFIRMER', 'CONFIRME', 'AUTRE_CRENEAU_PROPOSE']);

/** Demandes ouvertes et rendez-vous à venir assignés à un membre (`openTasks` de la présence). */
function openTasksOf(userId: string, now = Date.now()): number {
  const requests = adminRequests.filter(
    (item) => item.assignedTo?.id === userId && isOpen(item.status),
  ).length;
  const appointments = adminAppointments.filter(
    (item) =>
      item.assignedTo?.id === userId &&
      upcomingStatuses.has(item.status) &&
      new Date(item.endsAt).getTime() >= now,
  ).length;
  return requests + appointments;
}

/** « Mes tâches » de l'utilisateur connecté (contrat `GET /v1/admin/me/tasks`). */
export function myTasks(userId: string, canAssign: boolean, now = Date.now()): MyTasks {
  const today = doualaDay(now);
  const open = adminRequests.filter((item) => item.assignedTo?.id === userId && isOpen(item.status));
  const mine = adminAppointments.filter((item) => item.assignedTo?.id === userId);
  const start = (item: (typeof mine)[number]) => new Date(item.proposedStartsAt ?? item.startsAt).getTime();
  return {
    generatedAt: new Date(now).toISOString(),
    requests: {
      open: open.length,
      byStatus: {
        NOUVELLE: open.filter((item) => item.status === 'NOUVELLE').length,
        EN_COURS: open.filter((item) => item.status === 'EN_COURS').length,
      },
      overdue: open.filter((item) => isOverdue(item, now)).length,
      dueToday: open.filter(
        (item) => !isOverdue(item, now) && !!item.dueAt && doualaDay(item.dueAt) === today,
      ).length,
      items: [...open]
        .sort((a, b) => byUrgency(a, b, now))
        .slice(0, 10)
        .map(toListItem),
    },
    appointments: {
      today: mine.filter((item) => item.status === 'CONFIRME' && doualaDay(start(item)) === today).length,
      toConfirm: mine.filter((item) => item.status === 'A_CONFIRMER').length,
      upcoming: mine
        .filter(
          (item) =>
            upcomingStatuses.has(item.status) &&
            start(item) >= now - 60 * 60 * 1000 &&
            start(item) < now + 7 * DAY,
        )
        .sort((a, b) => start(a) - start(b))
        .slice(0, 5),
    },
    unassigned: canAssign
      ? adminRequests.filter((item) => !item.assignedTo && isOpen(item.status)).length
      : null,
  };
}

/** Équipe : rôles, présence et tâches de l'utilisateur connecté (`/v1/admin/roles`, `/users/presence`, `/me/tasks`). */
export const adminTeamHandlers = [
  http.get('*/v1/admin/roles', () => HttpResponse.json(ROLE_DEFINITIONS)),

  http.get('*/v1/admin/users/presence', () => {
    const now = Date.now();
    const time = (value: string | null | undefined) => (value ? new Date(value).getTime() : 0);
    const data: TeamMemberPresence[] = adminUsers
      .filter((user) => user.status === 'ACTIF')
      .map((user) => ({
        user: userRefOf(user),
        role: user.role,
        online: isOnline(user, now),
        lastActiveAt: user.lastActiveAt ?? null,
        lastLoginAt: user.lastLoginAt ?? null,
        assignable: isAssignable(user),
        openTasks: openTasksOf(user.id, now),
      }))
      // Connectés d'abord, puis par dernière activité décroissante.
      .sort((a, b) => Number(b.online) - Number(a.online) || time(b.lastActiveAt) - time(a.lastActiveAt));
    const body: TeamPresence = {
      onlineWindowMinutes: ONLINE_WINDOW_MINUTES,
      onlineCount: data.filter((member) => member.online).length,
      generatedAt: new Date(now).toISOString(),
      data,
    };
    return HttpResponse.json(body);
  }),

  http.get('*/v1/admin/me/tasks', ({ request }) => {
    const user = sessionUser(request)!;
    return HttpResponse.json(myTasks(user.id, can(user, 'requests:assign')));
  }),
];
