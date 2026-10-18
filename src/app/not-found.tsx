import type { Metadata } from 'next';
import { SiteLink as Link } from '@/i18n/site-link';
import { RootDocument } from '@/components/root-document';

export const metadata: Metadata = { title: 'Page introuvable', robots: { index: false } };

/**
 * Dernier recours pour une adresse hors du site et du back-office (le proxy oriente toutes les autres vers la 404 de la
 * langue, `[locale]/not-found.tsx`).
 */
export default function RootNotFound() {
  return (
    <RootDocument lang="fr">
      <main className="grid min-h-dvh place-items-center bg-neutral-50 p-5 text-center">
        <div>
          <h1 className="font-brand text-[28px] font-semibold text-text-main">Page introuvable</h1>
          <p className="mt-3 text-text-muted">
            <Link href="/" className="text-text-brand underline">
              Retour à l’accueil
            </Link>
          </p>
        </div>
      </main>
    </RootDocument>
  );
}
