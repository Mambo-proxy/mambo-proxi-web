import { Sparkles } from 'lucide-react';
import { Fragment } from 'react';
import type { MarqueeSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

function Track({ items, className }: { items: string[]; className?: string }) {
  // Liste doublée : le défilement d'une demi-largeur boucle sans saut.
  const doubled = [...items, ...items];
  return (
    <div
      className={cn(
        'flex w-max animate-[marquee_40s_linear_infinite] items-center gap-7 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none',
        className,
      )}
    >
      {doubled.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <span
            aria-hidden={index >= items.length || undefined}
            className="font-brand text-[18px] leading-7 font-semibold whitespace-nowrap text-text-main md:text-[22px]"
          >
            {item}
          </span>
          <Sparkles aria-hidden className="size-3.5 shrink-0 text-brand-primary md:size-[18px]" />
        </Fragment>
      ))}
    </div>
  );
}

/**
 * Bandeau des services (Figma `49:280`) : bordures haut et bas, défilement infini (≈ 40 s par cycle), pause au survol,
 * bords estompés. Liste réduite en mobile (`itemsMobile`).
 */
export function MarqueeBand({ section }: { section: MarqueeSection }) {
  const mobileItems = section.itemsMobile?.length ? section.itemsMobile : null;
  return (
    <section
      aria-label="Nos services en bref"
      className="group/marquee overflow-hidden border-y border-border-default bg-neutral-0 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] py-[17px] md:py-[22px]"
    >
      <Track items={section.items} className={mobileItems ? 'max-md:hidden' : undefined} />
      {mobileItems && <Track items={mobileItems} className="md:hidden" />}
    </section>
  );
}
