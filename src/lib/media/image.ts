import type { MediaImage } from '@/lib/api/schema';

type Variant = MediaImage['variants'][number];

/**
 * Adresse servie par le stockage des médias de l'API (`MEDIA_PUBLIC_URL`, ex. `http://localhost:4000/v1/media/…`),
 * par opposition aux photos livrées avec le site (`/photos/…`), optimisées par `next/image`.
 */
export function isRemoteMedia(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}

/** `srcset` d'un format (`480w, 960w, 1600w`), ou `null` si l'API n'a pas produit de variante dans ce format. */
function srcSet(variants: Variant[], format: Variant['format']): string | null {
  const items = variants
    .filter((variant) => variant.format === format)
    .sort((a, b) => a.width - b.width)
    .map((variant) => `${variant.url} ${String(variant.width)}w`);
  return items.length > 0 ? items.join(', ') : null;
}

/**
 * Variantes produites par l'API pour une image de la médiathèque (AVIF et WebP en 480, 960 et 1600 px) : servies
 * telles quelles par `<picture>` plutôt que réencodées par l'optimiseur de Next.js (qui refuse en outre les adresses
 * du réseau local en développement). `null` sans variante (SVG, traitement en cours, photo livrée avec le site).
 */
export function mediaSources(image: MediaImage): { avif: string | null; webp: string | null } | null {
  // Les photos livrées avec le site (et certaines données simulées) n'ont pas de liste de variantes.
  const variants = image.variants ?? [];
  if (variants.length === 0) return null;
  const avif = srcSet(variants, 'avif');
  const webp = srcSet(variants, 'webp');
  return avif || webp ? { avif, webp } : null;
}

/** Plus petite variante WebP (sinon AVIF) d'au moins `minWidth` px, sinon l'original (logos des partenaires). */
export function variantUrl(image: MediaImage, minWidth: number): string {
  const sorted = [...(image.variants ?? [])].sort((a, b) => a.width - b.width);
  const pick = (format: Variant['format']) =>
    sorted.find((variant) => variant.format === format && variant.width >= minWidth);
  return (pick('webp') ?? pick('avif'))?.url ?? image.url;
}
