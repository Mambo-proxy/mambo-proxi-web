'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { chipVariants } from '@/components/ui/chip';
import type { Link } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

/** Ligne de lecture : une section devient active quand son haut passe sous l'en-tête, à 45 % de la fenêtre. */
const READING_LINE = 0.45;

/**
 * Puces d'ancrage du héros (Qui sommes-nous `63:4851`, Mission `64:5378`, Magazine `254:26277`) : la première est
 * active en haut de page, puis la puce suit la dernière section passée sous la ligne de lecture ; clic = défilement
 * fluide vers la section.
 */
export function AnchorChips({ links }: { links: Link[] }) {
  const ids = links.map((link) => link.href.replace(/^#/, ''));
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join(',');

  useEffect(() => {
    const anchors = key.split(',');
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let current = anchors[0] ?? '';
      let currentTop = -Infinity;
      for (const id of anchors) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        // À hauteur égale (cartes d'une même rangée), la première de la liste reste active.
        if (top !== undefined && top <= line && top > currentTop) {
          current = id;
          currentTop = top;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [key]);

  return (
    <nav aria-label="Sur cette page">
      <ul className="flex flex-wrap gap-2">
        {links.map((link, index) => {
          const id = ids[index]!;
          const selected = id === active;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={selected ? 'location' : undefined}
                onClick={() => setActive(id)}
                className={chipVariants({ selected })}
              >
                {selected && <Check aria-hidden strokeWidth={2.5} />}
                {frenchTypography(link.label)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
