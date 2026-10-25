/** Longueurs acceptées par `GET /v1/search` (`q`). */
export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 120;

/** Texte recherché tel que l'API l'interprète : espaces de début et de fin retirés, espaces multiples réduits. */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
}

/** Adresse interne de la page de résultats (`/recherche?q=chef`, `/en/search?q=chef` une fois traduite). */
export function searchPageHref(query: string): string {
  const term = normalizeQuery(query);
  return term ? `/recherche?q=${encodeURIComponent(term)}` : '/recherche';
}
