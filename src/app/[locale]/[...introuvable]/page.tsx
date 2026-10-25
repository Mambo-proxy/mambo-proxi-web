import { notFound } from 'next/navigation';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

/** Toute adresse inconnue du site affiche la page introuvable de la langue demandée. */
export default async function UnknownPage({ params }: LocaleParams) {
  await withLocale(params);
  notFound();
}
