import type { MetadataRoute } from 'next';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
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
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
  '/cgu',
];

/**
 * Plan du site : pages publiques, rubriques, services et offres publiés (`GET /v1/sitemap`), régénéré à chaque
 * publication depuis le back-office (étiquette `sitemap`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await unwrapOrNull(api.GET('/v1/sitemap', cached([cacheTags.sitemap])));
  if (!entries) return STATIC_PATHS.map((path) => ({ url: absoluteUrl(path) }));
  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
