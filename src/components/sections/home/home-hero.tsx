import { ArrowRight, Heart } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { AccentText } from '@/components/ui/accent-text';
import { buttonVariants } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stars } from '@/components/ui/stars';
import { Visual } from '@/components/ui/visual';
import type { HeroSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { ResponsiveText } from '../responsive-text';

/** Avatars de la preuve sociale (maquette : orange 300, vert 300, orange 200, neutre 400). */
const AVATARS = ['bg-orange-300', 'bg-vert-300', 'bg-orange-200', 'bg-neutral-400'];

const floatingCard = 'absolute flex items-center gap-3 bg-neutral-0 shadow-3';

/**
 * Héros de l'accueil (Figma `47:247`, mobile `53:551`) : fond `neutral/50`, deux colonnes (texte 640 + visuel 616,
 * gap 56) à partir de 1280 px ; titre 58/64 (36/42 en mobile) dont la seconde ligne est en orange.
 */
export function HomeHero({ section }: { section: HeroSection }) {
  const [quoteCard, housingCard] = section.floatingCards ?? [];
  return (
    <section className="bg-neutral-50">
      <div className="container-site grid items-center gap-[22px] pt-7 pb-10 xl:grid-cols-[640px_1fr] xl:gap-14 xl:pt-16 xl:pb-[88px]">
        <div className="flex flex-col gap-[22px] xl:gap-7">
          {section.badge && (
            <p className="flex items-center gap-2.5 self-start rounded-full border border-border-default bg-neutral-0 py-2 pr-4 pl-2">
              {section.badge.tag && (
                <span className="rounded-full bg-vert-50 px-2 py-[3px] font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-vert-700 md:px-2.5 md:py-1 md:text-[13px] md:leading-5 md:tracking-[0.005em] md:whitespace-pre">
                  {section.badge.tag}
                </span>
              )}
              <span className="font-ui text-[13px] leading-4 tracking-[0.01em] text-text-muted md:text-[14px] md:leading-5 md:font-medium md:tracking-[0.005em]">
                {frenchTypography(section.badge.text)}
              </span>
            </p>
          )}
          {section.title && (
            <h1 className="font-brand text-[36px] leading-[42px] font-semibold tracking-[-0.02em] text-text-main md:text-[48px] md:leading-[54px] xl:text-[58px] xl:leading-16 xl:tracking-[-0.025em] [&>span]:block">
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
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'group/cta bg-neutral-0 px-[22px] max-md:w-full',
                )}
              >
                {section.secondaryCta.label}
                <ArrowRight
                  aria-hidden
                  className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
                />
              </Link>
            )}
          </div>
          {section.socialProof && (
            <div className="flex items-center gap-4 md:pt-2">
              <span aria-hidden className="flex">
                {AVATARS.map((color, index) => (
                  <span
                    key={color}
                    className={cn(
                      'size-8 rounded-full border-2 border-neutral-50 md:size-10 md:border-[3px]',
                      color,
                      index > 0 && '-ml-2.5 md:-ml-3',
                      index === 3 && 'max-md:hidden',
                    )}
                  />
                ))}
              </span>
              <span className="flex flex-col gap-1">
                <Stars rating={5} size={14} className="max-md:hidden" />
                <span className="font-ui text-[13px] leading-5 font-medium text-text-muted md:text-[14px]">
                  {frenchTypography(section.socialProof)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Visuel : composition complète à partir de 768 px, illustration + une carte en mobile. */}
        <div className="relative mx-auto aspect-[350/400] w-full max-w-[616px] md:aspect-[616/640]">
          {section.visual && (
            <Visual
              visual={section.visual}
              priority
              sizes="(min-width: 768px) 500px, 100vw"
              className="absolute inset-0 rounded-[28px] md:inset-auto md:top-[3.125%] md:left-[6.5%] md:h-[93.75%] md:w-[81.2%] md:rounded-[32px]"
            />
          )}
          {section.visualSecondary && (
            <Visual
              visual={section.visualSecondary}
              sizes="240px"
              className="absolute top-[53%] left-[61%] hidden h-[43.75%] w-[39%] rounded-xl border-[6px] border-neutral-0 shadow-[0_20px_40px_-8px_color-mix(in_srgb,var(--mp-color-neutral-900)_14%,transparent)] md:block"
            />
          )}
          {quoteCard && (
            <div
              className={cn(
                floatingCard,
                'top-5 left-4 rounded-lg px-3.5 py-3 md:top-[15%] md:left-[53.6%] md:rounded-[20px] md:px-[18px] md:py-3.5',
              )}
            >
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-vert-50 text-vert-600 md:size-10 md:rounded-md">
                <Icon name={quoteCard.icon ?? 'Check'} size={18} className="md:size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-ui text-[13px] leading-5 font-semibold text-text-main md:text-[14px]">
                  {frenchTypography(quoteCard.title)}
                </span>
                {quoteCard.text && (
                  <span className="font-ui text-[11px] leading-4 text-text-muted md:text-[12px]">
                    {frenchTypography(quoteCard.text)}
                  </span>
                )}
              </span>
            </div>
          )}
          {housingCard && (
            <div className="absolute top-[51.5%] left-0 hidden w-[236px] flex-col gap-3 rounded-[20px] bg-neutral-0 p-4 shadow-3 md:flex">
              <span className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-orange-50 text-text-brand">
                  <Icon name={housingCard.icon ?? 'KeyRound'} size={18} />
                </span>
                <span className="flex flex-col">
                  <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                    {frenchTypography(housingCard.title)}
                  </span>
                  {housingCard.text && (
                    <span className="font-ui text-[12px] leading-4 text-text-muted">
                      {frenchTypography(housingCard.text)}
                    </span>
                  )}
                </span>
              </span>
              {typeof housingCard.progress === 'number' && (
                <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <span
                    className="block h-full rounded-full bg-vert-500"
                    style={{ width: `${housingCard.progress * 100}%` }}
                  />
                </span>
              )}
              {housingCard.footnote && (
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  {frenchTypography(housingCard.footnote)}
                </span>
              )}
            </div>
          )}
          {section.sticker && (
            <span className="absolute top-[75%] left-[59%] flex rotate-4 items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 font-ui text-[11px] leading-4 font-semibold text-neutral-0 md:top-[6.9%] md:left-[11%] md:px-3.5 md:py-2 md:text-[12px]">
              {/* Petit cœur violet : l'un des trois usages autorisés du violet (docs/02 §2). */}
              <Heart aria-hidden size={12} className="text-violet-300 md:size-3.5" />
              {frenchTypography(section.sticker)}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
