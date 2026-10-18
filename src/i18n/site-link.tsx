'use client';

import type { Route } from 'next';
import NextLink from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useMemo, type ComponentProps } from 'react';
import { localizeHref, parseSitePath } from './href';
import { defaultLocale, isLocale, type Locale } from './routing';

/** Langue de la page affichée ; hors du site public (back-office), le français. */
export function useSiteLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  return isLocale(params?.locale) ? params.locale : defaultLocale;
}

/** Adresse interne de la page affichée (`/en/about-us` → `/qui-sommes-nous`), pour la comparer aux liens du contenu. */
export function useSitePathname(): string {
  return parseSitePath(usePathname()).internal;
}

/** `useRouter` dont `push` et `replace` acceptent une adresse interne, convertie dans la langue de la page. */
export function useSiteRouter() {
  const router = useRouter();
  const locale = useSiteLocale();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) =>
        router.push(localizeHref(href, locale) as Route, options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
        router.replace(localizeHref(href, locale) as Route, options),
    }),
    [router, locale],
  );
}

type SiteLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string };

/**
 * Lien du site : l'adresse interne (en français, comme dans le contenu et l'API) est convertie dans la langue de la
 * page (`/qui-sommes-nous` → `/en/about-us`). Sans effet dans le back-office.
 */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  const locale = useSiteLocale();
  return <NextLink href={localizeHref(href, locale) as Route} {...props} />;
}
