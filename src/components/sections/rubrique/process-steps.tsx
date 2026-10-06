import { Reveal } from '@/components/ui/reveal';
import type { CategoryDetail } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/**
 * « Comment ça se passe » (`60:1833`) : 4 cartes bordées (rayon 20, p 27) ; pastille numérotée 36 sombre,
 * la dernière en orange ; titre Inter SemiBold 16/24, texte 14/20. Lignes empilées en mobile.
 */
export function ProcessSteps({ category }: { category: CategoryDetail }) {
  const steps = category.processSteps;
  if (steps.length === 0) return null;
  return (
    <section className="bg-neutral-0 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading
          eyebrow="Comment ça se passe"
          title={category.processTitle}
          className="xl:max-w-[720px]"
        />
        <ol className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          {steps.map((step, index) => {
            const last = index === steps.length - 1;
            return (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 70}
                className="flex items-center gap-3.5 rounded-[20px] border border-border-default bg-neutral-0 p-[18px] md:flex-col md:items-start md:gap-4 md:p-[27px]"
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full font-ui text-[14px] leading-5 font-semibold',
                    last ? 'bg-brand-primary text-neutral-900' : 'bg-neutral-900 text-neutral-0',
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex flex-col gap-0.5 md:gap-1">
                  <span className="font-ui text-[16px] leading-6 font-semibold text-text-main">
                    {frenchTypography(step.title)}
                  </span>
                  <span className="font-ui text-[14px] leading-5 text-text-muted">
                    {frenchTypography(step.text)}
                  </span>
                </span>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
