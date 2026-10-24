import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { localizeHref } from '@/i18n/href';
import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/routing';
import type { Seo } from '@/lib/api/schema';
import { SITE_NAME } from './site';

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' };

/**
 * Adresses d'une page dans chaque langue (`/qui-sommes-nous` → `/en/about-us`) : canonical de la langue affichée,
 * `hreflang` des deux langues et `x-default` (français, langue par défaut du site).
 */
export function localizedAlternates(path: string, locale: Locale): NonNullable<Metadata['alternates']> {
  return {
    canonical: localizeHref(path, locale),
    languages: {
      ...Object.fromEntries(locales.map((item) => [item, localizeHref(path, item)])),
      'x-default': localizeHref(path, defaultLocale),
    },
  };
}

/** Image de partage générée (`src/app/opengraph-image.tsx`), utilisée quand le back-office n'en fournit pas. */
export const DEFAULT_OG_IMAGE = '/opengraph-image';

type PageSeo = {
  /** Titre de la page, complété par « | MAMBO Proxi » (sauf `absoluteTitle`). */
  title: string;
  description?: string | null;
  /** Chemin interne de la page, en français (`/qui-sommes-nous`) : traduit selon la langue affichée. */
  path: string;
  /** Réglages SEO du back-office : priment sur le titre et la description par défaut. */
  seo?: Seo | null;
  absoluteTitle?: boolean;
  noindex?: boolean;
};

/**
 * Métadonnées complètes d'une page publique dans la langue de la requête : titre, description, canonical et
 * `hreflang`, Open Graph et carte Twitter. Open Graph est réécrit en entier à chaque page (Next ne fusionne pas les
 * objets), d'où ce point d'entrée unique.
 */
export async function seoMetadata({
  title,
  description,
  path,
  seo,
  absoluteTitle,
  noindex,
}: PageSeo): Promise<Metadata> {
  const requested = await getLocale();
  const locale: Locale = isLocale(requested) ? requested : defaultLocale;
  const alternates = localizedAlternates(path, locale);
  const finalTitle = seo?.title ?? title;
  const finalDescription = seo?.description ?? description ?? undefined;
  const images = [seo?.ogImageUrl ?? DEFAULT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates,
    // Clé absente plutôt que `undefined` : la règle du gabarit racine (aucune indexation hors production) s'applique.
    ...(noindex || seo?.noindex ? { robots: { index: false } } : {}),
    openGraph: {
      type: 'website',
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => OG_LOCALES[item]),
      siteName: SITE_NAME,
      url: alternates.canonical as string,
      title: absoluteTitle ? finalTitle : `${finalTitle} | ${SITE_NAME}`,
      description: finalDescription,
      images,
    },
    twitter: { card: 'summary_large_image', images },
  };
}
