import { getAt, setPath, textEntries, type TextRules } from '@/lib/admin/translation';
import type { TextTranslationStatus } from '@/lib/api/schema';

/**
 * Version anglaise des services et des rubriques (onglet « English » de l'éditeur de service et du dialogue de
 * rubrique), mêmes règles que l'API (`CatalogTranslations`) : seuls les textes modifiables en français se traduisent
 * (l'icône des avantages reste celle du français) ; listes alignées par rang ; suivi par champ de premier niveau
 * (`steps` est « à traduire » s'il manque un de ses textes, « à revoir » si un texte français a changé). Module sans
 * React, partagé avec les gestionnaires simulés.
 */

export const CATALOG_TEXT_RULES: TextRules = { nonTextKeys: new Set(['icon']) };

/** Textes d'un service modifiables en anglais (`ServiceTexts`), dans l'ordre de l'éditeur. */
export const SERVICE_TEXT_UNITS = [
  'name',
  'tagline',
  'summary',
  'audiences',
  'steps',
  'advantages',
  'faq',
  'seoTitle',
  'seoDescription',
] as const;

/** Textes d'une rubrique modifiables en anglais (`CategoryTexts`), dans l'ordre du dialogue. */
export const CATEGORY_TEXT_UNITS = [
  'name',
  'tagline',
  'description',
  'eyebrow',
  'heroTitle',
  'heroLead',
  'audiencesTitle',
  'servicesTitle',
  'servicesLead',
  'processTitle',
  'ctaTitle',
  'ctaText',
  'homeCard',
  'seoTitle',
  'seoDescription',
] as const;

/** Textes anglais (forme partielle du français). */
export type EnglishTexts = Record<string, unknown>;

type FieldSpec = { label: string; maxLength?: number; multiline?: boolean; accent?: boolean };

/** Libellés et limites des textes, par chemin générique (`steps.*.title`, `*` = rang). */
const FIELD_SPECS: Record<string, FieldSpec> = {
  name: { label: 'Nom', maxLength: 120 },
  tagline: { label: 'Accroche', maxLength: 120 },
  summary: { label: 'Description courte (cartes et résultats)', maxLength: 240 },
  description: { label: 'Description', maxLength: 600, multiline: true },
  'audiences.*': { label: 'Public {n}', maxLength: 200 },
  'steps.*.title': { label: 'Étape {n} · Titre', maxLength: 120 },
  'steps.*.text': { label: 'Étape {n} · Texte', maxLength: 600, multiline: true },
  'advantages.*.title': { label: 'Avantage {n} · Titre', maxLength: 120 },
  'advantages.*.text': { label: 'Avantage {n} · Texte', maxLength: 600, multiline: true },
  'faq.*.question': { label: 'Question {n}', maxLength: 200 },
  'faq.*.answer': { label: 'Réponse {n}', maxLength: 2000, multiline: true },
  eyebrow: { label: 'Surtitre', maxLength: 60 },
  heroTitle: { label: 'Titre principal', maxLength: 400, accent: true },
  heroLead: { label: 'Texte d’introduction', maxLength: 400, multiline: true },
  audiencesTitle: { label: 'Titre de la partie « Pour qui ? »', maxLength: 160 },
  servicesTitle: { label: 'Titre de la liste des services', maxLength: 160 },
  servicesLead: { label: 'Texte sous la liste des services', maxLength: 300 },
  processTitle: { label: 'Titre de la partie « Comment ça marche ? »', maxLength: 160 },
  ctaTitle: { label: 'Titre de l’appel à l’action', maxLength: 120 },
  ctaText: { label: 'Texte de l’appel à l’action', maxLength: 300, multiline: true },
  'homeCard.title': { label: 'Titre de la carte', maxLength: 80 },
  'homeCard.text': { label: 'Texte de la carte', maxLength: 200, multiline: true },
  'homeCard.textMobile': { label: 'Texte court (mobile)', maxLength: 120 },
  'homeCard.chips.*': { label: 'Puce {n}', maxLength: 40 },
  seoTitle: { label: 'Titre pour Google', maxLength: 60 },
  seoDescription: { label: 'Description pour Google', maxLength: 160, multiline: true },
};

/** Libellés des champs de premier niveau qui regroupent plusieurs textes. */
export const UNIT_LABELS: Record<string, string> = {
  audiences: 'Publics',
  steps: 'Étapes',
  advantages: 'Avantages',
  faq: 'Questions fréquentes',
  homeCard: 'Carte de la page d’accueil',
};

