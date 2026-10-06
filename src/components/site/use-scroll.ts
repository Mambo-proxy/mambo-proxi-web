'use client';

import { useEffect, useState } from 'react';

type ScrollState = {
  /** Défilement au-delà du seuil (barre supérieure repliée, en-tête compact). */
  scrolled: boolean;
  /** L'utilisateur descend (masquage de l'en-tête mobile). */
  goingDown: boolean;
  y: number;
};

/** Position de défilement, mise à jour une fois par image (requestAnimationFrame). */
export function useScroll(threshold = 80): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, goingDown: false, y: 0 });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      // Petits mouvements ignorés pour éviter le clignotement de l'en-tête mobile.
      if (Math.abs(delta) < 6 && y > threshold) return;
      setState({ scrolled: y > threshold, goingDown: delta > 0 && y > threshold, y });
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return state;
}
