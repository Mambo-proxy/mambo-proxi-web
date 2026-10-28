import { describe, expect, it } from 'vitest';
import {
  composeTexts,
  fieldTranslationState,
  getAt,
  isTextPath,
  localTextStatus,
  setAt,
  setPath,
  textEntries,
  translationBadge,
} from './translation';

const rules = { paths: ['hoursLabel', 'agency.addressLines.*'] };
const french = {
  hoursLabel: 'Lun – Sam',
  phone: '+237600000000',
  agency: { addressLines: ['Rue 1', 'Akwa'] },
};

describe('socle des versions anglaises du back-office', () => {
  it('liste blanche de chemins (`*` = rang)', () => {
    expect(isTextPath('agency.addressLines.3', rules)).toBe(true);
    expect(isTextPath('phone', rules)).toBe(false);
    expect(isTextPath('phone', {})).toBe(true);
  });

  it('pose les textes anglais sur la structure française (liste blanche, rangs du français)', () => {
    const english = {
      hoursLabel: 'Mon – Sat',
      phone: '+33100000000',
      agency: { addressLines: ['', 'Akwa district', 'x'] },
    };
    expect(composeTexts(french, english, rules)).toEqual({
      ...french,
      hoursLabel: 'Mon – Sat',
      agency: { addressLines: ['Rue 1', 'Akwa district'] },
    });
    // Saisie en cours : un champ vidé reste vide.
    expect(composeTexts(french, english, rules, { keepEmpty: true })).toMatchObject({
      agency: { addressLines: ['', 'Akwa district'] },
    });
    expect(
      composeTexts(
        { href: '/devis', label: 'Devis' },
        { href: '/x', label: 'Quote' },
        { nonTextKeys: new Set(['href']) },
      ),
    ).toEqual({
      href: '/devis',
      label: 'Quote',
    });
  });

  it('extrait les textes et lit / écrit par chemin', () => {
    expect(textEntries(french, rules)).toEqual([
      ['hoursLabel', 'Lun – Sam'],
      ['agency.addressLines.0', 'Rue 1'],
      ['agency.addressLines.1', 'Akwa'],
    ]);
    expect(getAt(french, 'agency.addressLines.1')).toBe('Akwa');
    expect(setAt(french, 'agency.addressLines.0', 'Rue 2').agency.addressLines).toEqual(['Rue 2', 'Akwa']);
    expect(setPath({}, 'agency.addressLines.1', 'Akwa district')).toEqual({
      agency: { addressLines: [null, 'Akwa district'] },
    });
  });

  it('statut local, état d’un champ et badge', () => {
    const server = { state: 'OUTDATED' as const, missingFields: [], outdatedFields: ['hoursLabel'] };
    const fields = [
      { path: 'hoursLabel', translated: true },
      { path: 'agency.addressLines.0', translated: false },
    ];
    const status = localTextStatus(fields, server);
    expect(status).toEqual({
      state: 'MISSING',
      missingFields: ['agency.addressLines.0'],
      outdatedFields: ['hoursLabel'],
    });
    expect(fieldTranslationState('hoursLabel', status)).toBe('outdated');
    expect(fieldTranslationState('agency.addressLines.0', status)).toBe('missing');
    expect(localTextStatus([fields[0]!], server, new Set(['hoursLabel'])).state).toBe('UP_TO_DATE');
    expect(translationBadge(status)).toBe('À traduire');
    expect(translationBadge({ state: 'OUTDATED' })).toBe('À revoir');
    expect(translationBadge(undefined)).toBeNull();
  });
});
