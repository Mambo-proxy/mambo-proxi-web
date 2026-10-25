import { describe, expect, it } from 'vitest';
import type {
  AdminAppointment,
  MyTasks,
  Notification,
  RequestDetail,
  RequestListItem,
  RoleDefinition,
  SidebarCounts,
  TeamPresence,
} from '@/lib/api/schema';
import { requiredPermissions } from '../permissions';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';

async function call<T>(method: string, path: string, user: string, body?: unknown) {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, {
      method,
      headers: { [MOCK_COOKIE_HEADER]: `mp_at=${user}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
  const text = await response.text();
  const parsed = text && response.headers.get('content-type')?.includes('json') ? JSON.parse(text) : text;
  return { status: response.status, body: parsed as T };
}

type RequestPage = { data: RequestListItem[]; meta: { total: number } };

const ADMIN = 'usr_mireille';
const MANAGER = 'usr_carine';
const AGENT = 'usr_paul';
const WRITER = 'usr_grace';

describe('permissions du contrat (garde commune)', () => {
  it('table x-permissions : adresse littérale avant paramètre', () => {
    expect(requiredPermissions('GET', '/v1/admin/requests/export.csv')).toEqual(['requests:export']);
    expect(requiredPermissions('GET', '/v1/admin/requests/req_0142')).toEqual([
      'requests:read',
      'requests:read-assigned',
    ]);
    expect(requiredPermissions('GET', '/v1/admin/users/presence')).toEqual(['team:read']);
    expect(requiredPermissions('PUT', '/v1/admin/settings/coordonnees')).toEqual([
      'settings:write',
      'settings:admin',
    ]);
  });

  it('403 Problem sans la permission, sur chaque domaine', async () => {
    const denied = [
      ['GET', '/v1/admin/requests', WRITER],
      ['GET', '/v1/admin/requests/export.csv', AGENT],
      ['GET', '/v1/admin/services', AGENT],
      ['POST', '/v1/admin/services', MANAGER],
      ['GET', '/v1/admin/appointments?from=2026-01-01T00:00:00Z&to=2027-01-01T00:00:00Z', WRITER],
      ['GET', '/v1/admin/settings/coordonnees', AGENT],
      ['PUT', '/v1/admin/settings/coordonnees', MANAGER],
      ['GET', '/v1/admin/users', MANAGER],
      ['GET', '/v1/admin/users/presence', AGENT],
      ['GET', '/v1/admin/analytics/summary', WRITER],
      ['GET', '/v1/admin/audit-log', MANAGER],
      ['GET', '/v1/admin/contacts', AGENT],
    ] as const;
    for (const [method, path, user] of denied) {
      const body = method === 'GET' ? undefined : {};
      const response = await call<{ status: number; title: string }>(method, path, user, body);
      expect(response.status, `${method} ${path} (${user})`).toBe(403);
      expect(response.body).toMatchObject({ status: 403, title: 'Accès refusé' });
    }
    expect((await call('GET', '/v1/admin/me/tasks', WRITER)).status).toBe(200);
    expect((await call('GET', '/v1/admin/services', WRITER)).status).toBe(200);
  });

  it('rôles et permissions effectives', async () => {
    const roles = await call<RoleDefinition[]>('GET', '/v1/admin/roles', MANAGER);
    expect(roles.body.map((role) => role.role)).toEqual(['ADMIN', 'MANAGER', 'AGENT', 'EDITOR', 'WRITER']);
    const me = await call<{ role: string; permissions: string[] }>('GET', '/v1/auth/me', AGENT);
    expect(me.body.role).toBe('AGENT');
    expect(me.body.permissions).toContain('requests:read-assigned');
    expect(me.body.permissions).not.toContain('requests:read');
  });
});

describe('demandes assignées', () => {
  it('chargé de clientèle : ses demandes seulement, assignee=me d’office', async () => {
    const page = await call<RequestPage>('GET', '/v1/admin/requests?pageSize=100', AGENT);
    expect(page.status).toBe(200);
    expect(page.body.data.length).toBeGreaterThan(0);
    expect(page.body.data.every((item) => item.assignedTo?.id === AGENT)).toBe(true);
    expect((await call('GET', '/v1/admin/requests?assignee=none', AGENT)).status).toBe(403);
    expect((await call('GET', '/v1/admin/requests/req_0142', AGENT)).status).toBe(404);
    const counts = await call<SidebarCounts>('GET', '/v1/admin/sidebar-counts', AGENT);
    expect(counts.body).toMatchObject({ reviews: 0, applications: 0 });
  });

  it('filtres assignee et due, échéance 24 h et retard', async () => {
    const unassigned = await call<RequestPage>('GET', '/v1/admin/requests?assignee=none&pageSize=100', ADMIN);
    expect(unassigned.body.data.every((item) => item.assignedTo === null)).toBe(true);
    const paul = await call<RequestPage>('GET', `/v1/admin/requests?assignee=${AGENT}&pageSize=100`, ADMIN);
    expect(paul.body.data.map((item) => item.id).sort()).toEqual(['req_0124', 'req_0125', 'req_0137']);

    const overdue = await call<RequestPage>('GET', '/v1/admin/requests?due=overdue&pageSize=100', AGENT);
    expect(overdue.body.data.map((item) => item.id).sort()).toEqual(['req_0124', 'req_0125']);
    expect(overdue.body.data.every((item) => item.isOverdue)).toBe(true);
    const week = await call<RequestPage>('GET', '/v1/admin/requests?due=week&pageSize=100', AGENT);
    expect(week.body.data.map((item) => item.id)).toEqual(['req_0137']);

    const fresh = await call<RequestDetail>('GET', '/v1/admin/requests/req_0142', ADMIN);
    const delay = new Date(fresh.body.dueAt!).getTime() - new Date(fresh.body.createdAt).getTime();
    expect(delay).toBe(24 * 60 * 60 * 1000);
  });

  it('assignation : responsable, 422 si non assignable, notification ASSIGNMENT', async () => {
    expect(
      (await call('PATCH', '/v1/admin/requests/req_0141', MANAGER, { assignedToId: WRITER })).status,
    ).toBe(422);
    const assigned = await call<RequestDetail>('PATCH', '/v1/admin/requests/req_0141', MANAGER, {
      assignedToId: AGENT,
    });
    expect(assigned.status).toBe(200);
    expect(assigned.body.assignedTo).toEqual({ id: AGENT, name: 'Paul Ngando', initials: 'PN' });
    expect(assigned.body.history.at(-1)).toMatchObject({ kind: 'ASSIGNED', label: 'Assignée à Paul Ngando' });

    const notifications = await call<{ data: Notification[] }>('GET', '/v1/admin/notifications', AGENT);
    expect(notifications.body.data[0]).toMatchObject({
      kind: 'ASSIGNMENT',
      link: '/admin/demandes?id=req_0141',
    });
    // Paul voit désormais la demande, sans pouvoir la réassigner.
    expect((await call('GET', '/v1/admin/requests/req_0141', AGENT)).status).toBe(200);
    expect(
      (await call('PATCH', '/v1/admin/requests/req_0141', AGENT, { assignedToId: MANAGER })).status,
    ).toBe(403);
  });

  it('chargé de clientèle : statut et échéance de ses demandes, pas de retour arrière', async () => {
    const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const started = await call<RequestDetail>('PATCH', '/v1/admin/requests/req_0141', AGENT, {
      status: 'EN_COURS',
      dueAt,
    });
    expect(started.status).toBe(200);
    expect(started.body).toMatchObject({ status: 'EN_COURS', dueAt, isOverdue: false });
    expect((await call('PATCH', '/v1/admin/requests/req_0141', AGENT, { status: 'NOUVELLE' })).status).toBe(
      403,
    );
    expect((await call('PATCH', '/v1/admin/requests/req_0141', ADMIN, { status: 'NOUVELLE' })).status).toBe(
      200,
    );
    expect((await call('POST', '/v1/admin/requests/req_0141/duplicate', AGENT)).status).toBe(403);
  });
});

describe('équipe et tâches', () => {
  it('présence : connectés d’abord, personnes assignables', async () => {
    const presence = await call<TeamPresence>('GET', '/v1/admin/users/presence', MANAGER);
    expect(presence.body.onlineWindowMinutes).toBe(5);
    expect(presence.body.data[0]?.online).toBe(true);
    const grace = presence.body.data.find((member) => member.user.id === WRITER);
    expect(grace).toMatchObject({ role: 'WRITER', assignable: false, openTasks: 0 });
    const paul = presence.body.data.find((member) => member.user.id === AGENT);
    expect(paul).toMatchObject({ role: 'AGENT', assignable: true });
    expect(paul!.openTasks).toBeGreaterThan(0);
  });

  it('mes tâches : demandes urgentes d’abord, rendez-vous, non assignées selon requests:assign', async () => {
    const paul = await call<MyTasks>('GET', '/v1/admin/me/tasks', AGENT);
    expect(paul.body.requests.overdue).toBe(2);
    expect(paul.body.requests.items[0]?.isOverdue).toBe(true);
    expect(paul.body.unassigned).toBeNull();
    expect(paul.body.appointments.toConfirm).toBeGreaterThanOrEqual(1);
    const carine = await call<MyTasks>('GET', '/v1/admin/me/tasks', MANAGER);
    expect(carine.body.unassigned).toBeGreaterThan(0);
  });

  it('rendez-vous : périmètre assigné et action assign', async () => {
    const range = 'from=2020-01-01T00:00:00Z&to=2030-01-01T00:00:00Z';
    const mine = await call<{ data: AdminAppointment[]; pending: AdminAppointment[] }>(
      'GET',
      `/v1/admin/appointments?${range}`,
      AGENT,
    );
    expect(mine.body.data.length).toBeGreaterThan(0);
    expect([...mine.body.data, ...mine.body.pending].every((item) => item.assignedTo?.id === AGENT)).toBe(
      true,
    );
    expect(
      (await call('PATCH', '/v1/admin/appointments/apt_0150', AGENT, { action: 'confirm' })).status,
    ).toBe(404);
    expect(
      (
        await call('PATCH', '/v1/admin/appointments/apt_0152', AGENT, {
          action: 'assign',
          assignedToId: MANAGER,
        })
      ).status,
    ).toBe(403);
    const reassigned = await call<AdminAppointment>('PATCH', '/v1/admin/appointments/apt_0150', MANAGER, {
      action: 'assign',
      assignedToId: AGENT,
    });
    expect(reassigned.body.assignedTo?.id).toBe(AGENT);
  });
});
