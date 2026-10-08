import { http, HttpResponse } from 'msw';
import type { RequestDetail, RequestNote, RequestStatus, RequestType } from '@/lib/api/schema';
import { adminRequests } from '../data/admin-requests';
import { problem } from '../problem';
import { sessionUser } from '../session';
import { toListItem } from './admin-core';

const STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
};
const ORDER: RequestStatus[] = ['NOUVELLE', 'EN_COURS', 'PRESTATION_REALISEE', 'CLOTUREE'];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Demandes filtrées (hors statut) : sert à la liste et aux compteurs des onglets. */
function filtered(params: URLSearchParams) {
  const type = params.get('type') as RequestType | null;
  const category = params.get('category');
  const country = params.get('country');
  const from = params.get('from');
  const to = params.get('to');
  const q = params.get('q') ? normalize(params.get('q') ?? '') : null;
  return adminRequests
    .filter(
      (request) =>
        (!type || request.type === type) &&
        (!category || request.category?.slug === category) &&
        (!country || request.contact.country === country) &&
        (!from || request.createdAt >= from) &&
        (!to || request.createdAt <= to) &&
        (!q ||
          normalize(
            `${request.reference} ${request.contact.fullName} ${request.contact.email} ${request.subject ?? ''}`,
          ).includes(q)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function find(id: string) {
  return adminRequests.find((request) => request.id === id) ?? null;
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

export const adminRequestHandlers = [
  http.get('*/v1/admin/requests', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') as RequestStatus | null;
    const page = Math.max(1, Number(params.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? 20)));
    const base = filtered(params);
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
    const status = params.get('status');
    const rows = filtered(params).filter((item) => !status || item.status === status);
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

  http.get('*/v1/admin/requests/:id', ({ params }) => {
    const item = find(String(params.id));
    return item ? HttpResponse.json(item) : problem(404, 'Cette demande n’existe pas ou a été anonymisée.');
  }),

  http.patch('*/v1/admin/requests/:id', async ({ request, params }) => {
    const item = find(String(params.id));
    if (!item) return problem(404, 'Cette demande n’existe pas ou a été anonymisée.');
    const user = sessionUser(request);
    const body = (await request.json()) as { status?: RequestStatus; assignedToId?: string | null };
    if (body.status && body.status !== item.status) {
      if (ORDER.indexOf(body.status) < ORDER.indexOf(item.status) && user?.role !== 'ADMIN')
        return problem(403, 'Seul un administrateur peut revenir à un statut précédent.');
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
    if (body.assignedToId !== undefined) {
      item.assignedTo =
        body.assignedToId && user ? { id: user.id, name: user.name, initials: user.initials ?? '' } : null;
      event(
        item,
        'ASSIGNED',
        item.assignedTo ? `Assignée à ${item.assignedTo.name}` : 'Assignation retirée',
        user,
      );
    }
    return HttpResponse.json(item);
  }),

  http.delete('*/v1/admin/requests/:id', ({ request, params }) => {
    if (sessionUser(request)?.role !== 'ADMIN')
      return problem(403, 'Seul un administrateur peut anonymiser une demande.');
    const index = adminRequests.findIndex((item) => item.id === String(params.id));
    if (index < 0) return problem(404, 'Cette demande n’existe pas ou a été anonymisée.');
    adminRequests.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/requests/:id/notes', async ({ request, params }) => {
    const item = find(String(params.id));
    if (!item) return problem(404, 'Cette demande n’existe pas ou a été anonymisée.');
    const user = sessionUser(request);
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
    const item = find(String(params.id));
    if (!item) return problem(404, 'Cette demande n’existe pas ou a été anonymisée.');
    const number = 143 + adminRequests.length;
    const copy: RequestDetail = structuredClone(item);
    copy.id = `req_${number}`;
    copy.reference = `MP-2026-${String(number).padStart(4, '0')}`;
    copy.status = 'NOUVELLE';
    copy.createdAt = new Date().toISOString();
    copy.notes = [];
    copy.history = [];
    copy.survey = null;
    event(copy, 'DUPLICATED', `Copie de la demande ${item.reference}`, sessionUser(request));
    adminRequests.unshift(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),
];
