import { describe, expect, it } from 'vitest';
import type { PageSection } from '@/lib/api/schema';
import {
  createSection,
  formatFigure,
  parseFigure,
  sectionDescription,
  sectionLabel,
  sectionsWithErrors,
  uniqueSectionId,
  validateSections,
} from './page-model';

describe('chiffres clés', () => {
  it('lit les saisies usuelles', () => {
    expect(parseFigure('150+')).toEqual({ value: 150, prefix: '', suffix: '+', decimals: 0 });
    expect(parseFigure('4,8 / 5')).toEqual({ value: 4.8, prefix: '', suffix: ' / 5', decimals: 1 });
    expect(parseFigure('+12 %')).toEqual({ value: 12, prefix: '+', suffix: ' %', decimals: 0 });
    expect(parseFigure('1 248')).toEqual({ value: 1248, prefix: '', suffix: '', decimals: 0 });
    expect(parseFigure('beaucoup')).toBeNull();
    expect(parseFigure('')).toBeNull();
  });

  it('reformate avec la virgule décimale', () => {
    expect(formatFigure({ value: 150, prefix: '', suffix: '+', decimals: 0 })).toBe('150+');
    expect(formatFigure({ value: 4.8, prefix: '', suffix: ' / 5', decimals: 1 })).toBe('4,8 / 5');
    const parsed = parseFigure('40+');
    expect(parsed && formatFigure(parsed)).toBe('40+');
  });
});

describe('sections', () => {
  const hero: PageSection = {
    id: 'hero',
    type: 'hero',
    enabled: true,
    variant: 'home',
    showWhatsapp: false,
    adminLabel: 'Section principale',
    title: 'Mambo',
  };

  it('nomme et décrit les sections comme la maquette', () => {
    expect(sectionLabel(hero)).toBe('Section principale');
    expect(sectionDescription(hero)).toBe('Titre, texte, boutons et visuel');
    const engagements: PageSection = {
      id: 'engagements',
      type: 'featureList',
      enabled: true,
      adminLabel: 'Nos engagements',
      items: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
    };
    expect(sectionDescription(engagements)).toBe('3\u00A0engagements : titre et texte');
    const reviews: PageSection = {
      id: 'avis',
      type: 'dynamic',
      enabled: true,
      source: 'reviews-highlight',
      limit: 3,
    };
    expect(sectionLabel(reviews)).toBe('Témoignages');
    expect(sectionDescription(reviews)).toBe('Les avis publiés s’affichent automatiquement (3 derniers)');
    const stats: PageSection = {
      id: 'chiffres',
      type: 'statsGrid',
      enabled: true,
      items: [
        { key: 'a', value: 150, prefix: '', decimals: 0, label: 'projets accompagnés' },
        { key: 'b', value: 40, prefix: '', decimals: 0, label: 'partenaires engagés' },
      ],
    };
    expect(sectionDescription(stats)).toBe('Projets accompagnés, partenaires engagés');
  });

  it('crée des sections aux identifiants uniques', () => {
    expect(uniqueSectionId('faq', ['faq', 'faq-2'])).toBe('faq-3');
    const section = createSection('cardGrid', ['cartes']);
    expect(section).toMatchObject({ id: 'cartes-2', type: 'cardGrid', enabled: true, columns: 3 });
  });

  it('valide champ par champ avec les chemins de l’API', () => {
    const sections: PageSection[] = [
      { ...hero, title: '  ', primaryCta: { label: 'Devis', href: 'devis', external: false } },
      { id: 'faq', type: 'faq', enabled: true, items: [{ question: 'Q ?', answer: '' }] },
      { id: 'faq', type: 'marquee', enabled: true, items: ['Chef privé', ''] },
    ];
    const errors = validateSections(sections);
    expect(errors).toMatchObject({
      'sections.0.title': 'Ce champ est obligatoire.',
      'sections.0.primaryCta.href': expect.stringContaining('commençant par /'),
      'sections.1.items.0.answer': 'Indiquez la réponse.',
      'sections.2.id': expect.any(String),
      'sections.2.items.1': expect.any(String),
    });
    expect(errors['sections.1.items.0.question']).toBeUndefined();
    expect(sectionsWithErrors(errors)).toEqual([0, 1, 2]);
    expect(validateSections([hero])).toEqual({});
  });
});
