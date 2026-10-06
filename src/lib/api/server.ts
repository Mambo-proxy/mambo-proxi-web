import 'server-only';
import createClient from 'openapi-fetch';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from './config';
import type { paths } from './schema';
import { transport } from './transport';

/** Filet de sécurité si une revalidation à la demande n'arrive pas : une heure. */
const FALLBACK_REVALIDATE_SECONDS = 3600;

/** Client des routes publiques, utilisé par les Server Components. */
export const api = createClient<paths>({ baseUrl: getApiBaseUrl(), fetch: (request) => transport(request) });

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
