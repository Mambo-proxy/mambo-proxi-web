'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { chipVariants } from '@/components/ui/chip';
import { frenchTypography } from '@/lib/format/typography';

type CategoryNavProps = { items: { slug: string; name: string }[] };

/**
 * Barre des rubriques (Figma `58:966`) : puces collantes sous l'en-tête (fond blanc, bordure basse), défilement
 * horizontal en mobile. Clic = défilement fluide vers la rubrique ; la puce active suit la section visible.
 */
export function CategoryNav({ items }: CategoryNavProps) {
  const [active, setActive] = useState(items[0]?.slug ?? '');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.slug))
      .filter((section): section is HTMLElement => section !== null);
    // Section active : celle qui occupe la bande située juste sous l'en-tête et la barre.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-160px 0px -60% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Garde la puce active visible dans la rangée défilante (mobile).
  useEffect(() => {
    const chip = listRef.current?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <nav
      aria-label="Rubriques"
      className="sticky top-(--site-header-h,0px) z-30 border-b border-border-default bg-neutral-0 transition-[top] duration-200"
    >
      <ul
        ref={listRef}
        className="container-site flex [scrollbar-width:none] gap-2 overflow-x-auto py-3.5 xl:py-[18px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const selected = item.slug === active;
          return (
            <li key={item.slug} data-slug={item.slug} className="shrink-0">
              <a
                href={`#${item.slug}`}
                aria-current={selected ? 'location' : undefined}
                onClick={() => setActive(item.slug)}
                className={chipVariants({ selected })}
              >
                {selected && <Check aria-hidden strokeWidth={2.5} />}
                {frenchTypography(item.name)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
