import { describe, expect, it } from 'vitest';
import { serviceCompleteness } from './completeness';
import { emptyForm, formToFields, requiredErrors, withName, withTagline } from './service-form';
import { defaultSeoTitle, runsByCategory, slugify, spliceOrder } from './service-utils';

describe('éditeur de service : champs dérivés', () => {
  it('l’adresse et le titre pour Google suivent le nom tant qu’ils ne sont pas modifiés', () => {
    let form = withName(emptyForm(), 'Visites guidées', false);
    form = withName(form, 'Visites guidées de Douala', false);
    expect(form.slug).toBe('visites-guidees-de-douala');
    expect(form.seoTitle).toBe('Visites guidées de Douala | MAMBO Proxi');

    form = { ...form, slug: 'visites-douala', seoTitle: 'Titre libre' };
    form = withName(form, 'Visites de Douala', false);
    expect(form.slug).toBe('visites-douala');
    expect(form.seoTitle).toBe('Titre libre');
  });

  it('l’adresse d’un service déjà publié ne suit plus le nom', () => {
    const form = withName(
      { ...emptyForm(), name: 'Chef privé', slug: 'chef-prive' },
      'Chef à domicile',
      true,
    );
    expect(form.slug).toBe('chef-prive');
  });

  it('la description pour Google reprend l’accroche', () => {
    const form = withTagline(emptyForm(), 'Découvrez Douala avec un guide passionné.');
    expect(form.seoDescription).toBe('Découvrez Douala avec un guide passionné.');
  });

  it('titre pour Google limité à 60 caractères', () => {
    expect(defaultSeoTitle('x'.repeat(80))).toHaveLength(60);
    expect(slugify('Réception de colis & courrier')).toBe('reception-de-colis-courrier');
  });

  it('champs obligatoires et éléments vides retirés de l’envoi', () => {
    expect(Object.keys(requiredErrors(emptyForm()))).toEqual(['name', 'categoryId', 'tagline']);
    const fields = formToFields({ ...emptyForm(), name: ' Cours ', seoTitle: '' });
    expect(fields).toMatchObject({ name: 'Cours', audiences: [], steps: [], advantages: [], seoTitle: null });
    expect(fields).not.toHaveProperty('categoryId');
  });
});

describe('complétude (7 critères)', () => {
  it('6 sur 7 sans photo principale en haute définition : 86 %', () => {
    const result = serviceCompleteness({
      name: 'Visites guidées de Douala',
      categoryId: 'cat_culture',
      tagline: 'Découvrez Douala.',
      summary: 'Balades commentées.',
      audiences: ['Aux visiteurs'],
      steps: [{ title: 'Échange', text: '' }],
      advantages: [{ icon: null, title: 'Guides', text: '' }],
      faq: [{ question: 'Combien de temps ?', answer: '2 h.' }],
      relatedServiceIds: ['svc_a'],
      cover: { width: 1200 },
    });
    expect(result.percent).toBe(86);
    expect(result.criteria.filter((item) => !item.done).map((item) => item.key)).toEqual(['coverImage']);
  });
});

describe('réordonnancement par rubrique', () => {
  const item = (id: string, slug: string) => ({ id, category: { slug } });

  it('regroupe les lignes consécutives d’une même rubrique', () => {
    const runs = runsByCategory([item('a', 'x'), item('b', 'x'), item('c', 'y')]);
    expect(runs.map((run) => run.map((entry) => entry.id))).toEqual([['a', 'b'], ['c']]);
  });

  it('remplace la partie affichée dans l’ordre complet de la rubrique', () => {
    const full = ['a', 'b', 'c', 'd'].map((id) => item(id, 'x'));
    const shown = full.slice(2);
    const next = spliceOrder(full, shown, [shown[1]!, shown[0]!]);
    expect(next.map((entry) => entry.id)).toEqual(['a', 'b', 'd', 'c']);
  });
});
