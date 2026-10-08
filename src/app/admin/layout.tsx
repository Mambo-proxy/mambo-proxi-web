import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'Back-office', template: '%s · Back-office MAMBO Proxi' },
  robots: { index: false, follow: false },
};

/** Back-office : jamais indexé, rendu à la demande (session et CSP avec nonce, voir `src/proxy.ts`). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
