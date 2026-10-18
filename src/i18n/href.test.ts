import { describe, expect, it } from 'vitest';
import { localizeHref, parseSitePath } from './href';

describe('localizeHref', () => {
  it('français : adresses inchangées', () => {
    expect(localizeHref('/qui-sommes-nous', 'fr')).toBe('/qui-sommes-nous');
    expect(localizeHref('/', 'fr')).toBe('/');
    expect(localizeHref('/contact#rendez-vous', 'fr')).toBe('/contact#rendez-vous');
  });

  it('anglais : préfixe et adresses traduites, ancre et paramètres conservés', () => {
    expect(localizeHref('/', 'en')).toBe('/en');
    expect(localizeHref('/qui-sommes-nous#equipe', 'en')).toBe('/en/about-us#equipe');
    expect(localizeHref('/devis?service=chef-prive', 'en')).toBe('/en/free-quote?service=chef-prive');
    expect(localizeHref('/recrutement/chef-de-cuisine', 'en')).toBe('/en/careers/chef-de-cuisine');
    expect(localizeHref('/questionnaire/merci', 'en')).toBe('/en/survey/thank-you');
    expect(localizeHref('/services/experience/chef-prive', 'en')).toBe('/en/services/experience/chef-prive');
  });

  it('adresse inconnue : simple préfixe', () => {
    expect(localizeHref('/nouvelle-page', 'en')).toBe('/en/nouvelle-page');
  });

  it('liens externes, back-office et fichiers inchangés', () => {
    expect(localizeHref('https://wa.me/237600000000', 'en')).toBe('https://wa.me/237600000000');
    expect(localizeHref('mailto:contact@mamboproxi.com', 'en')).toBe('mailto:contact@mamboproxi.com');
    expect(localizeHref('/admin/demandes', 'en')).toBe('/admin/demandes');
    expect(localizeHref('/brand/logo-horizontal.svg', 'en')).toBe('/brand/logo-horizontal.svg');
  });
});

describe('parseSitePath', () => {
  it('retrouve la langue et l’adresse interne', () => {
    expect(parseSitePath('/')).toEqual({ locale: 'fr', internal: '/' });
    expect(parseSitePath('/qui-sommes-nous')).toEqual({ locale: 'fr', internal: '/qui-sommes-nous' });
    expect(parseSitePath('/en')).toEqual({ locale: 'en', internal: '/' });
    expect(parseSitePath('/en/about-us')).toEqual({ locale: 'en', internal: '/qui-sommes-nous' });
    expect(parseSitePath('/en/careers/chef-de-cuisine')).toEqual({
      locale: 'en',
      internal: '/recrutement/chef-de-cuisine',
    });
  });
});
