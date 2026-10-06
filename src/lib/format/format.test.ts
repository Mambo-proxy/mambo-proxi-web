import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatRelative, formatTime } from './date';
import { formatFileSize, formatNumber, formatPercent, formatRating } from './number';
import { frenchTypography } from './typography';

const NBSP = '\u00A0';
const NARROW = '\u202F';

describe('frenchTypography', () => {
  it('rend insécables les espaces avant la ponctuation haute', () => {
    expect(frenchTypography('Une question ? Oui ! Bien ; voici : la suite')).toBe(
      `Une question${NARROW}? Oui${NARROW}! Bien${NARROW}; voici${NBSP}: la suite`,
    );
  });

  it('traite les guillemets, les pourcentages et les unités', () => {
    expect(frenchTypography('« Très bien » à 98 % sous 24 h, CV de 5 Mo')).toBe(
      `«${NBSP}Très bien${NBSP}» à 98${NARROW}% sous 24${NBSP}h, CV de 5${NBSP}Mo`,
    );
  });

  it("n'ajoute pas d'espace et ne touche pas aux mots", () => {
    expect(frenchTypography('Qui sommes-nous?')).toBe('Qui sommes-nous?');
    expect(frenchTypography('3 hôtes et 2 minutes')).toBe(`3 hôtes et 2${NBSP}minutes`);
    expect(frenchTypography('https://mamboproxi.com')).toBe('https://mamboproxi.com');
  });
});

describe('nombres', () => {
  it('formate à la française', () => {
    expect(formatNumber(1200)).toBe(`1${NARROW}200`);
    expect(formatRating(4.8)).toBe('4,8');
    expect(formatPercent(0.92)).toBe(`92${NARROW}%`);
    expect(formatFileSize(2_400_000)).toBe(`2,3${NBSP}Mo`);
  });
});

describe('dates (fuseau Africa/Douala par défaut)', () => {
  // 13:30 UTC = 14 h 30 à Douala (UTC+1)
  const date = '2026-10-06T13:30:00.000Z';

  it('formate date et heure', () => {
    expect(formatDate(date)).toBe('6 octobre 2026');
    expect(formatTime(date)).toBe(`14${NBSP}h${NBSP}30`);
    expect(formatTime('2026-10-06T13:00:00.000Z')).toBe(`14${NBSP}h`);
    expect(formatDateTime(date)).toBe(`6 octobre 2026 à 14${NBSP}h${NBSP}30`);
    expect(formatTime(date, 'Europe/Paris')).toBe(`15${NBSP}h${NBSP}30`);
  });

  it('formate une date relative', () => {
    const now = '2026-10-06T15:00:00.000Z';
    expect(formatRelative('2026-10-06T14:59:30.000Z', now)).toBe("à l'instant");
    expect(formatRelative('2026-10-06T14:55:00.000Z', now)).toBe('il y a 5 minutes');
    expect(formatRelative('2026-10-05T15:00:00.000Z', now)).toBe('hier');
    expect(formatRelative('2026-10-03T15:00:00.000Z', now)).toBe(`il y a 3${NBSP}jours`);
    expect(formatRelative('2026-09-20T15:00:00.000Z', now)).toBe('20 septembre 2026');
  });
});
