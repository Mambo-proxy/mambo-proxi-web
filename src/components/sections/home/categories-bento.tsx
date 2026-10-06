import { ArrowRight, ArrowUpRight, Check, Package, ShoppingCart, Utensils } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { CategorySummary, DynamicSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { ResponsiveText } from '../responsive-text';

type CardProps = { category: CategorySummary };

const titleOf = (category: CategorySummary) => category.homeCard?.title ?? category.tagline;
const textOf = (category: CategorySummary) => category.homeCard?.text ?? category.description;
const chipsOf = (category: CategorySummary) => category.homeCard?.chips ?? [];

/** Lien couvrant toute la carte (le bouton flèche n'est que visuel). */
function CardLink({ category }: CardProps) {
  return (
    <Link href={category.href as Route} className="absolute inset-0 z-10 rounded-[inherit]">
      <span className="sr-only">
        {category.name} — {category.serviceCount} services
      </span>
    </Link>
  );
}

function ArrowButton({ tone, className }: { tone: 'light' | 'dark'; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-[52px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/card:rotate-45',
        tone === 'light' ? 'bg-neutral-0 text-text-main' : 'bg-neutral-900 text-neutral-0',
        className,
      )}
    >
      <ArrowUpRight size={22} />
    </span>
  );
}

function Chips({ items, tone, more = 0 }: { items: string[]; tone: 'glass' | 'light'; more?: number }) {
  const chip =
    tone === 'glass'
      ? 'border border-neutral-0/15 bg-neutral-900/40 text-neutral-0 backdrop-blur-[6px]'
      : 'border border-border-default bg-neutral-0 text-text-main';
  return (
    <ul className="flex flex-wrap gap-2">
      {[...items, ...(more > 0 ? [`+${more}`] : [])].map((item) => (
        <li
          key={item}
          className={cn('rounded-full px-3 py-1.5 font-ui text-[13px] leading-5 font-medium', chip)}
        >
          {frenchTypography(item)}
        </li>
      ))}
    </ul>
  );
}

function CountTag({ category, dark = false }: CardProps & { dark?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 font-ui text-[12px] leading-4 font-semibold',
        dark ? 'bg-neutral-800 text-neutral-0' : 'bg-neutral-0 text-text-main',
      )}
    >
      <Icon name={category.icon} size={14} className="text-text-brand" />
      {category.serviceCount} services
    </span>
  );
}

/** Carte « image pleine » : Expériences (desktop). */
function FeaturedCard({ category }: CardProps) {
  return (
    <article className="group/card relative flex min-h-[540px] overflow-hidden rounded-[32px] text-neutral-0">
      <Visual visual={category.visual} sizes="780px" className="absolute inset-0" />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,color-mix(in_srgb,var(--mp-color-neutral-900)_82%,transparent))]"
      />
      <ArrowButton tone="light" className="absolute top-10 right-10" />
      <div className="relative mt-auto flex max-w-[700px] flex-col gap-4 p-10">
        <CountTag category={category} />
        <h3 className="font-brand text-[40px] leading-[46px] font-bold tracking-[-0.015em]">
          {frenchTypography(titleOf(category))}
        </h3>
        <p className="font-ui text-[16px] leading-6">{frenchTypography(textOf(category))}</p>
        <Chips items={chipsOf(category)} tone="glass" />
      </div>
      <CardLink category={category} />
    </article>
  );
}

/** Carte « illustration en haut » : Immobilier (desktop). */
function ImageTopCard({ category }: CardProps) {
  const chips = chipsOf(category);
  return (
    <article className="group/card relative flex min-h-[540px] flex-col overflow-hidden rounded-[32px] border border-border-default bg-neutral-50">
      <Visual visual={category.visual} sizes="516px" className="h-[250px] shrink-0" />
      <div className="flex flex-col gap-3.5 px-8 pt-7 pb-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-brand text-[30px] leading-10 font-semibold tracking-[-0.01em] text-text-main">
            {frenchTypography(titleOf(category))}
          </h3>
          <ArrowButton tone="dark" />
        </div>
        <p className="font-ui text-[16px] leading-6 text-text-muted">{frenchTypography(textOf(category))}</p>
        <Chips items={chips} tone="light" more={Math.max(0, category.serviceCount - chips.length)} />
      </div>
      <CardLink category={category} />
    </article>
  );
}

/** Carte « quotidien » : Services de proximité (desktop) — icônes et carte de statut au lieu d'une illustration. */
function EverydayCard({ category }: CardProps) {
  return (
    <article className="group/card relative flex min-h-[420px] flex-col gap-6 overflow-hidden rounded-[32px] border border-vert-100 bg-vert-50 p-9">
      <div className="flex items-start justify-between">
        <span aria-hidden className="flex">
          {[Utensils, ShoppingCart, Package].map((ItemIcon, index) => (
            <span
              key={index}
              className={cn(
                'flex size-14 items-center justify-center rounded-full border-[3px] border-vert-100 bg-neutral-0 text-vert-700',
                index > 0 && '-ml-2.5',
              )}
            >
              <ItemIcon size={22} />
            </span>
          ))}
        </span>
        <ArrowButton tone="dark" />
      </div>
      <div
        aria-hidden
        className="flex w-fit rotate-2 items-center gap-3 rounded-lg bg-neutral-0 px-4 py-3 shadow-2"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-vert-500 text-neutral-0">
          <Check size={18} strokeWidth={3} />
        </span>
        <span className="flex flex-col">
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
            Courses livrées à Akwa
          </span>
          <span className="font-ui text-[12px] leading-4 text-text-muted">Aujourd&apos;hui · 18:40</span>
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-3.5">
        <h3 className="font-brand text-[30px] leading-[38px] font-semibold tracking-[-0.01em] text-text-main">
          {frenchTypography(titleOf(category))}
        </h3>
        <p className="font-ui text-[16px] leading-6 text-text-muted">{frenchTypography(textOf(category))}</p>
        <Chips items={chipsOf(category)} tone="light" />
      </div>
      <CardLink category={category} />
    </article>
  );
}

