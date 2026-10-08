import type { Route } from 'next';
import Link from 'next/link';
import { AccentText } from '@/components/ui/accent-text';
import { buttonVariants } from '@/components/ui/button';
import type { CtaBandSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

/**
 * Bandeau sombre (Recrutement « Devenir prestataire » `67:6991`) : section blanche py 80 (48 en mobile), bandeau
 * `neutral/900` rayon 32, p 44 ; sur-titre orange, titre Poppins 32/40 blanc (22/28 en mobile), texte 16/24
 * `neutral/300`, bouton principal à droite (pleine largeur dessous en mobile).
 */
export function DarkBand({ section }: { section: CtaBandSection }) {
  return (
    <section className="bg-neutral-0 py-12 xl:py-20">
      <div className="container-site">
        <div className="flex flex-col gap-6 rounded-3xl bg-neutral-900 p-6 md:flex-row md:items-center md:gap-10 xl:rounded-[32px] xl:p-11">
          <div className="flex flex-1 flex-col gap-2.5">
            {section.eyebrow && (
              <p className="font-ui text-[12px] leading-4 font-semibold tracking-[0.08em] text-orange-400 uppercase">
                {frenchTypography(section.eyebrow)}
              </p>
            )}
            {section.title && (
              <h2 className="font-brand text-[22px] leading-7 font-semibold text-neutral-0 xl:text-[32px] xl:leading-10 xl:tracking-[-0.01em]">
                <AccentText text={section.title} />
              </h2>
            )}
            {section.text && (
              <p className="font-ui text-[16px] leading-6 text-neutral-300">
                {frenchTypography(section.text)}
              </p>
            )}
          </div>
          {section.primaryCta && (
            <Link
              href={section.primaryCta.href as Route}
              className={buttonVariants({ className: 'focus-visible:focus-ring-inverse max-md:w-full' })}
            >
              {section.primaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
