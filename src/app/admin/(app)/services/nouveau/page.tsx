import type { Metadata } from 'next';
import { ServiceEditor } from '@/components/admin/services/service-editor';

export const metadata: Metadata = { title: 'Nouveau service' };

/** Ajouter un service (`91:10598`) : éditeur vide, brouillon créé dès que nom, rubrique et accroche sont saisis. */
export default function NewServicePage() {
  return <ServiceEditor id={null} />;
}
