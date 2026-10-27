import { http, HttpResponse } from 'msw';
import type { Magazine, MagazineEdition, MagazineEditionSummary } from '@/lib/api/schema';
import { langOf, type Lang } from '../data/catalogue';
import { magazineArticles, magazineEditions, type MagazineEditionRecord } from '../data/admin-magazine';
import { problem } from '../problem';

const NBSP = String.fromCharCode(0xa0);
const EDITION_NOT_FOUND = 'Cette édition du magazine n’existe pas ou n’est plus publiée.';

/** Valeur dans la langue demandée, repli sur le français champ par champ (comme l'API). */
function pick<T extends string | null>(fr: T, en: string | null, lang: Lang): T | string {
  return lang === 'en' && en && en.trim() !== '' ? en : fr;
}

/** Éditions visibles sur le site : publiées, ou programmées dont la date est passée. */
function isVisible(edition: MagazineEditionRecord, now: number): boolean {
  if (edition.status === 'PUBLISHED') return true;
  return edition.status === 'SCHEDULED' && edition.publishAt !== null && Date.parse(edition.publishAt) <= now;
}

function label(number: number | null, lang: Lang): string {
  if (number === null) return lang === 'en' ? 'Special issue' : 'Hors-série';
  return lang === 'en' ? `No.${NBSP}${String(number)}` : `N°${NBSP}${String(number)}`;
}

function articlesOf(editionId: string) {
  return magazineArticles
    .filter((article) => article.editionId === editionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function toSummary(edition: MagazineEditionRecord, lang: Lang): MagazineEditionSummary {
  return {
    id: edition.id,
    number: edition.number,
    label: label(edition.number, lang),
    title: pick(edition.title, edition.titleEn, lang),
    subtitle: pick(edition.subtitle, edition.subtitleEn, lang),
    themes: edition.themes,
    cover: edition.cover,
    publishedAt: edition.publishAt,
    articlesCount: articlesOf(edition.id).length,
  };
}

function toEdition(edition: MagazineEditionRecord, lang: Lang): MagazineEdition {
  return {
    ...toSummary(edition, lang),
    editorial: pick(edition.editorial, edition.editorialEn, lang),
    signature: pick(edition.signature, edition.signatureEn, lang),
    articles: articlesOf(edition.id).map((article) => ({
      id: article.id,
      anchor: `article-${article.id}`,
      title: pick(article.title, article.titleEn, lang),
      theme: pick(article.theme, article.themeEn, lang),
      excerpt: pick(article.excerpt, article.excerptEn, lang),
      body: pick(article.body, article.bodyEn, lang),
      image: article.image,
    })),
  };
}

/**
 * `GET /v1/magazine` (site public) construit depuis les éditions du back-office simulé : éditions visibles de la plus
 * récente à la plus ancienne, édition de `?edition=` (404 si elle n'est pas publiée) ou du jeton d'aperçu simulé
 * (`apercu-<id>`, délivré par `…/preview-token`), quel que soit son statut.
 */
export const magazineHandlers = [
  http.get('*/v1/magazine', ({ request }) => {
    const url = new URL(request.url);
    const lang = langOf(request);
    const now = Date.now();
    const visible = magazineEditions
      .filter((edition) => isVisible(edition, now))
      .sort((a, b) => Date.parse(b.publishAt ?? '') - Date.parse(a.publishAt ?? ''));
    const editions = visible.map((edition) => toSummary(edition, lang));

    const preview = url.searchParams.get('preview');
    const previewId = preview?.startsWith('apercu-') ? preview.slice('apercu-'.length) : null;
    if (previewId) {
      const edition = magazineEditions.find((item) => item.id === previewId);
      if (!edition) return problem(404, EDITION_NOT_FOUND);
      const body: Magazine = { edition: toEdition(edition, lang), editions, isPreview: true };
      return HttpResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    const requested = url.searchParams.get('edition');
    const current = requested ? visible.find((edition) => edition.id === requested) : visible[0];
    if (requested && !current) return problem(404, EDITION_NOT_FOUND);
    const body: Magazine = {
      edition: current ? toEdition(current, lang) : null,
      editions,
      isPreview: false,
    };
    return HttpResponse.json(body);
  }),
];
