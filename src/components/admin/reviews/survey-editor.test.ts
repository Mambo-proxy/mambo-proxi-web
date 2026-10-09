import { describe, expect, it } from 'vitest';
import { defaultOptions, toInput, validateDraft, type DraftQuestion } from './survey-editor';

const question = (overrides: Partial<DraftQuestion> = {}): DraftQuestion => ({
  key: 'k',
  id: 'q1',
  kind: 'CHOICE',
  label: 'Ponctualité et professionnalisme',
  helpText: null,
  options: defaultOptions('CHOICE'),
  required: false,
  active: true,
  ...overrides,
});

describe('questionnaire de satisfaction', () => {
  it('envoie la question sans clé locale, textes nettoyés, sans choix pour le texte libre', () => {
    expect(
      toInput(question({ label: '  Commentaire  ', kind: 'TEXT', options: ['x'], helpText: ' ' })),
    ).toEqual({
      id: 'q1',
      kind: 'TEXT',
      label: 'Commentaire',
      helpText: null,
      options: [],
      required: false,
      active: true,
    });
  });

  it('signale intitulé vide et choix insuffisants par question', () => {
    const { fields, general } = validateDraft([question(), question({ label: ' ', options: ['Oui', ' '] })]);
    expect(fields).toEqual({
      '1.label': 'Saisissez l’intitulé de la question.',
      '1.options': 'Proposez au moins deux choix de réponse.',
    });
    expect(general).toBeUndefined();
  });

  it('refuse plus de 5 questions actives', () => {
    const { general } = validateDraft(Array.from({ length: 6 }, () => question()));
    expect(general).toMatch(/5 questions actives au maximum\s: désactivez-en 1/);
  });

  it('choix par défaut selon le type', () => {
    expect(defaultOptions('STARS')).toHaveLength(5);
    expect(defaultOptions('NPS')).toHaveLength(2);
    expect(defaultOptions('TEXT')).toEqual([]);
  });
});
