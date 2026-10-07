import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { CardGridSection, SectionItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from './section-shell';

const GRID_COLUMNS: Record<number, string> = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

/** Ancre d'une carte d'énoncé (« Notre mission » → `mission`), pour les puces du héros. */
function itemAnchor(title: string): string {
  return title
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/^(notre|nos|nous)\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Valeurs sur fond sombre (Qui sommes-nous `63:4985`) : cartes `neutral/800` p 28 rayon 24, pastille 48 `neutral/700`
 * et icône orange, titre Poppins 20/28 blanc, texte 15/23 `neutral/300`.
 */
function ValueCard({ item }: { item: SectionItem }) {
  return (
    <div className="flex h-full flex-col gap-3.5 rounded-3xl bg-neutral-800 p-[22px] xl:p-7">
      {item.icon && (
        <span aria-hidden className="flex size-12 items-center justify-center rounded-[14px] bg-neutral-700">
          <Icon name={item.icon} size={22} className="text-orange-400" />
        </span>
      )}
      <h3 className="font-brand text-[20px] leading-7 font-semibold text-neutral-0">
        {frenchTypography(item.title)}
      </h3>
      {item.text && (
        <p className="font-ui text-[15px] leading-[23px] text-neutral-300">{frenchTypography(item.text)}</p>
      )}
    </div>
  );
}

/**
 * Engagement numéroté (Mission `64:5420`) : carte bordée rayon 22, p 28 (20 en mobile), numéro décoratif
 * Poppins 32/36 `orange/300` (rendu en CSS : contraste volontairement faible), titre 20/28, texte 15/23.
 */
function NumberedCard({ item }: { item: SectionItem }) {
  return (
    <div className="flex h-full gap-[18px] rounded-[22px] border border-border-default bg-neutral-0 p-5 xl:p-7">
      {item.number && (
        <span
          aria-hidden
          data-number={item.number}
          className="shrink-0 font-brand text-[24px] leading-7 font-semibold tracking-[-0.02em] text-orange-300 before:content-[attr(data-number)] xl:text-[32px] xl:leading-9"
        />
      )}
      <span className="flex flex-col gap-1">
        <h3 className="font-brand text-[17px] leading-7 font-semibold text-text-main xl:text-[20px]">
          {frenchTypography(item.title)}
        </h3>
        {item.text && (
          <p className="font-ui text-[15px] leading-[23px] text-text-muted">{frenchTypography(item.text)}</p>
        )}
      </span>
    </div>
  );
}

/**
 * Énoncé (Mission et vision `64:5400`) : grande carte rayon 32, p 48 (24 en mobile) — claire `orange/50` ou sombre ;
 * pastille 52, sur-titre, énoncé Poppins Medium 26/38 (20/29).
 */
function StatementCard({ item }: { item: SectionItem }) {
  const dark = item.tone === 'dark';
  return (
    <div
      id={itemAnchor(item.title)}
      className={cn(
        'flex h-full scroll-mt-(--site-header-h,0px) flex-col gap-5 rounded-3xl p-6 xl:rounded-[32px] xl:p-12',
        dark ? 'bg-neutral-900' : 'bg-orange-50',
      )}
    >
      {item.icon && (
        <span
          aria-hidden
          className={cn(
            'flex size-[52px] items-center justify-center rounded-2xl',
            dark ? 'bg-neutral-800' : 'bg-neutral-0',
          )}
        >
          <Icon name={item.icon} size={24} className={dark ? 'text-orange-400' : 'text-text-brand'} />
        </span>
      )}
      <h2 className={dark ? 'text-web-eyebrow text-orange-400!' : 'text-web-eyebrow'}>
        {frenchTypography(item.title)}
      </h2>
      {item.text && (
        <p
          className={cn(
            'font-brand text-[20px] leading-[29px] font-medium xl:text-[26px] xl:leading-[38px]',
            dark ? 'text-neutral-0' : 'text-text-main',
          )}
        >
          {frenchTypography(item.text)}
        </p>
      )}
    </div>
  );
}

/** Grille de cartes : valeurs (fond sombre), engagements numérotés ou énoncés, selon la mise en page choisie. */
export function CardGrid({ section }: { section: CardGridSection }) {
  const inverse = section.tone === 'dark';
  const Card =
    section.layout === 'numbered' ? NumberedCard : section.layout === 'compact' ? StatementCard : ValueCard;
  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      {(section.eyebrow || section.title) && (
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          titleMobile={section.titleMobile}
          lead={section.lead}
          leadMobile={section.leadMobile}
          inverse={inverse}
          className="xl:max-w-[760px]"
        />
      )}
      <ul
        className={cn(
          'grid',
          section.layout === 'compact' ? 'gap-3.5 xl:gap-6' : 'gap-4',
          GRID_COLUMNS[section.columns] ?? GRID_COLUMNS[2],
          section.layout === 'compact' && 'md:grid-cols-1 xl:grid-cols-2',
        )}
      >
        {section.items.map((item, index) => (
          <Reveal as="li" key={item.title} delay={index * 70}>
            <Card item={item} />
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}
