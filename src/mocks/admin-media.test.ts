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
});
