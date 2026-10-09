'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { charCountHelp, ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminReview } from '@/lib/api/schema';
import { useRefreshReviews } from './review-ui';

const MAX = 2000;

/**
 * Réponse publique de l'agence à un avis (non maquetté : modale du back-office). Affichée sous l'avis sur le site ;
 * « Retirer la réponse » (avec confirmation) envoie `reply: null`.
 */
export function ReplyDialog({
  review,
  open,
  onClose,
}: {
  review: AdminReview;
  open: boolean;
  onClose: () => void;
}) {
  const refresh = useRefreshReviews();
  const [text, setText] = useState(review.reply ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const save = useMutation({
    mutationFn: (reply: string | null) =>
      data(
        browserApi.POST('/v1/admin/reviews/{id}/reply', {
          params: { path: { id: review.id } },
          body: { reply },
        }),
      ),
    onSuccess: (updated) => {
      toast.success(updated.reply ? 'Réponse publiée.' : 'Réponse retirée.');
      setConfirmRemove(false);
      refresh();
      onClose();
    },
    onError: (failure) => {
      const fields = failure instanceof ApiError ? failure.fieldErrors : {};
      if (fields.reply) setError(fields.reply);
      else toast.error(errorMessage(failure));
    },
  });

  function submit() {
    const reply = text.trim();
    if (!reply) {
      setError('Écrivez une réponse avant de la publier.');
      return;
    }
    if (reply.length > MAX) {
      setError('2 000 caractères au maximum.');
      return;
    }
    setError(null);
    save.mutate(reply);
  }

  return (
    <>
      <Modal
        // La confirmation s'ouvre par-dessus (fermer la modale déclencherait `onClose`).
        open={open}
        onClose={onClose}
        title={`Répondre à ${review.authorName}`}
        description={
          review.status === 'PUBLIE'
            ? 'Votre réponse est publiée sous l’avis, sur le site.'
            : 'Votre réponse sera affichée sous l’avis dès sa publication sur le site.'
        }
        footer={
          <>
            {review.reply && (
              <Button variant="ghost" size="sm" className="md:mr-auto" onClick={() => setConfirmRemove(true)}>
                Retirer la réponse
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button size="sm" loading={save.isPending && save.variables !== null} onClick={submit}>
              {review.reply ? 'Enregistrer la réponse' : 'Publier la réponse'}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex flex-col gap-4"
        >
          <blockquote className="rounded-md bg-neutral-50 p-3.5 font-ui text-[14px] leading-5 text-text-main">
            «{'\u00A0'}
            {review.text}
            {'\u00A0'}»
          </blockquote>
          <Field label="Réponse publique" required error={error} help={charCountHelp(text, MAX)}>
            {(control) => (
              <Textarea
                {...control}
                rows={5}
                maxLength={MAX}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Merci pour votre retour…"
              />
            )}
          </Field>
        </form>
      </Modal>
      <ConfirmDialog
        open={open && confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => save.mutate(null)}
        title="Retirer la réponse ?"
        description="La réponse de l’agence ne sera plus affichée sous cet avis."
        confirmLabel="Retirer la réponse"
        destructive
        pending={save.isPending && save.variables === null}
      />
    </>
  );
}
