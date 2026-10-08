'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, MessageSquareQuote } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/admin/ui/filters';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Stars } from '@/components/ui/stars';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminReview } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

/** Témoignages affichés sur une page de service : 6 au plus (contrat `featuredReviewIds`). */
export const MAX_REVIEWS = 6;

/** Avis publiés (`GET /v1/admin/reviews?status=PUBLIE`) : sélecteur et libellés des puces. */
export function usePublishedReviews(enabled = true) {
  return useQuery({
    queryKey: ['admin-reviews', { status: 'PUBLIE', pageSize: 100 }],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/reviews', { params: { query: { status: 'PUBLIE', pageSize: 100 } } })),
    enabled,
  });
}

/** « Patrick E. · ★★★★★ » (étoiles décoratives, note lue en toutes lettres). */
export function ReviewChipLabel({ review }: { review: Pick<AdminReview, 'authorName' | 'rating'> }) {
  return (
    <>
      {review.authorName} · <span aria-hidden>{'★'.repeat(review.rating)}</span>
      <span className="sr-only">
        {review.rating} étoile{review.rating > 1 ? 's' : ''} sur 5
      </span>
    </>
  );
}

/**
 * Sélecteur « + Choisir un avis publié » (non maquetté) : liste des avis publiés, sélection multiple (6 au plus
 * avec ceux déjà affichés), validation par « Ajouter ».
 */
export function ReviewPickerDialog({
  open,
  onClose,
  selected,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  /** Avis déjà affichés sur la page. */
  selected: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const reviews = usePublishedReviews(open);
  const [picked, setPicked] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPicked([]);
  }
  const room = MAX_REVIEWS - selected.length;
  const list = (reviews.data?.data ?? []).filter((review) => !selected.includes(review.id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choisir un avis publié"
      description={
        room > 0
          ? `Les avis choisis s’affichent en bas de la page du service (${MAX_REVIEWS} au plus).`
          : `${MAX_REVIEWS} avis sont déjà affichés : retirez-en un pour en ajouter un autre.`
      }
      maxWidth={640}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" disabled={picked.length === 0} onClick={() => onConfirm(picked)}>
            {picked.length > 1 ? `Ajouter ${picked.length} avis` : 'Ajouter l’avis'}
          </Button>
        </div>
      }
    >
      {reviews.isPending ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : reviews.isError ? (
        <p role="alert" className="font-ui text-[14px] text-feedback-error">
          {errorMessage(reviews.error)}
        </p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote size={24} />}
          title="Aucun autre avis publié"
          text="Les avis validés dans « Avis clients » apparaissent ici."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((review) => {
            const active = picked.includes(review.id);
            const disabled = !active && picked.length >= room;
            return (
              <li key={review.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  disabled={disabled}
                  onClick={() =>
                    setPicked((current) =>
                      active ? current.filter((id) => id !== review.id) : [...current, review.id],
                    )
                  }
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    active
                      ? 'border-neutral-900 ring-1 ring-neutral-900'
                      : 'border-border-default hover:border-border-strong',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border',
                      active ? 'border-neutral-900 bg-neutral-900 text-neutral-0' : 'border-border-strong',
                    )}
                  >
                    {active && <Check size={14} />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[14px] leading-5 font-semibold text-text-main">
                      {review.authorName}
                      {review.city ? (
                        <span className="font-normal text-text-muted">· {review.city}</span>
                      ) : null}
                      <Stars rating={review.rating} size={14} />
                    </span>
                    <span className="line-clamp-2 font-ui text-[13px] leading-[18px] text-text-muted">
                      {review.text}
                    </span>
                    {review.service && (
                      <span className="font-ui text-[12px] leading-4 text-text-muted">
                        {review.service.name}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
