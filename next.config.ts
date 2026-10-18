import type { NextConfig } from 'next';
import { publicCsp, securityHeaders } from './src/lib/security/headers';

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Configuration des langues de next-intl (équivalent de son plugin, qui dépend d'un binaire natif superflu ici).
  turbopack: {
    resolveAlias: { 'next-intl/config': './src/i18n/request.ts' },
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
