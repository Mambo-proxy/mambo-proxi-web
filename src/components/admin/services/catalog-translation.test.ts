import { describe, expect, it } from 'vitest';
import {
  catalogFieldState,
  catalogTextFields,
  CATEGORY_TEXT_UNITS,
  editEnglish,
  englishPayload,
  localCatalogStatus,
  SERVICE_TEXT_UNITS,
} from './catalog-translation';

const service = {
  name: 'Chef privé',
  tagline: 'Un chef chez vous',
  summary: '',
  audiences: ['Particuliers'],
  steps: [{ title: 'Votre demande', text: 'Décrivez votre repas.' }],
  advantages: [{ icon: 'ChefHat', title: 'Sur mesure', text: 'Menu adapté.' }],
  faq: [],
  seoTitle: 'Chef privé | MAMBO Proxi',
  seoDescription: null,
  slug: 'chef-prive',
};

describe('version anglaise des services et des rubriques', () => {
  it('liste les textes français modifiables (sans icône ni texte vide), avec leurs libellés', () => {
    expect(catalogTextFields(SERVICE_TEXT_UNITS, service).map((field) => [field.path, field.label])).toEqual([
      ['name', 'Nom'],
      ['tagline', 'Accroche'],
      ['audiences.0', 'Public 1'],
      ['steps.0.title', 'Étape 1 · Titre'],
      ['steps.0.text', 'Étape 1 · Texte'],
      ['advantages.0.title', 'Avantage 1 · Titre'],
      ['advantages.0.text', 'Avantage 1 · Texte'],
      ['seoTitle', 'Titre pour Google'],
    ]);
    const category = {
      name: 'Expérience',
      homeCard: { title: 'Des moments', chips: ['Chef privé', 'Massage'] },
    };
    expect(catalogTextFields(CATEGORY_TEXT_UNITS, category).map((field) => field.label)).toEqual([
      'Nom',
      'Titre de la carte',
      'Puce 1',
      'Puce 2',
    ]);
  });

  it('envoie les seuls textes traduits, coupés, de la forme du français', () => {
    let english = editEnglish({}, 'name', ' Private chef ');
    english = editEnglish(english, 'steps.0.text', 'Describe your meal.');
    english = editEnglish(english, 'summary', 'Ignoré : pas de français');
    english = editEnglish(english, 'tagline', '   ');
    expect(englishPayload(SERVICE_TEXT_UNITS, service, english)).toEqual({
      name: 'Private chef',
      steps: [{ text: 'Describe your meal.' }],
    });
    expect(englishPayload(SERVICE_TEXT_UNITS, service, {})).toBeNull();
  });

  it('statut pendant l’édition : à traduire d’après la saisie, à revoir d’après l’API sauf retouche ou revue', () => {
    const saved = {
      name: 'Private chef',
      tagline: 'A chef at home',
      audiences: ['Individuals'],
      steps: [{ title: 'Your request', text: 'Describe your meal.' }],
      advantages: [{ title: 'Tailor-made', text: 'Adapted menu.' }],
      seoTitle: 'Private chef | MAMBO Proxi',
    };
    const server = { state: 'OUTDATED' as const, missingFields: [], outdatedFields: ['steps', 'name'] };
    const status = (english: Record<string, unknown>, reviewed: string[] = []) =>
      localCatalogStatus({ units: SERVICE_TEXT_UNITS, french: service, english, saved, server, reviewed });

    expect(status(saved)).toEqual({
      state: 'OUTDATED',
      missingFields: [],
      outdatedFields: ['name', 'steps'],
    });
    // Étape retouchée en anglais, nom marqué revu : plus rien à revoir.
    const edited = editEnglish(saved, 'steps.0.text', 'Tell us about your meal.');
    expect(status(edited, ['name'])).toEqual({ state: 'UP_TO_DATE', missingFields: [], outdatedFields: [] });
    // Texte anglais vidé : à traduire.
    const cleared = editEnglish(saved, 'audiences.0', '');
    expect(status(cleared).missingFields).toEqual(['audiences']);
    expect(catalogFieldState({ path: 'audiences.0', unit: 'audiences' }, cleared, status(cleared))).toBe(
      'missing',
    );
    expect(catalogFieldState({ path: 'steps.0.title', unit: 'steps' }, saved, status(saved))).toBe(
      'outdated',
    );
  });
});
