import { describe, expect, it } from 'vitest';
import type { AdminCategory, AdminService, AdminServiceListItem } from '@/lib/api/schema';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(path: string, init: RequestInit = {}) {
  const response = await resolveMockRequest(new Request(`${API}${path}`, { headers: session, ...init }));
  const body = response.status === 204 ? null : ((await response.json()) as T);
  return { status: response.status, body: body as T };
}

type List = { data: AdminServiceListItem[]; countsByCategory: Record<string, number> };

describe('services simulés du back-office', () => {
  it('liste les 23 services à page, 5 rubriques et un seul brouillon', async () => {
    const { status, body } = await call<List>('/v1/admin/services');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(23);
    expect(body.data.filter((service) => service.status === 'DRAFT')).toHaveLength(1);
    expect(body.data.find((service) => service.status === 'DRAFT')?.name).toBe('Visites guidées de Douala');
    expect(body.countsByCategory).toEqual({
      'services-a-domicile': 2,
      experience: 5,
      immobilier: 7,
      'services-de-proximite': 4,
      'culture-evenementiel': 5,
    });
    expect(body.data[0]?.category.slug).toBe('services-a-domicile');
  });

  it('filtre par rubrique et par statut', async () => {
    const experience = await call<List>('/v1/admin/services?category=experience');
    expect(experience.body.data.map((service) => service.name)).toContain('Chef privé');
    expect(experience.body.data).toHaveLength(5);
    const drafts = await call<List>('/v1/admin/services?status=DRAFT');
    expect(drafts.body.data.map((service) => service.name)).toEqual(['Visites guidées de Douala']);
  });

  it('service de la maquette : champs de l’éditeur et complétude à 86 %', async () => {
    const { body } = await call<AdminService>('/v1/admin/services/svc_visites_douala');
    expect(body.name).toBe('Visites guidées de Douala');
    expect(body.category).toEqual({ slug: 'culture-evenementiel', name: 'Culture & événementiel' });
    expect(body.tagline).toBe('Découvrez Douala avec un guide passionné, loin des circuits classiques.');
    expect(body.audiences).toHaveLength(3);
    expect(body.steps).toHaveLength(3);
    expect(body.advantages).toHaveLength(2);
    expect(body.faq).toHaveLength(1);
    expect(body.completenessDetail.percent).toBe(86);
    expect(body.completenessDetail.criteria.filter((criterion) => !criterion.done)).toEqual([
      { key: 'coverImage', label: 'Photo principale en haute définition', done: false },
    ]);
    expect(body.path).toBe('/services/culture-evenementiel/visites-guidees-douala');
  });

  it('interrupteur « Dans le menu » enregistré', async () => {
    const updated = await call<AdminService>('/v1/admin/services/svc_chef_prive', {
      method: 'PATCH',
      body: JSON.stringify({ showInMenu: false }),
    });
    expect(updated.status).toBe(200);
    expect(updated.body.showInMenu).toBe(false);
    const { body } = await call<AdminService>('/v1/admin/services/svc_chef_prive');
    expect(body.showInMenu).toBe(false);
    await call('/v1/admin/services/svc_chef_prive', {
      method: 'PATCH',
      body: JSON.stringify({ showInMenu: true }),
    });
  });

  it('publication puis retour en brouillon', async () => {
    const published = await call<AdminService>('/v1/admin/services/svc_visites_douala/publish', {
      method: 'POST',
    });
    expect(published.status).toBe(200);
    expect(published.body.status).toBe('PUBLISHED');
    expect(published.body.publishedAt).not.toBeNull();
    const unpublished = await call<AdminService>('/v1/admin/services/svc_visites_douala/unpublish', {
      method: 'POST',
    });
    expect(unpublished.body.status).toBe('DRAFT');
  });

  it('duplication en brouillon et suppression interdite sur un service publié', async () => {
    const copy = await call<AdminService>('/v1/admin/services/svc_chef_prive/duplicate', {
      method: 'POST',
    });
    expect(copy.status).toBe(201);
    expect(copy.body.name).toBe('Chef privé (copie)');
    expect(copy.body.status).toBe('DRAFT');
    expect(copy.body.slug).toMatch(/^chef-prive-copie/);

    const refused = await call('/v1/admin/services/svc_chef_prive', { method: 'DELETE' });
    expect(refused.status).toBe(409);

    const removed = await call(`/v1/admin/services/${copy.body.id}`, { method: 'DELETE' });
    expect(removed.status).toBe(204);
  });

  it('création d’un brouillon : slug calculé, page et complétude', async () => {
    const created = await call<AdminService>('/v1/admin/services', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ateliers de cuisine',
        categoryId: 'cat_experience',
        tagline: 'Apprenez les saveurs de Douala avec un chef.',
      }),
    });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe('DRAFT');
    expect(created.body.slug).toBe('ateliers-de-cuisine');
    expect(created.body.path).toBe('/services/experience/ateliers-de-cuisine');
    expect(created.body.seoTitle).toBe('Ateliers de cuisine | MAMBO Proxi');
    expect(created.body.completenessDetail.percent).toBe(14);

    const invalid = await call('/v1/admin/services', {
      method: 'POST',
      body: JSON.stringify({ name: '', categoryId: '', tagline: '' }),
    });
    expect(invalid.status).toBe(422);
  });

  it('rubriques : ordre du site et renommage', async () => {
    const { body } = await call<AdminCategory[]>('/v1/admin/categories');
    expect(body.map((category) => category.slug)).toEqual([
      'services-a-domicile',
      'experience',
      'immobilier',
      'services-de-proximite',
      'culture-evenementiel',
    ]);
    expect(body[1]?.serviceCount).toBe(5);

    const renamed = await call<AdminCategory>('/v1/admin/categories/cat_experience', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Expériences' }),
    });
    expect(renamed.body.name).toBe('Expériences');
    await call('/v1/admin/categories/cat_experience', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Expérience' }),
    });
  });
});
