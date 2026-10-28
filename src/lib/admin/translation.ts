import type { TextTranslationStatus } from '@/lib/api/schema';

/**
 * Socle des versions anglaises saisies à la main dans le back-office (pages, paramètres, zones…), mêmes règles que
 * l'API (`src/common/i18n/text-translation.ts`) : seuls les textes viennent de l'anglais ; structure, nombres,
 * booléens et champs techniques sont ceux du français ; listes alignées par rang. Ce qui est un texte se règle par
 * `TextRules` : clés jamais traduites (`nonTextKeys`) et/ou liste blanche de chemins (`paths`, `*` = n'importe quel
 * rang ou clé). Module sans React, couvert par des tests unitaires.
 */

export type TextRules = {
  nonTextKeys?: ReadonlySet<string>;
  paths?: readonly string[];
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Chemin pointé d'un texte (`agency.addressLines.0`) conforme à la liste blanche (toujours vrai sans liste). */
export function isTextPath(path: string, rules: TextRules): boolean {
  if (rules.paths === undefined) return true;
  const segments = path.split('.');
  return rules.paths.some((pattern) => {
    const parts = pattern.split('.');
    return (
      parts.length === segments.length &&
      parts.every((part, index) => part === '*' || part === segments[index])
    );
  });
}

const join = (path: string, segment: string) => (path === '' ? segment : `${path}.${segment}`);

/**
 * Textes anglais posés sur la structure française : une chaîne française non vide (et textuelle) prend la chaîne
 * anglaise de même chemin si elle est renseignée ; listes élément par élément (nombre et ordre du français) ; tout
 * le reste du français. `keepEmpty` : une saisie anglaise vide est gardée telle quelle (valeur affichée dans un
 * éditeur : un champ vidé ne se remplit pas de nouveau avec le français pendant la saisie).
 */
export function composeTexts(
  french: unknown,
  english: unknown,
  rules: TextRules,
  options: { key?: string; keepEmpty?: boolean; path?: string } = {},
): unknown {
  const { key, keepEmpty = false, path = '' } = options;
  if (key !== undefined && rules.nonTextKeys?.has(key)) return french;
  if (typeof french === 'string') {
    if (french === '' || typeof english !== 'string' || !isTextPath(path, rules)) return french;
    return keepEmpty || english.trim() !== '' ? english : french;
  }
  if (Array.isArray(french)) {
    const list: unknown[] = Array.isArray(english) ? english : [];
    return french.map((item, index) =>
      composeTexts(item, list[index], rules, { keepEmpty, path: join(path, String(index)) }),
    );
  }
  if (isObject(french)) {
    const source = isObject(english) ? english : {};
    return Object.fromEntries(
      Object.entries(french).map(([field, value]) => [
        field,
        composeTexts(value, source[field], rules, { key: field, keepEmpty, path: join(path, field) }),
      ]),
    );
  }
  return french;
}

/** Textes de `value` (`[chemin, texte]` non vides, dans l'ordre du document) : ce qui se traduit. */
export function textEntries(value: unknown, rules: TextRules): [string, string][] {
  const texts: [string, string][] = [];
  const walk = (item: unknown, path: string, key?: string) => {
    if (key !== undefined && rules.nonTextKeys?.has(key)) return;
    if (typeof item === 'string') {
      if (item.trim() !== '' && isTextPath(path, rules)) texts.push([path, item]);
    } else if (Array.isArray(item)) {
      item.forEach((child, index) => walk(child, join(path, String(index))));
    } else if (isObject(item)) {
      for (const [field, child] of Object.entries(item)) walk(child, join(path, field), field);
    }
  };
  walk(value, '');
  return texts;
}

/** Valeur d'un chemin (`items.2.title`). */
export function getAt(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) return current[Number(segment)];
    return isObject(current) ? current[segment] : undefined;
  }, value);
}

/** Copie avec la valeur remplacée au chemin donné (le chemin doit exister). */
export function setAt<T>(value: T, path: string, next: unknown): T {
  const [head = '', ...rest] = path.split('.');
  const child = rest.length === 0 ? next : setAt(getAt(value, head), rest.join('.'), next);
  if (Array.isArray(value)) return value.map((item, index) => (index === Number(head) ? child : item)) as T;
  return { ...(value as object), [head]: child } as T;
}

/**
 * Copie avec la valeur posée au chemin donné, en créant les objets et listes manquants (version anglaise partielle :
 * `agency.addressLines.1` dans `{}`). Les rangs absents d'une liste valent `null`.
 */
export function setPath<T>(value: T, path: string, next: unknown): T {
  const [head = '', ...rest] = path.split('.');
  const index = /^\d+$/.test(head) ? Number(head) : null;
  const current =
    index === null
      ? isObject(value)
        ? value[head]
        : undefined
      : Array.isArray(value)
        ? value[index]
        : undefined;
  const child =
    rest.length === 0 ? next : setPath(current ?? (/^\d+$/.test(rest[0]!) ? [] : {}), rest.join('.'), next);
  if (index !== null) {
    const list: unknown[] = Array.isArray(value) ? [...(value as unknown[])] : [];
    while (list.length < index) list.push(null);
    list[index] = child;
    return list as T;
  }
  return { ...(isObject(value) ? value : {}), [head]: child } as T;
}

// ───────────────────────────── État de la traduction ─────────────────────────────

export type TranslationState = TextTranslationStatus['state'];

export type FieldTranslationState = 'missing' | 'outdated' | null;

/** Badge de l'onglet « English » : « À traduire », « À revoir », ou rien si la version anglaise est à jour. */
export function translationBadge(status: { state: TranslationState } | null | undefined): string | null {
  if (status?.state === 'MISSING') return 'À traduire';
  if (status?.state === 'OUTDATED') return 'À revoir';
  return null;
}

export const FIELD_STATE_LABELS: Record<Exclude<FieldTranslationState, null>, string> = {
  missing: 'À traduire',
  outdated: 'À revoir',
};

/** État d'un champ d'après le statut de l'API (`TextTranslationStatus`). */
export function fieldTranslationState(
  path: string,
  status: TextTranslationStatus | null | undefined,
): FieldTranslationState {
  if (status?.missingFields.includes(path)) return 'missing';
  if (status?.outdatedFields.includes(path)) return 'outdated';
  return null;
}

/**
 * Statut pendant l'édition : champs à traduire d'après la saisie locale (un champ saisi en anglais n'est plus « à
 * traduire », un texte français ajouté l'est), champs à revoir d'après l'API sauf ceux retouchés en anglais ou
 * marqués revus depuis le chargement (l'API les remet à jour à l'enregistrement).
 */
export function localTextStatus(
  fields: readonly { path: string; translated: boolean }[],
  server: TextTranslationStatus | null | undefined,
  settled: ReadonlySet<string> = new Set(),
): TextTranslationStatus {
  const missingFields = fields.filter((field) => !field.translated).map((field) => field.path);
  const outdatedFields = fields
    .filter(
      (field) => field.translated && server?.outdatedFields.includes(field.path) && !settled.has(field.path),
    )
    .map((field) => field.path);
  const state: TranslationState =
    missingFields.length > 0 ? 'MISSING' : outdatedFields.length > 0 ? 'OUTDATED' : 'UP_TO_DATE';
  return { state, missingFields, outdatedFields };
}
