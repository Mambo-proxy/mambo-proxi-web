import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { CategorySummary, ServiceSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

/** Pastille d'icône des cartes service, par teinte de rubrique (maquette : Culture = fond sombre, icône orange). */
const BADGES: Record<string, string> = {
  'orange-50': 'bg-orange-50 text-text-brand',
  'neutral-100': 'bg-neutral-100 text-neutral-700',
  'vert-50': 'bg-vert-50 text-vert-700',
  'neutral-900': 'bg-neutral-900 text-brand-primary',
};

type Tone = { section: string; card: string };

function ServiceCard({ service, tone, badge }: { service: ServiceSummary; tone: Tone; badge: string }) {
  const name = service.shortName ?? service.name;
  return (
    <article
      className={cn(
        'group/card relative flex items-center gap-3.5 rounded-[18px] border border-border-default p-4 md:flex-col md:items-stretch md:rounded-xl md:p-7',
        tone.card,
      )}
    >
      <div className="flex shrink-0 items-center justify-between">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-[13px] md:size-[52px] md:rounded-2xl',
            badge,
          )}
        >
          <Icon name={service.icon} className="size-5 md:size-6" />
        </span>
        <span
          aria-hidden
          className="hidden size-10 items-center justify-center rounded-full border border-border-strong text-text-main transition-transform duration-300 group-hover/card:rotate-45 md:flex"
        >
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-3.5">
        <h3 className="font-ui text-[15px] leading-6 font-semibold text-text-main md:font-brand md:text-[20px] md:leading-7">
          <Link href={service.href as Route} className="after:absolute after:inset-0 after:rounded-[inherit]">
            {frenchTypography(name)}
          </Link>
        </h3>
        <p className="font-ui text-[13px] leading-[19px] text-text-muted md:text-[15px] md:leading-6">
          {frenchTypography(service.summary)}
        </p>
        <span
          aria-hidden
          className="hidden items-center gap-1.5 font-ui text-[14px] leading-5 font-semibold text-text-brand md:inline-flex"
        >
          En savoir plus
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover/card:translate-x-[3px]"
          />
        </span>
      </div>
      <ChevronRight aria-hidden size={18} className="shrink-0 text-icon-default md:hidden" />
    </article>
  );
}

/**
 * Rubrique de la page « Nos services » (Figma `58:978`…) : présentation 400 px (numéro `orange/200`, titre 40/48,
 * accroche orange, description, « Découvrir la rubrique », illustration) + grille de cartes 2 × 416 (gap 16) ;
 * en mobile, liste de lignes cliquables (`58:1602`). Fonds alternés blanc / `neutral/50`.
 */
export function CategoryServices({ category, index }: { category: CategorySummary; index: number }) {
  const tone: Tone =
    index % 2 === 0
      ? { section: 'bg-neutral-0', card: 'bg-neutral-50' }
      : { section: 'bg-neutral-50', card: 'bg-neutral-0' };
  const badge = BADGES[category.tint] ?? BADGES['neutral-100']!;
  const number = category.number ?? String(category.sortOrder).padStart(2, '0');
  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-titre`}
      className={cn('scroll-mt-[calc(var(--site-header-h,0px)+77px)] py-14 xl:py-24', tone.section)}
    >
      <div className="container-site grid gap-6 xl:grid-cols-[400px_1fr] xl:gap-16">
        <div className="flex flex-col gap-4 xl:self-start">
          {/* Numéro décoratif (orange très pâle de la maquette) : pseudo-élément, hors du texte de la page. */}
          <p
            aria-hidden
            data-number={number}
            className="font-brand text-[36px] leading-10 font-semibold tracking-[-0.02em] text-orange-200 before:content-[attr(data-number)] xl:text-[56px] xl:leading-[60px]"
          />
          <h2
            id={`${category.slug}-titre`}
            className="font-brand text-[28px] leading-[34px] font-semibold tracking-[-0.015em] text-text-main xl:text-[40px] xl:leading-[48px] xl:tracking-[-0.02em]"
          >
            {frenchTypography(category.name)}
          </h2>
          <p className="font-ui text-[16px] leading-6 font-semibold text-text-brand">
            {frenchTypography(category.tagline)}
          </p>
          <p className="font-ui text-[16px] leading-[26px] text-text-muted">
            {frenchTypography(category.description)}
          </p>
          <Link
            href={category.href as Route}
            className="group/link inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main"
          >
            Découvrir la rubrique
            <span className="sr-only"> {category.name}</span>
            <ArrowRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/link:translate-x-[3px]"
            />
          </Link>
          <Visual
            visual={category.visual}
            sizes="400px"
            className="mt-2 hidden h-[260px] rounded-xl xl:block"
          />
        </div>
        <ul className="grid items-start gap-2.5 md:grid-cols-2 md:gap-4">
          {(category.services ?? []).map((service, serviceIndex) => (
            <Reveal as="li" key={service.slug} delay={Math.min(serviceIndex, 5) * 60}>
              <ServiceCard service={service} tone={tone} badge={badge} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
