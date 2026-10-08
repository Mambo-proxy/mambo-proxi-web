'use client';

import { useMutation } from '@tanstack/react-query';
import {
  CircleCheck,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  UserPen,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminReview, ReviewStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatDayMonth } from '@/lib/format/date';
import { ReplyDialog } from './reply-dialog';
import { ConsentBadge, reviewButtonClass, ReviewStars, useRefreshReviews } from './review-ui';

type Change = { status?: ReviewStatus; featured?: boolean };

const SUCCESS: Record<ReviewStatus, string> = {
  A_VALIDER: 'Avis remis à valider.',
  PUBLIE: 'Avis publié sur le site.',
  MASQUE: 'Avis masqué : il reste consultable dans l’onglet « Masqués ».',
};

/**
 * Carte d'avis (`93:11152`) : auteur, service et date de prestation, note, texte, réponses au questionnaire,
 * consentement, réponse de l'agence, actions selon le statut (Répondre, Masquer, Publier ou Suivi interne,
 * Mettre en avant). `onRemoved` est appelé quand l'avis quitte l'onglet courant (focus replacé sur la liste).
 */
export function ReviewCard({ review, onRemoved }: { review: AdminReview; onRemoved: () => void }) {
  const refresh = useRefreshReviews();
  const [replyOpen, setReplyOpen] = useState(false);
  const [confirm, setConfirm] = useState<'hide' | 'delete' | null>(null);

  const update = useMutation({
    mutationFn: (body: Change) =>
      data(browserApi.PATCH('/v1/admin/reviews/{id}', { params: { path: { id: review.id } }, body })),
    onSuccess: (updated, body) => {
      setConfirm(null);
      if (body.featured !== undefined)
        toast.success(updated.featured ? 'Avis mis en avant sur l’accueil.' : 'Avis retiré de l’accueil.');
      else if (body.status === 'MASQUE' && !review.publishConsent && confirm !== 'hide')
        toast.success('Avis classé en suivi interne : il reste consultable dans l’onglet « Masqués ».');
      else toast.success(SUCCESS[updated.status]);
      if (body.status && body.status !== review.status) onRemoved();
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () =>
      data(browserApi.DELETE('/v1/admin/reviews/{id}', { params: { path: { id: review.id } } })),
    onSuccess: () => {
      setConfirm(null);
      toast.success('Avis supprimé.');
      onRemoved();
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const pending = (body: Change) =>
    update.isPending &&
    update.variables?.status === body.status &&
    update.variables?.featured === body.featured;

  const meta = [
    review.service?.name,
    review.serviceDate ? `prestation du ${formatDayMonth(review.serviceDate)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      aria-labelledby={`review-${review.id}`}
      className="flex flex-col gap-3.5 rounded-lg border border-border-default bg-neutral-0 p-4 md:p-[22px]"
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full font-ui text-[14px] leading-5 font-semibold text-text-main',
            review.publishConsent ? 'bg-orange-100' : 'bg-neutral-200',
          )}
        >
          {review.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3
            id={`review-${review.id}`}
            className="font-ui text-[14px] leading-5 font-semibold text-text-main"
          >
            {review.authorName}
            {review.city ? ` · ${review.city}` : ''}
          </h3>
          {meta && <p className="font-ui text-[12px] leading-4 text-text-muted">{meta}</p>}
        </div>
        <ReviewStars rating={review.rating} />
      </header>

      <p className="font-ui text-[15px] leading-6 text-text-main">
        «{'\u00A0'}
        {review.text}
        {'\u00A0'}»
      </p>

      {(review.answers?.length ?? 0) > 0 && (
        <ul aria-label="Réponses au questionnaire" className="flex flex-wrap gap-1.5">
          {review.answers?.map((answer) => (
            <li
              key={answer.question}
              className="rounded-sm bg-neutral-50 px-2.5 py-1.5 font-ui text-[12px] leading-4 text-text-muted"
            >
              {answer.question}
              {'\u00A0'}: <span className="font-semibold text-text-main">{answer.answer}</span>
            </li>
          ))}
        </ul>
      )}

      {(review.featured || !review.verified) && (
        <p className="flex flex-wrap gap-1.5">
          {review.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold text-text-brand">
              <Pin aria-hidden size={14} />
              Mis en avant sur l’accueil
            </span>
          )}
          {!review.verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold text-text-muted">
              <UserPen aria-hidden size={14} />
              Ajouté manuellement · non vérifié
            </span>
          )}
        </p>
      )}

      {review.reply && (
        <div className="flex flex-col gap-1 rounded-md border-l-[3px] border-brand-primary bg-neutral-50 px-3.5 py-3">
          <p className="font-ui text-[12px] leading-4 font-semibold text-text-main">Réponse de MAMBO Proxi</p>
          <p className="font-ui text-[14px] leading-5 whitespace-pre-line text-text-main">{review.reply}</p>
        </div>
      )}

      <footer className="flex flex-col gap-3 border-t border-border-default pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <ConsentBadge consent={review.publishConsent} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={reviewButtonClass.secondary} onClick={() => setReplyOpen(true)}>
            <MessageSquare aria-hidden />
            {review.reply ? 'Modifier la réponse' : 'Répondre'}
          </button>
          {review.status !== 'MASQUE' && (
            <button type="button" className={reviewButtonClass.secondary} onClick={() => setConfirm('hide')}>
              <Eye aria-hidden />
              Masquer
            </button>
          )}
          {review.status === 'PUBLIE' && (
            <button
              type="button"
              className={reviewButtonClass.secondary}
              disabled={update.isPending}
              aria-busy={pending({ featured: !review.featured }) || undefined}
              onClick={() => update.mutate({ featured: !review.featured })}
            >
              {review.featured ? <PinOff aria-hidden /> : <Pin aria-hidden />}
              {review.featured ? 'Retirer de l’accueil' : 'Mettre en avant'}
            </button>
          )}
          {!review.verified && (
            <button
              type="button"
              className={reviewButtonClass.secondary}
              onClick={() => setConfirm('delete')}
              aria-label={`Supprimer l’avis de ${review.authorName}`}
            >
              <Trash2 aria-hidden />
            </button>
          )}
          {review.status !== 'PUBLIE' &&
            (review.publishConsent ? (
              <button
                type="button"
                className={reviewButtonClass.primary}
                disabled={update.isPending}
                aria-busy={pending({ status: 'PUBLIE' }) || undefined}
                onClick={() => update.mutate({ status: 'PUBLIE' })}
              >
                <CircleCheck aria-hidden />
                Publier
              </button>
            ) : review.status === 'A_VALIDER' ? (
              // Sans consentement, l'avis ne peut pas être publié : il est classé pour le suivi interne.
              <button
                type="button"
                className={reviewButtonClass.dark}
                disabled={update.isPending}
                aria-busy={pending({ status: 'MASQUE' }) || undefined}
                onClick={() => update.mutate({ status: 'MASQUE' })}
              >
                <FileText aria-hidden />
                Suivi interne
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-1 font-ui text-[12px] leading-4 text-text-muted">
                <EyeOff aria-hidden size={14} />
                Non publiable
              </span>
            ))}
        </div>
      </footer>

      {replyOpen && <ReplyDialog review={review} open={replyOpen} onClose={() => setReplyOpen(false)} />}
      <ConfirmDialog
        open={confirm === 'hide'}
        onClose={() => setConfirm(null)}
        onConfirm={() => update.mutate({ status: 'MASQUE' })}
        title="Masquer cet avis ?"
        description={
          review.status === 'PUBLIE'
            ? `L’avis de ${review.authorName} sera retiré du site. Il reste consultable dans l’onglet « Masqués ».`
            : `L’avis de ${review.authorName} ne sera pas publié sur le site. Il reste consultable dans l’onglet « Masqués ».`
        }
        confirmLabel="Masquer l’avis"
        destructive
        pending={pending({ status: 'MASQUE' })}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove.mutate()}
        title="Supprimer cet avis ?"
        description={`Le témoignage de ${review.authorName}, ajouté manuellement, sera définitivement supprimé.`}
        confirmLabel="Supprimer l’avis"
        destructive
        pending={remove.isPending}
      />
    </article>
  );
}
