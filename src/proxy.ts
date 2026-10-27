import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { mergeCookieHeader, renewSession } from '@/lib/admin/session-renewal';
import { getApiBaseUrl } from '@/lib/api/config';
import { transport } from '@/lib/api/transport';
import { adminCsp } from '@/lib/security/headers';
import { JS_CLASS_SCRIPT, cspHash } from '@/lib/security/inline-scripts';
import { findSiteRedirect } from '@/lib/site-redirects';

/** Cookies de session déposés par l'API (jeton d'accès 15 min, jeton de rafraîchissement). */
export const SESSION_COOKIES = ['mp_at', 'mp_rt'] as const;

/** Écrans du back-office accessibles sans session. */
export const ADMIN_PUBLIC_PATHS = [
  '/admin/connexion',
  '/admin/mot-de-passe-oublie',
  '/admin/nouveau-mot-de-passe',
  '/admin/invitation',
];

/** Langue de l'adresse (préfixe `/en`), adresses traduites et 404 de la langue demandée. */
const intl = createIntlMiddleware(routing);

/** Durée de mémorisation de l'état « maintenance » des Paramètres, pour ne pas interroger l'API à chaque page. */
const MAINTENANCE_TTL_MS = 30_000;
let maintenanceCache: { value: boolean; expiresAt: number } | null = null;

/** Réinitialise la mémorisation (tests). */
export function resetMaintenanceCache() {
  maintenanceCache = null;
}

/**
 * Mode maintenance : forcé par `MAINTENANCE_MODE=on` (intervention d'exploitation, même API arrêtée) ou activé dans
 * les Paramètres du back-office (`features.maintenanceMode`). Si l'API ne répond pas, le site reste ouvert.
 */
async function isMaintenance(): Promise<boolean> {
  if (process.env.MAINTENANCE_MODE === 'on') return true;
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) return maintenanceCache.value;
  let value = false;
  try {
    const response = await transport(new Request(`${getApiBaseUrl()}/v1/site/settings`), {
      signal: AbortSignal.timeout(2000),
    });
    if (response.ok) {
      const settings = (await response.json()) as { features?: { maintenanceMode?: boolean } };
      value = settings.features?.maintenanceMode === true;
    }
  } catch {
    value = false;
  }
  maintenanceCache = { value, expiresAt: now + MAINTENANCE_TTL_MS };
  return value;
}

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function isAdminPublic(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function loginRedirect(request: NextRequest, setCookies: string[] = []): NextResponse {
  const { pathname, search } = request.nextUrl;
  const login = new URL('/admin/connexion', request.url);
  if (pathname !== '/admin') login.searchParams.set('suite', `${pathname}${search}`);
  const response = NextResponse.redirect(login);
  for (const cookie of setCookies) response.headers.append('set-cookie', cookie);
  return response;
}

/**
 * Back-office : redirection vers la connexion sans session ; jeton d'accès expiré (cookie `mp_at` absent, `mp_rt`
 * présent) → session renouvelée avant le rendu, ou connexion si le renouvellement est refusé ; CSP stricte avec
 * nonce ; jamais indexé.
 */
async function admin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isPublic = isAdminPublic(pathname);
  if (!isPublic && !hasSession(request)) return loginRedirect(request);

  let renewed: string[] = [];
  const refreshToken = request.cookies.get('mp_rt')?.value;
  if (!isPublic && refreshToken && !request.cookies.get('mp_at')?.value) {
    const renewal = await renewSession(refreshToken, request.headers.get('user-agent'));
    if (renewal.kind === 'expired') return loginRedirect(request, renewal.cookies);
    if (renewal.kind === 'renewed') renewed = renewal.cookies;
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = adminCsp(nonce, [await cspHash(JS_CLASS_SCRIPT)]);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  if (renewed.length > 0)
    requestHeaders.set('cookie', mergeCookieHeader(request.headers.get('cookie'), renewed));
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of renewed) response.headers.append('set-cookie', cookie);
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/** Langue d'une adresse publique : `/en` ou `/en/…` pour l'anglais, sinon le français (sans préfixe). */
function localeOf(pathname: string): string {
  const prefix = routing.locales.find(
    (locale) =>
      locale !== routing.defaultLocale && (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)),
  );
  return prefix ?? routing.defaultLocale;
}

/**
 * Proxy (anciennement « middleware ») : protège `/admin`, applique les redirections du back-office (301 ou 302, dans
 * la langue de l'adresse demandée), oriente le site public vers sa langue et affiche la page de maintenance de cette
 * langue (statut 503) quand elle est activée. Les membres de l'équipe connectés continuent de voir le site.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return admin(request);
  if (pathname === '/dev' || pathname.startsWith('/dev/')) return NextResponse.next();

  const redirect = await findSiteRedirect(request.nextUrl);
  if (redirect) return NextResponse.redirect(redirect.url, redirect.status);

  const locale = localeOf(pathname);
  const maintenancePath = `/${locale}/maintenance`;
  const isMaintenancePage = pathname === '/maintenance' || pathname === `/${locale}/maintenance`;
  if (!isMaintenancePage && !hasSession(request) && (await isMaintenance())) {
    const response = NextResponse.rewrite(new URL(maintenancePath, request.url), { status: 503 });
    response.headers.set('Retry-After', '3600');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  return intl(request);
}

export const config = {
  matcher: [
    {
      // Ni fichiers statiques, ni images optimisées, ni routes techniques, ni fichiers publics (extension).
      // Les préchargements passent aussi par le proxy : sans la réécriture de langue (`/x` → `/fr/x`), ils
      // recevaient un 404 que la navigation réutilisait ensuite.
      source:
        '/((?!_next/static|_next/image|api/|health|sitemap\\.xml|robots\\.txt|opengraph-image|icon\\.svg|.*\\.[a-zA-Z0-9]+$).*)',
    },
  ],
};
