import type { Metadata } from 'next';
import { ServiceEditor } from '@/components/admin/services/service-editor';

export const metadata: Metadata = { title: 'Nouveau service' };

/** Éditeur de service (`91:10598`) : création d'un brouillon. */
export default function NewServicePage() {
  return <ServiceEditor />;
}
