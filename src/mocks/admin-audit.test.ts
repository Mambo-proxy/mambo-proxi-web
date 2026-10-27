import { describe, expect, it } from 'vitest';
import type { AuditLogEntry } from '@/lib/api/schema';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';

async function list(query: string, user = 'usr_mireille') {
  const response = await resolveMockRequest(
    new Request(`${API}/v1/admin/audit-log${query}`, { headers: { [MOCK_COOKIE_HEADER]: `mp_at=${user}` } }),
  );
  return {
    status: response.status,
    body: (await response.json()) as { data: AuditLogEntry[]; meta: { total: number } },
  };
}

describe('journal d’activité simulé', () => {
  it('du plus récent au plus ancien, filtres par utilisateur et contenu', async () => {
    const all = await list('');
    expect(all.body.meta.total).toBe(72);
    const dates = all.body.data.map((entry) => entry.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());
    const team = await list('?actor=usr_equipe&entity=Request');
    expect(team.body.data.length).toBeGreaterThan(0);
    expect(
      team.body.data.every((entry) => entry.actor?.id === 'usr_equipe' && entry.entity === 'Request'),
    ).toBe(true);
    const recent = await list(`?from=${new Date(Date.now() - 7 * 86_400_000).toISOString()}`);
    expect(recent.body.meta.total).toBeLessThan(all.body.meta.total);
  });

  it('réservé aux administrateurs', async () => {
    expect((await list('', 'usr_equipe')).status).toBe(403);
  });
});
