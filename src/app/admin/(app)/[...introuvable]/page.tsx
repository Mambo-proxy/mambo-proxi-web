import { notFound } from 'next/navigation';

/** Adresse inconnue du back-office : 404 dans la coque (et non celle du site). */
export default function UnknownAdminPage() {
  notFound();
}
