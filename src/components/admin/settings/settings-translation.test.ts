import { describe, expect, it } from 'vitest';
import { saveMockTranslation } from '@/mocks/text-translations';
import {
  editEnglishText,
  localSettingsStatus,
  markReviewed,
  settingsTextFields,
  settingsTextRules,
} from './settings-translation';

const coordonnees = {
  phoneCameroon: '+237600000000',
  hoursLabel: 'Lun – Sam · 8h – 20h',
  agency: {
    name: 'Agence MAMBO Proxi',
    addressLines: ['Cité SIC'],
    city: 'Douala',
    phone: '+237600000000',
    openingHours: [{ label: 'Lundi', hours: '8 h – 18 h' }],
  },
};

describe('version anglaise des paramètres', () => {
  it('liste les seuls textes traduisibles, dans l’ordre des champs', () => {
    expect(settingsTextFields('coordonnees', coordonnees).map((field) => [field.path, field.label])).toEqual([
      ['hoursLabel', 'Horaires'],
      ['agency.name', 'Nom de l’agence'],
      ['agency.addressLines.0', 'Adresse de l’agence · ligne 1'],
      ['agency.openingHours.0.label', 'Horaires d’ouverture 1 · Jours'],
      ['agency.openingHours.0.hours', 'Horaires d’ouverture 1 · Heures'],
    ]);
  });

  it('saisie, statut local et marquage « revu »', () => {
    const saved = {
      translations: { en: { hoursLabel: 'Mon – Sat' } },
      translationStatus: {
        en: {
          state: 'OUTDATED' as const,
          missingFields: [],
          outdatedFields: ['hoursLabel'],
        },
      },
    };
    const value = { defaultTitle: 'Titre', defaultDescription: '' };
    // Champ vide en français : rien à traduire.
    expect(settingsTextFields('seo', value).map((field) => field.path)).toEqual(['defaultTitle']);

    const french = { message: 'Bonjour' };
    expect(localSettingsStatus('whatsapp', french, undefined, undefined).missingFields).toEqual(['message']);
    const typed = editEnglishText(undefined, 'message', 'Hello');
    expect(localSettingsStatus('whatsapp', french, typed, undefined).state).toBe('UP_TO_DATE');

    const hours = { hoursLabel: 'Lun – Ven' };
    expect(localSettingsStatus('coordonnees', hours, saved.translations, saved).outdatedFields).toEqual([
      'hoursLabel',
    ]);
    const reviewed = markReviewed(saved.translations, 'hoursLabel');
    expect(reviewed.reviewedFields).toEqual(['hoursLabel']);
    expect(localSettingsStatus('coordonnees', hours, reviewed, saved).state).toBe('UP_TO_DATE');
  });

  it('simulation : seuls les textes de la liste blanche sont gardés, référence française suivie', () => {
    const rules = settingsTextRules('coordonnees');
    const first = saveMockTranslation({
      french: coordonnees,
      previousFrench: coordonnees,
      before: { en: null, sources: {} },
      english: { hoursLabel: 'Mon – Sat', agency: { phone: '+33100000000', addressLines: ['SIC estate'] } },
      reviewed: [],
      rules,
    });
    expect(first.en).toEqual({ hoursLabel: 'Mon – Sat', agency: { addressLines: ['SIC estate'] } });
    expect(first.sources).toEqual({
      hoursLabel: coordonnees.hoursLabel,
      'agency.addressLines.0': 'Cité SIC',
    });
  });
});
