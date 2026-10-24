import { describe, expect, it } from 'vitest';
import type { AdminContact, AdminContactListItem, ContactStats } from '@/lib/api/schema';
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
  });
});
