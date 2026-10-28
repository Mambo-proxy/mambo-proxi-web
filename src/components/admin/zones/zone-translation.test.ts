import { describe, expect, it } from 'vitest';
import type { AdminZone } from '@/lib/api/schema';
import { localZoneStatus, quarterFieldLabel, type ZoneTextDraft } from './zone-translation';

const zone = {
  nameEn: 'Zone 1 — Nearby',
  descriptionEn: 'Around Cité SIC.',
  resultEn: 'Fast service.',
  quarters: [{ name: 'Akwa' }],
  translationStatus: {
    en: { state: 'OUTDATED', missingFields: [], outdatedFields: ['description', 'quarters.0.detail'] },
  },
} as unknown as AdminZone;

const draft: ZoneTextDraft = {
  name: 'Zone 1 — Proximité',
  nameEn: 'Zone 1 — Nearby',
  description: 'Autour de la base de Cité SIC.',
  descriptionEn: 'Around Cité SIC.',
  result: 'Intervention rapide.',
  resultEn: 'Fast service.',
  reviewedFields: [],
};

describe('version anglaise des zones', () => {
  it('ne dépend pas du seul nom : description et quartiers à revoir comptent', () => {
    expect(localZoneStatus(draft, zone)).toEqual({
      state: 'OUTDATED',
      missingFields: [],
      outdatedFields: ['description', 'quarters.0.detail'],
    });
    expect(localZoneStatus({ ...draft, resultEn: '' }, zone).state).toBe('MISSING');
  });

  it('retouche ou marquage « revu » : le champ n’est plus à revoir', () => {
    expect(localZoneStatus({ ...draft, descriptionEn: 'Around the SIC base.' }, zone).outdatedFields).toEqual(
      ['quarters.0.detail'],
    );
    expect(
      localZoneStatus({ ...draft, reviewedFields: ['description', 'quarters.0.detail'] }, zone).state,
    ).toBe('UP_TO_DATE');
  });

  it('nouvelle zone : textes français sans traduction', () => {
    expect(localZoneStatus({ ...draft, nameEn: '', descriptionEn: '', resultEn: '' }, null)).toEqual({
      state: 'MISSING',
      missingFields: ['name', 'description', 'result'],
      outdatedFields: [],
    });
    expect(quarterFieldLabel('quarters.0.mapLabel', [{ name: 'Akwa' }])).toBe(
      'Akwa · étiquette sur la carte',
    );
  });
});
