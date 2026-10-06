'use client';

import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@/lib/format/number';

type CountUpProps = { value: number; prefix?: string; suffix?: string; durationMs?: number };

/**
 * Chiffre clé qui défile de 0 à sa valeur à la première apparition (1,2 s, sortie douce).
 * Valeur finale rendue côté serveur et affichée directement si les animations sont réduites.
 */
export function CountUp({ value, prefix = '', suffix = '', durationMs = 1200 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    // Repart de 0 seulement si le chiffre n'est pas déjà visible à l'écran.
    const box = node.getBoundingClientRect();
    if (box.top > window.innerHeight) frame = requestAnimationFrame(() => setDisplay(0));
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden>
        {prefix}
        {formatNumber(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {formatNumber(value)}
        {suffix}
      </span>
    </span>
  );
}
