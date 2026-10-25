import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Route } from 'next';
import { SiteLink as Link } from '@/i18n/site-link';
import { chipVariants } from '@/components/ui/chip';
import { Pagination } from '@/components/ui/pagination';
import { Reveal } from '@/components/ui/reveal';
import type { Review } from '@/lib/api/schema';
import { SectionShell } from '../content/section-shell';
import { ReviewCard } from './review-card';
import { SortSelect } from './sort-select';

type ReviewsListProps = {
  reviews: Review[];
  categories: { slug: string; name: string }[];
  category: string | null;
  sort: 'recent' | 'rating';
  page: number;
  totalPages: number;
};

/** Libellé court des rubriques françaises dans les filtres (maquette : « Proximité »). */
const SHORT_NAMES: Record<string, string> = { 'services-de-proximite': 'Proximité' };

/**
 * Avis publiés (`68:7342`) : filtres par rubrique (liens `?categorie=`), tri à droite (collé sous les filtres en mobile),
 * maçonnerie 3 colonnes remplie ligne par ligne (une colonne en dessous de 1 280 px, 4 avis en mobile), pagination.
 * Les avis apparaissent en cascade au défilement ; la liste, propre à chaque filtre, tri et page (`key`), est recréée
 * quand ils changent : les nouveaux avis apparaissent à leur tour en cascade.
 */
export function ReviewsList({ reviews, categories, category, sort, page, totalPages }: ReviewsListProps) {
  const t = useTranslations('reviews');
  const shortNames = useLocale() === 'en' ? {} : SHORT_NAMES;
  const query = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (category) params.set('categorie', category);
    if (sort === 'rating') params.set('tri', 'notes');
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    return params.toString();
  };
  const href = (changes: Record<string, string | null>) => {
    const value = query(changes);
    return `/avis-clients${value ? `?${value}` : ''}#avis` as Route;
  };
  const columns = [0, 1, 2].map((column) => reviews.filter((_, index) => index % 3 === column));
  const listKey = query({ page: String(page) });
  const delay = (index: number) => Math.min(index, 5) * 70;

  return (
    <SectionShell section={{ anchor: 'avis', tone: 'light' }} innerClassName="flex flex-col gap-7 xl:gap-12">
      <div className="flex flex-col md:gap-4 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label={t('filter')}>
          <ul className="flex flex-wrap gap-2">
            {[{ slug: null, name: t('all') }, ...categories].map((item) => {
              const selected = item.slug === category;
              return (
                <li key={item.slug ?? 'tous'}>
                  <Link
                    href={href({ categorie: item.slug, page: null })}
                    scroll={false}
                    aria-current={selected ? 'page' : undefined}
                    className={chipVariants({ selected })}
                  >
                    {selected && <Check aria-hidden strokeWidth={2.5} />}
                    {(item.slug && shortNames[item.slug]) ?? item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <SortSelect value={sort} baseQuery={query({})} />
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border-strong p-7 text-center font-ui text-[15px] leading-6 text-text-muted">
          {t('empty')}
        </p>
      ) : (
        <>
          <ul
            key={`mobile-${listKey}`}
            className="flex flex-col gap-5 xl:hidden max-md:[&>li:nth-child(n+5)]:hidden"
          >
            {reviews.map((review, index) => (
              <Reveal as="li" key={review.id} delay={delay(index)}>
                <ReviewCard review={review} index={index} />
              </Reveal>
            ))}
          </ul>
          <div key={`desktop-${listKey}`} className="hidden items-start gap-5 xl:grid xl:grid-cols-3">
            {columns.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-5">
                {column.map((review) => (
                  <Reveal as="li" key={review.id} delay={delay(reviews.indexOf(review))}>
                    <ReviewCard review={review} index={reviews.indexOf(review)} />
                  </Reveal>
                ))}
              </ul>
            ))}
          </div>
        </>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(target) => href({ page: target === 1 ? null : String(target) })}
      />
    </SectionShell>
  );
}
