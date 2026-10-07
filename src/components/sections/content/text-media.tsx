import { Quote } from 'lucide-react';
import { AccentText } from '@/components/ui/accent-text';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { TextMediaSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionShell } from './section-shell';

/**
 * Présentation (Qui sommes-nous `63:4873`) : titre 40/48 à gauche (520), paragraphes 18/30 et piliers à droite
 * (pastilles `neutral/50` avec point orange), écart 80 ; une colonne en mobile (titre 26/32).
 */
function Presentation({ section }: { section: TextMediaSection }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)] xl:gap-20">
      <div className="flex flex-col gap-4">
        {section.eyebrow && <p className="text-web-eyebrow">{frenchTypography(section.eyebrow)}</p>}
        {section.title && (
          <h2 className="font-brand text-[26px] leading-8 font-semibold tracking-[-0.015em] text-text-main md:text-[34px] md:leading-[42px] xl:text-[40px] xl:leading-[48px] xl:tracking-[-0.02em]">
            <AccentText text={section.title} />
          </h2>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {section.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="font-ui text-[16px] leading-[26px] text-text-muted xl:text-[18px] xl:leading-[30px]"
          >
            {frenchTypography(paragraph)}
          </p>
        ))}
        {section.chips && section.chips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {section.chips.map((chip) => (
              <li
                key={chip}
                className="flex items-center gap-2 rounded-full bg-neutral-50 px-3.5 py-2 font-ui text-[14px] leading-5 font-medium text-text-main"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-brand-primary" />
                {chip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Parcours de la fondatrice (`63:4894`) : portrait 520 × 600 (350 × 380 en mobile, au-dessus), citation Poppins 28/40
 * avec guillemet violet (usage autorisé), texte 17/28, signature (trait orange 32 × 2, nom et fonction).
 */
function Founder({ section }: { section: TextMediaSection }) {
  const [name, role] = (section.signature ?? '').split(/\s+—\s+/);
  return (
    <div className="grid items-center gap-6 xl:grid-cols-[520px_minmax(0,1fr)] xl:gap-[72px]">
      {section.visual && (
        <Visual
          visual={section.visual}
          sizes="(min-width: 1280px) 520px, 100vw"
          className="h-[380px] rounded-3xl md:h-[480px] xl:h-[600px] xl:rounded-[32px]"
        />
      )}
      <Reveal as="figure" className="flex flex-col gap-4 xl:gap-5">
        {section.eyebrow && <p className="text-web-eyebrow">{frenchTypography(section.eyebrow)}</p>}
        <Quote aria-hidden className="size-7 text-violet-500 xl:size-10" />
        {section.quote && (
          <blockquote className="font-brand text-[20px] leading-7 font-medium text-text-main xl:text-[28px] xl:leading-10">
            {frenchTypography(`« ${section.quote} »`)}
          </blockquote>
        )}
        {section.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="font-ui text-[15px] leading-6 text-text-muted xl:text-[17px] xl:leading-7"
          >
            {frenchTypography(paragraph)}
          </p>
        ))}
        {name && (
          <figcaption className="flex items-center gap-3 pt-1">
            <span aria-hidden className="h-0.5 w-8 shrink-0 bg-brand-primary" />
            <span className="flex flex-col">
              <span className="font-ui text-[16px] leading-6 font-semibold text-text-main">{name}</span>
              {role && (
                <span className="font-ui text-[13px] leading-4 tracking-[0.01em] text-text-muted">
                  {role}
                </span>
              )}
            </span>
          </figcaption>
        )}
      </Reveal>
    </div>
  );
}

/** Section texte + média : citation signée (fondatrice) ou présentation en deux colonnes. */
export function TextMedia({ section }: { section: TextMediaSection }) {
  return (
    <SectionShell section={section}>
      {section.quote ? <Founder section={section} /> : <Presentation section={section} />}
    </SectionShell>
  );
}
