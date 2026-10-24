import type { MetadataRoute } from 'next';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { localizeHref } from '@/i18n/href';
import { locales } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo/site';

/** Pages fixes, utilisées si l'API ne répond pas (le plan du site n'est jamais vide). */
const STATIC_PATHS = [
  '/',
  '/services',
  '/qui-sommes-nous',
  '/mission',
  '/partenaires',
  '/formation',
  '/recrutement',
  '/avis-clients',
  '/contact',
  '/devis',
  '/inscription',
  '/suivi-mambo',
  '/magazine',
  '/zones-d-intervention',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
  '/cgu',
];

type Entry = Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'> & { path: string };

/** Chaque page dans les deux langues (`/contact`, `/en/contact`), avec ses adresses `hreflang`. */
function bilingual(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, absoluteUrl(localizeHref(path, locale))]),
    );
    return locales.map((locale) => ({
      url: absoluteUrl(localizeHref(path, locale)),
      ...rest,
      alternates: { languages },
    }));
  });
}

/**
 * Plan du site : pages publiques, rubriques, services et offres publiés (`GET /v1/sitemap`), régénéré à chaque
 * publication depuis le back-office (étiquette `sitemap`), en français et en anglais.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await unwrapOrNull(api.GET('/v1/sitemap', cached([cacheTags.sitemap])));
  if (!entries) return bilingual(STATIC_PATHS.map((path) => ({ path })));
  return bilingual(
    entries.map((entry) => ({
      path: entry.path,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
  );
}
