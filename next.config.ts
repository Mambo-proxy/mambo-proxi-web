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

const nextConfig: NextConfig = {
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
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Le back-office reçoit sa propre CSP (avec nonce) depuis le proxy.
      {
        source: '/((?!admin(?:/|$)).*)',
        headers: [{ key: 'Content-Security-Policy', value: publicCsp() }],
      },
    ];
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
