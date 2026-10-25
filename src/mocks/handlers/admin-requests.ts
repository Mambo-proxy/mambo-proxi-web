import { http, HttpResponse } from 'msw';
import type { CurrentUser, RequestDetail, RequestNote, RequestStatus, RequestType } from '@/lib/api/schema';
import { matchesAssignee, matchesDue, visibleRequests, withOverdue } from '../assignments';
import { adminRequests } from '../data/admin-requests';
import { assignedOnly, can, forbidden } from '../permissions';
import { problem } from '../problem';
import { sessionUser } from '../session';
import { assignableMember, userRefOf } from '../team';
import { notifyAssignment, toListItem } from './admin-core';

const STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
};
const ORDER: RequestStatus[] = ['NOUVELLE', 'EN_COURS', 'PRESTATION_REALISEE', 'CLOTUREE'];
const DAY = 24 * 60 * 60 * 1000;
const NOT_FOUND = 'Cette demande n’existe pas ou a été anonymisée.';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * Filtre `assignee` effectif : avec la seule permission `requests:read-assigned`, `me` est appliqué d'office et toute
 * autre personne est refusée (`403`).
 */
function assigneeFilter(
  params: URLSearchParams,
  user: CurrentUser | null,
): { assignee: string | null; denied: Response | null } {
  const assignee = params.get('assignee');
  if (!assignedOnly(user, 'requests')) return { assignee, denied: null };
  if (assignee && assignee !== 'me' && assignee !== user?.id)
    return { assignee, denied: forbidden('Vous ne voyez que les demandes qui vous sont assignées.') };
  return { assignee: 'me', denied: null };
}

