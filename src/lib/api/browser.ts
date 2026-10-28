import createClient, { type Middleware } from 'openapi-fetch';
import { redirectToLogin } from '@/lib/admin/expired-session';
import { getApiBaseUrl, isApiRelay, isRelayedRoute } from './config';
import type { paths } from './schema';
import { withSessionRefresh, type RefreshOutcome } from './session-refresh';
import { transport } from './transport';

const CSRF_COOKIE = 'mp_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/** Recopie le cookie lisible `mp_csrf` dans l'en-tête `X-CSRF-Token` d'une mutation. */
function withCsrfToken(request: Request): Request {
  if (SAFE_METHODS.has(request.method)) return request;
  const token = readCookie(CSRF_COOKIE);
  if (token) request.headers.set(CSRF_HEADER, token);
  return request;
}

/** Jeton CSRF « double-submit » : le cookie lisible `mp_csrf` est recopié dans l'en-tête des mutations. */
const csrf: Middleware = {
  onRequest({ request }) {
    if (SAFE_METHODS.has(request.method)) return undefined;
    return withCsrfToken(request);
  },
};

/**
 * Relais same-origin (`isApiRelay`) : une route à cookies part sur l'origine du site (`/v1/…`, réécrit vers l'API par
 * `next.config.ts`), pour que les cookies de session soient ceux du site et que `mp_csrf` soit lisible. Le corps est
 * recopié (au plus 10 Mo, médiathèque) : une requête ne peut pas reprendre le flux d'une autre sans `duplex`.
 */
async function throughRelay(request: Request): Promise<Request> {
  if (!isApiRelay || typeof window === 'undefined') return request;
  const url = new URL(request.url);
  if (url.origin === window.location.origin || !isRelayedRoute(url.pathname)) return request;
  return new Request(new URL(`${url.pathname}${url.search}`, window.location.origin), {
    method: request.method,
    headers: request.headers,
    body: request.body ? await request.arrayBuffer() : undefined,
    credentials: 'include',
    cache: request.cache,
    redirect: request.redirect,
    signal: request.signal,
  });
}

/** Transport du navigateur, relais compris. */
const relayedTransport = async (request: Request) => transport(await throughRelay(request));

/**
 * `POST /v1/auth/refresh` : seul le cookie `mp_rt` compte (ni jeton d'accès ni jeton CSRF, selon le contrat). Un
 * `204` sans nouveaux cookies (rotation faite par un autre onglet il y a moins de 10 s) est aussi un succès.
 */
async function refreshSession(): Promise<RefreshOutcome> {
  const response = await relayedTransport(
    new Request(`${getApiBaseUrl()}/v1/auth/refresh`, { method: 'POST', credentials: 'include' }),
  );
  if (response.ok) return 'refreshed';
  return response.status === 401 ? 'expired' : 'failed';
}

/**
 * Envoi avec renouvellement de la session du back-office : sur un `401`, un seul `POST /v1/auth/refresh` puis rejeu
 * de la requête, avec le jeton CSRF renouvelé. Renouvellement refusé : retour à l'écran de connexion.
 */
const send = withSessionRefresh({
  send: relayedTransport,
  refresh: refreshSession,
  onExpired: redirectToLogin,
  prepareReplay: withCsrfToken,
});

/**
 * Langue de la page (`<html lang>`, `fr` ou `en`) transmise à l'API par `Accept-Language` : messages de réponse et
 * e-mails (accusés de réception, confirmation de la newsletter) dans la langue du site consulté, et non dans celle du
 * navigateur. En-tête autorisé par le CORS de l'API.
 */
const language: Middleware = {
  onRequest({ request }) {
    if (typeof document === 'undefined' || request.headers.has('Accept-Language')) return undefined;
    const lang = document.documentElement.lang;
    if (lang) request.headers.set('Accept-Language', lang);
    return request;
  },
};

/** Client utilisé par les composants client (formulaires du site, back-office). Cookies de session inclus. */
export const browserApi = createClient<paths>({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  fetch: send,
});

browserApi.use(csrf, language);
