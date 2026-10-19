'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type OffersCarouselProps = {
  /** En-tête de la section, à gauche des flèches (desktop et tablette). */
  heading: ReactNode;
  children: ReactNode;
  labels: { list: string; previous: string; next: string };
};

const navButton =
  'flex size-12 items-center justify-center rounded-full transition-[background-color,border-color,color,opacity] duration-200 disabled:cursor-default';

/**
 * Carrousel « Nos offres » de la fiche service (`254:11429`, mobile `254:11689`) : piste à défilement natif avec
 * aimantation (doigt, molette, flèches du clavier une fois la piste sélectionnée), rognée au bord du conteneur ;
 * flèches 48 à droite de l'en-tête (précédent bordé, suivant orange, absentes en mobile), points de position
 * décoratifs (actif = barre 24 × 8 orange). Une flèche se désactive en bout de piste.
 */
export function OffersCarousel({ heading, children, labels }: OffersCarouselProps) {
  const listId = useId();
  const ref = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: items.length <= 1 });

  const update = useCallback(() => {
    const list = ref.current;
    const first = list?.firstElementChild as HTMLElement | null;
    if (!list || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || '0');
    const end = list.scrollLeft >= list.scrollWidth - list.clientWidth - 4;
    // En fin de piste, la dernière carte est considérée active même si elle ne peut pas venir à gauche.
    setActive(end ? items.length - 1 : Math.min(items.length - 1, Math.round(list.scrollLeft / step)));
    setEdges({ start: list.scrollLeft <= 4, end });
  }, [items.length]);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const list = ref.current;
    const first = list?.firstElementChild as HTMLElement | null;
    if (!list || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || '0');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="flex flex-col gap-6 xl:gap-8">
      <div className="flex items-end gap-6">
        <div className="min-w-0 flex-1">{heading}</div>
        {items.length > 1 && (
          <div className="flex shrink-0 gap-3 max-md:hidden">
            <button
              type="button"
              aria-label={labels.previous}
              aria-controls={listId}
              disabled={edges.start}
              onClick={() => scrollBy(-1)}
              className={cn(
                navButton,
                // Au début de la piste, la flèche « précédent » garde l'aspect de la maquette, chevron atténué.
                'border border-border-default bg-neutral-0 text-text-main enabled:hover:border-border-strong disabled:text-text-muted',
              )}
            >
              <ChevronLeft aria-hidden size={20} />
            </button>
            <button
              type="button"
              aria-label={labels.next}
              aria-controls={listId}
              disabled={edges.end}
              onClick={() => scrollBy(1)}
              className={cn(
                navButton,
                'bg-brand-primary text-text-on-primary enabled:hover:bg-brand-primary-hover disabled:opacity-50',
              )}
            >
              <ChevronRight aria-hidden size={20} />
            </button>
          </div>
        )}
      </div>
      <ul
        id={listId}
        ref={ref}
        tabIndex={0}
        aria-label={labels.list}
        // `relative` : les textes `sr-only` (en absolu) des cartes hors champ restent dans la piste qui défile.
        className="relative flex snap-x snap-mandatory [scrollbar-width:none] items-start gap-5 overflow-x-auto rounded-xl [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li key={index} className="w-[290px] shrink-0 snap-start md:w-[352px]">
            {item}
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div aria-hidden className="flex gap-2" data-active={active}>
          {items.map((_, index) => (
            <span
              key={index}
              className={cn(
                'block h-2 rounded-full transition-[width,background-color] duration-200',
                index === active ? 'w-6 bg-brand-primary' : 'w-2 bg-neutral-300',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
