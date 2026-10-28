import { getAt, localTextStatus, setPath, textEntries, type TextRules } from '@/lib/admin/translation';
import type { TextTranslationStatus } from '@/lib/api/schema';

/**
 * Suivi simulé des versions anglaises champ par champ (paramètres, zones, services, rubriques), mêmes règles que l'API
 * (`src/common/i18n/text-translation.ts`) : à la place d'une empreinte, chaque champ traduit garde le texte
 * français qu'il traduit (`sources`) ; un texte français différent le signale « à revoir ».
 */

export type MockTextTranslation = {
  /** Textes anglais, de la forme partielle du français ; `null` sans traduction. */
  en: Record<string, unknown> | null;
  /** Texte français traduit, par chemin. */
  sources: Record<string, string>;
};

const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value : null);

/** Textes anglais réduits aux chemins textuels dont le français est renseigné ; `null` si rien n'est traduit. */
export function pickEnglish(
  french: unknown,
  english: unknown,
  rules: TextRules,
): Record<string, unknown> | null {
  let result: Record<string, unknown> | null = null;
  for (const [path] of textEntries(french, rules)) {
    const value = text(getAt(english, path));
    if (value !== null) result = setPath(result ?? {}, path, value);
  }
  return result;
}

/** Statut de la traduction (`TextTranslationStatus`) ; un champ sans texte français d'origine est à jour. */
export function mockTextStatus(
  french: unknown,
  translation: MockTextTranslation,
  rules: TextRules,
): TextTranslationStatus {
  const entries = textEntries(french, rules);
  const fields = entries.map(([path]) => ({ path, translated: text(getAt(translation.en, path)) !== null }));
  const outdatedFields = entries
    .filter(([path, value]) => translation.sources[path] !== undefined && translation.sources[path] !== value)
    .map(([path]) => path);
  return localTextStatus(fields, { state: 'UP_TO_DATE', missingFields: [], outdatedFields });
}

/**
 * Enregistrement : textes envoyés (`english`, `undefined` = inchangés) réduits aux chemins textuels ; texte français
 * de référence mis à jour pour un texte anglais nouveau, modifié ou revu, gardé sinon.
 */
export function saveMockTranslation(options: {
  french: unknown;
  previousFrench: unknown;
  before: MockTextTranslation;
  english: unknown;
  reviewed: readonly string[];
  rules: TextRules;
}): MockTextTranslation {
  const { french, previousFrench, before, reviewed, rules } = options;
  const english = options.english === undefined ? before.en : options.english;
  const en = pickEnglish(french, english, rules);
  const sources: Record<string, string> = {};
  for (const [path, value] of textEntries(french, rules)) {
    const translated = text(getAt(en, path));
    if (translated === null) continue;
    const unchanged = text(getAt(before.en, path)) === translated;
    sources[path] =
      reviewed.includes(path) || !unchanged
        ? value
        : (before.sources[path] ?? text(getAt(previousFrench, path)) ?? value);
  }
  return { en, sources };
}

/** `reviewedFields` : chemins sans texte anglais (`422`, chemin `<base>.N`). */
export function unknownReviewedFields(
  french: unknown,
  english: unknown,
  reviewed: readonly string[],
  rules: TextRules,
  basePath: string,
) {
  const translated = new Set(
    textEntries(french, rules)
      .map(([path]) => path)
      .filter((path) => text(getAt(english, path)) !== null),
  );
  return reviewed.flatMap((path, index) =>
    translated.has(path)
      ? []
      : [
          {
            path: `${basePath}.${index}`,
            code: 'unknown_field',
            message: 'Ce champ n’a pas de traduction anglaise à marquer comme revue.',
          },
        ],
  );
}

// ─────────────── Suivi par champ de premier niveau (services, rubriques) ───────────────

const unitOf = (path: string) => path.split('.')[0]!;

/**
 * Statut par champ de premier niveau (`CatalogTranslationStatus`) : « à traduire » s'il manque un de ses textes,
 * sinon « à revoir » si l'un de ses textes français a changé depuis sa traduction.
 */
export function mockUnitStatus(
  french: unknown,
  translation: MockTextTranslation,
  rules: TextRules,
): TextTranslationStatus {
  const entries = textEntries(french, rules);
  const units = [...new Set(entries.map(([path]) => unitOf(path)))];
  const own = (unit: string) => entries.filter(([path]) => unitOf(path) === unit);
  const missingFields = units.filter((unit) =>
    own(unit).some(([path]) => text(getAt(translation.en, path)) === null),
  );
  const outdatedFields = units.filter(
    (unit) =>
      !missingFields.includes(unit) &&
      own(unit).some(
        ([path, value]) => translation.sources[path] !== undefined && translation.sources[path] !== value,
      ),
  );
  const state = missingFields.length > 0 ? 'MISSING' : outdatedFields.length > 0 ? 'OUTDATED' : 'UP_TO_DATE';
  return { state, missingFields, outdatedFields };
}

/** Chemins des textes des champs de premier niveau donnés (`reviewedFields` → chemins revus). */
export function unitPaths(french: unknown, rules: TextRules, units: readonly string[]): string[] {
  return textEntries(french, rules)
    .map(([path]) => path)
    .filter((path) => units.includes(unitOf(path)));
}

/** `reviewedFields` d'un service ou d'une rubrique : champs sans aucun texte anglais (`422`, `<base>.N`). */
export function unknownReviewedUnits(
  french: unknown,
  english: unknown,
  reviewed: readonly string[],
  rules: TextRules,
  basePath: string,
) {
  const translated = new Set(
    textEntries(french, rules)
      .filter(([path]) => text(getAt(english, path)) !== null)
      .map(([path]) => unitOf(path)),
  );
  return reviewed.flatMap((unit, index) =>
    translated.has(unit)
      ? []
      : [
          {
            path: `${basePath}.${index}`,
            code: 'unknown_field',
            message: 'Ce champ n’a pas de traduction anglaise à marquer comme revue.',
          },
        ],
  );
}
