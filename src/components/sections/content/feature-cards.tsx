import { CountUp } from '@/components/ui/count-up';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { FeatureListSection, KeyFigure } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from './section-shell';

/**
 * « Pourquoi Mambo Proxi ? » (`63:5015`) : 3 cartes bordées (p 32, rayon 24 ; pastille 48 `vert/50` et icône verte,
 * numéro décoratif Poppins 40/44 `orange/200` à droite, titre 20/28, texte 15/23) puis 4 tuiles de chiffres
 * (`neutral/50`, p 28, rayon 20 ; valeur 48/56, 32/38 en mobile). Sans chiffres propres, ceux des Paramètres.
 */
export function FeatureCards({
  section,
  keyFigures,
}: {
  section: FeatureListSection;
  keyFigures: KeyFigure[];
}) {
  const figures: KeyFigure[] = section.figures && section.figures.length > 0 ? section.figures : keyFigures;
  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        titleMobile={section.titleMobile}
        lead={section.lead}
        leadMobile={section.leadMobile}
        className="xl:max-w-[760px]"
      />
      <div className="flex flex-col gap-4 xl:gap-12">
        <ul className="grid gap-4 md:grid-cols-3">
          {section.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 70}
              className="flex flex-col gap-3.5 rounded-3xl border border-border-default p-[23px] xl:p-8"
            >
              <span className="flex items-start justify-between gap-4">
                {item.icon && (
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-[14px] bg-vert-50"
                  >
                    <Icon name={item.icon} size={22} className="text-vert-700" />
                  </span>
                )}
                {item.number && (
                  <span
                    aria-hidden
                    data-number={item.number}
                    className="font-brand text-[40px] leading-[44px] font-semibold tracking-[-0.02em] text-orange-200 before:content-[attr(data-number)]"
                  />
                )}
              </span>
              <h3 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
                {frenchTypography(item.title)}
              </h3>
              {item.text && (
                <p className="font-ui text-[15px] leading-[23px] text-text-muted">
                  {frenchTypography(item.text)}
                </p>
              )}
            </Reveal>
          ))}
        </ul>
        {figures.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
            {figures.map((figure) => (
              <div
                key={figure.key}
                className="flex flex-col-reverse gap-1 rounded-[20px] bg-neutral-50 p-[18px] xl:p-7"
              >
                <dt className="font-ui text-[14px] leading-5 text-text-muted">{figure.label}</dt>
                <dd className="font-brand text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-text-main xl:text-[48px] xl:leading-[56px]">
                  <CountUp value={figure.value} prefix={figure.prefix ?? ''} suffix={figure.suffix ?? ''} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </SectionShell>
  );
}
