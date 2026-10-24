import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MediaLibrary } from '@/components/admin/media/media-library';

export const metadata: Metadata = { title: 'Médiathèque' };

/** Médiathèque (non maquettée) : images du site, texte alternatif, point focal, usages, envoi et suppression. */
export default function MediaPage() {
  return (
    <Suspense>
      <MediaLibrary />
    </Suspense>
  );
}
