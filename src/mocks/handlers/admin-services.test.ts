import { describe, expect, it } from 'vitest';
import type { AdminCategory, AdminService, AdminServiceListItem, Problem } from '@/lib/api/schema';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';
const headers = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(method: string, path: string, body?: unknown, extra: Record<string, string> = {}) {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, {
      method,
      headers: { ...headers, ...extra },
      body: body ? JSON.stringify(body) : undefined,
    }),
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

  it('slugs comme l’API : 409 pour un slug choisi déjà pris, suffixe pour un slug tiré du nom', async () => {
    const base = { categoryId: 'cat_experience', tagline: 'Une accroche.' };
    const taken = await call<Problem>('POST', '/v1/admin/services', {
      ...base,
      name: 'Chef privé bis',
      slug: 'chef-prive',
    });
    expect(taken.status).toBe(409);
    expect(taken.body).toMatchObject({
      type: 'https://api.mamboproxi.com/problems/conflict',
      title: 'Conflit',
      errors: [{ path: 'slug', code: 'slug_taken' }],
    });
    const first = await call<AdminService>('POST', '/v1/admin/services', { ...base, name: 'Chef privé' });
    expect(first.body.slug).toBe('chef-prive-2');
    const second = await call<AdminService>('POST', '/v1/admin/services', { ...base, name: 'Chef privé' });
    expect(second.body.slug).toBe('chef-prive-3');
    expect(first.body).toMatchObject({ categoryId: 'cat_experience', coverImageId: null });

    // Modification : slug pris par un autre service → 409.
    const moved = await call<Problem>('PATCH', `/v1/admin/services/${first.body.id}`, {
      slug: 'photographe',
    });
    expect(moved.status).toBe(409);
    for (const created of [first, second]) await call('DELETE', `/v1/admin/services/${created.body.id}`);
  });

  it('verrouillage optimiste (If-Match), accroche obligatoire en ligne, références contrôlées', async () => {
    const { body: service } = await call<AdminService>('GET', '/v1/admin/services/svc_chef_prive');
    const stale = await call<Problem>(
      'PATCH',
      '/v1/admin/services/svc_chef_prive',
      { summary: 'Texte' },
      { 'If-Match': '"v0"' },
    );
    expect(stale.status).toBe(412);
    expect(stale.body).toMatchObject({
      type: 'https://api.mamboproxi.com/problems/precondition-failed',
      title: 'Version obsolète',
    });
    const tagline = await call<Problem>('PATCH', '/v1/admin/services/svc_chef_prive', { tagline: '' });
    expect(tagline.body.errors).toEqual([
      { path: 'tagline', code: 'required', message: 'Écrivez une phrase d’accroche.' },
    ]);
    const references = await call<Problem>(
      'PATCH',
      '/v1/admin/services/svc_chef_prive',
      {
        coverImageId: 'med_inconnue',
        galleryImageIds: ['med_culture', 'med_absente'],
        relatedServiceIds: ['svc_chef_prive', 'svc_inconnu'],
      },
      { 'If-Match': `W/"${service.version}"` },
    );
    expect(references.status).toBe(422);
    expect(references.body.errors?.map((error) => [error.path, error.code])).toEqual([
      ['coverImageId', 'unknown_media'],
      ['galleryImageIds.1', 'unknown_media'],
      ['relatedServiceIds.0', 'self_reference'],
      ['relatedServiceIds.1', 'unknown_service'],
    ]);
    const empty = await call<Problem>('PATCH', '/v1/admin/services/svc_chef_prive', {});
    expect(empty.body.errors).toEqual([
      { path: '', code: 'invalid', message: 'Aucune modification envoyée.' },
    ]);
    // La photo de la fiche (données d'amorçage) reste une référence valable.
    const kept = await call<AdminService>('PATCH', '/v1/admin/services/svc_chef_prive', {
      coverImageId: service.coverImageId,
    });
    expect(kept.status).toBe(200);
  });

  it('ordre : identifiant inconnu ou en double refusé ; aperçu de 30 minutes', async () => {
    const { body } = await call<List>('GET', '/v1/admin/services?category=experience');
    const ids = body.data.map((service) => service.id);
    const duplicate = await call<Problem>('PATCH', '/v1/admin/services/reorder', {
      scope: 'experience',
      ids: [ids[0], ids[0]],
    });
    expect(duplicate.status).toBe(422);
    expect(duplicate.body.errors?.[0]).toMatchObject({
      path: 'ids',
      message: 'Un élément figure deux fois dans l’ordre.',
    });
    const unknown = await call<Problem>('PATCH', '/v1/admin/categories/reorder', { ids: ['cat_inconnue'] });
    expect(unknown.body.errors).toEqual([
      { path: 'ids', code: 'invalid_order', message: 'Rubriques inconnues.' },
    ]);
    const invalid = await call<Problem>('GET', '/v1/admin/services?status=EN_LIGNE');
    expect(invalid.status).toBe(400);
    expect(invalid.body.type).toBe('https://api.mamboproxi.com/problems/invalid-query');

    const token = await call<{ url: string; expiresAt: string }>(
      'GET',
      '/v1/admin/services/svc_chef_prive/preview-token',
    );
    expect(token.body.url).toMatch(/\/services\/experience\/chef-prive\?preview=/);
    const minutes = (new Date(token.body.expiresAt).getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(29);
    expect(minutes).toBeLessThanOrEqual(30);
  });

  it('rubriques : slug tiré du nom suffixé, slug choisi pris → 409, slug modifié contrôlé', async () => {
    const fields = { tagline: 'Accroche', description: 'Description', icon: 'Sparkles', tint: 'orange-50' };
    const created = await call<AdminCategory>('POST', '/v1/admin/categories', {
      ...fields,
      name: 'Immobilier',
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ slug: 'immobilier-2', status: 'DRAFT' });
    const taken = await call<Problem>('POST', '/v1/admin/categories', {
      ...fields,
      name: 'Autre',
      slug: 'experience',
    });
    expect(taken.status).toBe(409);
    const renamed = await call<Problem>('PATCH', `/v1/admin/categories/${created.body.id}`, {
      slug: 'experience',
    });
    expect(renamed.status).toBe(409);
    expect(renamed.body.errors).toEqual([
      {
        path: 'slug',
        code: 'slug_taken',
        message: 'Cette adresse est déjà utilisée par une autre rubrique.',
      },
    ]);
    const image = await call<Problem>('PATCH', `/v1/admin/categories/${created.body.id}`, {
      imageId: 'med_inconnue',
    });
    expect(image.body.errors).toEqual([
      { path: 'imageId', code: 'unknown_media', message: 'Cette image n’existe pas dans la médiathèque.' },
    ]);
    expect((await call('DELETE', `/v1/admin/categories/${created.body.id}`)).status).toBe(204);
  });
});
