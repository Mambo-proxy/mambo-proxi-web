'use client';

import type { Route } from 'next';
import NextLink from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useMemo, type ComponentProps } from 'react';
import { localizeHref, parseSitePath } from './href';
import { defaultLocale, isLocale, type Locale } from './routing';

/**
 * Type de transition des navigations du site : la page qui change s'anime (`PageTransition`). Les navigations sans ce
 * type (boutons Précédent/Suivant du navigateur, `router.refresh()`, liens qui le retirent) changent la page sans animation.
 */
export const PAGE_TRANSITION = 'site-page';
const pageTransition = [PAGE_TRANSITION];

/** Langue de la page affichée ; hors du site public (back-office), le français. */
export function useSiteLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  return isLocale(params?.locale) ? params.locale : defaultLocale;
}

/** Adresse interne de la page affichée (`/en/about-us` → `/qui-sommes-nous`), pour la comparer aux liens du contenu. */
export function useSitePathname(): string {
  return parseSitePath(usePathname()).internal;
}

/**
 * `useRouter` dont `push` et `replace` acceptent une adresse interne, convertie dans la langue de la page ; `push`
 * (changement de page) porte la transition de page, `replace` (filtres, tri dans l'adresse) non.
 */
export function useSiteRouter() {
  const router = useRouter();
  const locale = useSiteLocale();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) =>
        router.push(localizeHref(href, locale) as Route, { transitionTypes: pageTransition, ...options }),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
        router.replace(localizeHref(href, locale) as Route, options),
    }),
    [router, locale],
  );
}

type SiteLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string };

/**
 * Lien du site : l'adresse interne (en français, comme dans le contenu et l'API) est convertie dans la langue de la
 * page (`/qui-sommes-nous` → `/en/about-us`). La navigation porte la transition de page ; `transitionTypes={[]}` la
 * retire (liens du menu mobile, dont la fermeture sert déjà de transition). Sans effet dans le back-office.
 */
export function SiteLink({ href, transitionTypes = pageTransition, ...props }: SiteLinkProps) {
  const locale = useSiteLocale();
  return <NextLink href={localizeHref(href, locale) as Route} transitionTypes={transitionTypes} {...props} />;
}
