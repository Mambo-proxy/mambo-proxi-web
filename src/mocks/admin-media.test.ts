import { describe, expect, it } from 'vitest';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille' };

describe('médiathèque simulée', () => {
  it('liste et recherche les images', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/media?q=marche`, { headers: session }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { data: { id: string }[]; meta: { total: number } };
    expect(body.data.map((media) => media.id)).toEqual(['med_marche']);
  });

  it('exige un texte alternatif à l’envoi', async () => {
    const form = new FormData();
    form.append('file', new File(['x'], 'photo.png', { type: 'image/png' }));
    form.append('alt', ' ');
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/media`, { method: 'POST', body: form, headers: session }),
    );
    expect(response.status).toBe(422);
  });

  it('refuse de supprimer une image utilisée', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/media/med_chef`, { method: 'DELETE', headers: session }),
    );
    expect(response.status).toBe(409);
  });

  it('usages tirés du catalogue actuel ; une image inutilisée se supprime', async () => {
    const list = await resolveMockRequest(new Request(`${API}/v1/admin/media?q=chef`, { headers: session }));
    const body = (await list.json()) as { data: { id: string; usages: { label: string }[] }[] };
    expect(body.data.find((media) => media.id === 'med_chef')?.usages.map((usage) => usage.label)).toEqual([
      'Service « Chef privé »',
    ]);
    const removed = await resolveMockRequest(
      new Request(`${API}/v1/admin/media/med_portrait`, { method: 'DELETE', headers: session }),
    );
    expect(removed.status).toBe(204);
  });

  it('texte alternatif et point focal', async () => {
    const patch = (body: unknown) =>
      resolveMockRequest(
        new Request(`${API}/v1/admin/media/med_marche`, {
          method: 'PATCH',
          headers: { ...session, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
    expect((await patch({ alt: ' ' })).status).toBe(422);
    const saved = await patch({ alt: 'Marché de Douala', focalPoint: { x: 0.3, y: 0.6 } });
    expect(await saved.json()).toMatchObject({ alt: 'Marché de Douala', focalPoint: { x: 0.3, y: 0.6 } });
  });
});
