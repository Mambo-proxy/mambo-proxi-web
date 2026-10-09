'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Lock, Star } from 'lucide-react';
import { sidebarCountsKey } from '@/components/admin/shell/sidebar';
import type { ReviewStatus, SurveyQuestionKind } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  A_VALIDER: 'À valider',
  PUBLIE: 'Publiés',
  MASQUE: 'Masqués',
};

export const SURVEY_KIND_LABELS: Record<SurveyQuestionKind, string> = {
  STARS: 'Note de 1 à 5 étoiles',
  CHOICE: 'Choix unique',
  NPS: 'Échelle de 0 à 10',
  TEXT: 'Texte libre',
};

export const reviewsKey = ['reviews'] as const;
export const reviewStatsKey = ['review-stats'] as const;
export const surveyQuestionsKey = ['survey-questions'] as const;

/** Rafraîchit la liste, les indicateurs, le compteur de la barre latérale et le tableau de bord. */
export function useRefreshReviews() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: reviewsKey });
    void client.invalidateQueries({ queryKey: reviewStatsKey });
    void client.invalidateQueries({ queryKey: sidebarCountsKey });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

/** Étoiles d'un avis (`93:11152`) : 16 px, écart 2 ; pleines orange, vides en contour `border/strong`. */
export function ReviewStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span role="img" aria-label={`Note : ${rating} sur 5`} className="inline-flex shrink-0 gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          size={size}
          strokeWidth={1.75}
          className={
            index < rating ? 'fill-brand-primary text-brand-primary' : 'fill-transparent text-border-strong'
          }
        />
      ))}
    </span>
  );
}

/**
 * Consentement à la publication (`93:11152`) : « Publication acceptée par le client » (vert, `icon/check-circle`)
 * ou « Publication non autorisée » (gris, `icon/lock`) ; pilule, Inter SemiBold 12.
 */
export function ConsentBadge({ consent }: { consent: boolean }) {
  const Icon = consent ? CircleCheck : Lock;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold sm:self-auto',
        consent ? 'bg-vert-50 text-vert-700' : 'bg-neutral-100 text-text-muted',
      )}
    >
      <Icon aria-hidden size={14} className="shrink-0" />
      {consent ? 'Publication acceptée par le client' : 'Publication non autorisée'}
    </span>
  );
}

/** Bouton d'action d'une carte d'avis : rayon 10, padding 10/14, Inter SemiBold 14, icône 16. */
export const reviewButtonClass = {
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-text-main transition-colors hover:bg-neutral-50 disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0',
  primary:
    'inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-primary px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-text-on-primary transition-colors hover:bg-brand-primary-hover disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0',
  dark: 'inline-flex items-center justify-center gap-2 rounded-[10px] bg-neutral-900 px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-neutral-0 transition-colors hover:bg-neutral-800 focus-visible:focus-ring-inverse disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0',
} as const;
