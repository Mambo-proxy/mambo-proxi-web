import type { CurrentUser, UserRef } from '@/lib/api/schema';

/** Texte comparable sans accents ni casse (recherches simulées). */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Vrai si `q` (paramètre de recherche) est vide ou contenu dans l'un des textes. */
export function matches(q: string | null, ...texts: (string | null | undefined)[]): boolean {
  if (!q) return true;
  return normalize(texts.filter(Boolean).join(' ')).includes(normalize(q));
}

/** Page `{ data, meta }` d'une liste (paramètres `page` et `pageSize` du contrat, 20 par défaut, 100 au plus). */
export function paginate<T>(list: T[], params: URLSearchParams, defaultPageSize = 20) {
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(params.get('pageSize') ?? defaultPageSize) || defaultPageSize),
  );
  return {
    data: list.slice((page - 1) * pageSize, page * pageSize),
    meta: { page, pageSize, total: list.length, totalPages: Math.max(1, Math.ceil(list.length / pageSize)) },
  };
}

/** Auteur d'une action (`UserRef`) à partir de l'utilisateur de la session simulée. */
export function actorOf(user: CurrentUser | null): UserRef | null {
  return user ? { id: user.id, name: user.name, initials: user.initials ?? '' } : null;
}

/** Identifiant simulé unique (`svc_k3f9x2`). */
export function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Longueur maximale d'un slug (schéma `Slug` du contrat). */
const SLUG_MAX_LENGTH = 120;

/**
 * Slug d'URL tiré d'un libellé, comme l'API (`src/common/text/slug.ts`) : minuscules sans accents, ligatures
 * dépliées, 120 caractères au plus (« Visites guidées de Douala » → `visites-guidees-de-douala`).
 */
export function slugify(value: string, maxLength = SLUG_MAX_LENGTH): string {
  return normalize(value)
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/, '');
}

/** Premier slug libre parmi `base`, `base-2`, `base-3`… (`taken` : slugs déjà utilisés), comme l'API. */
export function uniqueSlug(base: string, taken: (slug: string) => boolean, fallback = 'contenu'): string {
  const root = base === '' ? fallback : base;
  if (!taken(root)) return root;
  for (let index = 2; ; index += 1) {
    const suffix = `-${index}`;
    const candidate = `${root.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/, '')}${suffix}`;
    if (!taken(candidate)) return candidate;
  }
}

/** Date ISO décalée de `days` jours et `hours` heures par rapport à maintenant (données de démonstration). */
export function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();
}

/** Corps JSON d'une requête simulée (objet vide si absent). */
export async function jsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
