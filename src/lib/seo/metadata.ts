import type { Metadata } from 'next';
import type { Seo } from '@/lib/api/schema';
import { SITE_NAME } from './site';

/** Image de partage générée (`src/app/opengraph-image.tsx`), utilisée quand le back-office n'en fournit pas. */
export const DEFAULT_OG_IMAGE = '/opengraph-image';

type PageSeo = {
  /** Titre de la page, complété par « | MAMBO Proxi » (sauf `absoluteTitle`). */
  title: string;
  description?: string | null;
  /** Chemin canonique de la page. */
  path: string;
  /** Réglages SEO du back-office : priment sur le titre et la description par défaut. */
  seo?: Seo | null;
  absoluteTitle?: boolean;
  noindex?: boolean;
};

/**
 * Métadonnées complètes d'une page publique : titre, description, canonical, Open Graph et carte Twitter.
 * Open Graph est réécrit en entier à chaque page (Next ne fusionne pas les objets), d'où ce point d'entrée unique.
 */
export function seoMetadata({ title, description, path, seo, absoluteTitle, noindex }: PageSeo): Metadata {
  const finalTitle = seo?.title ?? title;
  const finalDescription = seo?.description ?? description ?? undefined;
  const images = [seo?.ogImageUrl ?? DEFAULT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates: { canonical: path },
    // Clé absente plutôt que `undefined` : la règle du gabarit racine (aucune indexation hors production) s'applique.
    ...(noindex || seo?.noindex ? { robots: { index: false } } : {}),
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: SITE_NAME,
      url: path,
      title: absoluteTitle ? finalTitle : `${finalTitle} | ${SITE_NAME}`,
      description: finalDescription,
      images,
    },
    twitter: { card: 'summary_large_image', images },
  };
}
