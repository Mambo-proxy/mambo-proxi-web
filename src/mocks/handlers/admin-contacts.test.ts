import { describe, expect, it } from 'vitest';
import type { AdminContact, AdminContactListItem, ContactStats, RequestListItem } from '@/lib/api/schema';
import { doualaDay } from '../assignments';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';
const headers = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille' };

async function call<T>(method: string, path: string) {
  const response = await resolveMockRequest(new Request(`${API}${path}`, { method, headers }));
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as T };
}

type List = { data: AdminContactListItem[]; meta: { total: number }; stats: ContactStats };

describe('contacts du back-office simulés', () => {
  it('indicateurs de la maquette : 1 486 contacts, 174 professionnels, 64 ce mois-ci, 58 % / 39 %', async () => {
    const { body } = await call<List>('GET', '/v1/admin/contacts?pageSize=6');
    expect(body.stats).toMatchObject({
      total: 1486,
      individuals: 1312,
      professionals: 174,
      newThisMonth: 64,
    });
    const { douala, surroundings } = body.stats.locations!;
    expect(Math.round((douala / 1486) * 100)).toBe(58);
    expect(Math.round((surroundings / 1486) * 100)).toBe(39);
    expect(body.data.map((item) => item.fullName)).toEqual([
      'Aurélie Kamga',
      'Saveurs de Douala',
      'Patrick Essama',
      'Sandrine Mballa',
      'Studio Lumière',
      'Hervé Dikoume',
    ]);
  });

  it('filtres : profil, quartier, rubrique', async () => {
    const pros = await call<List>('GET', '/v1/admin/contacts?profile=PROFESSIONNEL');
    expect(pros.body.meta.total).toBe(174);
    const kotto = await call<List>('GET', '/v1/admin/contacts?district=kotto');
    expect(kotto.body.data.every((item) => item.city?.startsWith('Kotto'))).toBe(true);
    const culture = await call<List>('GET', '/v1/admin/contacts?interest=culture-evenementiel&pageSize=100');
    expect(
      culture.body.data.every((item) => item.interests.some((c) => c.slug === 'culture-evenementiel')),
    ).toBe(true);
  });

  it('fiche : demandes du contact et abonnement', async () => {
    const { status, body } = await call<AdminContact>('GET', '/v1/admin/contacts/ctc_aurelie_kamga');
    expect(status).toBe(200);
    expect(body.requests.length).toBeGreaterThan(0);
    expect(body.subscriber?.status).toBe('CONFIRME');
    // Origine de l'abonnement (formulaire), pas la source de la fiche.
    expect(body.subscriber?.source).toBe('footer');
    expect(body.requests[0]).toHaveProperty('isOverdue');
  });

  it('tri `sort` du contrat ; champ non autorisé : 400', async () => {
    const { body } = await call<List>('GET', '/v1/admin/contacts?sort=fullName&pageSize=50');
    const names = body.data.map((item) => item.fullName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'fr')));
    expect((await call('GET', '/v1/admin/contacts?sort=email')).status).toBe(400);
    const empty = await call<List>('GET', '/v1/admin/contacts?q=personne-introuvable');
    expect(empty.body.meta).toMatchObject({ total: 0, totalPages: 0 });
  });

  it('export CSV : « Créé le » en date de Douala, nom de fichier daté', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/contacts/export.csv?profile=PROFESSIONNEL`, { headers }),
    );
    expect(response.headers.get('content-disposition')).toBe(
      `attachment; filename="contacts-${doualaDay(Date.now())}.csv"`,
    );
    const [header, first] = (await response.text()).split('\r\n');
    expect(header).toBe(
      '"Nom";"Structure";"E-mail";"Téléphone";"Profil";"Ville";"Pays";"Intérêts";"Demandes";"Newsletter";"Créé le"',
    );
    const list = await call<List>('GET', '/v1/admin/contacts?profile=PROFESSIONNEL&pageSize=1');
    const contact = list.body.data[0]!;
    expect(first).toContain(`"${contact.fullName}"`);
    expect(first?.endsWith(`"${doualaDay(contact.createdAt)}"`)).toBe(true);
  });

  it('export RGPD : fiche, demandes et abonnement, sans notes internes', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/contacts/ctc_aurelie_kamga/export`, { headers }),
    );
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="donnees-ctc_aurelie_kamga.json"',
    );
    const body = (await response.json()) as Record<string, unknown> & {
      contact: AdminContact;
      requests: Record<string, unknown>[];
    };
    expect(Object.keys(body)).toEqual(['exportedAt', 'contact', 'requests', 'newsletter']);
    expect(body.requests.length).toBeGreaterThan(0);
    expect(body.requests[0]).toHaveProperty('consent');
    expect(body.requests[0]).not.toHaveProperty('notes');
    expect((body.contact.appointments ?? []).every((item) => !('notes' in item))).toBe(true);
    expect(body.newsletter).toMatchObject({ confirmedAt: expect.any(String) });
  });

  // En dernier : modifie les données simulées.
  it('effacement : fiche et demandes disparaissent (404), comme l’API', async () => {
    const before = await call<AdminContact>('GET', '/v1/admin/contacts/ctc_aurelie_kamga');
    const requestIds = before.body.requests.map((request) => request.id);
    expect(requestIds.length).toBeGreaterThan(0);
    expect((await call('DELETE', '/v1/admin/contacts/ctc_aurelie_kamga')).status).toBe(204);
    expect((await call('GET', '/v1/admin/contacts/ctc_aurelie_kamga')).status).toBe(404);
    const list = await call<{ data: RequestListItem[] }>('GET', '/v1/admin/requests?pageSize=100');
    expect(list.body.data.some((request) => requestIds.includes(request.id))).toBe(false);
    expect(list.body.data.some((request) => request.contact.fullName === 'Contact effacé')).toBe(false);
    expect((await call('GET', `/v1/admin/requests/${requestIds[0]}`)).status).toBe(404);
  });
});
