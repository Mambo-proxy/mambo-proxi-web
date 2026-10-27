/**
 * En-têtes de sécurité (docs/07 §3). Le site public garde le rendu statique + ISR : sa politique de sécurité du
 * contenu (CSP) est fixe, sans nonce (un nonce imposerait un rendu à chaque requête). Le back-office, rendu à la
 * demande, reçoit une CSP stricte avec nonce, posée par le proxy (`src/proxy.ts`).
 */

// Import relatif : ce module est aussi chargé par `next.config.ts`, hors des alias de chemins.
import { tilesOrigin } from '../geo/tiles';

const isDev = process.env.NODE_ENV === 'development';

function originOf(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/** Origine de l'API (requêtes du navigateur, images servies par le stockage). */
function apiOrigin(): string {
  return originOf(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
}

/**
 * Origine des images de la médiathèque (`MEDIA_PUBLIC_URL` de l'API) si elle diffère de l'API (CDN) :
 * `NEXT_PUBLIC_MEDIA_URL`. Listée dans `img-src` avec l'API, pour le développement en `http` (`https:` couvre la
 * production).
 */
function mediaOrigin(): string {
  return originOf(process.env.NEXT_PUBLIC_MEDIA_URL);
}

const TURNSTILE = 'https://challenges.cloudflare.com';
/**
 * Tuiles de la carte des zones (OpenStreetMap par défaut, ou `NEXT_PUBLIC_MAP_TILES_URL`) : images seulement
 * (Leaflet n'utilise ni `fetch` ni scripts tiers ; ses styles sont une feuille du site et des attributs `style`,
 * couverts par `style-src`). Déjà couvertes par `https:`, listées pour pouvoir restreindre `img-src` plus tard.
 */
const MAP_TILES = tilesOrigin() ?? false;
const GOOGLE_TAG_MANAGER = 'https://www.googletagmanager.com';
const GOOGLE_ANALYTICS = [
  GOOGLE_TAG_MANAGER,
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
];

function serialize(directives: Record<string, (string | false)[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values.filter(Boolean)].join(' '))
    .join('; ');
}

/** Passage forcé en HTTPS des ressources, uniquement quand le site est servi en HTTPS. */
function upgrade(): Record<string, string[]> {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')
    ? { 'upgrade-insecure-requests': [] }
    : {};
}

/** CSP du site public : scripts du site, de Turnstile et de Google Analytics (chargé après consentement). */
export function publicCsp(): string {
  return serialize({
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", isDev && "'unsafe-eval'", TURNSTILE, GOOGLE_TAG_MANAGER],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', apiOrigin(), mediaOrigin(), MAP_TILES],
    'font-src': ["'self'"],
    'connect-src': ["'self'", apiOrigin(), TURNSTILE, ...GOOGLE_ANALYTICS],
    'frame-src': [TURNSTILE],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    ...upgrade(),
  });
}

/**
 * CSP du back-office : seuls les scripts portant le nonce de la requête (et ceux qu'ils chargent) s'exécutent ;
 * le petit script en ligne du gabarit racine est autorisé par son empreinte.
 */
export function adminCsp(nonce: string, inlineScriptHashes: string[]): string {
  return serialize({
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...inlineScriptHashes.map((hash) => `'${hash}'`),
      isDev && "'unsafe-eval'",
    ],
    // Les attributs `style` (positions calculées, animations) imposent `unsafe-inline` pour les styles.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', apiOrigin(), mediaOrigin(), MAP_TILES],
    'font-src': ["'self'"],
    'connect-src': ["'self'", apiOrigin()],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    ...upgrade(),
  });
}

/** En-têtes communs à toutes les réponses. */
export const securityHeaders: { key: string; value: string }[] = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...((process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
];
