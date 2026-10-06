'use client';

import { useEffect, useRef, type ComponentProps, type ElementType } from 'react';
import { cn } from '@/lib/cn';

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Décalage d'apparition (cascade de 60–80 ms entre éléments d'une liste, 6 au plus). */
  delay?: number;
} & Omit<ComponentProps<T>, 'as'>;

/**
 * Apparition au défilement, une seule fois (docs/04) : fondu + translation 16 px, 500 ms.
 * Le contenu est rendu côté serveur ; l'état masqué ne s'applique que si JavaScript est actif
 * et que l'utilisateur n'a pas demandé de réduire les animations (voir `.reveal` dans web.css).
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  delay = 0,
  className,
  style,
  ...props
}: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Component = (as ?? 'div') as ElementType;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.dataset.visible = '';
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...props}
    />
  );
}
