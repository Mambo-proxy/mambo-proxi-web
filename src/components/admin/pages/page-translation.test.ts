import { describe, expect, it } from 'vitest';
import type { PageDraftInput, PageSection } from '@/lib/api/schema';
import {
  buildEnglishInput,
  editEnglish,
  englishPreviewUrl,
  englishSectionsWithErrors,
  englishView,
  localTranslationStatus,
  publishWarning,
  sectionTranslationState,
  splitDraftErrors,
  translatableFields,
  translationBadge,
  type EnglishDraft,
} from './page-translation';

const hero: PageSection = {
  id: 'hero',
  type: 'hero',
  enabled: true,
  variant: 'page',
  title: 'Parlons de ==votre projet.==',
  lead: 'Nous vous répondons rapidement.',
  primaryCta: { label: 'Demander un devis', href: '/devis', external: false },
  visual: { illustration: 'accueil', image: null, alt: 'Une cuisine' },
  showWhatsapp: false,
};

const cards: PageSection = {
  id: 'cartes',
  type: 'cardGrid',
  enabled: true,
  layout: 'cards',
  columns: 3,
  title: 'Nos atouts',
  items: [
    { title: 'Confiance', text: 'Des intervenants vérifiés.', icon: 'ShieldCheck', number: '01' },
    { title: 'Proximité', text: null, icon: 'MapPin' },
  ],
  cta: null,
};

const automatic: PageSection = { id: 'moyens', type: 'dynamic', enabled: true, source: 'contact-cards' };

const emptyDraft = (sections: Record<string, PageSection> = {}): EnglishDraft => ({
  title: null,
  seo: { title: null, description: null },
  sections,
});

describe('champs à traduire', () => {
  it('liste les textes de la section, sans les champs techniques', () => {
    const fields = translatableFields(hero);
    expect(fields.map((field) => field.path)).toEqual(['title', 'lead', 'primaryCta.label', 'visual.alt']);
    expect(fields[0]).toMatchObject({ label: 'Titre', accent: true, group: null });
    expect(fields[2]).toMatchObject({ label: 'Bouton principal · Libellé', french: 'Demander un devis' });
  });

  it('regroupe les éléments de liste sous leur nom', () => {
    const fields = translatableFields(cards);
    expect(fields.map((field) => [field.path, field.group, field.label])).toEqual([
      ['title', null, 'Titre'],
      ['items.0.title', 'Carte 1', 'Titre'],
      ['items.0.text', 'Carte 1', 'Texte'],
      ['items.1.title', 'Carte 2', 'Titre'],
    ]);
    expect(translatableFields(automatic)).toEqual([]);
  });
});

describe('brouillon anglais envoyé', () => {
  it('pré-remplit une section non traduite avec le français, puis la rend traduite à la saisie', () => {
    const draft = emptyDraft();
    expect(englishView(hero, draft)).toBe(hero);
    const edited = editEnglish(draft, hero, 'title', 'Let’s talk about ==your project.==');
    expect(edited.sections.hero).toMatchObject({
      title: 'Let’s talk about ==your project.==',
      lead: 'Nous vous répondons rapidement.',
    });
  });

  it('n’envoie que les sections traduites, dans l’ordre du français, avec les champs non textuels du français', () => {
    const englishHero = {
      ...hero,
      title: 'Let’s talk',
      lead: '',
      primaryCta: { label: 'Get a quote', href: '/ancienne-adresse', external: true },
    } as PageSection;
    const draft: EnglishDraft = {
      title: '  ',
      seo: { title: 'Contact us', description: null },
      sections: { cartes: { ...cards, title: 'Our strengths' } as PageSection, hero: englishHero },
    };
    const french = [hero, automatic, { ...cards, columns: 2 } as PageSection];
    const input = buildEnglishInput(french, draft, { noindex: false, title: 'Contact' });
    expect(input.title).toBeNull();
    expect(input.seo).toEqual({ noindex: false, title: 'Contact us', description: null });
    expect(input.sections.map((section) => section.id)).toEqual(['hero', 'cartes']);
    expect(input.sections[0]).toMatchObject({
      type: 'hero',
      title: 'Let’s talk',
      lead: '',
      primaryCta: { label: 'Get a quote', href: '/devis', external: false },
    });
    expect(input.sections[1]).toMatchObject({ title: 'Our strengths', columns: 2 });
  });

  it('ignore une section anglaise dont le type ne correspond plus', () => {
    const draft = emptyDraft({ hero: { ...cards, id: 'hero' } as PageSection });
    expect(buildEnglishInput([hero], draft, undefined).sections).toEqual([]);
  });
});

