import { CountUp } from '@/components/ui/count-up';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { FeatureListSection, KeyFigure } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { ResponsiveText } from '../responsive-text';

/** Habillage des 4 tuiles de chiffres (maquette) : neutre, dégradé orange, sombre, vert. */
const FIGURE_TONES = [
  { card: 'bg-neutral-50', value: 'text-text-main', label: 'text-text-muted' },
  { card: 'bg-gradient-energie', value: 'text-neutral-900', label: 'text-neutral-900' },
  { card: 'bg-neutral-900', value: 'text-neutral-0', label: 'text-neutral-300' },
  { card: 'bg-vert-50', value: 'text-vert-800', label: 'text-vert-800' },
];

function FigureTile({ figure, index, className }: { figure: KeyFigure; index: number; className?: string }) {
  const tone = FIGURE_TONES[index % FIGURE_TONES.length] ?? FIGURE_TONES[0]!;
  const isLast = index === 3;
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-[20px] p-5 md:rounded-[28px] md:p-7',
        tone.card,
        className,
      )}
    >
      <p
        className={cn(
          'font-brand text-[34px] leading-10 font-semibold tracking-[-0.02em]',
          isLast ? 'md:text-[48px] md:leading-[56px]' : 'md:text-[56px] md:leading-[60px]',
          tone.value,
        )}
      >
        <CountUp value={figure.value} prefix={figure.prefix ?? ''} suffix={figure.suffix ?? ''} />
      </p>
      <p className={cn('font-ui text-[13px] leading-5 md:text-[14px]', tone.label)}>
        <ResponsiveText
          desktop={frenchTypography(figure.label)}
          mobile={figure.labelMobile ? frenchTypography(figure.labelMobile) : null}
        />
      </p>
    </div>
  );
}

/**
 * « Nos engagements » (Figma `50:410`, mobile `54:639`) : colonne texte 560 (engagements séparés par une bordure,
 * icône 22 dans un carré vert pâle) + chiffres clés sur 2 colonnes avec l'illustration équipe ; en mobile, grille 2 × 2.
 * Chiffres : ceux de la section, sinon ceux des Paramètres.
 */
export function Commitments({
  section,
  keyFigures,
}: {
  section: FeatureListSection;
  keyFigures: KeyFigure[];
}) {
  const figures = (section.figures?.length ? section.figures : keyFigures) as KeyFigure[];
  const [projects, partners, services, countries] = figures;
  return (
    <section className="bg-neutral-0 py-16 xl:py-28">
      <div className="container-site grid gap-8 xl:grid-cols-[560px_1fr] xl:items-center xl:gap-16">
        <div className="flex flex-col gap-6 xl:gap-8">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            titleMobile={section.titleMobile}
            lead={section.lead}
            leadMobile={section.leadMobile}
          />
          <ul className="flex flex-col gap-6 md:gap-0">
            {section.items.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 70}
                className="flex gap-4 md:gap-5 md:border-t md:border-border-default md:py-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-vert-50 text-vert-700 md:size-12">
                  {item.icon && <Icon name={item.icon} className="size-5 md:size-[22px]" />}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-ui text-[16px] leading-6 font-semibold text-text-main md:font-brand md:text-[19px] md:leading-7">
                    {frenchTypography(item.title)}
                  </span>
                  {item.text && (
                    <span className="font-ui text-[14px] leading-5 text-text-muted md:text-[16px] md:leading-6">
                      <ResponsiveText
                        desktop={frenchTypography(item.text)}
                        mobile={item.textMobile ? frenchTypography(item.textMobile) : null}
                      />
                    </span>
                  )}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Mobile et tablette : grille 2 × 2. */}
        <div className="grid grid-cols-2 gap-3 xl:hidden">
          {figures.slice(0, 4).map((figure, index) => (
            <Reveal key={figure.key} delay={index * 70}>
              <FigureTile figure={figure} index={index} className="h-full" />
            </Reveal>
          ))}
        </div>

        {/* Desktop : illustration + 150+ à gauche ; 40+, 19, 2 pays à droite. */}
        <div className="hidden grid-cols-2 gap-4 xl:grid">
          <div className="flex flex-col gap-4">
            {section.visual && (
              <Reveal>
                <Visual visual={section.visual} sizes="336px" className="h-[330px] rounded-[28px]" />
              </Reveal>
            )}
            {projects && (
              <Reveal delay={70}>
                <FigureTile figure={projects} index={0} />
              </Reveal>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {partners && (
              <Reveal delay={70}>
                <FigureTile figure={partners} index={1} className="md:pb-[108px]" />
              </Reveal>
            )}
            {services && (
              <Reveal delay={140}>
                <FigureTile figure={services} index={2} />
              </Reveal>
            )}
            {countries && (
              <Reveal delay={210}>
                <FigureTile figure={countries} index={3} />
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