export type CatalogTextField = FieldSpec & {
  /** Chemin du texte (`steps.1.title`). */
  path: string;
  /** Champ de premier niveau (unité du suivi). */
  unit: string;
  /** Texte français de référence. */
  french: string;
};

const unitOf = (path: string) => path.split('.')[0]!;
const genericPath = (path: string) => path.replace(/\.\d+(?=\.|$)/g, '.*');

/** Limite de longueur d'un texte anglais (celle du français) ; `undefined` pour un chemin inconnu. */
export function catalogMaxLength(path: string): number | undefined {
  return FIELD_SPECS[genericPath(path)]?.maxLength;
}

/** Textes français modifiables d'une valeur (`{ champ: valeur }` limité aux unités). */
export function frenchTexts(units: readonly string[], value: object): EnglishTexts {
  const source = value as Record<string, unknown>;
  return Object.fromEntries(units.map((unit) => [unit, source[unit] ?? null]));
}

/** Textes français à traduire, dans l'ordre des unités puis du document. */
export function catalogTextFields(units: readonly string[], value: object): CatalogTextField[] {
  const entries = textEntries(frenchTexts(units, value), CATALOG_TEXT_RULES);
  return units.flatMap((unit) =>
    entries
      .filter(([path]) => unitOf(path) === unit)
      .map(([path, french]) => {
        const spec = FIELD_SPECS[genericPath(path)] ?? { label: path };
        const rank = path.split('.').find((segment) => /^\d+$/.test(segment));
        return {
          ...spec,
          label: spec.label.replace('{n}', rank === undefined ? '' : String(Number(rank) + 1)),
          path,
          unit,
          french,
        };
      }),
  );
}

/** Texte anglais saisi pour un chemin (`''` sans traduction). */
export function englishAt(english: EnglishTexts | null | undefined, path: string): string {
  const value = getAt(english, path);
  return typeof value === 'string' ? value : '';
}

/** Saisie d'un texte anglais. */
export function editEnglish(
  english: EnglishTexts | null | undefined,
  path: string,
  value: string,
): EnglishTexts {
  return setPath(english ?? {}, path, value);
}

/**
 * Textes anglais à envoyer (`translations.en`) : chemins dont le français est renseigné, texte non vide (coupé) ;
 * `null` si rien n'est traduit.
 */
export function englishPayload(
  units: readonly string[],
  french: object,
  english: EnglishTexts | null | undefined,
): EnglishTexts | null {
  let result: EnglishTexts | null = null;
  for (const field of catalogTextFields(units, french)) {
    const text = englishAt(english, field.path).trim();
    if (text !== '') result = setPath(result ?? {}, field.path, text);
  }
  return result;
}

/** Valeur anglaise d'une unité (comparaison « retouchée depuis l'enregistrement »). */
const unitValue = (english: EnglishTexts | null | undefined, unit: string) =>
  JSON.stringify(getAt(english, unit) ?? null);

/**
 * Statut pendant l'édition, par unité : « à traduire » d'après la saisie (un texte français sans anglais), « à
 * revoir » d'après l'API sauf les unités retouchées en anglais (`saved` : version anglaise du dernier
 * enregistrement) ou marquées revues depuis.
 */
export function localCatalogStatus(options: {
  units: readonly string[];
  french: object;
  english: EnglishTexts | null | undefined;
  saved: EnglishTexts | null | undefined;
  server: TextTranslationStatus | null | undefined;
  reviewed: readonly string[];
}): TextTranslationStatus {
  const { units, french, english, saved, server, reviewed } = options;
  const fields = catalogTextFields(units, french);
  const present = units.filter((unit) => fields.some((field) => field.unit === unit));
  const missingFields = present.filter((unit) =>
    fields.some((field) => field.unit === unit && englishAt(english, field.path).trim() === ''),
  );
  const outdatedFields = present.filter(
    (unit) =>
      !missingFields.includes(unit) &&
      server?.outdatedFields.includes(unit) &&
      !reviewed.includes(unit) &&
      unitValue(english, unit) === unitValue(saved, unit),
  );
  const state = missingFields.length > 0 ? 'MISSING' : outdatedFields.length > 0 ? 'OUTDATED' : 'UP_TO_DATE';
  return { state, missingFields, outdatedFields };
}

/** État d'un texte dans l'onglet anglais : à traduire s'il est vide, sinon celui de son unité. */
export function catalogFieldState(
  field: Pick<CatalogTextField, 'path' | 'unit'>,
  english: EnglishTexts | null | undefined,
  status: TextTranslationStatus,
): 'missing' | 'outdated' | null {
  if (englishAt(english, field.path).trim() === '') return 'missing';
  return status.outdatedFields.includes(field.unit) ? 'outdated' : null;
}
