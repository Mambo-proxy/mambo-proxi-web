import type { Route } from 'next';
import Link from 'next/link';
import { AccentText } from '@/components/ui/accent-text';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { Visual } from '@/components/ui/visual';
import type { HeroSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { ResponsiveText } from './responsive-text';

type PageHeroProps = {
  section: HeroSection;
  breadcrumb: BreadcrumbItem[];
  whatsappHref: string | null;
};

/**
 * Héros des pages intérieures (Nos services `58:940`, rubriques…) : fond `neutral/50`, fil d'Ariane, sur-titre,
 * titre `web/hero` (52/58 → 32/38) dont la fin est en orange, chapô 19/31, boutons Devis + WhatsApp ;
 * illustration 560 × 420 rayon 32 à droite (350 × 240 sous le texte en mobile).
 */
export function PageHero({ section, breadcrumb, whatsappHref }: PageHeroProps) {
  return (
    <section className="bg-neutral-50">
      <div className="container-site grid items-center gap-6 pt-5 pb-10 md:pb-14 xl:grid-cols-[1fr_560px] xl:gap-16 xl:pt-12 xl:pb-20">
        <div className="flex flex-col gap-4 xl:gap-[22px]">
          <Breadcrumb items={breadcrumb} />
          {section.eyebrow && <p className="text-web-eyebrow">{frenchTypography(section.eyebrow)}</p>}
          {section.title && (
            <h1 className="text-web-hero tracking-[-0.025em] text-text-main max-xl:tracking-[-0.02em]">
              <AccentText text={section.title} />
            </h1>
          )}
          {section.lead && (
            <p className="text-web-lead text-text-muted">
              <ResponsiveText
                desktop={frenchTypography(section.lead)}
                mobile={section.leadMobile ? frenchTypography(section.leadMobile) : null}
              />
            </p>
          )}
          <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
            {section.primaryCta && (
              <Link href={section.primaryCta.href as Route} className={cn(buttonVariants(), 'max-md:w-full')}>
                {section.primaryCta.label}
              </Link>
            )}
            {section.secondaryCta && (
              <Link
                href={section.secondaryCta.href as Route}
                className={cn(buttonVariants({ variant: 'outline' }), 'bg-neutral-0 max-md:w-full')}
              >
                {section.secondaryCta.label}
              </Link>
            )}
            {section.showWhatsapp && whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'whatsapp' }), 'max-md:w-full')}
              >
                Écrire sur WhatsApp
              </a>
            )}
          </div>
        </div>
        {section.visual && (
          <Visual
            visual={section.visual}
            priority
            sizes="(min-width: 1280px) 560px, 100vw"
            className="h-60 rounded-xl md:h-[360px] xl:h-[420px] xl:rounded-[32px]"
          />
        )}
      </div>
    </section>
  );
}
