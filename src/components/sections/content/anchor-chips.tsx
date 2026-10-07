'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { chipVariants } from '@/components/ui/chip';
import type { Link } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

/**
 * Puces d'ancrage du héros (Qui sommes-nous `63:4851`, Mission `64:5378`) : la première est active au chargement,
 * puis la puce suit la section visible ; clic = défilement fluide vers la section.
 */
export function AnchorChips({ links }: { links: Link[] }) {
  const ids = links.map((link) => link.href.replace(/^#/, ''));
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join(',');

  useEffect(() => {
    const sections = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
