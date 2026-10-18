import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_NAME, isIndexable, siteUrl } from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  // Hors production (préproduction, développement, tests) : aucune page indexée.
  robots: isIndexable() ? undefined : { index: false, follow: false },
};

/**
 * Racine commune sans document : le site (`[locale]/layout.tsx`, une langue par adresse) et le back-office
 * (`admin/layout.tsx`) rendent chacun leur `<html>` avec la bonne langue.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
