import { describe, expect, it } from 'vitest';
import { resolveMockRequest } from './resolve';

const API = 'http://localhost:4000';

describe('résolution des requêtes simulées (transport NEXT_PUBLIC_API_MOCKING)', () => {
  it("renvoie l'exemple du contrat d'une route publique", async () => {
    const response = await resolveMockRequest(new Request(`${API}/v1/pages/accueil`));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ key: 'accueil' });
  });

  it("répond 204 sans corps pour une opération qui n'en renvoie pas", async () => {
    const response = await resolveMockRequest(new Request(`${API}/v1/auth/logout`, { method: 'POST' }));
    expect(response.status).toBe(204);
  });

  it('signale explicitement une route non simulée (501, Problem Details)', async () => {
    const response = await resolveMockRequest(new Request(`${API}/v1/admin/notifications`));
    expect(response.status).toBe(501);
    expect(response.headers.get('Content-Type')).toContain('application/problem+json');
  });
});
