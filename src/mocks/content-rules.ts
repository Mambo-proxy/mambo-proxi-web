import type { FieldErrors } from './problem';

/**
 * Règles communes des contenus du back-office simulé, reprises de l'API : ordre (`ReorderInput`), verrouillage
 * optimiste (`If-Match`), corps sans modification, longueurs maximales, jetons et adresses d'aperçu.
 */

/** Durée de validité d'un jeton d'aperçu (API : `PREVIEW_TOKEN_TTL_MS`, 30 minutes). */
export const PREVIEW_TOKEN_TTL_MS = 30 * 60_000;

/** Adresse du site pour l'aperçu : celle du document qui exécute les mocks, sinon le domaine de production. */
export const siteOrigin = () =>
  typeof location !== 'undefined' && location.origin.startsWith('http')
    ? location.origin
    : 'https://mamboproxi.com';

/** Adresse d'aperçu sur le site : `?preview=` avant l'éventuelle ancre (`#formules`), comme l'API. */
export function previewUrl(path: string, token: string): string {
  const [pathname = '', hash] = path.split('#');
  const url = new URL(pathname, siteOrigin());
  url.searchParams.set('preview', token);
  if (hash !== undefined) url.hash = hash;
  return url.toString();
}

/** Version attendue d'un en-tête `If-Match` (guillemets et `W/` acceptés, `*` ignoré). */
export function parseIfMatch(header: string | null): string | undefined {
  if (header === null || header.trim() === '' || header.trim() === '*') return undefined;
  return header
    .trim()
    .replace(/^W\//, '')
    .replace(/^"(.*)"$/, '$1');
}

/** Contrôles du schéma `ReorderInput` (liste non vide, sans doublon). */
export function reorderInputErrors(ids: unknown): FieldErrors {
  if (!Array.isArray(ids) || ids.length === 0)
    return [{ path: 'ids', code: ids === undefined ? 'required' : 'too_few', message: 'Ordre manquant.' }];
  if (ids.some((id) => typeof id !== 'string' || id === ''))
    return [{ path: 'ids', code: 'invalid_type', message: 'Saisissez un texte.' }];
  if (new Set(ids).size !== ids.length)
    return [{ path: 'ids', code: 'invalid', message: 'Un élément figure deux fois dans l’ordre.' }];
  return [];
}

/** Corps de mise à jour partielle sans aucun champ (règle `Aucune modification envoyée.` des schémas de l'API). */
export function nothingSent(body: object): FieldErrors {
  return Object.values(body).some((value) => value !== undefined)
    ? []
    : [{ path: '', code: 'invalid', message: 'Aucune modification envoyée.' }];
}

/** Texte trop long : message de l'API (`frenchErrorMap`). */
export function tooLong(errors: FieldErrors, path: string, value: unknown, max: number) {
  if (typeof value === 'string' && value.trim().length > max)
    errors.push({ path, code: 'too_long', message: `Saisissez au plus ${max} caractères.` });
}

/** Liste trop longue : message propre au champ, ou celui de l'API. */
export function tooMany(errors: FieldErrors, path: string, value: unknown, max: number, message?: string) {
  if (Array.isArray(value) && value.length > max)
    errors.push({ path, code: 'too_many', message: message ?? `Sélectionnez au plus ${max} éléments.` });
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug envoyé (schéma `Slug`) : forme et longueur. */
export function slugErrors(errors: FieldErrors, value: unknown) {
  if (value === undefined) return;
  if (typeof value !== 'string' || !SLUG_PATTERN.test(value.trim()))
    errors.push({
      path: 'slug',
      code: 'invalid_format',
      message: 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement.',
    });
  else tooLong(errors, 'slug', value, 120);
}

/** Liste d'identifiants sans doublon (le premier est gardé), comme `idList` de l'API. */
export const uniqueIds = (ids: string[] | undefined) => (ids === undefined ? undefined : [...new Set(ids)]);
