import { describe, expect, it } from 'vitest';
import { previewRewrite } from './preview-routes';

const rewrite = (href: string) => previewRewrite(new URL(href, 'https://mamboproxi.com'))?.toString() ?? null;

describe('previewRewrite', () => {
  it('adresse d’aperçu française et anglaise (adresse traduite) → route d’aperçu de la langue', () => {
    expect(rewrite('/qui-sommes-nous?preview=abc')).toBe(
      'https://mamboproxi.com/fr/apercu/qui-sommes-nous?preview=abc',
    );
    expect(rewrite('/en/about-us?preview=abc')).toBe(
      'https://mamboproxi.com/en/apercu/qui-sommes-nous?preview=abc',
    );
    expect(rewrite('/?preview=abc')).toBe('https://mamboproxi.com/fr/apercu/accueil?preview=abc');
    expect(rewrite('/en?preview=abc')).toBe('https://mamboproxi.com/en/apercu/accueil?preview=abc');
    expect(rewrite('/en/legal-notice?preview=abc')).toBe(
      'https://mamboproxi.com/en/apercu/mentions-legales?preview=abc',
    );
  });

  it('sans jeton, Magazine (dynamique) ou page hors Pages & textes : aucune réécriture', () => {
    expect(rewrite('/qui-sommes-nous')).toBeNull();
    expect(rewrite('/qui-sommes-nous?preview=')).toBeNull();
    expect(rewrite('/magazine?preview=abc')).toBeNull();
    expect(rewrite('/services/experience/chef-prive?preview=abc')).toBeNull();
  });
});
