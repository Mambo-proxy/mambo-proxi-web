/** Nom du site, utilisé quand les paramètres de l'API ne sont pas disponibles (page de maintenance, image de partage). */
export const SITE_NAME = 'MAMBO Proxi';

/** Adresse publique du site (`NEXT_PUBLIC_SITE_URL`), sans barre oblique finale : canonicals, sitemap, données structurées. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Adresse absolue d'un chemin du site. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Indexation autorisée uniquement en production (`SITE_ENV=production`) : en préproduction, en développement et
 * dans les tests, `robots.txt` bloque tout et chaque page porte `noindex`.
 */
export function isIndexable(): boolean {
  return process.env.SITE_ENV === 'production';
}
