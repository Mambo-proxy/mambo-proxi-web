import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/sections/errors/not-found-content';
import SiteLayout from './(site)/layout';

export const metadata: Metadata = { title: 'Page introuvable', robots: { index: false } };

/** Adresse inconnue (404 `83:9961`) : même gabarit que le site (en-tête, pied de page, WhatsApp). */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
