import path from 'node:path';
import type { NextConfig } from 'next';
import { publicCsp, securityHeaders } from './src/lib/security/headers';

/** Formateur de messages précompilés de `use-intl` (dépendance de next-intl, non installée à la racine par pnpm). */
const formatOnly = `./${path
  .relative(
    process.cwd(),
    require.resolve('use-intl/format-message/format-only', {
      paths: [path.dirname(require.resolve('next-intl/plugin'))],
    }),
  )
  .split(path.sep)
  .join('/')}`;

/**
 * Images de la médiathèque servies par l'API (`GET /v1/media/{dossier}/{fichier}`, `MEDIA_PUBLIC_URL`) ou par le CDN
 * placé devant (`NEXT_PUBLIC_MEDIA_URL`). `<Visual>` sert d'abord les variantes AVIF / WebP de l'API ; ces motifs
 * couvrent les autres usages de `next/image` avec une adresse de l'API.
 */
function mediaPatterns(): URL[] {
  const patterns: URL[] = [];
  for (const [base, path] of [
    [process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '/v1/media/**'],
    [process.env.NEXT_PUBLIC_MEDIA_URL, '/**'],
  ] as const) {
    if (!base) continue;
    try {
      const url = new URL(base);
      patterns.push(new URL(`${url.origin}${url.pathname.replace(/\/+$/, '')}${path}`));
    } catch {
      // Adresse invalide : ignorée.
    }
  }
  return patterns;
}

/**
 * Relais same-origin de l'API (site et API sur deux domaines, ex. Vercel et `*.sslip.io`) : `API_RELAY_TARGET`
 * (origine de l'API, sans `/v1`). `/v1/*` est réécrit vers l'API, et le navigateur y envoie les routes à cookies
 * (`/v1/admin`, `/v1/auth`) : cookies de session déposés sur le domaine du site, `mp_csrf` lisible. Lu au build.
 */
function relayTarget(): string | null {
  const target = process.env.API_RELAY_TARGET?.trim();
  if (!target || process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') return null;
  try {
    const url = new URL(target);
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    throw new Error(`API_RELAY_TARGET invalide : ${target}`);
  }
}

const apiRelayTarget = relayTarget();

const nextConfig: NextConfig = {
  // Relais activé : indiqué au code du navigateur (`isApiRelay`, `src/lib/api/config.ts`).
  env: { NEXT_PUBLIC_API_RELAY: apiRelayTarget ? 'enabled' : '' },
  reactCompiler: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Configuration de next-intl, sans son plugin (il charge au démarrage le binaire natif de SWC, refusé sur certains
  // postes Windows) : fichier de configuration des langues, et messages précompilés au build (`messages/*.json`) pour
  // que le navigateur ne reçoive pas l'analyseur de messages ICU (réglages repris de `next-intl/plugin`).
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
      'use-intl/format-message': formatOnly,
    },
    rules: {
      '*.json': {
        loaders: [
          {
            loader: 'next-intl/extractor/catalogLoader',
            options: { messages: { format: 'json', precompile: true } },
          },
        ],
        condition: { path: '{./messages}/**/*' },
        as: '*.js',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: mediaPatterns(),
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Le back-office reçoit sa propre CSP (avec nonce) depuis le proxy.
      {
        source: '/((?!admin(?:/|$)).*)',
        headers: [{ key: 'Content-Security-Policy', value: publicCsp() }],
      },
      // Réponses relayées jamais gardées par le CDN de Vercel (réponses propres à une session, cookies).
      ...(apiRelayTarget
        ? [{ source: '/v1/:path*', headers: [{ key: 'x-vercel-enable-rewrite-caching', value: '0' }] }]
        : []),
    ];
  },
  async rewrites() {
    // Avant les pages et les routes dynamiques (`[locale]`) : `/v1/…` n'est jamais une page du site.
    return {
      beforeFiles: apiRelayTarget
        ? [{ source: '/v1/:path*', destination: `${apiRelayTarget}/v1/:path*` }]
        : [],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: '/devis-gratuit', destination: '/devis', permanent: true },
      { source: '/s-inscrire', destination: '/inscription', permanent: true },
      { source: '/nos-services', destination: '/services', permanent: true },
    ];
  },
};

export default nextConfig;