/** Demandes filtrées (hors statut) : sert à la liste, aux compteurs des onglets et à l'export. */
function filtered(params: URLSearchParams, user: CurrentUser | null, assignee: string | null) {
  const type = params.get('type') as RequestType | null;
  const category = params.get('category');
  const country = params.get('country');
  const district = params.get('district') ? normalize(params.get('district') ?? '') : null;
  const due = params.get('due');
  const from = params.get('from');
  const to = params.get('to');
  const q = params.get('q') ? normalize(params.get('q') ?? '') : null;
  return visibleRequests(user)
    .filter(
      (request) =>
        (!type || request.type === type) &&
        (!category || request.category?.slug === category) &&
        (!country || request.contact.country === country) &&
        (!district || normalize(request.contact.city ?? '').startsWith(district)) &&
        matchesAssignee(request, assignee, user) &&
        matchesDue(request, due) &&
        (!from || request.createdAt >= from) &&
        (!to || request.createdAt <= to) &&
        (!q ||
          normalize(
            `${request.reference} ${request.contact.fullName} ${request.contact.email} ${request.subject ?? ''}`,
          ).includes(q)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Demande visible par l'utilisateur (hors de son périmètre : introuvable, comme l'API). */
function find(id: string, user: CurrentUser | null) {
  return visibleRequests(user).find((request) => request.id === id) ?? null;
}

/** Statut, échéance et notes : toute demande (`requests:write`) ou les siennes (`requests:write-assigned`). */
function canWrite(user: CurrentUser | null, request: RequestDetail) {
  return (
    can(user, 'requests:write') ||
    (can(user, 'requests:write-assigned') && request.assignedTo?.id === user?.id)
  );
}

function event(
  request: RequestDetail,
  kind: RequestDetail['history'][number]['kind'],
  label: string,
  user: ReturnType<typeof sessionUser>,
) {
  request.history.push({
    id: `${request.id}-${request.history.length + 1}`,
    kind,
    label,
    actor: user ? { id: user.id, name: user.name, initials: user.initials ?? '' } : null,
    data: null,
    createdAt: new Date().toISOString(),
  });
  request.updatedAt = new Date().toISOString();
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

type PatchBody = { status?: RequestStatus; assignedToId?: string | null; dueAt?: string | null };

export const adminRequestHandlers = [
  http.get('*/v1/admin/requests', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const user = sessionUser(request);
    const { assignee, denied } = assigneeFilter(params, user);
    if (denied) return denied;
    const status = params.get('status') as RequestStatus | null;
    const page = Math.max(1, Number(params.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? 20)));
    const base = filtered(params, user, assignee);
    const list = status ? base.filter((item) => item.status === status) : base;
    const counts = {
      ALL: base.length,
      NOUVELLE: base.filter((item) => item.status === 'NOUVELLE').length,
      EN_COURS: base.filter((item) => item.status === 'EN_COURS').length,
      PRESTATION_REALISEE: base.filter((item) => item.status === 'PRESTATION_REALISEE').length,
      CLOTUREE: base.filter((item) => item.status === 'CLOTUREE').length,
    };
    return HttpResponse.json({
      data: list.slice((page - 1) * pageSize, page * pageSize).map(toListItem),
      meta: { page, pageSize, total: list.length, totalPages: Math.ceil(list.length / pageSize) },
      counts,
    });
  }),

  http.get('*/v1/admin/requests/export.csv', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const user = sessionUser(request);
    const { assignee, denied } = assigneeFilter(params, user);
    if (denied) return denied;
    const status = params.get('status');
    const rows = filtered(params, user, assignee).filter((item) => !status || item.status === status);
    const header = [
      'Référence',
      'Type',
      'Statut',
      'Client',
      'E-mail',
      'Téléphone',
      'Ville',
      'Pays',
      'Service',
      'Assignée à',
      'Échéance',
      'Reçue le',
    ];
    const lines = rows.map((item) =>
      [
        item.reference,
        item.type,
        STATUS_LABELS[item.status],
        item.contact.fullName,
        item.contact.email,
        item.contact.phone ?? '',
        item.contact.city ?? '',
        item.contact.country ?? '',
        item.subject ?? '',
        item.assignedTo?.name ?? '',
        item.dueAt ?? '',
        item.createdAt,
      ]
        .map(csvCell)
        .join(';'),
    );
    return new HttpResponse(`\uFEFF${[header.map(csvCell).join(';'), ...lines].join('\r\n')}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="demandes.csv"',
      },
    });
  }),

  http.get('*/v1/admin/requests/:id', ({ request, params }) => {
    const item = find(String(params.id), sessionUser(request));
    return item ? HttpResponse.json(withOverdue(item)) : problem(404, NOT_FOUND);
  }),

  http.patch('*/v1/admin/requests/:id', async ({ request, params }) => {
    const user = sessionUser(request);
    const item = find(String(params.id), user);
    if (!item) return problem(404, NOT_FOUND);
    const body = (await request.json()) as PatchBody;

    // Tous les contrôles avant la moindre modification : la requête est acceptée ou refusée en entier.
    if ((body.status !== undefined || body.dueAt !== undefined) && !canWrite(user, item))
      return forbidden('Vous ne pouvez modifier que les demandes qui vous sont assignées.');
    if (
      body.status &&
      ORDER.indexOf(body.status) < ORDER.indexOf(item.status) &&
      !can(user, 'requests:revert-status')
    )
      return forbidden('Seul un administrateur peut revenir à un statut précédent.');
    if (body.assignedToId !== undefined && !can(user, 'requests:assign'))
      return forbidden('Seul un responsable peut assigner ou réassigner une demande.');
    const assignee = body.assignedToId ? assignableMember(body.assignedToId) : null;
    if (body.assignedToId && !assignee)
      return problem(422, 'Cette personne ne peut pas recevoir de demandes.', [
        { path: 'assignedToId', message: 'Choisissez un membre actif qui traite les demandes.' },
      ]);
    if (body.dueAt && Number.isNaN(Date.parse(body.dueAt)))
      return problem(422, 'Échéance invalide.', [{ path: 'dueAt', message: 'Indiquez une date valide.' }]);

    if (body.status && body.status !== item.status) {
      event(
        item,
        'STATUS_CHANGED',
        `Statut : ${STATUS_LABELS[item.status]} → ${STATUS_LABELS[body.status]}`,
        user,
      );
      item.status = body.status;
      if (body.status === 'PRESTATION_REALISEE') {
        item.completedAt = new Date().toISOString();
        if (item.type === 'DEVIS') {
          const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          item.survey = { status: 'SCHEDULED', scheduledFor, sentAt: null, completedAt: null, rating: null };
          event(item, 'SURVEY_SCHEDULED', 'Questionnaire de satisfaction programmé (dans 24 h)', null);
        }
      }
      if (body.status === 'CLOTUREE') item.closedAt = new Date().toISOString();
    }
    if (body.dueAt !== undefined) {
      item.dueAt = body.dueAt ? new Date(body.dueAt).toISOString() : null;
      item.updatedAt = new Date().toISOString();
    }
    if (body.assignedToId !== undefined && (assignee?.id ?? null) !== (item.assignedTo?.id ?? null)) {
      item.assignedTo = assignee ? userRefOf(assignee) : null;
      event(
        item,
        'ASSIGNED',
        item.assignedTo ? `Assignée à ${item.assignedTo.name}` : 'Assignation retirée',
        user,
      );
      if (assignee)
        notifyAssignment(
          assignee.id,
          user?.id,
          `Demande assignée — ${item.subject ?? 'Demande'} (${item.reference})`,
          `/admin/demandes?id=${item.id}`,
        );
    }
    return HttpResponse.json(withOverdue(item));
  }),

  // Anonymisation : permission `requests:anonymize`, contrôlée par la garde commune (`admin-core.ts`).
  http.delete('*/v1/admin/requests/:id', ({ request, params }) => {
    if (!find(String(params.id), sessionUser(request))) return problem(404, NOT_FOUND);
    adminRequests.splice(
      adminRequests.findIndex((item) => item.id === String(params.id)),
      1,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/requests/:id/notes', async ({ request, params }) => {
    const user = sessionUser(request);
    const item = find(String(params.id), user);
    if (!item) return problem(404, NOT_FOUND);
    if (!canWrite(user, item))
      return forbidden('Vous ne pouvez annoter que les demandes qui vous sont assignées.');
    const { body } = (await request.json()) as { body: string };
    if (!body?.trim())
      return problem(422, 'La note est vide.', [
        { path: 'body', message: 'Écrivez une note avant de l’enregistrer.' },
      ]);
    const note: RequestNote = {
      id: `${item.id}-note-${item.notes.length + 1}`,
      body: body.trim(),
      author: { id: user?.id ?? 'usr', name: user?.name ?? 'Équipe', initials: user?.initials ?? 'EQ' },
      createdAt: new Date().toISOString(),
    };
    item.notes.push(note);
    event(item, 'NOTE_ADDED', 'Note interne ajoutée', user);
    return HttpResponse.json(note, { status: 201 });
  }),

  http.post('*/v1/admin/requests/:id/duplicate', ({ request, params }) => {
    const item = find(String(params.id), sessionUser(request));
    if (!item) return problem(404, NOT_FOUND);
    const number = 143 + adminRequests.length;
    const copy: RequestDetail = structuredClone(item);
    copy.id = `req_${number}`;
    copy.reference = `MP-2026-${String(number).padStart(4, '0')}`;
    copy.status = 'NOUVELLE';
    copy.createdAt = new Date().toISOString();
    // Nouvelle échéance : 24 h après la création de la copie.
    copy.dueAt = new Date(Date.now() + DAY).toISOString();
    copy.notes = [];
    copy.history = [];
    copy.survey = null;
    event(copy, 'DUPLICATED', `Copie de la demande ${item.reference}`, sessionUser(request));
    adminRequests.unshift(copy);
    return HttpResponse.json(withOverdue(copy), { status: 201 });
  }),
];
