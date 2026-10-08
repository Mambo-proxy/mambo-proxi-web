import type { Metadata } from 'next';
import { ServiceEditor } from '@/components/admin/services/service-editor';

export const metadata: Metadata = { title: 'Modifier un service' };

/** Modifier un service : même éditeur que la création ; service inconnu → 404 de la coque. */
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor id={id} />;
}
