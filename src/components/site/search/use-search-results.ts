'use client';

import { useCallback, useEffect, useState } from 'react';
import { localizeHref } from '@/i18n/href';
import { useSiteLocale, useSiteRouter } from '@/i18n/site-link';
import { browserApi } from '@/lib/api/browser';
import type { SearchResults } from '@/lib/api/schema';
import { MIN_QUERY_LENGTH, normalizeQuery } from './search-href';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

type Outcome = { key: string; data: SearchResults | null };

type Options = {
  /** Nombre maximal de résultats par type. */
  limit: number;
  /** Attente après la dernière frappe avant d'interroger l'API (ms). */
  delay?: number;
};

/**
 * Résultats de `GET /v1/search` pour le texte saisi, dans la langue de la page : requête envoyée `delay` ms après la
 * dernière frappe, requête précédente annulée (`AbortController`) dès que le texte change. Pendant le chargement, les
 * résultats précédents restent affichés (`data`), sans clignotement. Moins de 2 caractères : `idle`, aucune requête.
 */
export function useSearchResults(query: string, { limit, delay = 200 }: Options) {
  const locale = useSiteLocale();
  const term = normalizeQuery(query);
  const ready = term.length >= MIN_QUERY_LENGTH;
  const key = `${locale}|${limit}|${term}`;
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      browserApi
        .GET('/v1/search', {
          params: { query: { q: term, lang: locale, limit } },
          signal: controller.signal,
        })
        .then(
          ({ data }) => {
            if (!controller.signal.aborted) setOutcome({ key, data: data ?? null });
          },
          () => {
            if (!controller.signal.aborted) setOutcome({ key, data: null });
          },
        );
    }, delay);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [ready, term, locale, limit, delay, key]);

  if (!ready) return { term, status: 'idle' as SearchStatus, data: null };
  if (outcome?.key === key)
    return { term, status: (outcome.data ? 'success' : 'error') as SearchStatus, data: outcome.data };
  return { term, status: 'loading' as SearchStatus, data: outcome?.data ?? null };
}

/**
 * Ouvre un résultat : navigation du routeur (avec la transition de page), sauf pour une ancre de la page affichée
 * (`/formation#…` depuis la page Formation) — navigation d'ancre du navigateur, qui met à jour `:target` et déclenche
 * `hashchange` (mise en évidence de l'élément visé).
 */
export function useOpenResult() {
  const router = useSiteRouter();
  const locale = useSiteLocale();
  return useCallback(
    (href: string) => {
      const localized = localizeHref(href, locale);
      const hashAt = localized.indexOf('#');
      if (hashAt > 0 && localized.slice(0, hashAt) === window.location.pathname) {
        window.location.hash = localized.slice(hashAt);
        return;
      }
      router.push(href);
    },
    [router, locale],
  );
}
