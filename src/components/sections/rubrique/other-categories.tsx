import { ArrowUpRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { CategoryDetail } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/**
 * « Nos autres rubriques » (`60:1886`) : 3 cartes horizontales (rayon 20) — vignette 88 (72 en mobile), nom,
 * « accroche · N services », flèche ↗. Empilées en mobile.
 */
export function OtherCategories({ category }: { category: CategoryDetail }) {
  if (category.otherCategories.length === 0) return null;
  return (
    <section className="bg-neutral-0 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading eyebrow="Découvrir aussi" title="Nos autres rubriques" />
        <ul className="grid gap-4 md:grid-cols-3">
          {category.otherCategories.map((other, index) => (
            <Reveal as="li" key={other.slug} delay={index * 70}>
              <Link
                href={other.href as Route}
                className="group/card flex items-center gap-4 rounded-[20px] border border-border-default bg-neutral-0 p-4 transition-colors hover:bg-neutral-50 md:p-5"
              >
                <Visual
                  visual={other.thumbnail ?? other.visual}
                  sizes="88px"
                  className="size-[72px] shrink-0 rounded-lg md:size-[88px]"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-ui text-[16px] leading-6 font-semibold text-text-main">
                    {frenchTypography(other.name)}
                  </span>
                  <span className="font-ui text-[14px] leading-5 text-text-muted">
                    {frenchTypography(`${other.tagline} · ${other.serviceCount} services`)}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  size={20}
                  className="shrink-0 text-text-main transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
