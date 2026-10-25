import { describe, expect, it } from 'vitest';
import type { Problem, SearchResults } from '@/lib/api/schema';
import { resolveMockRequest } from './resolve';

const API = 'http://localhost:4000';

async function search<T = SearchResults>(query: string) {
  const response = await resolveMockRequest(new Request(`${API}/v1/search?${query}`));
  return { status: response.status, body: (await response.json()) as T };
}

describe('recherche globale simulée', () => {
  it('cherche « chef » dans le catalogue, les rubriques et les pages, groupes dans l’ordre du contrat', async () => {
    const { status, body } = await search('q=chef');
    expect(status).toBe(200);
    expect(body).toMatchObject({ query: 'chef', lang: 'fr' });
    const types = body.groups.map((group) => group.type);
    expect(types.slice(0, 3)).toEqual(['service', 'category', 'page']);
    expect(body.total).toBe(body.groups.reduce((sum, group) => sum + group.total, 0));

    const service = body.groups[0]?.items[0];
    expect(service).toMatchObject({
      type: 'service',
      key: 'chef-prive',
      title: 'Chef privé',
      context: 'Expérience',
      href: '/services/experience/chef-prive',
      titleHighlights: [{ start: 0, end: 4 }],
      icon: null,
    });
    // Plages reportées sur l'extrait affiché.
    for (const range of service?.highlights ?? []) {
      expect(service?.excerpt.slice(range.start, range.end).toLowerCase()).toBe('chef');
    }
    expect(body.groups[1]?.items[0]).toMatchObject({
      type: 'category',
      key: 'experience',
      href: '/services/experience',
      icon: expect.any(String),
    });
  });

  it('ignore la casse et les accents, et surligne le texte d’origine', async () => {
    const { body } = await search('q=HYGIENE');
    const training = body.groups.find((group) => group.type === 'training')?.items[0];
    expect(training).toMatchObject({
      title: 'Hygiène et sécurité en cuisine',
      href: '/formation#hygiene-securite-cuisine',
      titleHighlights: [{ start: 0, end: 7 }],
    });
    expect(training?.excerpt.length).toBeLessThanOrEqual(240);
  });

  it('respecte `types` et `limit`, avec le total réel du groupe', async () => {
    const { body } = await search('q=douala&types=job,training&limit=1');
    expect(body.groups.map((group) => group.type)).toEqual(['job', 'training']);
    for (const group of body.groups) expect(group.items).toHaveLength(1);
    expect(body.groups[0]?.total).toBeGreaterThan(1);
    expect(body.groups[0]?.items[0]?.href).toMatch(/^\/recrutement\//);
  });

  it('renvoie les articles publiés du Magazine vers leur ancre, pas ceux des éditions en préparation', async () => {
    const { body } = await search('q=manger&types=article');
    const titles = body.groups[0]?.items.map((item) => item.title) ?? [];
    expect(titles).toContain('Bien manger au quotidien sans se ruiner');
    expect(body.groups[0]?.items[0]?.href).toMatch(/^\/magazine#article-art_\d+$/);
    // « Le marché, premier allié de la cuisine maison » : édition n° 2, programmée, pas encore en ligne.
    const scheduled = await search('q=premier%20allie&types=article');
    expect(scheduled.body.groups).toEqual([]);
  });

  it('répond en anglais avec `lang=en`', async () => {
    const { body } = await search('q=chef&lang=en');
    expect(body.lang).toBe('en');
    expect(body.groups[0]?.items[0]).toMatchObject({
      title: 'Private chef',
      titleHighlights: [{ start: 8, end: 12 }],
    });
    expect(body.groups.find((group) => group.type === 'category')?.label).toBe('Categories');
  });

  it('aucun résultat : liste de groupes vide', async () => {
    const { status, body } = await search('q=zzzzzz');
    expect(status).toBe(200);
    expect(body).toMatchObject({ total: 0, groups: [] });
  });

  it('400 si le texte fait moins de 2 caractères, si un type est inconnu ou si la limite est hors bornes', async () => {
    for (const query of ['q=c', 'q=%20c%20', 'q=chef&types=video', 'q=chef&limit=21', 'q=chef&limit=0']) {
      const { status, body } = await search<Problem>(query);
      expect(status, query).toBe(400);
      expect(body.status).toBe(400);
    }
  });
});
