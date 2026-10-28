import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageSections } from '@/components/sections/content/page-sections';
import { ArticleAnchor } from '@/components/sections/magazine/article-anchor';
import { MagazineArticles } from '@/components/sections/magazine/magazine-articles';
import { PreviewBanner } from '@/components/site/preview-banner';
import type { MagazineEdition, Page, PageSection } from '@/lib/api/schema';
import { unwrapOrNull } from '@/lib/api/result';
import { api, cached, uncached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { getPage, pageMetadata, previewState } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { seoMetadata } from '@/lib/seo/metadata';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

type SearchParams = { searchParams: Promise<{ edition?: string | string[]; preview?: string | string[] }> };

const single = (value: string | string[] | undefined) =>
  typeof value === 'string' && value ? value : undefined;

/** Aperçu (`?preview=`, page ou édition) : brouillon de la page lu sans cache, jamais indexé. */
export async function generateMetadata({
  params,
  searchParams,
}: LocaleParams & SearchParams): Promise<Metadata> {
  await withLocale(params);
  const preview = single((await searchParams).preview);
  if (!preview) return pageMetadata('magazine', '/magazine');
  const page = await getPage('magazine', { preview });
  if (!page) return {};
  return seoMetadata({ title: page.title, path: '/magazine', seo: page.seo, noindex: true });
}

/**
 * `GET /v1/magazine` : édition affichée (la dernière publiée, celle de `?edition=`, ou le brouillon d'un jeton
 * d'aperçu du back-office, jamais mis en cache) et éditions publiées. Étiquette `page:magazine`, envoyée par l'API à
 * chaque modification d'une édition en ligne. `null` : édition inconnue ou retirée (404).
 */
function getMagazine(edition: string | undefined, preview: string | undefined) {
  return unwrapOrNull(
    api.GET('/v1/magazine', {
      params: { query: { ...(edition ? { edition } : {}), ...(preview ? { preview } : {}) } },
      ...(preview ? uncached : cached([cacheTags.page('magazine')])),
    }),
  );
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  nbsp: String.fromCharCode(0xa0),
};

/** Paragraphes d'un texte riche de l'API (`<p>…</p>`, assaini), en texte brut pour la section « Édito ». */
function htmlParagraphs(html: string): string[] {
  const blocks = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [html];
  return blocks
    .map((block) =>
      block
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name] ?? ''),
    )
    .map((text) => text.trim())
    .filter(Boolean);
}

type Copy = {
  heroTitle: string;
  editoEyebrow: string;
};

/**
 * Page `magazine` (Pages & textes) habillée avec l'édition affichée : titre du héros (« Mambo Proxi — Édition n° 1 »),
 * photo de couverture, sur-titre de l'édito (« Édito · Édition spéciale — … »). Pour la dernière édition, le texte de
 * l'édito et les thèmes du numéro restent ceux de la page (maquette) ; pour une autre édition (ou un aperçu), l'édito
 * et la signature viennent de l'édition, et les thèmes de la page (ceux du dernier numéro) sont masqués.
 */
function withEdition(page: Page, edition: MagazineEdition, isLatest: boolean, copy: Copy): Page {
  const sections = page.sections.map((section): PageSection => {
    if (section.type === 'hero')
      return {
        ...section,
        title: copy.heroTitle,
        visual: edition.cover
          ? {
              illustration: section.visual?.illustration ?? 'portrait',
              image: edition.cover,
              alt: section.visual?.alt || edition.cover.alt || '',
            }
          : section.visual,
      };
    if (section.type === 'textMedia' && section.anchor === 'edito') {
      if (isLatest || !edition.editorial) return { ...section, eyebrow: copy.editoEyebrow };
      return {
        ...section,
        eyebrow: copy.editoEyebrow,
        quote: null,
        paragraphs: htmlParagraphs(edition.editorial),
        signature: edition.signature,
      };
    }
    if (section.type === 'cardGrid' && !isLatest) return { ...section, enabled: false };
    return section;
  });
  if (isLatest) return { ...page, sections };
  // Puces du héros : seules celles dont la cible est encore affichée (les thèmes du dernier numéro sont masqués).
  const anchors = new Set(
    sections.filter((section) => section.enabled && section.anchor).map((section) => `#${section.anchor}`),
  );
  anchors.add('#articles');
  return {
    ...page,
    sections: sections.map((section) =>
      section.type === 'hero' && section.anchors
        ? { ...section, anchors: section.anchors.filter((link) => anchors.has(link.href)) }
        : section,
    ),
  };
}

