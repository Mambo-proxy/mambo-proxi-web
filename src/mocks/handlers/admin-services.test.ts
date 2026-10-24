import { describe, expect, it } from 'vitest';
import type { AdminCategory, AdminService, AdminServiceListItem } from '@/lib/api/schema';
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

type List = { data: AdminServiceListItem[]; countsByCategory: Record<string, number> };

describe('services du back-office simulés', () => {
  it('liste les 27 services triés par rubrique (formules comprises), avec les compteurs', async () => {
    const { status, body } = await call<List>('GET', '/v1/admin/services');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(27);
    expect(body.data.slice(0, 2).map((service) => service.name)).toEqual([
      'Maison Essentiel',
      'Maison + Auto',
    ]);
    expect(body.countsByCategory).toEqual({
      'services-a-domicile': 6,
      experience: 5,
      immobilier: 7,
      'services-de-proximite': 4,
      'culture-evenementiel': 5,
    });
    const draft = body.data.find((service) => service.id === 'svc_visites_douala');
    expect(draft).toMatchObject({ status: 'DRAFT', completeness: 86 });
  });

  it('réordonne une rubrique et refuse un service d’une autre rubrique', async () => {
    const { body } = await call<List>('GET', '/v1/admin/services?category=experience');
    const ids = body.data.map((service) => service.id);
    const swapped = [ids[1]!, ids[0]!, ...ids.slice(2)];
    expect(
      (await call('PATCH', '/v1/admin/services/reorder', { scope: 'experience', ids: swapped })).status,
    ).toBe(204);
    const after = await call<List>('GET', '/v1/admin/services?category=experience');
    expect(after.body.data.map((service) => service.id)).toEqual(swapped);
    const refused = await call('PATCH', '/v1/admin/services/reorder', {
      scope: 'experience',
      ids: ['svc_gestion_locative'],
    });
    expect(refused.status).toBe(422);
  });

  it('crée un brouillon (slug et SEO pré-remplis), le modifie puis le publie', async () => {
    const missing = await call<{ errors: { path: string }[] }>('POST', '/v1/admin/services', { name: 'X' });
    expect(missing.status).toBe(422);
    expect(missing.body.errors.map((error) => error.path)).toEqual(
      expect.arrayContaining(['name', 'categoryId', 'tagline']),
    );

    const created = await call<AdminService>('POST', '/v1/admin/services', {
      name: 'Cours de cuisine',
      categoryId: 'cat_culture',
      tagline: 'Apprenez les recettes du pays.',
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      slug: 'cours-de-cuisine',
      status: 'DRAFT',
      seoTitle: 'Cours de cuisine | MAMBO Proxi',
      path: '/services/culture-evenementiel/cours-de-cuisine',
    });

    const patched = await call<AdminService>('PATCH', `/v1/admin/services/${created.body.id}`, {
      steps: [{ title: 'Choix du menu', text: 'Selon vos envies.' }],
    });
    expect(patched.body.steps).toHaveLength(1);
    expect(patched.body.version).not.toBe(created.body.version);

    const published = await call<AdminService>('POST', `/v1/admin/services/${created.body.id}/publish`);
    expect(published.body.status).toBe('PUBLISHED');
    expect((await call('DELETE', `/v1/admin/services/${created.body.id}`)).status).toBe(409);
  });

  it('404 sur un service inconnu', async () => {
    expect((await call('GET', '/v1/admin/services/svc_inconnu')).status).toBe(404);
  });

  it('rubriques : liste ordonnée, suppression refusée si non vide', async () => {
    const { body } = await call<AdminCategory[]>('GET', '/v1/admin/categories');
    expect(body.map((category) => category.slug)).toEqual([
      'services-a-domicile',
      'experience',
      'immobilier',
      'services-de-proximite',
      'culture-evenementiel',
    ]);
    expect(body[0]!.serviceCount).toBe(6);
    expect((await call('DELETE', '/v1/admin/categories/cat_experience')).status).toBe(409);
  });
});
