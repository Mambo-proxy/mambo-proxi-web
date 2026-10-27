'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Send, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { AddItemButton, charCountHelp } from '@/components/admin/editor/editor-ui';
import { EmailPreviewDialog, EmailTestDialog } from '@/components/admin/editor/email-dialogs';
import { ReadOnlyFieldset, useCan } from '@/components/admin/shell/permissions';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { EmailTemplate, EmailTemplateFields, EmailTemplateKey } from '@/lib/api/schema';
import { emailTemplatesKey, useEmailTemplates } from './settings-queries';

type Draft = { subject: string; preheader: string; title: string; paragraphs: string[]; buttonLabel: string };
type TextField = Exclude<keyof Draft, 'paragraphs'> | number;

const draftOf = (template: EmailTemplate): Draft => ({
  subject: template.subject ?? '',
  preheader: template.preheader ?? '',
  title: template.title ?? '',
  paragraphs: template.paragraphs?.length ? template.paragraphs : [''],
  buttonLabel: template.buttonLabel ?? '',
});

const bodyOf = (draft: Draft): EmailTemplateFields => ({
  subject: draft.subject.trim(),
  preheader: draft.preheader.trim() || null,
  title: draft.title.trim(),
  paragraphs: draft.paragraphs.map((item) => item.trim()).filter(Boolean),
  buttonLabel: draft.buttonLabel.trim() || null,
});

/**
 * Erreur d'un paragraphe : l'API retire les paragraphes vides avant de les contrôler, ses chemins
 * (`paragraphs.<i>`) comptent donc les seuls paragraphes remplis.
 */
function paragraphError(errors: Record<string, string>, paragraphs: string[], index: number): string | null {
  if (!paragraphs[index]?.trim()) return null;
  const sent = paragraphs.slice(0, index).filter((item) => item.trim()).length;
  return errors[`paragraphs.${sent}`] ?? null;
}

/** Éditeur d'un modèle d'e-mail automatique (non maquetté : langage des modales du back-office). */
export function TemplateDialog({
  templateKey,
  onClose,
}: {
  templateKey: EmailTemplateKey | null;
  onClose: () => void;
}) {
  const templates = useEmailTemplates();
  const template = templates.data?.find((item) => item.key === templateKey) ?? null;
  return template ? <TemplateEditor key={template.key} template={template} onClose={onClose} /> : null;
}