describe('erreurs 422 de la version anglaise', () => {
  const input: PageDraftInput = {
    sections: [hero, automatic, cards],
    translations: { en: { sections: [hero, cards] } },
  };

  it('rattache translations.en.sections.N au rang de la section française', () => {
    const { french, english } = splitDraftErrors(
      {
        'sections.0.title': 'Ce champ est obligatoire.',
        'translations.en.sections.1.items.0.title': '160 caractères au maximum.',
        'translations.en.sections.0.type': 'Type différent.',
        'translations.en.title': '160 caractères au maximum.',
        'translations.en.seo.description': 'Trop long.',
      },
      input,
    );
    expect(french).toEqual({ 'sections.0.title': 'Ce champ est obligatoire.' });
    expect(english).toEqual({
      'en.sections.2.items.0.title': '160 caractères au maximum.',
      'en.sections.0': 'Type différent.',
      'en.title': '160 caractères au maximum.',
      'en.seo.description': 'Trop long.',
    });
    expect(englishSectionsWithErrors(english)).toEqual([0, 2]);
  });

  it('garde une erreur sur une section anglaise inconnue au niveau de la page', () => {
    const { english } = splitDraftErrors({ 'translations.en.sections.5.id': 'Inconnue.' }, input);
    expect(english).toEqual({ en: 'Inconnue.' });
  });
});

describe('état de la traduction', () => {
  const server = { state: 'OUTDATED' as const, missingSectionIds: [], outdatedSectionIds: ['hero'] };

  it('compte les sections à traduire et à revoir pendant l’édition', () => {
    const draft = emptyDraft({ hero });
    const status = localTranslationStatus([hero, automatic, cards], draft, server);
    expect(status).toEqual({ state: 'MISSING', missingSectionIds: ['cartes'], outdatedSectionIds: ['hero'] });
    expect(sectionTranslationState('cartes', status)).toBe('missing');
    expect(sectionTranslationState('hero', status)).toBe('outdated');
    expect(sectionTranslationState('moyens', status)).toBeNull();
    // Section retouchée en anglais : plus « à revoir » (l'API la remet à jour à l'enregistrement).
    expect(localTranslationStatus([hero], draft, server, new Set(['hero'])).state).toBe('UP_TO_DATE');
  });

  it('affiche le badge de l’onglet anglais et l’avertissement de publication', () => {
    expect(translationBadge({ state: 'MISSING' })).toBe('À traduire');
    expect(translationBadge({ state: 'OUTDATED' })).toBe('À revoir');
    expect(translationBadge({ state: 'UP_TO_DATE' })).toBeNull();
    expect(
      publishWarning({ state: 'MISSING', missingSectionIds: ['a', 'b'], outdatedSectionIds: ['c'] }),
    ).toBe(
      'La version anglaise n’est pas à jour\u00A0: 2\u00A0sections à traduire, 1\u00A0section à revoir. Publier quand même\u00A0?',
    );
    expect(publishWarning({ state: 'UP_TO_DATE', missingSectionIds: [], outdatedSectionIds: [] })).toBeNull();
  });
});

describe('aperçu en anglais', () => {
  it('garde le jeton et passe à l’adresse anglaise de la page', () => {
    expect(englishPreviewUrl('https://mamboproxi.fr/qui-sommes-nous?preview=abc')).toBe(
      'https://mamboproxi.fr/en/about-us?preview=abc',
    );
    expect(englishPreviewUrl('https://mamboproxi.fr/?preview=abc')).toBe(
      'https://mamboproxi.fr/en?preview=abc',
    );
  });
});
