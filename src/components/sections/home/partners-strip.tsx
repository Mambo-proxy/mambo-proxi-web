import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { Route } from 'next';
import Link from 'next/link';
import type { DynamicSection, Partner } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { ResponsiveText } from '../responsive-text';

/**
 * « Ils travaillent à nos côtés » (Figma `52:490`, mobile `54:753`) : 6 tuiles `neutral/50` rayon 20 (hauteur 88 ;
 * 3 × 2 de 60 px en mobile) ; logo du partenaire, ou son nom tant qu'aucun logo n'est fourni.
 */
export function PartnersStrip({ section, partners }: { section: DynamicSection; partners: Partner[] }) {
  const shown = partners.slice(0, section.limit ?? 6);
  return (
    <section className="bg-neutral-0 py-12 md:py-20">
      <div className="container-site flex flex-col items-center gap-5 md:gap-8">
        {section.title && (
          <h2 className="text-center font-ui text-[14px] leading-5 font-semibold text-text-muted md:text-[16px] md:leading-6">
            {frenchTypography(section.title)}
          </h2>
        )}
        <ul className="grid w-full grid-cols-3 gap-x-2.5 gap-y-5 md:grid-cols-6 md:gap-4">
          {shown.map((partner) => (
            <li
              key={partner.id}
              className="flex h-[60px] items-center justify-center rounded-[20px] bg-neutral-50 px-3 md:h-[88px]"
            >
              {partner.logo ? (
                <Image
                  src={partner.logo.url}
                  alt={partner.name}
                  width={partner.logo.width}
                  height={partner.logo.height}
                  className="max-h-10 w-auto object-contain md:max-h-12"
                />
              ) : (
                <span className="text-center font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-muted">
                  <ResponsiveText desktop="Logo partenaire" mobile="Logo" />
                </span>
              )}
            </li>
          ))}
        </ul>
        {section.link && (
          <Link
            href={section.link.href as Route}
            className="group/link inline-flex items-center gap-2 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand md:text-[16px] md:leading-6"
          >
            <ResponsiveText
              desktop={frenchTypography(section.link.label)}
              mobile={section.link.labelMobile ? frenchTypography(section.link.labelMobile) : null}
            />
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover/link:translate-x-[3px] md:size-[18px]"
            />
          </Link>
        )}
      </div>
    </section>
  );
}
