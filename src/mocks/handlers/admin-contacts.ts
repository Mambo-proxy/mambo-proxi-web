import { http, HttpResponse } from 'msw';
import type { AdminContact, AdminContactListItem, ContactStats, RequestListItem } from '@/lib/api/schema';
import { csvResponse, matches, normalize, paginate } from '../admin-utils';
import { adminContacts, inDouala } from '../data/admin-contacts';
import { adminRequests } from '../data/admin-requests';
import { problem } from '../problem';

const NEWSLETTER_LABELS = { CONFIRME: 'Abonné', EN_ATTENTE: 'En attente', DESINSCRIT: 'Désinscrit' } as const;

/** Contacts filtrés (profil, pays, quartier, rubrique, recherche), du plus récent au plus ancien. */
function filtered(params: URLSearchParams) {
  const profile = params.get('profile');
  const country = params.get('country');
  const district = params.get('district') ? normalize(params.get('district') ?? '') : null;
  const interest = params.get('interest');
  const q = params.get('q');
  return adminContacts
    .filter(
      (item) =>
        (!profile || item.profile === profile) &&
        (!country || item.country === country) &&
        (!district || normalize(item.city ?? '').startsWith(district)) &&
        (!interest || item.interests.some((category) => category.slug === interest)) &&
        matches(q, item.fullName, item.email, item.organization),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Indicateurs sur l'ensemble des contacts (indépendants des filtres de la liste). */
function stats(): ContactStats {
  const month = Date.now() - 30 * 86_400_000;
  const byCountry: Record<string, number> = {};
  let douala = 0;
  let surroundings = 0;
  for (const item of adminContacts) {
    if (item.country) byCountry[item.country] = (byCountry[item.country] ?? 0) + 1;
    if (inDouala(item)) douala += 1;
    else if (item.country === 'CM') surroundings += 1;
  }
  return {
    total: adminContacts.length,
    individuals: adminContacts.filter((item) => item.profile === 'PARTICULIER').length,
    professionals: adminContacts.filter((item) => item.profile === 'PROFESSIONNEL').length,
    newsletterSubscribers: adminContacts.filter((item) => item.newsletterStatus === 'CONFIRME').length,
    newThisMonth: adminContacts.filter((item) => new Date(item.createdAt).getTime() >= month).length,
    byCountry,
    locations: { douala, surroundings, elsewhere: adminContacts.length - douala - surroundings },
  };
}

function requestsOf(contact: AdminContactListItem): RequestListItem[] {
  return adminRequests
    .filter((request) => request.contact.id === contact.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(
      ({
        id,
        reference,
        type,
        status,
        contact: summary,
        service,
        category,
        subject,
        assignedTo,
        createdAt,
      }) => ({
        id,
        reference,
        type,
        status,
        contact: summary,
        service,
        category,
        subject,
        assignedTo,
        createdAt,
      }),
    );
}

function detail(contact: AdminContactListItem): AdminContact {
  return {
    ...contact,
    activity: contact.organization ? 'Prestataire partenaire' : null,
    preferredChannel: null,
    requests: requestsOf(contact),
    appointments: [],
    subscriber: contact.newsletterStatus
      ? {
          id: `sub_${contact.id}`,
          email: contact.email,
          name: contact.fullName,
          phone: contact.phone ?? null,
          country: contact.country ?? null,
          status: contact.newsletterStatus,
          tags: contact.interests.map((category) => category.slug),
          source: contact.source ?? null,
          confirmedAt: contact.newsletterStatus === 'EN_ATTENTE' ? null : contact.createdAt,
          unsubscribedAt: contact.newsletterStatus === 'DESINSCRIT' ? contact.createdAt : null,
          createdAt: contact.createdAt,
        }
      : null,
    updatedAt: contact.createdAt,
  };
}

/** Back-office — Contacts & inscrits (`/v1/admin/contacts*`). */
export const adminContactHandlers = [
  http.get('*/v1/admin/contacts/export.csv', ({ request }) => {
    const rows = filtered(new URL(request.url).searchParams);
    return csvResponse(
      `contacts-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Nom',
        'Structure',
        'E-mail',
        'Téléphone',
        'Profil',
        'Ville',
        'Pays',
        'Intérêts',
        'Demandes',
        'Newsletter',
        'Créé le',
      ],
      rows.map((item) => [
        item.fullName,
        item.organization ?? '',
        item.email,
        item.phone ?? '',
        item.profile === 'PROFESSIONNEL' ? 'Professionnel' : 'Particulier',
        item.city ?? '',
        item.country ?? '',
        item.interests.map((category) => category.name).join(', '),
        item.requestsCount,
        item.newsletterStatus ? NEWSLETTER_LABELS[item.newsletterStatus] : 'Non',
        item.createdAt.slice(0, 10),
      ]),
    );
  }),

  http.get('*/v1/admin/contacts', ({ request }) => {
    const params = new URL(request.url).searchParams;
    return HttpResponse.json({ ...paginate(filtered(params), params), stats: stats() });
  }),

  http.get('*/v1/admin/contacts/:id/export', ({ params }) => {
    const contact = adminContacts.find((item) => item.id === params.id);
    if (!contact) return problem(404, 'Ce contact n’existe plus.');
    return HttpResponse.json({ exportedAt: new Date().toISOString(), contact: detail(contact) });
  }),

  http.get('*/v1/admin/contacts/:id', ({ params }) => {
    const contact = adminContacts.find((item) => item.id === params.id);
    if (!contact) return problem(404, 'Ce contact n’existe plus.');
    return HttpResponse.json(detail(contact));
  }),

  http.delete('*/v1/admin/contacts/:id', ({ params }) => {
    const index = adminContacts.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Ce contact n’existe plus.');
    adminContacts.splice(index, 1);
    // Droit à l'effacement : les demandes du contact sont anonymisées.
    for (const request of adminRequests)
      if (request.contact.id === params.id)
        request.contact = {
          ...request.contact,
          fullName: 'Contact effacé',
          initials: '—',
          email: 'efface@mamboproxi.invalid',
          phone: null,
        };
    return new HttpResponse(null, { status: 204 });
  }),
];
