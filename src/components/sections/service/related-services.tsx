import { ArrowUpRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { ServiceSummary } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/**
 * Services liés (`62:4537`) : 3 cartes horizontales bordées, rayon 22, p 16 (14 en mobile) ; vignette 96 (76),
 * rayon 16 ; titre 16/24, résumé 13/19 ; flèche ↗ 20. Toute la carte est cliquable.
 */
export function RelatedServices({
  title,
  services,
}: {
  title: string | null | undefined;
  services: ServiceSummary[];
}) {
  if (services.length === 0) return null;
  return (
    <section className="bg-neutral-0 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading eyebrow="Services liés" title={title ?? 'Pour aller plus loin'} />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={index * 70}>
              <Link
                href={service.href as Route}
                className="group/related flex h-full items-center gap-4 rounded-[22px] border border-border-default bg-neutral-0 p-3.5 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-2 xl:p-4"
              >
                <Visual
                  visual={service.visual}
                  sizes="96px"
                  className="size-[76px] shrink-0 rounded-2xl xl:size-24"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-ui text-[16px] leading-6 font-semibold text-text-main">
                    {frenchTypography(service.name)}
                  </span>
                  <span className="font-ui text-[13px] leading-[19px] text-text-muted">
                    {frenchTypography(service.summary)}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  size={20}
                  className="shrink-0 text-text-main transition-transform duration-200 group-hover/related:translate-x-0.5 group-hover/related:-translate-y-0.5"
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
