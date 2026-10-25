import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from './routing';

/** Props d'une page ou d'un gabarit sous `[locale]`, avec ses éventuels autres paramètres d'adresse. */
export type LocaleParams<T extends object = object> = { params: Promise<T & { locale: string }> };

/**
 * Langue de l'adresse (`params.locale`), validée puis enregistrée pour le rendu en cours : next-intl (`getLocale`,
 * `getTranslations`, client API serveur) la lit alors sans consulter les en-têtes, ce qui garde la page statique
 * (ISR). À appeler en tête de chaque page, gabarit et `generateMetadata` du segment, qui s'exécutent en parallèle.
 * Langue inconnue : page introuvable.
 */
export async function withLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
