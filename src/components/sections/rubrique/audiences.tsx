import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { CategoryDetail } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { tintBadge } from './tint';

/**
 * « Pour qui ? » (Expérience `60:1631`) : titre 48/56 (bloc 820), 3 cartes `neutral/50` rayon 24, p 28 ;
 * icône 24 dans un carré 52 à la teinte de la rubrique ; en mobile, lignes empilées (icône 44 à gauche).
 */
export function Audiences({ category }: { category: CategoryDetail }) {
  if (category.audiences.length === 0) return null;
  return (
    <section className="bg-neutral-0 py-12 xl:py-20">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading eyebrow="Pour qui ?" title={category.audiencesTitle} className="xl:max-w-[820px]" />
        <ul className="grid gap-4 md:grid-cols-3">
          {category.audiences.map((audience, index) => (
            <Reveal
              as="li"
              key={audience.title}
              delay={index * 70}
              className="flex gap-4 rounded-xl bg-neutral-50 p-5 md:flex-col md:p-7"
            >
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-[14px] md:size-[52px] md:rounded-2xl',
                  tintBadge(category.tint),
                )}
              >
                {audience.icon && <Icon name={audience.icon} className="size-5 md:size-6" />}
              </span>
              <span className="flex flex-col gap-1 md:gap-2">
                <span className="font-brand text-[16px] leading-7 font-semibold text-text-main md:text-[19px]">
                  {frenchTypography(audience.title)}
                </span>
                <span className="font-ui text-[14px] leading-[22px] text-text-muted md:text-[15px]">
                  {frenchTypography(audience.text)}
                </span>
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
