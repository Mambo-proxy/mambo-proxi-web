import { describe, expect, it } from 'vitest';
import type { Campaign } from '@/lib/api/schema';
import { campaignSubline, isEmptyHtml, openRate } from './campaign-labels';

const base = {
  id: 'cmp_1',
  subject: 'Octobre',
  segment: { kind: 'ALL' },
  recipients: 1192,
  opens: 548,
  clicks: 107,
  unsubscribes: 5,
  createdAt: '2026-10-01T09:00:00.000Z',
} as Campaign;

describe('libellés des envois', () => {
  it('sous-titre selon le statut', () => {
    expect(campaignSubline({ ...base, status: 'PROGRAMMEE', scheduledAt: '2026-11-02T08:00:00.000Z' })).toBe(
      'Programmée le 2 nov. · 09:00',
    );
    expect(campaignSubline({ ...base, status: 'ENVOYEE', sentAt: '2026-10-05T08:00:00.000Z' })).toBe(
      'Envoyée le 5 oct.',
    );
    const now = Date.parse('2026-10-24T12:00:00.000Z');
    expect(
      campaignSubline({ ...base, status: 'BROUILLON', updatedAt: '2026-10-23T10:00:00.000Z' }, now),
    ).toBe('Modifié hier');
  });

  it('taux d’ouverture des envois partis seulement', () => {
    expect(openRate({ ...base, status: 'ENVOYEE' })).toMatch(/^46\s%$/);
    expect(openRate({ ...base, status: 'PROGRAMMEE' })).toBe('—');
  });

  it('corps vide : ni texte, ni image, ni bouton', () => {
    expect(isEmptyHtml('<p></p>')).toBe(true);
    expect(isEmptyHtml('<img src="/a.png" alt="">')).toBe(false);
    expect(isEmptyHtml('<p>Bonjour</p>')).toBe(false);
  });
});
