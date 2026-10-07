import { Quote } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { Stars } from '@/components/ui/stars';
import type { Review } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/**
 * Avis du service (`62:4496`) : fond `neutral/50`, py 96 ; cartes 648 bordées, rayon 24, p 32 (22 en mobile),
 * guillemet violet 28 (usage autorisé du violet) et 5 étoiles 15, citation 18/29 (16/25), signature 14/20.
 */
export function ServiceReviews({ title, reviews }: { title: string | null | undefined; reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="bg-neutral-50 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading eyebrow="Avis clients" title={title ?? 'Ils nous ont fait confiance'} />
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review, index) => (
            <Reveal as="li" key={review.id} delay={index * 70}>
              <figure className="flex h-full flex-col gap-4 rounded-xl border border-border-default bg-neutral-0 p-[22px] xl:p-8">
                <div className="flex items-center justify-between">
                  <Quote aria-hidden size={28} className="text-violet-500" />
                  <Stars rating={review.rating} size={15} />
                </div>
                <blockquote className="flex-1 font-ui text-[16px] leading-[25px] text-text-main xl:text-[18px] xl:leading-[29px]">
                  {frenchTypography(`« ${review.text} »`)}
                </blockquote>
                <figcaption className="font-ui text-[14px] leading-5 font-medium text-text-muted">
                  {[review.authorName, review.city].filter(Boolean).join(' · ')}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
