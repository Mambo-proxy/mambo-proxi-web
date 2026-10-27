'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { EmailPreview } from '@/lib/api/schema';

/** Aperçu : rendu HTML réel d'un e-mail (newsletter, modèle d'e-mail automatique), affiché dans un cadre isolé. */
export function EmailPreviewDialog({
  open,
  onClose,
  queryKey,
  load,
  description,
}: {
  open: boolean;
  onClose: () => void;
  queryKey: readonly unknown[];
  load: () => Promise<EmailPreview>;
  /** Texte sous le titre tant que l'objet n'est pas connu. */
  description: string;
}) {
  const preview = useQuery({ queryKey, queryFn: load, enabled: open, gcTime: 0 });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aperçu de l’e-mail"
      description={preview.data ? `Objet : ${preview.data.subject}` : description}
      maxWidth={720}
    >
      {preview.isError ? (
        <p role="alert" className="font-ui text-[14px] leading-5 text-feedback-error">
          {errorMessage(preview.error)}
        </p>
      ) : open && preview.data ? (
        <iframe
          title="Aperçu de l’e-mail"
          // Origine opaque (sans `allow-same-origin`) : le cadre n'a aucun accès au back-office. `allow-scripts`
          // évite les erreurs « Blocked script execution » des scripts que le navigateur y injecte (le HTML de
          // l'aperçu, assaini par l'API, n'en contient pas).
          sandbox="allow-scripts"
          srcDoc={preview.data.html}
          className="h-[60vh] w-full rounded-md border border-border-default bg-neutral-50"
        />
      ) : (
        <Skeleton className="h-[60vh] w-full rounded-md" />
      )}
    </Modal>
  );
}

/** Envoi de test à une adresse (celle de l'utilisateur par défaut). */
export function EmailTestDialog({
  open,
  onClose,
  send,
  description = 'Un exemplaire de l’e-mail est envoyé à l’adresse indiquée.',
}: {
  open: boolean;
  onClose: () => void;
  send: (email: string) => Promise<{ message: string }>;
  description?: string;
}) {
  const { user } = useAdmin();
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEmail(user?.email ?? '');
      setError(null);
    }
  }
  const mutation = useMutation({
    mutationFn: () => send(email.trim()),
    onSuccess: (result) => {
      toast.success(result.message);
      onClose();
    },
    onError: (caught) => {
      if (caught instanceof ApiError) setError(caught.fieldErrors.email ?? null);
      toast.error(errorMessage(caught));
    },
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Envoyer un test"
      description={description}
      maxWidth={460}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            loading={mutation.isPending}
            onClick={() => {
              if (!/^\S+@\S+\.\S+$/.test(email.trim()))
                return setError('Saisissez une adresse e-mail valide.');
              mutation.mutate();
            }}
          >
            Envoyer le test
          </Button>
        </div>
      }
    >
      <Field label="Adresse de test" error={error}>
        {(control) => (
          <Input {...control} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        )}
      </Field>
    </Modal>
  );
}
