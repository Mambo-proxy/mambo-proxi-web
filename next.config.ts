import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  typedRoutes: true,
  images: {
    formats: ['image/avif', 'image/webp'],
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
