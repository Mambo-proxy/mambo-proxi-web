import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Visual as VisualData } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { isRemoteMedia, mediaSources } from '@/lib/media/image';

type Scene = VisualData['illustration'];

/**
 * Couleur dominante de chaque scène (qa/raw-exports/illustrations/dominant-colors.json), affichée
 * pendant le chargement. Toutes correspondent à un token, sauf la scène nocturne « culture ».
 */
const FALLBACK: Record<Scene, string> = {
  accueil: 'var(--mp-color-orange-100)',
  chef: 'var(--mp-color-orange-100)',
  colis: 'var(--mp-color-neutral-100)',
  courses: 'var(--mp-color-orange-50)',
  culture: '#3a2a20',
  equipe: 'var(--mp-color-vert-100)',
  evenement: 'var(--mp-color-orange-100)',
  formation: 'var(--mp-color-orange-50)',
  livraison: 'var(--mp-color-vert-100)',
  logement: 'var(--mp-color-neutral-100)',
  marche: 'var(--mp-color-vert-100)',
  massage: 'var(--mp-color-orange-50)',
  photo: 'var(--mp-color-vert-100)',
  portrait: 'var(--mp-color-orange-100)',
  voiture: 'var(--mp-color-orange-50)',
};

type VisualProps = {
  visual: VisualData;
  /** Largeurs d'affichage pour le choix de la variante (attribut `sizes` de `next/image`). */
  sizes: string;
  /**
   * Image au-dessus de la ligne de flottaison (héros, élément LCP) : préchargée depuis `<head>` et demandée en
   * priorité haute (`fetchpriority="high"`), sans chargement différé. Une seule image prioritaire par page.
   */
  priority?: boolean;
  /** Le cadre (taille, rayon, ombre, bordure) reprend celui de la maquette. */
  className?: string;
};

/** Attributs `next/image` d'une image prioritaire (`priority`, déprécié depuis Next 16, est remplacé par `preload`). */
const PRIORITY_PROPS = { preload: true, fetchPriority: 'high' } as const;

/**
 * Emplacement « photo » (docs/02 §6) : affiche l'illustration provisoire tant qu'aucune image n'est fournie
 * par le back-office, puis l'image, sans changer la mise en page (`object-fit: cover`, point focal).
 */
export function Visual({ visual, sizes, priority = false, className }: VisualProps) {
  const style: CSSProperties = { backgroundColor: FALLBACK[visual.illustration] };
  const image = visual.image;
  const sources = image ? mediaSources(image) : null;
  const objectPosition = image?.focalPoint
    ? `${(image.focalPoint.x ?? 0.5) * 100}% ${(image.focalPoint.y ?? 0.5) * 100}%`
    : undefined;
  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      {image && sources ? (
        // Image de la médiathèque : variantes AVIF / WebP produites par l'API, choisies par le navigateur.
        <picture>
          {sources.avif && <source type="image/avif" srcSet={sources.avif} sizes={sizes} />}
          {sources.webp && <source type="image/webp" srcSet={sources.webp} sizes={sizes} />}
          <img
            src={image.url}
            alt={visual.alt ?? image.alt ?? ''}
            width={image.width || undefined}
            height={image.height || undefined}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 size-full object-cover"
            style={{
              objectPosition,
              ...(image.blurDataUrl
                ? { backgroundImage: `url(${image.blurDataUrl})`, backgroundSize: 'cover' }
                : {}),
            }}
          />
        </picture>
      ) : image ? (
        <Image
          src={image.url}
          alt={visual.alt ?? image.alt ?? ''}
          fill
          sizes={sizes}
          {...(priority ? PRIORITY_PROPS : {})}
          placeholder={image.blurDataUrl ? 'blur' : 'empty'}
          blurDataURL={image.blurDataUrl ?? undefined}
          // Fichier de l'API sans variante (SVG, traitement en cours) : servi tel quel.
          unoptimized={isRemoteMedia(image.url)}
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
        />
      ) : (
        <Image
          src={`/illustrations/${visual.illustration}.svg`}
          alt={visual.alt ?? ''}
          fill
          sizes={sizes}
          {...(priority ? PRIORITY_PROPS : {})}
          unoptimized
          className="object-cover"
        />
      )}
    </div>
  );
}
