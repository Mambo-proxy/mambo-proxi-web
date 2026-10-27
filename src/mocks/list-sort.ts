import { problem } from './problem';

export type SortOrder<F extends string> = { field: F; direction: 'asc' | 'desc' };

/**
 * Paramètre `sort` d'une liste du back-office (`Sort` du contrat) : un des champs autorisés, préfixé de `-` pour
 * l'ordre décroissant ; absent ou vide = `fallback`. Champ non autorisé : `400` (`invalid-query`), comme l'API.
 */
export function parseSort<const F extends string>(
  params: URLSearchParams,
  fields: readonly F[],
  fallback: `${'' | '-'}${NoInfer<F>}`,
): { sort: SortOrder<F>; invalid: null } | { sort: null; invalid: Response } {
  const value = params.get('sort') || fallback;
  const field = value.replace(/^-/, '');
  if (!(fields as readonly string[]).includes(field))
    return {
      sort: null,
      invalid: problem(400, 'Vérifiez les paramètres de la requête.', [
        {
          path: 'sort',
          message: `Tri possible sur : ${fields.join(', ')} (préfixe « - » pour l’ordre décroissant).`,
        },
      ]),
    };
  return { sort: { field: field as F, direction: value.startsWith('-') ? 'desc' : 'asc' }, invalid: null };
}

type Key = string | number | null | undefined;

/**
 * Tri d'une liste comme l'API (PostgreSQL) : valeurs `null` en dernier en ordre croissant et en premier en ordre
 * décroissant, puis identifiant dans le même sens pour départager.
 */
export function sortBy<T extends { id: string }>(
  list: T[],
  direction: 'asc' | 'desc',
  key: (item: T) => Key,
  compare: (a: string | number, b: string | number) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0),
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const left = key(a);
    const right = key(b);
    const nullOrder =
      Number(left === null || left === undefined) - Number(right === null || right === undefined);
    if (nullOrder) return nullOrder * sign;
    const order =
      left === null || left === undefined || right === null || right === undefined ? 0 : compare(left, right);
    return (order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) * sign;
  });
}
