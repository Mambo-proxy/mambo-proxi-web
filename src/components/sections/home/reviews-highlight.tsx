import { ArrowRight, Quote } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { Stars } from '@/components/ui/stars';
import type { DynamicSection, Review, ReviewSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber, formatRating } from '@/lib/format/number';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { ReviewsCarousel } from './reviews-carousel';

/** Couleurs des avatars à initiales (maquette : orange 200, vert 200, neutre 200). */
const AVATARS = ['bg-orange-200', 'bg-vert-200', 'bg-neutral-200'];

const quoted = (text: string) => frenchTypography(`« ${text} »`);

/** Carte desktop (Figma `52:410`) : rayon 28, p 32, guillemet violet 32 (usage autorisé du violet), citation 18/29. */
function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <figure className="flex h-full flex-col gap-6 rounded-[28px] border border-border-default bg-neutral-0 p-8">
      <div className="flex items-center justify-between">
        <Quote aria-hidden size={32} className="text-violet-500" />
        <Stars rating={review.rating} size={16} />
      </div>
      <blockquote className="flex-1 font-ui text-[18px] leading-[29px] text-text-main">
        {quoted(review.text)}
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border-default pt-5">
        <span
          aria-hidden
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full font-ui text-[15px] leading-6 font-semibold text-text-main',
            AVATARS[index % AVATARS.length],
          )}
        >
          {review.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-ui text-[15px] leading-6 font-semibold text-text-main">
            {review.authorName}
          </span>
          {review.city && (
            <span className="font-ui text-[13px] leading-4 tracking-[0.01em] text-text-muted">
              {review.city}
            </span>
          )}
        </span>
        {review.service && (
          <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1.5 font-ui text-[12px] leading-4 font-semibold text-text-brand">
            {frenchTypography(review.service.name)}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/** Carte du carrousel mobile et tablette (`54:683`) : 300 px, rayon 24, citation 16/25 limitée à 4 lignes. */
function CompactReviewCard({ review, index }: { review: Review; index: number }) {
  const subtitle = [review.city, review.service?.name].filter(Boolean).join(' · ');
  return (
    <figure className="flex h-full flex-col gap-[18px] rounded-xl border border-border-default bg-neutral-0 p-6">
      <div className="flex items-center justify-between">
        <Quote aria-hidden size={26} className="text-violet-500" />
        <Stars rating={review.rating} size={14} />
      </div>
      <blockquote className="line-clamp-4 font-ui text-[16px] leading-[25px] text-text-main">
        {quoted(review.text)}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-[38px] shrink-0 items-center justify-center rounded-full font-ui text-[14px] leading-5 font-medium text-text-main',
            AVATARS[index % AVATARS.length],
          )}
        >
          {review.initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
            {review.authorName}
          </span>
          {subtitle && (
            <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
              {frenchTypography(subtitle)}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * « Avis clients » (Figma `52:389`) : en-tête avec note moyenne encadrée, 3 cartes, lien « Lire tous les avis » ;
 * en mobile et tablette, note en ligne et carrousel à pagination par points (`54:683`).
 */
export function ReviewsHighlight({
  section,
  reviews,
  summary,
}: {
  section: DynamicSection;
  reviews: Review[];
  summary: ReviewSummary;
}) {
  const average = formatRating(summary.average);
  const total = `${formatNumber(summary.total)}\u00A0avis`;
  return (
    <section className="overflow-hidden bg-neutral-50 py-16 xl:py-28">
      <div className="container-site flex flex-col gap-6 xl:gap-12">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            titleMobile={section.titleMobile}
            className="xl:max-w-[640px]"
          />
          <div className="flex items-center gap-2 xl:hidden">
            <span className="font-ui text-[18px] leading-6 font-semibold text-text-main">{average}</span>
            <Stars rating={summary.average} size={14} />
            <span className="font-ui text-[14px] leading-5 text-text-muted">· {total}</span>
          </div>
          <div className="hidden items-center gap-4 rounded-[20px] border border-border-default bg-neutral-0 px-6 py-4 xl:flex">
            <span className="font-brand text-[44px] leading-[48px] font-semibold tracking-[-0.02em] text-text-main">
              {average}
            </span>
            <span className="flex flex-col gap-1">
              <Stars rating={summary.average} size={16} />
              <span className="font-ui text-[14px] leading-5 text-text-muted">Note moyenne · {total}</span>
            </span>
          </div>
        </div>

        <div className="hidden grid-cols-3 gap-6 xl:grid">
          {reviews.map((review, index) => (
            <Reveal key={review.id} delay={index * 70}>
              <ReviewCard review={review} index={index} />
            </Reveal>
          ))}
        </div>
        <ReviewsCarousel className="xl:hidden">
          {reviews.map((review, index) => (
            <CompactReviewCard key={review.id} review={review} index={index} />
          ))}
        </ReviewsCarousel>

        {section.link && (
          <Link
            href={section.link.href as Route}
            className="group/link hidden items-center gap-2 self-center rounded-xs font-ui text-[16px] leading-6 font-semibold text-text-main xl:inline-flex"
          >
            {section.link.label}
            <ArrowRight
              aria-hidden
              size={18}
              className="transition-transform duration-200 group-hover/link:translate-x-[3px]"
            />
          </Link>
        )}
      </div>
    </section>
  );
}
