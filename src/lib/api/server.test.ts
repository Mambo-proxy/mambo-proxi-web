import { describe, expect, it } from 'vitest';
import { MOCK_FAILURE_EMAIL } from '@/mocks/handlers/forms';
import { ApiError } from './errors';
import { unwrap, unwrapOrNull } from './result';
import { api, cached } from './server';
import { cacheTags } from './tags';

describe('client API serveur (sur les mocks)', () => {
  it('renvoie les paramètres du site issus du contrat', async () => {
    const settings = await unwrap(api.GET('/v1/site/settings', cached([cacheTags.settings])));
    expect(settings.whatsapp).toBeDefined();
  });

  it('renvoie la rubrique demandée et null pour une rubrique inconnue', async () => {
    const experience = await unwrapOrNull(
      api.GET('/v1/categories/{slug}', { params: { path: { slug: 'experience' } } }),
    );
    expect(experience?.slug).toBe('experience');

    const unknown = await unwrapOrNull(
      api.GET('/v1/categories/{slug}', { params: { path: { slug: 'inconnue' } } }),
    );
    expect(unknown).toBeNull();
  });

  it('expose les 4 rubriques et les 19 services du catalogue', async () => {
    const categories = await unwrap(
      api.GET('/v1/categories', { params: { query: { include: 'services' } } }),
    );
    expect(categories).toHaveLength(4);
    expect(categories.flatMap((category) => category.services ?? [])).toHaveLength(19);
  });

  it('filtre les services par rubrique et par recherche sans accents', async () => {
    const immobilier = await unwrap(
      api.GET('/v1/services', { params: { query: { category: 'immobilier' } } }),
    );
    expect(immobilier).toHaveLength(7);

    const search = await unwrap(api.GET('/v1/services', { params: { query: { q: 'prive' } } }));
    expect(search.map((service) => service.slug)).toContain('chef-prive');
  });

  it("renvoie une référence MP-AAAA-NNNN à l'envoi d'un formulaire", async () => {
    const { data, response } = await api.POST('/v1/contact-messages', {
      body: { email: 'awa@exemple.fr' } as never,
    });
    expect(response.status).toBe(201);
    expect(data?.reference).toMatch(/^MP-\d{4}-\d{4}$/);
  });

  it('lève une ApiError avec le message à afficher quand le serveur échoue', async () => {
    const request = unwrap(
      api.POST('/v1/contact-messages', { body: { email: MOCK_FAILURE_EMAIL } as never }),
    );
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ status: 500 });
  });
});
