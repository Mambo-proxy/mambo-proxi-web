import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootDocument } from '@/components/root-document';

export const metadata: Metadata = {
  title: { default: 'Back-office', template: '%s · Back-office MAMBO Proxi' },
  robots: { index: false, follow: false },
};

/** Back-office (en français) : jamais indexé, rendu à la demande (session et CSP avec nonce, voir `src/proxy.ts`). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="fr">{children}</RootDocument>;
}
