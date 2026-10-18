import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import { SiteLink as Link } from '@/i18n/site-link';
import type { DynamicSection, ServiceSummary } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/** Adresses des deux actions d'une formule : prise de rendez-vous et devis, formule présélectionnée. */
export function formulaLinks(slug: string) {
  return {
    booking: `/contact?service=${encodeURIComponent(slug)}#rendez-vous`,
    quote: `/devis?service=${encodeURIComponent(slug)}`,
  };
}

function FormulaCard({ formula }: { formula: ServiceSummary }) {
  const t = useTranslations('home.formulas');
  const links = formulaLinks(formula.slug);
  const action =
    'group/action inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] whitespace-nowrap';
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border-default bg-neutral-0">
      <Visual
        visual={formula.visual}
        sizes="(min-width: 1280px) 313px, (min-width: 768px) 50vw, 100vw"
        className="h-[170px] shrink-0 xl:h-[220px]"
      />
      <div className="flex flex-col gap-3 p-5 xl:p-[26px]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-vert-50 text-vert-700">
            <Icon name={formula.icon} size={18} />
          </span>
          <h3 className="min-w-0 flex-1 font-brand text-[17px] leading-[26px] font-semibold text-text-main xl:text-[19px]">
            {frenchTypography(formula.name)}
          </h3>
        </div>
        <p className="font-ui text-[14px] leading-[23px] text-text-muted xl:text-[15px]">
          {frenchTypography(formula.summary)}
        </p>
        <div className="flex items-center justify-between pt-1.5">
          <Link href={links.booking} className={`${action} text-text-main`}>
            {t('book')}
            <span className="sr-only"> — {formula.name}</span>
            <ArrowRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/action:translate-x-[3px]"
            />
          </Link>
          <Link href={links.quote} className={`${action} text-text-brand`}>
            {t('quote')}
            <span className="sr-only"> — {formula.name}</span>
            <ArrowUpRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/action:translate-x-[2px] group-hover/action:-translate-y-[2px]"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * « Services à domicile » de l'accueil (Figma `251:25576`, mobile `251:25375`) : fond `neutral/50`, en-tête 820 px,
 * 4 cartes de formule (313 px, gap 20, hauteurs libres, alignées en haut) ; pile en mobile (gap 14), 2 colonnes
 * en tablette. Photo 220 (170 en mobile), contenu p 26 (20), titre Poppins 19 (17), texte 15/23 (14/23).
 */
export function FormulaCards({ section, formulas }: { section: DynamicSection; formulas: ServiceSummary[] }) {
  return (
    <section className="bg-neutral-50 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          titleMobile={section.titleMobile}
          lead={section.lead}
          leadMobile={section.leadMobile}
          className="gap-3 xl:max-w-[820px] xl:gap-4"
        />
        <ul className="grid items-start gap-3.5 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {formulas.map((formula, index) => (
            <Reveal as="li" key={formula.slug} delay={Math.min(index, 3) * 70}>
              <FormulaCard formula={formula} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
