'use client';

import { ArrowRight } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Reveal } from '@/components/ui/reveal';

const INITIAL = 3;

/** En-tête et liste de l'agenda : 3 événements, puis tous au clic sur « Voir tout l’agenda ». */
export function AgendaList({
  heading,
  cards,
  moreLabel,
}: {
  heading: ReactNode;
  cards: ReactNode[];
  moreLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const shown = expanded ? cards : cards.slice(0, INITIAL);
  const more =
    cards.length > INITIAL && !expanded ? (
      <button
        type="button"
        aria-controls={listId}
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
        className="group/more inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main xl:self-end"
      >
        {moreLabel}
        <ArrowRight
          aria-hidden
          size={16}
          className="transition-transform duration-200 group-hover/more:translate-x-[3px]"
        />
      </button>
    ) : null;
  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        {heading}
        {more}
      </div>
      <ul id={listId} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((card, index) => (
          <Reveal as="li" key={index} delay={(index % INITIAL) * 70}>
            {card}
          </Reveal>
        ))}
      </ul>
    </>
  );
}
