import { Quote } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { CategoryDetail } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

/**
 * Témoignage de la rubrique (`60:1862`) : carte blanche bordée rayon 32 ; guillemet violet 40 (usage autorisé du
 * violet), citation Poppins Medium 26/40, auteur avec initiales ; illustration 380 × 300 à droite (absente en mobile).
 */
export function Testimonial({ category }: { category: CategoryDetail }) {
  const review = category.testimonial;
  if (!review) return null;
  const subtitle = [review.city, review.service?.name].filter(Boolean).join(' · ');
  return (
    <section className="bg-neutral-50 py-14 xl:py-24">
      <div className="container-site">
        <Reveal className="grid items-center gap-10 rounded-xl border border-border-default bg-neutral-0 p-6 md:p-10 xl:grid-cols-[1fr_380px] xl:gap-16 xl:rounded-[32px] xl:p-14">
          <figure className="flex flex-col gap-[18px] xl:gap-6">
            <Quote aria-hidden className="size-7 text-violet-500 xl:size-10" />
            <blockquote className="font-brand text-[19px] leading-6 font-medium text-text-main xl:text-[26px] xl:leading-10">
              {frenchTypography(`« ${review.text} »`)}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-ui text-[15px] leading-6 font-semibold text-text-main"
              >
                {review.initials}
              </span>
              <span className="flex flex-col">
                <span className="font-ui text-[16px] leading-6 font-semibold text-text-main">
                  {review.authorName}
                </span>
                {subtitle && (
                  <span className="font-ui text-[12px] leading-4 text-text-muted">
                    {frenchTypography(subtitle)}
                  </span>
                )}
              </span>
            </figcaption>
          </figure>
          <Visual
            visual={category.testimonialVisual ?? { illustration: 'equipe', image: null, alt: '' }}
            sizes="380px"
            className="hidden h-[300px] rounded-xl xl:block"
          />
        </Reveal>
      </div>
    </section>
  );
}