/** Carte « sombre » : Culture & événementiel (desktop) — texte à gauche, illustration à droite. */
function DarkSplitCard({ category }: CardProps) {
  return (
    <article className="group/card relative grid min-h-[420px] grid-cols-[400fr_380fr] overflow-hidden rounded-[32px] bg-neutral-900 text-neutral-0">
      <div className="flex flex-col gap-3.5 p-10">
        <CountTag category={category} dark />
        <h3 className="mt-auto font-brand text-[30px] leading-10 font-semibold">
          {frenchTypography(titleOf(category))}
        </h3>
        <p className="font-ui text-[16px] leading-6 text-neutral-300">{frenchTypography(textOf(category))}</p>
        <Chips items={chipsOf(category)} tone="glass" />
      </div>
      <div className="relative">
        <Visual visual={category.visual} sizes="380px" className="absolute inset-0" />
        <ArrowButton tone="light" className="absolute top-8 right-8" />
      </div>
      <CardLink category={category} />
    </article>
  );
}

/** Carte mobile et tablette (`53:622`…) : illustration pleine, voile, étiquette, titre 24/30, flèche 40. */
function CompactCard({ category }: CardProps) {
  return (
    <article className="group/card relative flex h-[300px] overflow-hidden rounded-xl text-neutral-0 md:h-[360px]">
      <Visual visual={category.visual} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,color-mix(in_srgb,var(--mp-color-neutral-900)_85%,transparent))]"
      />
      <span
        aria-hidden
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-neutral-0 text-text-main"
      >
        <ArrowUpRight size={18} />
      </span>
      <div className="relative mt-auto flex flex-col gap-2 p-5">
        <span className="self-start rounded-full bg-neutral-0 px-2.5 py-1 font-ui text-[11px] leading-4 font-semibold text-text-main">
          {category.serviceCount} services
        </span>
        <h3 className="font-brand text-[24px] leading-[30px] font-semibold">
          {frenchTypography(titleOf(category))}
        </h3>
        <p className="font-ui text-[14px] leading-5">
          <ResponsiveText
            desktop={frenchTypography(textOf(category))}
            mobile={category.homeCard?.textMobile ? frenchTypography(category.homeCard.textMobile) : null}
          />
        </p>
      </div>
      <CardLink category={category} />
    </article>
  );
}

const DESKTOP_CARDS: Record<string, (props: CardProps) => ReactNode> = {
  experience: FeaturedCard,
  immobilier: ImageTopCard,
  'services-de-proximite': EverydayCard,
  'culture-evenementiel': DarkSplitCard,
};

/**
 * « Nos univers » (Figma `49:333`) : grille « bento » en desktop (780/516 puis 516/780, gap 16, rayon 32),
 * pile de cartes identiques en mobile (`53:616`), deux colonnes en tablette.
 */
export function CategoriesBento({
  section,
  categories,
}: {
  section: DynamicSection;
  categories: CategorySummary[];
}) {
  const [first, second, third, fourth] = categories;
  const desktop = (category: CategorySummary | undefined) => {
    if (!category) return null;
    const Card = DESKTOP_CARDS[category.slug] ?? ImageTopCard;
    return <Card category={category} />;
  };
  return (
    <section className="bg-neutral-0 py-16 xl:py-28">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            titleMobile={section.titleMobile}
            lead={section.lead}
            leadMobile={section.leadMobile}
            className="xl:max-w-[720px]"
          />
          {section.link && (
            <Link
              href={section.link.href as Route}
              className={cn(
                buttonVariants({ variant: 'outline', shape: 'pill' }),
                'group/link self-start px-[22px] py-3.5 max-md:hidden xl:self-auto',
              )}
            >
              {section.link.label}
              <ArrowRight
                aria-hidden
                className="transition-transform duration-200 group-hover/link:translate-x-[3px]"
              />
            </Link>
          )}
        </div>

        <div className="grid gap-3.5 md:grid-cols-2 md:gap-4 xl:hidden">
          {categories.map((category, index) => (
            <Reveal key={category.slug} delay={Math.min(index, 5) * 70}>
              <CompactCard category={category} />
            </Reveal>
          ))}
        </div>

        <div className="hidden flex-col gap-4 xl:flex">
          <div className="grid grid-cols-[780fr_516fr] gap-4">
            <Reveal>{desktop(first)}</Reveal>
            <Reveal delay={70}>{desktop(second)}</Reveal>
          </div>
          <div className="grid grid-cols-[516fr_780fr] gap-4">
            <Reveal>{desktop(third)}</Reveal>
            <Reveal delay={70}>{desktop(fourth)}</Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
