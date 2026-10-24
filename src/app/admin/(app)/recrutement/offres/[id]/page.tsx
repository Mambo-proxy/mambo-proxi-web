import type { Metadata } from 'next';
import { OfferEditor } from '@/components/admin/jobs/offer-editor';

export const metadata: Metadata = { title: 'Offre d’emploi' };

/** Recrutement · création ou modification d'une offre (non maquetté, même langage que l'éditeur de service). */
export default async function OfferPage({ params }: PageProps<'/admin/recrutement/offres/[id]'>) {
  const { id } = await params;
  return <OfferEditor id={id} />;
}
