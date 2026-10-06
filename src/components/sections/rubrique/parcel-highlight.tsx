import { Info } from 'lucide-react';
import { AccentText } from '@/components/ui/accent-text';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { CategoryHighlight } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

/**
 * Réception de colis et de courrier (Services de proximité `61:3632`) : section sombre `neutral/900`, sur-titre
 * `orange/400`, titre blanc 48/56 ; 3 cartes `neutral/800` rayon 20 (pastille 48 `neutral/700`, icône orange 22) ;
 * note informative.
 */
export function ParcelHighlight({ highlight }: { highlight: CategoryHighlight }) {
  return (
    <section className="bg-neutral-900 py-14 text-neutral-0 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <div className="flex flex-col gap-4 xl:max-w-[760px]">
          {highlight.eyebrow && (
            <p className="font-ui text-[12px] leading-4 font-semibold tracking-[0.08em] text-orange-400 uppercase xl:text-[13px]">
              {frenchTypography(highlight.eyebrow)}
            </p>
          )}
          <h2 className="text-web-section">
            <AccentText text={highlight.title} accentClassName="text-orange-400" />
          </h2>
          {highlight.text && (
            <p className="text-web-lead text-neutral-300">{frenchTypography(highlight.text)}</p>
          )}
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {(highlight.steps ?? []).map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 70}
              className="flex flex-col gap-4 rounded-[20px] bg-neutral-800 p-5 md:p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-neutral-700 text-orange-400">
                {step.icon && <Icon name={step.icon} size={22} />}
              </span>
              <span className="flex flex-col gap-2">
                <span className="font-brand text-[19px] leading-7 font-semibold">
                  {frenchTypography(step.title)}
                </span>
                <span className="font-ui text-[15px] leading-[23px] text-neutral-300">
                  {frenchTypography(step.text)}
                </span>
              </span>
            </Reveal>
          ))}
        </ol>
        {highlight.note && (
          <p className="flex items-center gap-2 font-ui text-[14px] leading-5 text-neutral-400">
            <Info aria-hidden size={18} className="shrink-0" />
            {frenchTypography(highlight.note)}
          </p>
        )}
      </div>
    </section>
  );
}
