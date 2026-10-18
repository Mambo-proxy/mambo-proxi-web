import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PagesView } from '@/components/admin/pages/pages-view';

export const metadata: Metadata = { title: 'Pages & textes' };

/** Pages & textes (`92:10771`) : pages du site, sections, brouillon enregistré automatiquement, publication. */
export default function PagesPage() {
  return (
    <Suspense>
      <PagesView />
    </Suspense>
  );
}
