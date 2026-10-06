import createClient, { type Middleware } from 'openapi-fetch';
import { getApiBaseUrl } from './config';
import type { paths } from './schema';
import { transport } from './transport';

const CSRF_COOKIE = 'mp_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/** Jeton CSRF « double-submit » : le cookie lisible `mp_csrf` est recopié dans l'en-tête des mutations. */
const csrf: Middleware = {
  onRequest({ request }) {
    if (SAFE_METHODS.has(request.method)) return undefined;
    const token = readCookie(CSRF_COOKIE);
    if (token) request.headers.set(CSRF_HEADER, token);
    return request;
  },
};

/** Client utilisé par les composants client (formulaires du site, back-office). Cookies de session inclus. */
export const browserApi = createClient<paths>({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  fetch: (request) => transport(request),
});

browserApi.use(csrf);
