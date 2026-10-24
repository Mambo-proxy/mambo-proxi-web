import { describe, expect, it } from 'vitest';
import { activityDay, diffLines, periodStart } from './activity-model';

describe('journal d’activité', () => {
  const now = Date.parse('2026-10-24T10:00:00.000Z');

  it('début de période au début d’une journée', () => {
    expect(periodStart('7j', now)).toBe('2026-10-17T00:00:00.000Z');
    expect(periodStart('tout', now)).toBeUndefined();
  });

  it('en-têtes des jours', () => {
    expect(activityDay('2026-10-24T07:00:00.000Z', now)).toBe('Aujourd’hui');
    expect(activityDay('2026-10-23T15:00:00.000Z', now)).toBe('Hier');
    expect(activityDay('2026-10-19T15:00:00.000Z', now)).toBe('lundi 19 octobre');
  });

  it('détail des modifications', () => {
    expect(diffLines({ statut: ['Nouvelle', 'Devis envoyé'], note: 'ajoutée' })).toEqual([
      { field: 'statut', change: 'Nouvelle → Devis envoyé' },
      { field: 'note', change: 'ajoutée' },
    ]);
    expect(diffLines(null)).toEqual([]);
  });
});