function TemplateEditor({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(() => draftOf(template));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<'preview' | 'test' | null>(null);
  // Dernier champ texte utilisé : les variables y sont insérées à la position du curseur.
  const focused = useRef<{ field: TextField; element: HTMLInputElement | HTMLTextAreaElement } | null>(null);
  const key = template.key!;
  // Consultation et aperçu : `settings:read` ; modification et envoi de test : `settings:write`.
  const canWrite = useCan()('settings:write');

  /** Aperçu : une variable inconnue (422 `unknown_variable`) est signalée sous son champ. */
  async function loadPreview() {
    try {
      return await data(
        browserApi.POST('/v1/admin/email-templates/{key}/preview', {
          params: { path: { key } },
          body: bodyOf(draft) as never,
        }),
      );
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length) setErrors(error.fieldErrors);
      throw error;
    }
  }

  const save = useMutation({
    mutationFn: () =>
      data(
        browserApi.PUT('/v1/admin/email-templates/{key}', {
          params: { path: { key } },
          body: bodyOf(draft) as never,
        }),
      ),
    onSuccess: (saved) => {
      client.setQueryData<EmailTemplate[]>(emailTemplatesKey, (list) =>
        list?.map((item) => (item.key === key ? saved : item)),
      );
      toast.success(`Modèle « ${template.name} » enregistré.`);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  function setField(field: TextField, value: string) {
    setDraft((previous) =>
      typeof field === 'number'
        ? {
            ...previous,
            paragraphs: previous.paragraphs.map((item, index) => (index === field ? value : item)),
          }
        : { ...previous, [field]: value },
    );
  }

  const track = (field: TextField) => ({
    onFocus: (event: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
      focused.current = { field, element: event.currentTarget };
    },
  });

  function insert(variable: string) {
    const target = focused.current;
    if (!target) {
      setDraft((previous) => {
        const paragraphs = [...previous.paragraphs];
        paragraphs[paragraphs.length - 1] = `${paragraphs.at(-1) ?? ''}${variable}`;
        return { ...previous, paragraphs };
      });
      return;
    }
    const { element, field } = target;
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    setField(field, `${element.value.slice(0, start)}${variable}${element.value.slice(end)}`);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + variable.length, start + variable.length);
    });
  }

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setDialog('preview')}>
          <Eye aria-hidden size={16} />
          Aperçu
        </Button>
        {canWrite && (
          <Button variant="outline" size="sm" onClick={() => setDialog('test')}>
            <Send aria-hidden size={16} />
            Test
          </Button>
        )}
      </div>
      {canWrite ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>
            Enregistrer le modèle
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={`Modèle · ${template.name}`}
        description={template.description}
        maxWidth={640}
        footer={footer}
      >
        <ReadOnlyFieldset readOnly={!canWrite}>
          <div className="flex flex-col gap-5">
            <Field label="Objet" error={errors.subject} help={charCountHelp(draft.subject, 150)}>
              {(control) => (
                <Input
                  {...control}
                  {...track('subject')}
                  maxLength={150}
                  value={draft.subject}
                  onChange={(event) => setField('subject', event.target.value)}
                />
              )}
            </Field>
            <Field
              label="Texte d’aperçu"
              help="Affiché après l’objet dans la boîte de réception (facultatif)."
              error={errors.preheader}
            >
              {(control) => (
                <Input
                  {...control}
                  {...track('preheader')}
                  maxLength={150}
                  value={draft.preheader}
                  onChange={(event) => setField('preheader', event.target.value)}
                />
              )}
            </Field>
            <Field label="Titre" error={errors.title}>
              {(control) => (
                <Input
                  {...control}
                  {...track('title')}
                  maxLength={150}
                  value={draft.title}
                  onChange={(event) => setField('title', event.target.value)}
                />
              )}
            </Field>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
                Paragraphes
              </legend>
              {draft.paragraphs.map((paragraph, index) => {
                const paragraphMessage = paragraphError(errors, draft.paragraphs, index);
                return (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Textarea
                        {...track(index)}
                        aria-label={`Paragraphe ${index + 1}`}
                        aria-invalid={paragraphMessage ? true : undefined}
                        rows={3}
                        maxLength={1500}
                        value={paragraph}
                        onChange={(event) => setField(index, event.target.value)}
                        className="min-h-0"
                      />
                      {paragraphMessage && (
                        <p className="font-ui text-[13px] leading-4 text-feedback-error">
                          {paragraphMessage}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Retirer le paragraphe ${index + 1}`}
                      disabled={draft.paragraphs.length === 1}
                      onClick={() => {
                        focused.current = null;
                        setDraft((previous) => ({
                          ...previous,
                          paragraphs: previous.paragraphs.filter((_, position) => position !== index),
                        }));
                      }}
                      className="mt-2 flex size-9 shrink-0 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-feedback-error disabled:opacity-30"
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  </div>
                );
              })}
              {errors.paragraphs && (
                <p className="font-ui text-[13px] leading-4 text-feedback-error">{errors.paragraphs}</p>
              )}
              {draft.paragraphs.length < 8 && (
                <AddItemButton
                  onClick={() =>
                    setDraft((previous) => ({ ...previous, paragraphs: [...previous.paragraphs, ''] }))
                  }
                >
                  Ajouter un paragraphe
                </AddItemButton>
              )}
            </fieldset>
            <Field
              label="Libellé du bouton"
              help="Vide : l’e-mail n’affiche pas de bouton."
              error={errors.buttonLabel}
            >
              {(control) => (
                <Input
                  {...control}
                  {...track('buttonLabel')}
                  maxLength={60}
                  value={draft.buttonLabel}
                  onChange={(event) => setField('buttonLabel', event.target.value)}
                />
              )}
            </Field>
            {canWrite && template.variables && template.variables.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="font-ui text-[13px] leading-4 text-text-muted">
                  Variables (remplacées à l’envoi) : cliquez pour l’insérer dans le champ en cours.
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      // Le champ en cours garde le focus et la position du curseur.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => insert(variable)}
                      className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-[12px] leading-4 text-text-main transition-colors hover:bg-orange-50 hover:text-orange-700"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ReadOnlyFieldset>
      </Modal>
      <EmailPreviewDialog
        open={dialog === 'preview'}
        onClose={() => setDialog(null)}
        queryKey={[...emailTemplatesKey, 'preview', key, bodyOf(draft)]}
        load={loadPreview}
        description="Rendu avec des données d’exemple, modifications en cours comprises."
      />
      <EmailTestDialog
        open={canWrite && dialog === 'test'}
        onClose={() => setDialog(null)}
        description="La version enregistrée du modèle est envoyée, avec des données d’exemple."
        send={(email) =>
          data(
            browserApi.POST('/v1/admin/email-templates/{key}/test', {
              params: { path: { key } },
              body: { email },
            }),
          )
        }
      />
    </>
  );
}
