import { describe, expect, it } from 'vitest';
import type { Campaign, NewsletterStats } from '@/lib/api/schema';
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

describe('newsletter du back-office simulée', () => {
  it('indicateurs et envois de la maquette', async () => {
    const { body } = await call<{ data: Campaign[]; stats: NewsletterStats }>('GET', '/v1/admin/campaigns');
    expect(body.stats).toMatchObject({
      subscribers: 1248,
      newThisMonth: 56,
      averageOpenRate: 46,
      averageClickRate: 9,
      unsubscribeRate: 0.4,
      lastOpenRateDelta: 4,
    });
    expect(body.data.map((item) => item.status)).toEqual(['PROGRAMMEE', 'ENVOYEE', 'ENVOYEE', 'BROUILLON']);
  });

  it('brouillon : création, programmation refusée sans contenu, puis programmée', async () => {
    const created = await call<Campaign>('POST', '/v1/admin/campaigns', {
      subject: 'Décembre',
      html: '',
      segment: { kind: 'CAMEROUN' },
    });
    expect(created.status).toBe(201);
    const at = new Date(Date.now() + 86_400_000).toISOString();
    const refused = await call('POST', `/v1/admin/campaigns/${created.body.id}/schedule`, {
      scheduledAt: at,
    });
    expect(refused.status).toBe(422);
    await call('PATCH', `/v1/admin/campaigns/${created.body.id}`, { html: '<p>Bonjour {prénom}</p>' });
    const scheduled = await call<Campaign>('POST', `/v1/admin/campaigns/${created.body.id}/schedule`, {
      scheduledAt: at,
    });
    expect(scheduled.body).toMatchObject({
      status: 'PROGRAMMEE',
      recipients: 1094,
      segmentLabel: 'Cameroun',
    });
  });
});
