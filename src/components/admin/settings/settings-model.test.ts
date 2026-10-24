import { describe, expect, it } from 'vitest';
import type { EmailTemplate } from '@/lib/api/schema';
import {
  backupLabel,
  EMAIL_FAMILIES,
  familyEnabled,
  formatPhone,
  parseEmails,
  parsePhone,
  socialDisplay,
  socialUrl,
  tabsFor,
} from './settings-model';

describe('paramètres', () => {
  it('numéros : affichage de la maquette et saisie libre', () => {
    expect(formatPhone('+237600000000')).toBe('+237 6 00 00 00 00');
    expect(formatPhone('+33612345678')).toBe('+33 6 12 34 56 78');
    expect(parsePhone('+237 6 00 00 00 00')).toBe('+237600000000');
    expect(parsePhone('00237 6.00-00 (00) 00')).toBe('+237600000000');
  });

  it('réseaux sociaux : adresse courte ↔ adresse complète', () => {
    expect(socialDisplay('https://www.instagram.com/mamboproxi')).toBe('instagram.com/mamboproxi');
    expect(socialUrl('instagram.com/mamboproxi')).toBe('https://www.instagram.com/mamboproxi');
    expect(socialUrl('https://tiktok.com/@mamboproxi')).toBe('https://tiktok.com/@mamboproxi');
    expect(socialUrl(' ')).toBe('');
  });

  it('famille d’e-mails active si tous ses modèles le sont', () => {
    const survey = EMAIL_FAMILIES.find((family) => family.id === 'survey')!;
    const templates = [
      { key: 'survey-invitation', enabled: true },
      { key: 'survey-reminder', enabled: false },
    ] as EmailTemplate[];
    expect(familyEnabled(survey, templates)).toBe(false);
    expect(familyEnabled(survey, templates.slice(0, 1))).toBe(true);
    expect(survey.description(24)).toBe('24\u00A0h après le passage au statut « Prestation réalisée »');
  });

  it('sauvegarde de la nuit et onglets selon le rôle', () => {
    const now = Date.parse('2026-10-24T10:00:00.000Z');
    expect(backupLabel('2026-10-24T02:00:00.000Z', now)).toBe('Chaque nuit · dernière : aujourd’hui 03:00');
    expect(backupLabel('2026-10-23T02:00:00.000Z', now)).toBe('Chaque nuit · dernière : hier 03:00');
    expect(tabsFor('EDITOR').map((tab) => tab.value)).toEqual(['coordonnees', 'e-mails', 'referencement']);
    expect(parseEmails('a@b.cm, c@d.cm;\ne@f.cm')).toEqual(['a@b.cm', 'c@d.cm', 'e@f.cm']);
  });
});
