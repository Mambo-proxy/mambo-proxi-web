import type { Metadata } from 'next';
import { unstable_rethrow } from 'next/navigation';
import { cache } from 'react';
import type { Page, PageKey } from '@/lib/api/schema';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached, uncached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { seoMetadata } from '@/lib/seo/metadata';

/**
 * Jeton d'aperçu du rendu en cours, enregistré par la route d'aperçu (`/[locale]/apercu/[key]`, vers laquelle le
 * proxy réécrit les adresses `…?preview=`). Mémoire propre à la requête (`cache` de React) : les pages prérendues
 * lisent ainsi le brouillon sans lire `searchParams`, ce qui les garderait dynamiques pour tout le monde.
 */
const requestPreview = cache((): { token?: string } => ({}));

/** Enregistre le jeton d'aperçu pour le rendu en cours (route d'aperçu uniquement). */
export function setRequestPreview(token: string | undefined) {
  requestPreview().token = token || undefined;
}

/** Version publiée, mise en cache avec l'étiquette de la page (invalidée par l'API à chaque publication). */
function getPublishedPage(key: PageKey) {
  return unwrapOrNull(
    api.GET('/v1/pages/{key}', { params: { path: { key } }, ...cached([cacheTags.page(key)]) }),
  );
}

/**
 * Lecture avec un jeton d'aperçu, jamais mise en cache (l'API répond `private, no-store`) ; une seule lecture par
 * requête (métadonnées et page). Jeton valide : le brouillon (`isPreview: true`). Jeton expiré, invalide ou émis
 * pour une autre page : l'API renvoie la version publiée (`isPreview: false`), ou 404 si la page n'a jamais été
 * publiée. Toute autre erreur retombe sur la version publiée : un aperçu ne provoque jamais d'erreur 500.
 */
const getPreviewPage = cache(async (key: PageKey, preview: string): Promise<Page | null> => {
  try {
    const { data, response } = await api.GET('/v1/pages/{key}', {
      params: { path: { key }, query: { preview } },
      ...uncached,
    });
    if (response.status === 404) return null;
    if (response.ok && data) return data;
  } catch (error) {
    unstable_rethrow(error);
  }
  return getPublishedPage(key);
});

/**
 * Page éditoriale (`GET /v1/pages/{key}`), dans la langue de la page (`?lang=en` ajouté par le client serveur).
 * Sans jeton d'aperçu : version publiée, mise en cache avec l'étiquette de la page. Avec un jeton (`preview`, ou
 * celui enregistré par la route d'aperçu) : brouillon, sans cache (voir `getPreviewPage`). `null` : page introuvable.
 */
export function getPage(key: PageKey, options: { preview?: string } = {}): Promise<Page | null> {
  const preview = options.preview || requestPreview().token;
  return preview ? getPreviewPage(key, preview) : getPublishedPage(key);
}

/**
 * État de l'aperçu affiché : `draft` (brouillon servi), `expired` (jeton refusé : version publiée affichée), `null`
 * hors aperçu.
 */
export type PreviewState = 'draft' | 'expired' | null;

export function previewState(
  preview: string | undefined,
  page: Pick<Page, 'isPreview'> | null,
): PreviewState {
  if (!preview) return null;
  return page?.isPreview ? 'draft' : 'expired';
}

/** Métadonnées d'une page éditoriale (titre et description SEO du back-office, ceux du brouillon en aperçu). */
export async function pageMetadata(key: PageKey, canonical: string): Promise<Metadata> {
  const page = await getPage(key);
  if (!page) return {};
  return seoMetadata({ title: page.title, path: canonical, seo: page.seo });
}