/**
 * Magazine (desktop `254:26265`, mobile `254:26493`) : sections de la page `magazine` — héros et pastilles, édito de
 * la fondatrice, thèmes du numéro, bandeau d'abonnement à la lettre Mambo — habillées avec l'édition de
 * `GET /v1/magazine`, puis les articles de l'édition (ancres `article-{id}` des résultats de la recherche,
 * `ArticleAnchor`) et le sélecteur des éditions, avant le bandeau d'abonnement.
 */
export default async function MagazinePage({ params, searchParams }: LocaleParams & SearchParams) {
  await withLocale(params);
  const query = await searchParams;
  const editionId = single(query.edition);
  const preview = single(query.preview);
  const [page, magazine, settings, t, tm] = await Promise.all([
    getPage('magazine', { preview }),
    getMagazine(editionId, preview),
    getSiteSettings(),
    getTranslations('rubrique'),
    getTranslations('magazine'),
  ]);
  if (!page) notFound();
  // Édition demandée inconnue, retirée, ou jeton d'aperçu d'une édition supprimée.
  if (!magazine && (editionId || preview)) notFound();

  const edition = magazine?.edition ?? null;
  const isLatest = Boolean(edition && !magazine?.isPreview && edition.id === magazine?.editions[0]?.id);
  const issue = edition
    ? edition.number === null
      ? tm('specialIssue')
      : tm('issue', { number: edition.number })
    : null;
  const shown =
    edition && issue
      ? withEdition(page, edition, isLatest, {
          heroTitle: tm('heroTitle', { issue }),
          editoEyebrow: edition.subtitle
            ? tm('editoEyebrow', { subtitle: edition.subtitle, title: edition.title })
            : tm('editoEyebrowShort', { title: edition.title }),
        })
      : page;

  // Articles et sélecteur des éditions avant le bandeau d'abonnement (dernière section de la page).
  const split = shown.sections.findIndex((section) => section.type === 'ctaBand');
  const at = split === -1 ? shown.sections.length : split;
  const common = {
    breadcrumb: [{ label: t('home'), href: routes.home }, { label: page.title }],
    whatsappHref: settings.whatsapp.enabled
      ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message)
      : null,
    keyFigures: settings.keyFigures ?? [],
    heroVisualClassName: 'xl:h-[460px]',
  };
  const themesAnchor = shown.sections.find(
    (section) => section.type === 'cardGrid' && section.enabled,
  )?.anchor;
  return (
    <>
      <ArticleAnchor fallbackId={themesAnchor ?? (edition ? 'articles' : null)} />
      {/* Jeton d'une édition (texte du Magazine) ou de la page (Pages & textes) ; refusé par les deux : expiré. */}
      {magazine?.isPreview ? (
        <PreviewBanner state="draft">{tm('preview')}</PreviewBanner>
      ) : (
        <PreviewBanner state={previewState(preview, page)} />
      )}
      <PageSections page={{ ...shown, sections: shown.sections.slice(0, at) }} {...common} />
      {edition && magazine && (
        <MagazineArticles articles={edition.articles} editions={magazine.editions} currentId={edition.id} />
      )}
      <PageSections page={{ ...shown, sections: shown.sections.slice(at) }} {...common} />
    </>
  );
}
