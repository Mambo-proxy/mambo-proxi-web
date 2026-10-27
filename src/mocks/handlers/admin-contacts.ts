import { http, HttpResponse } from 'msw';
import type { AdminAppointment, AdminContact, AdminContactListItem, ContactStats } from '@/lib/api/schema';
import { matches, normalize, paginate } from '../admin-utils';
import { doualaDay, toListItem } from '../assignments';
import { attachmentDisposition, csvExport } from '../csv';
import { adminAppointments } from '../data/admin-appointments';
import { adminContacts, inDouala } from '../data/admin-contacts';
import { adminRequests } from '../data/admin-requests';
import { parseSort, sortBy } from '../list-sort';
import { problem } from '../problem';

const NEWSLETTER_LABELS = { CONFIRME: 'Abonné', EN_ATTENTE: 'En attente', DESINSCRIT: 'Désinscrit' } as const;
const REQUEST_STATUS_LABELS = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
} as const;
const REQUEST_TYPE_LABELS = {
  DEVIS: 'Devis',
  CONTACT: 'Contact',
  INFORMATION: 'Information',
  INSCRIPTION: 'Inscription',
  FORMATION: 'Formation',
  CANDIDATURE: 'Candidature',
  PARTENARIAT: 'Partenariat',
  EVENEMENT: 'Événement',
  RENDEZ_VOUS: 'Rendez-vous',
} as const;
const NOT_FOUND = 'Ce contact n’existe plus.';
/** Tris autorisés par le contrat (`-createdAt` par défaut). */
const SORT_FIELDS = ['createdAt', 'updatedAt', 'fullName', 'lastActivityAt'] as const;
/** Domaine des adresses factices des fiches effacées (`.invalid` : jamais délivrable), comme l'API. */
const ERASED_DOMAIN = 'mamboproxi.invalid';

/** Contacts filtrés (profil, pays, quartier, rubrique, recherche) ; l'export ne tient pas compte de `q` (contrat). */
function filtered(params: URLSearchParams) {
  const profile = params.get('profile');
  const country = params.get('country');
  const district = params.get('district') ? normalize(params.get('district') ?? '') : null;
  const interest = params.get('interest');
  const q = params.get('q');
  return adminContacts.filter(
    (item) =>
      (!profile || item.profile === profile) &&
      (!country || item.country === country) &&
      (!district || normalize(item.city ?? '').startsWith(district)) &&
      (!interest || item.interests.some((category) => category.slug === interest)) &&
      matches(q, item.fullName, item.email, item.organization),
  );
}

/**
 * Clé de tri (`sort`). Les contacts simulés n'ont ni date de modification ni date de dernière activité : la date de
 * création en tient lieu (`updatedAt` de la fiche simulée).
 */
function sortKey(item: AdminContactListItem, field: (typeof SORT_FIELDS)[number]) {
  return field === 'fullName' ? item.fullName : item.createdAt;
}

/** Copie sans la propriété `key`. */
function omit<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

const byName = (a: string | number, b: string | number) => String(a).localeCompare(String(b), 'fr');

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

/** Demandes du contact (les demandes anonymisées ont disparu des données simulées), des plus récentes aux plus anciennes. */
const requestsOf = (contactId: string) =>
  adminRequests
    .filter((request) => request.contact.id === contactId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));

/** Rendez-vous du contact, du plus récent au plus ancien (`subject` : champ propre aux mocks, retiré). */
function appointmentsOf(contactId: string): AdminAppointment[] {
  return adminAppointments
    .filter((appointment) => appointment.contact.id === contactId)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt) || b.id.localeCompare(a.id))
    .map((appointment) => omit(appointment, 'subject'));
}

function detail(contact: AdminContactListItem): AdminContact {
  return {
    ...contact,
    activity: contact.organization ? 'Prestataire partenaire' : null,
    preferredChannel: null,
    requests: requestsOf(contact.id).map(toListItem),
    appointments: appointmentsOf(contact.id),
    subscriber: contact.newsletterStatus
      ? {
          id: `sub_${contact.id}`,
          email: contact.email,
          name: contact.fullName,
          phone: contact.phone ?? null,
          country: contact.country ?? null,
          status: contact.newsletterStatus,
          tags: contact.interests.map((category) => category.slug),
          // Formulaire d'origine de l'abonnement (`footer`, `suivi-mambo`, `inscription`, `autre`).
          source: 'footer',
          confirmedAt: contact.newsletterStatus === 'EN_ATTENTE' ? null : contact.createdAt,
          unsubscribedAt: contact.newsletterStatus === 'DESINSCRIT' ? contact.createdAt : null,
          createdAt: contact.createdAt,
        }
      : null,
    updatedAt: contact.createdAt,
  };
}

/**
 * Export RGPD (`GET /v1/admin/contacts/{id}/export`), clés de l'API : `exportedAt`, `contact` (fiche complétée),
 * `requests` (contenu des formulaires, preuve du consentement, historique, pièces jointes, questionnaire) et
 * `newsletter`. Les notes internes de l'équipe (demandes et rendez-vous) n'y figurent pas.
 */
