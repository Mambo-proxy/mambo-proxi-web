'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Carrousel horizontal (avis en mobile et tablette) : défilement natif avec aimantation (doigt, molette, flèches du
 * clavier une fois la liste sélectionnée), cartes 300 px (340 en tablette) débordant à droite. Les points (actif =
 * barre 20 × 6 `neutral/900`) indiquent la position ; trop petits pour servir de cibles tactiles, ils sont décoratifs.
 */
export function ReviewsCarousel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const onScroll = () => {
      const first = list.firstElementChild as HTMLElement | null;
      if (!first) return;
      // En fin de défilement, la dernière carte est considérée active même si elle ne peut pas venir à gauche.
      if (list.scrollLeft >= list.scrollWidth - list.clientWidth - 4) {
        setActive(items.length - 1);
        return;
      }
      setActive(Math.min(items.length - 1, Math.round(list.scrollLeft / (first.offsetWidth + 12))));
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    return () => list.removeEventListener('scroll', onScroll);
  }, [items.length]);

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <ul
        ref={ref}
        tabIndex={0}
        aria-label="Avis clients (faire défiler horizontalement)"
        className="-mr-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto rounded-xl pr-5 md:-mr-[clamp(20px,4.5vw,64px)] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li key={index} className="w-[300px] shrink-0 snap-start md:w-[340px]">
            {item}
          </li>
        ))}
      </ul>
      <div aria-hidden className="flex justify-center gap-1.5" data-active={active}>
        {items.map((_, index) => (
          <span
            key={index}
            className={cn(
              'block h-1.5 rounded-full transition-[width,background-color] duration-200',
              index === active ? 'w-5 bg-neutral-900' : 'w-1.5 bg-neutral-300',
            )}
          />
        ))}
      </div>
    </div>
  );
}
