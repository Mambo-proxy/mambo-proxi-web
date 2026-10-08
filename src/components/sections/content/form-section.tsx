import type { ReactNode } from 'react';
import type { DynamicSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from './section-shell';

/**
 * Section formulaire (Partenaires `65:5991`, Formation) : colonne d'informations (420 : sur-titre, titre, chapô et
 * encadré « Et ensuite ? » en 3 étapes numérotées, masqué en mobile) et carte formulaire, écart 64.
 */
export function FormSection({
  section,
  aside,
  children,
}: {
  section: DynamicSection;
  /** Contenu complémentaire sous le chapô, masqué en mobile (Formation : illustration 420 × 280). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const steps = section.items ?? [];
  return (
    <SectionShell
      section={section}
      innerClassName="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-16"
    >
      <div className="flex flex-col gap-5">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          titleMobile={section.titleMobile}
          lead={section.lead}
          leadMobile={section.leadMobile}
          leadClassName="md:text-[16px] md:leading-[26px]"
        />
        {aside && <div className="hidden xl:block">{aside}</div>}
        {steps.length > 0 && (
          <div className="hidden flex-col gap-3.5 rounded-[20px] border border-border-default bg-neutral-0 p-6 xl:flex">
            <p className="font-ui text-[16px] leading-6 font-semibold text-text-main">
              {frenchTypography(section.note ?? 'Et ensuite ?')}
            </p>
            <ol className="flex flex-col gap-3.5">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-center gap-2.5 font-ui text-[14px] leading-5 text-text-main"
                >
                  <span
                    aria-hidden
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-neutral-900 font-ui text-[12px] leading-4 font-semibold text-neutral-0"
                  >
                    {index + 1}
                  </span>
                  {frenchTypography(step.title)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      {children}
    </SectionShell>
  );
}
