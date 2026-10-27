import { localizeHref, parseSitePath } from '@/i18n/href';
import { getApiBaseUrl } from '@/lib/api/config';
import type { Redirect } from '@/lib/api/schema';
import { transport } from '@/lib/api/transport';

/**
 * Redirections du back-office (`GET /v1/site/redirects`, étiquette `redirects`), appliquées par le proxy.
 *
 * Le cache de données de Next (`fetch` étiqueté, `revalidateTag`) n'est pas garanti dans le proxy : la liste est
 * gardée en mémoire 60 s au plus. `/api/revalidate` la vide quand l'API publie l'étiquette `redirects` (même
 * processus) ; sur plusieurs instances, chacune la relit au plus tard à l'échéance.
 */
export const REDIRECTS_TTL_MS = 60_000;

/** Nombre maximal de redirections suivies d'affilée (une chaîne plus longue est considérée comme une boucle). */
const MAX_HOPS = 5;

interface RedirectStore {
  map: Map<string, Redirect> | null;
  expiresAt: number;
  pending: Promise<Map<string, Redirect>> | null;
}

/** Mémoire partagée par les modules du processus (proxy et route `/api/revalidate` sont compilés séparément). */
const STORE_KEY = Symbol.for('mambo-proxi.site-redirects');

function store(): RedirectStore {
  const scope = globalThis as typeof globalThis & { [STORE_KEY]?: RedirectStore };
  return (scope[STORE_KEY] ??= { map: null, expiresAt: 0, pending: null });
}

/** Vide la liste mémorisée : relue à la prochaine visite (revalidation de l'étiquette `redirects`, tests). */
export function invalidateSiteRedirects() {
  const current = store();
  current.map = null;
  current.expiresAt = 0;
  current.pending = null;
}

/** `/services/x/` → `/services/x` (la racine reste `/`). */
function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function toMap(list: unknown): Map<string, Redirect> {
  const map = new Map<string, Redirect>();
  if (!Array.isArray(list)) return map;
  for (const item of list as Partial<Redirect>[]) {
    if (typeof item?.from !== 'string' || typeof item.to !== 'string' || !item.from.startsWith('/')) continue;
    const from = normalizePath(item.from);
    if (from === normalizePath(item.to)) continue;
    map.set(from, { from, to: item.to, permanent: item.permanent !== false });
  }
  return map;
}

async function fetchRedirects(previous: Map<string, Redirect> | null): Promise<Map<string, Redirect>> {
  try {
    const response = await transport(new Request(`${getApiBaseUrl()}/v1/site/redirects`), {
      signal: AbortSignal.timeout(2000),
    });
    // API indisponible : on garde la dernière liste connue (aucune redirection si elle n'a jamais été lue).
    if (!response.ok) return previous ?? new Map();
    return toMap(await response.json());
  } catch {
    return previous ?? new Map();
  }
}

async function redirectMap(): Promise<Map<string, Redirect>> {
  const current = store();
  if (current.map && current.expiresAt > Date.now()) return current.map;
  // Une seule lecture à la fois, même si plusieurs visites arrivent ensemble.
  current.pending ??= fetchRedirects(current.map).then((map) => {
    current.map = map;
    current.expiresAt = Date.now() + REDIRECTS_TTL_MS;
    current.pending = null;
    return map;
  });
  return current.pending;
}

/**
 * Adresses qui ne passent jamais par les redirections (ni lecture de l'API) : fichiers Next, routes techniques,
 * back-office, aperçu des composants et fichiers statiques (extension).
 */
export function isRedirectCandidate(pathname: string): boolean {
  return !(
    pathname.startsWith('/_next') ||
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/dev' ||
    pathname.startsWith('/dev/') ||
    pathname === '/health' ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

/** Redirection de l'adresse (avec ou sans préfixe de langue), chaîne suivie jusqu'à sa destination finale. */
function resolve(map: Map<string, Redirect>, pathname: string): { to: string; permanent: boolean } | null {
  const path = normalizePath(pathname);
  const { internal } = parseSitePath(path);
  let found = map.get(path) ?? map.get(internal);
  if (!found) return null;
  const seen = new Set([path, internal]);
  let permanent = found.permanent;
  for (let hop = 1; hop < MAX_HOPS; hop += 1) {
    const target = normalizePath(found.to.split(/[?#]/)[0] ?? '');
    if (seen.has(target)) return null; // Boucle : on laisse la page s'afficher (ou répondre 404).
    seen.add(target);
    const next = map.get(target);
    if (!next) return { to: found.to, permanent };
    permanent &&= next.permanent;
    found = next;
  }
  return null;
}

/**
 * Destination de la redirection de la requête, dans la langue de l'adresse demandée (`/en/…` → `/en/…`), avec ses
 * paramètres si la destination n'en précise pas ; `null` sans redirection.
 */
export async function findSiteRedirect(url: URL): Promise<{ url: URL; status: 301 | 302 } | null> {
  if (!isRedirectCandidate(url.pathname)) return null;
  const map = await redirectMap();
  if (map.size === 0) return null;
  const match = resolve(map, url.pathname);
  if (!match) return null;
  const { locale } = parseSitePath(normalizePath(url.pathname));
  const destination = new URL(localizeHref(match.to, locale), url);
  if (!match.to.includes('?')) destination.search = url.search;
  if (
    destination.origin === url.origin &&
    normalizePath(destination.pathname) === normalizePath(url.pathname)
  )
    return null;
  return { url: destination, status: match.permanent ? 301 : 302 };
}
