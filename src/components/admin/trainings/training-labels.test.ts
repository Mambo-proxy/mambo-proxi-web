import { describe, expect, it } from 'vitest';
import { formatLabel, requestedTraining, trainingSection } from './training-labels';

describe('libellés des formations', () => {
  it('section de la page Formation selon la catégorie', () => {
    expect(trainingSection('PROFESSIONNELS')).toBe('Formation des professionnels');
    expect(trainingSection('ATELIERS')).toBe('Ateliers & sensibilisation');
    expect(trainingSection('SENSIBILISATION')).toBe('Ateliers & sensibilisation');
  });

  it('format et lieu', () => {
    expect(formatLabel({ format: 'Présentiel', location: 'Douala' })).toBe('Présentiel · Douala');
    expect(formatLabel({ format: 'En ligne', location: null })).toBe('En ligne');
  });

  it('formation souhaitée : catalogue, « Autre » saisie ou libellé par défaut', () => {
    const training = { id: 'trn_1', slug: 'accueil', title: 'Accueil et relation client' };
    expect(requestedTraining({ training, otherTraining: null })).toBe('Accueil et relation client');
    expect(requestedTraining({ training: null, otherTraining: 'Couture' })).toBe('Couture');
    expect(requestedTraining({ training: null, otherTraining: null })).toBe('Autre formation');
  });
});
