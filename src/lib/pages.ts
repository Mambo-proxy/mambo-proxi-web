import type { Metadata } from 'next';
import type { PageKey } from '@/lib/api/schema';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';

/** Page éditoriale publiée (`GET /v1/pages/{key}`), mise en cache avec l'étiquette de la page. */
export function getPage(key: PageKey) {
  return unwrapOrNull(
    api.GET('/v1/pages/{key}', { params: { path: { key } }, ...cached([cacheTags.page(key)]) }),
  );
}

/** Métadonnées d'une page éditoriale (titre et description SEO du back-office). */
export async function pageMetadata(key: PageKey, canonical: string): Promise<Metadata> {
  const page = await getPage(key);
  if (!page) return {};
  return {
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? undefined,
    alternates: { canonical },
    robots: page.seo.noindex ? { index: false } : undefined,
  };
}
