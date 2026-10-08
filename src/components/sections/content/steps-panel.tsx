import { AccentText } from '@/components/ui/accent-text';
import { Icon } from '@/components/ui/icon';
import type { StepsSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionShell } from './section-shell';

/**
 * Bloc texte + étapes (Avis clients « Votre avis compte » `68:7519`) : carte blanche bordée, rayon 32, p 48 (25 en
 * mobile) ; texte à gauche (sur-titre 12/16, titre Poppins 34/42, texte 16/26) et étapes à droite (420 : fond
 * `neutral/50`, rayon 16, p 14, pastille 36 blanche et icône orange, libellé 14/20), empilés en mobile.
 */
export function StepsPanel({ section }: { section: StepsSection }) {
  return (
    <SectionShell section={section}>
      <div className="flex flex-col gap-6 rounded-3xl border border-border-default bg-neutral-0 p-[25px] xl:flex-row xl:items-center xl:gap-14 xl:rounded-[32px] xl:p-12">
        <div className="flex flex-1 flex-col gap-3.5">
          {section.eyebrow && (
            <p className="font-ui text-[12px] leading-4 font-semibold tracking-[0.08em] text-text-brand uppercase">
              {frenchTypography(section.eyebrow)}
            </p>
          )}
          {section.title && (
            <h2 className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.01em] text-text-main xl:text-[34px] xl:leading-[42px]">
              <AccentText text={section.title} />
            </h2>
          )}
          {section.lead && (
            <p className="font-ui text-[16px] leading-[26px] text-text-muted">
              {frenchTypography(section.lead)}
            </p>
          )}
        </div>
        <ol className="flex flex-col gap-2.5 xl:w-[420px]">
          {section.items.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3.5 font-ui text-[14px] leading-5 font-medium text-text-main"
            >
              {item.icon && (
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-neutral-0"
                >
                  <Icon name={item.icon} size={17} className="text-text-brand" />
                </span>
              )}
              {frenchTypography(item.title)}
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
