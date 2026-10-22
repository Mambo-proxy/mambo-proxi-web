import type { Metadata } from 'next';
import { EditionEditor } from '@/components/admin/magazine/edition-editor';

export const metadata: Metadata = { title: 'Édition du magazine' };

/** Magazine · Éditer une édition (`269:1677`). */
export default async function MagazineEditionPage({ params }: PageProps<'/admin/magazine/[id]'>) {
  const { id } = await params;
  return <EditionEditor id={id} />;
}
