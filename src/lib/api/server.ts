import 'server-only';
import createClient from 'openapi-fetch';
import { cookies } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale } from '@/i18n/routing';
import { getApiBaseUrl } from './config';
import type { paths } from './schema';
import { transport } from './transport';

/** Filet de sécurité si une revalidation à la demande n'arrive pas : une heure. */
const FALLBACK_REVALIDATE_SECONDS = 3600;

/** Client des routes publiques, utilisé par les Server Components. */
export const api = createClient<paths>({ baseUrl: getApiBaseUrl(), fetch: (request) => transport(request) });

/**
 * Langue du rendu en cours, enregistrée par `withLocale` (`@/i18n/request-locale`) ; hors d'un rendu (tests,
 * `generateStaticParams`), le français. Les interruptions de Next (rendu dynamique, page introuvable…) sont relancées :
 * avalées, elles feraient servir une page statique en français à l'adresse anglaise.
 */
async function currentLocale(): Promise<string> {
  try {
    return await getLocale();
  } catch (error) {
    unstable_rethrow(error);
    return defaultLocale;
  }
}

/**
 * Contenus dans la langue de la page : `?lang=en` ajouté aux lectures du site anglais (le français, langue par défaut,
 * garde des adresses sans paramètre). Le paramètre fait partie de l'adresse, donc de la clé du cache.
 */
api.use({
  async onRequest({ request }) {
    if (request.method !== 'GET') return undefined;
    const locale = await currentLocale();
    if (locale === defaultLocale) return undefined;
    const url = new URL(request.url);
    if (url.searchParams.has('lang')) return undefined;
    url.searchParams.set('lang', locale);
    return new Request(url, request);
  },
});

/**
 * Options de requête mises en cache par Next.js et invalidées par étiquettes.
 * @example await unwrap(api.GET('/v1/site/settings', cached([cacheTags.settings])))
 */
export function cached(tags: string[], revalidate: number | false = FALLBACK_REVALIDATE_SECONDS) {
  return { fetch: (request: Request) => transport(request, { next: { tags, revalidate } }) };
}

/** Options de requête jamais mises en cache (aperçu de brouillon, jetons à usage unique…). */
export const uncached = { fetch: (request: Request) => transport(request, { cache: 'no-store' }) };

/** Client du back-office côté serveur : transmet les cookies de session de l'utilisateur, sans cache. */
export async function createAdminServerClient() {
  const cookieHeader = (await cookies()).toString();
  return createClient<paths>({
    baseUrl: getApiBaseUrl(),
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    fetch: (request) => transport(request, { cache: 'no-store' }),
  });
}
