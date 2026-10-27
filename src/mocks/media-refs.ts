import { adminMedia } from './handlers/admin-media';
import type { FieldErrors } from './problem';

/**
 * Images référencées par les contenus du back-office simulé, contrôlées comme dans l'API
 * (`src/modules/media/media-refs.ts`) : un identifiant inconnu de la médiathèque → 422 avec le chemin du champ.
 *
 * Les photos des données d'amorçage (fiches, pages) font partie de la médiathèque de l'API (le seed les y dépose) ;
 * la médiathèque simulée ne liste que les illustrations, ces photos sont donc retenues à part comme connues.
 */

export const UNKNOWN_MEDIA_MESSAGE = 'Cette image n’existe pas dans la médiathèque.';

export type MediaReference = { path: string; id: string | null | undefined };

const seedImages = new Set<string>();

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Identifiant de l'image d'un visuel (`{ illustration, image: { id } }` ou référence `{ imageId }`). */
function visualImageId(value: Record<string, unknown>): string | null {
  if (typeof value.imageId === 'string') return value.imageId;
  if ('illustration' in value && isObject(value.image) && typeof value.image.id === 'string')
    return value.image.id;
  return null;
}

/** Images des visuels contenus dans `value`, avec leur chemin (`sections.0.visual.image`). */
export function visualReferences(
  value: unknown,
  path: string,
  into: MediaReference[] = [],
): MediaReference[] {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visualReferences(item, `${path}.${index}`, into));
  } else if (isObject(value)) {
    const id = visualImageId(value);
    if (id !== null) into.push({ path: `${path}.image`, id });
    for (const [key, item] of Object.entries(value)) {
      if (key !== 'image') visualReferences(item, `${path}.${key}`, into);
    }
  }
  return into;
}

/** Retient les images des données d'amorçage (visuels, photos de couverture) comme présentes dans la médiathèque. */
export function rememberSeedImages(value: unknown): void {
  for (const reference of visualReferences(value, '')) if (reference.id) seedImages.add(reference.id);
  const walk = (item: unknown) => {
    if (Array.isArray(item)) item.forEach(walk);
    else if (isObject(item)) {
      if (isObject(item.coverImage) && typeof item.coverImage.id === 'string')
        seedImages.add(item.coverImage.id);
      Object.values(item).forEach(walk);
    }
  };
  walk(value);
}

export function isKnownMedia(id: string): boolean {
  return seedImages.has(id) || adminMedia.some((media) => media.id === id);
}

/** Erreurs des images inconnues (`unknown_media`), dans l'ordre des références. */
export function unknownMediaErrors(references: readonly MediaReference[]): FieldErrors {
  return references
    .filter((reference) => typeof reference.id === 'string' && !isKnownMedia(reference.id))
    .map((reference) => ({ path: reference.path, code: 'unknown_media', message: UNKNOWN_MEDIA_MESSAGE }));
}
