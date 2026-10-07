import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { QuoteSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { TONE_BACKGROUND } from './section-shell';

/**
 * Citation-signature (Mission `64:5514`) : bandeau `vert/50` rayon 32, p 56, citation Poppins SemiBold 34/44 `vert/900`,
 * attribution 14/20 `vert/700`, illustration 360 × 240 à droite (supprimée en mobile : p 24, citation 22/30).
 * La section n'a pas de marge haute : elle suit une section blanche.
 */
export function QuoteBand({ section }: { section: QuoteSection }) {
  return (
    <section className="bg-neutral-0 pb-14 xl:pb-24">
      <div className="container-site">
        <Reveal
          as="figure"
          className={`flex items-center gap-12 rounded-3xl p-6 xl:rounded-[32px] xl:p-14 ${TONE_BACKGROUND[section.tone ?? 'green']}`}
        >
          <div className="flex flex-1 flex-col gap-4">
            <blockquote className="font-brand text-[22px] leading-[30px] font-semibold tracking-[-0.01em] text-vert-900 xl:text-[34px] xl:leading-[44px]">
              {frenchTypography(`« ${section.text} »`)}
            </blockquote>
            {section.author && (
              <figcaption className="font-ui text-[14px] leading-5 font-medium tracking-[0.005em] text-vert-700">
                {section.author}
              </figcaption>
            )}
          </div>
          {section.visual && (
            <Visual
              visual={section.visual}
              sizes="360px"
              className="hidden h-60 w-[360px] shrink-0 rounded-3xl md:block"
            />
          )}
        </Reveal>
      </div>
    </section>
  );
}