function personalData(contact: AdminContactListItem) {
  const fiche = detail(contact);
  const [firstName = '', ...rest] = contact.fullName.trim().split(/\s+/);
  const district = contact.city?.includes(',') ? (contact.city.split(',')[0]?.trim() ?? null) : null;
  return {
    exportedAt: new Date().toISOString(),
    contact: {
      ...fiche,
      appointments: (fiche.appointments ?? []).map((appointment) => omit(appointment, 'notes')),
      firstName: contact.organization ? null : firstName,
      lastName: contact.organization ? null : rest.join(' ') || null,
      district,
      language: 'fr',
      lastActivityAt: contact.createdAt,
    },
    requests: requestsOf(contact.id)
      .slice()
      .reverse()
      .map((request) => {
        const values = omit(request.payload as Record<string, unknown>, 'fields');
        return {
          reference: request.reference,
          type: request.type,
          typeLabel: REQUEST_TYPE_LABELS[request.type],
          status: request.status,
          statusLabel: REQUEST_STATUS_LABELS[request.status],
          subject: request.subject ?? null,
          service: request.service?.name ?? null,
          category: request.category?.name ?? null,
          organization: null,
          contactPreference: request.contactPreference ?? null,
          message: request.message ?? null,
          fields: request.fields,
          values,
          language: 'fr',
          consent: { at: request.consentAt, ip: null, userAgent: null },
          createdAt: request.createdAt,
          completedAt: request.completedAt ?? null,
          closedAt: request.closedAt ?? null,
          history: request.history.map(({ kind, label, createdAt }) => ({ kind, label, createdAt })),
          attachments: request.attachments.map(({ fileName, mimeType, size }) => ({
            fileName,
            mimeType,
            size,
            createdAt: request.createdAt,
          })),
          survey: request.survey
            ? {
                status: request.survey.status,
                sentAt: request.survey.sentAt ?? null,
                completedAt: request.survey.completedAt ?? null,
                answers: null,
                rating: request.survey.rating ?? null,
                npsScore: null,
                publishConsent: null,
                displayName: null,
                city: null,
              }
            : null,
        };
      }),
    newsletter: fiche.subscriber
      ? {
          language: 'fr',
          consentAt: fiche.subscriber.createdAt,
          confirmedAt: fiche.subscriber.confirmedAt ?? null,
          unsubscribedAt: fiche.subscriber.unsubscribedAt ?? null,
        }
      : null,
  };
}

/** Back-office — Contacts & inscrits (`/v1/admin/contacts*`). */
export const adminContactHandlers = [
  http.get('*/v1/admin/contacts/export.csv', ({ request }) => {
    const params = new URL(request.url).searchParams;
    params.delete('q');
    const rows = sortBy(filtered(params), 'desc', (item) => item.createdAt);
    return csvExport(
      `contacts-${doualaDay(Date.now())}.csv`,
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
        item.organization,
        item.email,
        item.phone,
        item.profile === 'PROFESSIONNEL' ? 'Professionnel' : 'Particulier',
        item.city,
        item.country,
        item.interests.map((category) => category.name).join(', '),
        item.requestsCount,
        item.newsletterStatus ? NEWSLETTER_LABELS[item.newsletterStatus] : 'Non',
        doualaDay(item.createdAt),
      ]),
    );
  }),

  http.get('*/v1/admin/contacts', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const { sort, invalid } = parseSort(params, SORT_FIELDS, '-createdAt');
    if (invalid) return invalid;
    const list = sortBy(
      filtered(params),
      sort.direction,
      (item) => sortKey(item, sort.field),
      sort.field === 'fullName' ? byName : undefined,
    );
    const page = paginate(list, params);
    // Comme l'API : 0 page pour une liste vide.
    const totalPages = Math.ceil(page.meta.total / page.meta.pageSize);
    return HttpResponse.json({ ...page, meta: { ...page.meta, totalPages }, stats: stats() });
  }),

  http.get('*/v1/admin/contacts/:id/export', ({ params }) => {
    const contact = adminContacts.find((item) => item.id === params.id);
    if (!contact) return problem(404, NOT_FOUND);
    return HttpResponse.json(personalData(contact), {
      headers: {
        'Content-Disposition': attachmentDisposition(`donnees-${contact.id}.json`),
        'Cache-Control': 'no-store',
      },
    });
  }),

  http.get('*/v1/admin/contacts/:id', ({ params }) => {
    const contact = adminContacts.find((item) => item.id === params.id);
    if (!contact) return problem(404, NOT_FOUND);
    return HttpResponse.json(detail(contact));
  }),

  /**
   * Droit à l'effacement, comme l'API : la fiche disparaît du back-office (`404` ensuite) ; ses demandes sont
   * anonymisées et ne sont plus affichées nulle part (`404` au détail) ; ses rendez-vous restent rattachés à la fiche
   * vidée (« Contact effacé », adresse factice), sans message ni notes ; son abonnement (dérivé de la fiche) disparaît
   * avec elle.
   */
  http.delete('*/v1/admin/contacts/:id', ({ params }) => {
    const id = String(params.id);
    const index = adminContacts.findIndex((item) => item.id === id);
    if (index < 0) return problem(404, NOT_FOUND);
    adminContacts.splice(index, 1);
    for (let i = adminRequests.length - 1; i >= 0; i -= 1)
      if (adminRequests[i]!.contact.id === id) adminRequests.splice(i, 1);
    for (const appointment of adminAppointments)
      if (appointment.contact.id === id) {
        appointment.contact = {
          ...appointment.contact,
          fullName: 'Contact effacé',
          initials: 'CE',
          email: `efface-${id}@${ERASED_DOMAIN}`,
          phone: null,
          country: null,
          city: null,
        };
        appointment.message = null;
        appointment.notes = null;
      }
    return new HttpResponse(null, { status: 204 });
  }),
];
