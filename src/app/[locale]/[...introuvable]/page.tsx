import { notFound } from 'next/navigation';

/** Toute adresse inconnue du site affiche la page introuvable de la langue demandée. */
export default function UnknownPage() {
  notFound();
}
