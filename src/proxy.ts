import { NextResponse, type NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/api/config';
import { transport } from '@/lib/api/transport';
import { adminCsp } from '@/lib/security/headers';
import { JS_CLASS_SCRIPT, cspHash } from '@/lib/security/inline-scripts';

/** Cookies de session déposés par l'API (jeton d'accès 15 min, jeton de rafraîchissement). */
export const SESSION_COOKIES = ['mp_at', 'mp_rt'] as const;

/** Écrans du back-office accessibles sans session. */
export const ADMIN_PUBLIC_PATHS = [
  '/admin/connexion',
  '/admin/mot-de-passe-oublie',
  '/admin/nouveau-mot-de-passe',
  '/admin/invitation',
];

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

/** Back-office : redirection vers la connexion sans session ; CSP stricte avec nonce ; jamais indexé. */
async function admin(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  if (!isAdminPublic(pathname) && !hasSession(request)) {
    const login = new URL('/admin/connexion', request.url);
    if (pathname !== '/admin') login.searchParams.set('suite', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = adminCsp(nonce, [await cspHash(JS_CLASS_SCRIPT)]);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

/**
 * Proxy (anciennement « middleware ») : protège `/admin` et affiche la page de maintenance à la place du site public
 * (statut 503) quand elle est activée. Les membres de l'équipe connectés continuent de voir le site.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return admin(request);

  if (pathname !== '/maintenance' && !hasSession(request) && (await isMaintenance())) {
    const response = NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
    response.headers.set('Retry-After', '3600');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      // Ni fichiers statiques, ni images optimisées, ni routes techniques, ni fichiers publics (extension).
      source:
        '/((?!_next/static|_next/image|api/|health|sitemap\\.xml|robots\\.txt|opengraph-image|icon\\.svg|.*\\.[a-zA-Z0-9]+$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
