import { parseSitePath } from '@/i18n/href';
import type { PageKey } from '@/lib/api/schema';

/**
 * Pages prérendues construites sur une page éditoriale de l'API, par adresse interne (française). Le Magazine n'y
 * figure pas : déjà dynamique (éditions, `?edition=`), il lit lui-même `?preview=`.
 */
export const PREVIEWABLE_PAGES = {
  '/': 'accueil',
  '/services': 'services',
  '/zones-d-intervention': 'zones-d-intervention',
  '/qui-sommes-nous': 'qui-sommes-nous',
  '/mission': 'mission',
  '/partenaires': 'partenaires',
  '/formation': 'formation',
  '/recrutement': 'recrutement',
  '/avis-clients': 'avis-clients',
  '/suivi-mambo': 'suivi-mambo',
  '/mentions-legales': 'mentions-legales',
  '/confidentialite': 'confidentialite',
  '/cookies': 'cookies',
  '/cgu': 'cgu',
} as const satisfies Record<string, PageKey>;

export type PreviewablePageKey = (typeof PREVIEWABLE_PAGES)[keyof typeof PREVIEWABLE_PAGES];

const PREVIEWABLE_KEYS = new Set<string>(Object.values(PREVIEWABLE_PAGES));

export function isPreviewablePageKey(value: string): value is PreviewablePageKey {
  return PREVIEWABLE_KEYS.has(value);
}

/** Segment de la route d'aperçu (`src/app/[locale]/(site)/apercu/[key]`). */
export const PREVIEW_ROUTE_SEGMENT = 'apercu';

/**
 * Adresse d'aperçu du back-office (`/qui-sommes-nous?preview=…`, `/en/about-us?preview=…`) → route d'aperçu
 * dynamique de la langue (`/en/apercu/qui-sommes-nous?preview=…`), vers laquelle le proxy réécrit la requête : les
 * pages restent prérendues pour les visiteurs, seul l'aperçu est rendu à la demande. `null` : pas de jeton, ou page
 * sans brouillon éditorial.
 */
export function previewRewrite(url: URL): URL | null {
  if (!url.searchParams.get('preview')) return null;
  const { locale, internal } = parseSitePath(url.pathname);
  const key = (PREVIEWABLE_PAGES as Record<string, PreviewablePageKey | undefined>)[internal];
  if (!key) return null;
  const target = new URL(`/${locale}/${PREVIEW_ROUTE_SEGMENT}/${key}`, url);
  target.search = url.search;
  return target;
}
