import { getTranslations } from 'next-intl/server';
import { SiteLink as Link } from '@/i18n/site-link';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { MagazineArticle, MagazineEditionSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from '../content/section-shell';

type MagazineArticlesProps = {
  articles: MagazineArticle[];
  /** Éditions publiées, de la plus récente à la plus ancienne (sélecteur affiché à partir de deux). */
  editions: MagazineEditionSummary[];
  /** Édition affichée. */
  currentId: string;
};

/** Adresse d'une édition : la plus récente sur `/magazine`, les autres sur `/magazine?edition={id}`. */
function editionHref(edition: MagazineEditionSummary, latestId: string | undefined): string {
  return edition.id === latestId ? '/magazine' : `/magazine?edition=${encodeURIComponent(edition.id)}`;
}

/**
 * Articles de l'édition affichée (`GET /v1/magazine`, non maquetté) : cartes dans le langage des cartes illustrées
 * (bordure, rayon 24, photo pleine largeur, thème en orange, titre Poppins 20/28), ancrées `article-{id}` pour les
 * résultats de la recherche ; texte de l'article dépliable. Sélecteur des éditions publiées au-dessus des cartes.
 */
export async function MagazineArticles({ articles, editions, currentId }: MagazineArticlesProps) {
  const t = await getTranslations('magazine');
  if (articles.length === 0 && editions.length < 2) return null;
  const latestId = editions[0]?.id;
  return (
    <SectionShell
      section={{ anchor: 'articles', tone: 'light' }}
      innerClassName="flex flex-col gap-7 xl:gap-12"
    >
      <SectionHeading eyebrow={t('articlesEyebrow')} title={t('articlesTitle')} />
      {editions.length > 1 && (
        <nav aria-label={t('editions')}>
          <ul className="flex flex-wrap gap-2">
            {editions.map((edition) => {
              const current = edition.id === currentId;
              return (
                <li key={edition.id}>
                  <Link
                    href={editionHref(edition, latestId)}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-ui text-[14px] leading-5 font-medium',
                      current
                        ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                        : 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50',
                    )}
                  >
                    {frenchTypography(`${edition.label} · ${edition.title}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      {articles.length > 0 && (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {articles.map((article, index) => (
            <Reveal key={article.id} as="li" delay={Math.min(index, 5) * 60}>
              <article
                id={article.anchor}
                className="flex h-full scroll-mt-(--site-header-h,0px) flex-col overflow-hidden rounded-3xl border border-border-default bg-neutral-0 data-[targeted=true]:border-brand-primary"
              >
                {article.image && (
                  <Visual
                    visual={{ illustration: 'photo', image: article.image, alt: article.image.alt ?? '' }}
                    sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
                    className="h-[180px] shrink-0"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2.5 p-5 xl:p-6">
                  <p className="font-ui text-[14px] leading-5 font-medium tracking-[0.005em] text-text-brand">
                    {frenchTypography(article.theme)}
                  </p>
                  <h3 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
                    {frenchTypography(article.title)}
                  </h3>
                  {article.excerpt && (
                    <p className="font-ui text-[15px] leading-[23px] text-text-muted">
                      {frenchTypography(article.excerpt)}
                    </p>
                  )}
                  {article.body && (
                    <details className="group/article mt-auto">
                      <summary className="cursor-pointer rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main">
                        {t('readArticle')}
                        <span className="sr-only"> : {article.title}</span>
                      </summary>
                      {/* HTML assaini par l'API (liste blanche de balises). */}
                      <div
                        className="mt-3 flex flex-col gap-3 font-ui text-[15px] leading-[23px] text-text-muted"
                        dangerouslySetInnerHTML={{ __html: article.body }}
                      />
                    </details>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
