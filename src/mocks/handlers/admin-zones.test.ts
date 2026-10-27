import { describe, expect, it } from 'vitest';
import type { AdminZone, AdminZones, Problem } from '@/lib/api/schema';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';
const headers = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(method: string, path: string, body?: unknown) {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }),
  );
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as T };
}

describe('zones du back-office simulées (règles de l’API)', () => {
  it('renvoie toutes les erreurs du corps, quartier en double sur son nom', async () => {
    const refused = await call<Problem>('POST', '/v1/admin/zones', {
      name: '',
      tone: 'violet',
      quarters: [
        { name: 'Akwa' },
        { name: 'akwa' },
        { name: 'Bali', coordinates: { lat: 48.85, lng: 2.35 } },
      ],
    });
    expect(refused.status).toBe(422);
    expect(refused.body).toMatchObject({
      type: 'https://api.mamboproxi.com/problems/validation-error',
      title: 'Certaines informations sont à corriger',
    });
    expect(refused.body.errors?.map((error) => error.path)).toEqual([
      'name',
      'tone',
      'quarters.1.name',
      'quarters.2.coordinates',
    ]);
  });

  it('clé tirée du nom et rendue unique, ordre contrôlé, option des tarifs', async () => {
    const first = await call<AdminZone>('POST', '/v1/admin/zones', { name: 'Zone test', tone: 'zone3' });
    const second = await call<AdminZone>('POST', '/v1/admin/zones', { name: 'Zone test', tone: 'zone3' });
    expect([first.body.key, second.body.key]).toEqual(['zone-test', 'zone-test-2']);
    expect(first.body).toMatchObject({ active: false, quarters: [], requestsCount: 0 });

    const unknown = await call<Problem>('PATCH', '/v1/admin/zones/reorder', { ids: ['zon_inconnue'] });
    expect(unknown.status).toBe(422);
    expect(unknown.body.errors).toEqual([
      { path: 'ids', code: 'invalid_order', message: 'Zones inconnues.' },
    ]);
    const duplicate = await call<Problem>('PATCH', '/v1/admin/zones/reorder', {
      ids: [first.body.id, first.body.id],
    });
    expect(duplicate.status).toBe(422);

    const { body } = await call<AdminZones>('GET', '/v1/admin/zones');
    expect(body.showFees).toBe(false);
    for (const zone of [first, second])
      expect((await call('DELETE', `/v1/admin/zones/${zone.body.id}`)).status).toBe(204);
    expect((await call<Problem>('PATCH', '/v1/admin/zones/zon_1', {})).body.errors).toEqual([
      { path: '', code: 'invalid', message: 'Aucune modification envoyée.' },
    ]);
  });
});
