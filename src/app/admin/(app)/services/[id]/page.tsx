import type { Metadata } from 'next';
import { ServiceEditor } from '@/components/admin/services/service-editor';

export const metadata: Metadata = { title: 'Modifier le service' };

/** Éditeur de service (`91:10598`) : contenu, publication, aperçu et complétude. */
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor id={id} />;
}
