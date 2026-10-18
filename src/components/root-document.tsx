import { Inter, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { JS_CLASS_SCRIPT } from '@/lib/security/inline-scripts';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

/**
 * Document HTML commun au site (une racine par langue, `app/[locale]`) et au back-office (`app/admin`, en français) :
 * langue du document, polices et notifications.
 */
export function RootDocument({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      {/* Racine de l'App Router (rendue par les gabarits racine) : `<head>` y est permis. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Classe `js` posée avant l'affichage : les états initiaux des animations n'existent qu'avec JavaScript. */}
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS_SCRIPT }} />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
