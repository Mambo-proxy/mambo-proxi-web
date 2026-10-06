import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRating } from '@/lib/format/number';

type StarsProps = {
  /** Note de 0 à 5 (arrondie à l'étoile la plus proche pour l'affichage). */
  rating: number;
  /** Taille des étoiles en px (maquettes : 14, 15, 16, 18). */
  size?: number;
  className?: string;
};

/** Étoiles de notation (orange `brand/primary`, gap 2) avec une alternative textuelle. */
export function Stars({ rating, size = 16, className }: StarsProps) {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span
      role="img"
      aria-label={`Note : ${formatRating(rating)} sur 5`}
      className={cn('inline-flex gap-0.5', className)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          size={size}
          strokeWidth={0}
          className={index < filled ? 'fill-brand-primary' : 'fill-neutral-200'}
        />
      ))}
    </span>
  );
}
