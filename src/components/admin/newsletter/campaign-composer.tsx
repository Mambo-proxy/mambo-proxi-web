'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Eye, Send, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { EmailPreviewDialog, EmailTestDialog } from '@/components/admin/editor/email-dialogs';
import { ConfirmDialog, SavedNote } from '@/components/admin/editor/editor-ui';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { useAutosave } from '@/components/admin/editor/use-autosave';
import {
  compactButtonClass,
  compactInputClass,
  compactPrimaryClass,
} from '@/components/admin/magazine/magazine-ui';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { Campaign, CampaignFields, CampaignSegment } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format/number';
import { formatStamp } from '@/lib/format/date';
import { isEmptyHtml } from './campaign-labels';

export const campaignsKey = ['campaigns'] as const;

type Draft = { subject: string; html: string; segment: CampaignSegment };

/** Clé d'un segment : son type, plus ses étiquettes pour un segment `TAGS` (un segment par étiquette). */
const segmentKey = (segment: CampaignSegment) =>
  segment.kind === 'TAGS' ? `TAGS:${[...(segment.tags ?? [])].sort().join(',')}` : segment.kind;

const draftOf = (campaign: Campaign | null): Draft => ({
  subject: campaign?.subject && campaign.subject !== 'Brouillon sans titre' ? campaign.subject : '',
  html: campaign?.html ?? '',
  segment: campaign?.segment ?? { kind: 'ALL' },
});

const bodyOf = (draft: Draft): CampaignFields => ({
  subject: draft.subject.trim() || 'Brouillon sans titre',
  html: draft.html,
  segment: draft.segment.kind === 'TAGS' ? draft.segment : { kind: draft.segment.kind },
});

/**
 * « Nouvel envoi » (`94:11779`) : objet, destinataires (segments), corps (gras, italique, lien, image, bouton),
 * « Aperçu », « Test », « Programmer ». Le brouillon est créé à la première saisie puis enregistré
 * automatiquement ; un envoi programmé peut être modifié ou déprogrammé.
 */
export function CampaignComposer({
  campaign,
  onCreated,
}: {
  campaign: Campaign | null;
  onCreated: (id: string) => void;
}) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(() => draftOf(campaign));
  const [errors, setErrors] = useState<{ subject?: string; html?: string }>({});
  const [dialog, setDialog] = useState<'preview' | 'test' | 'schedule' | 'delete' | null>(null);
  // Identifiant de l'envoi : état pour le rendu, ref pour les enregistrements en cours (création unique).
  const [campaignId, setCampaignId] = useState<string | null>(campaign?.id ?? null);
  const id = useRef<string | null>(campaign?.id ?? null);
  const segments = useQuery({
    queryKey: [...campaignsKey, 'segments'],
    queryFn: () => data(browserApi.GET('/v1/admin/campaigns/segments')),
    staleTime: 60_000,
  });

  const refresh = () => client.invalidateQueries({ queryKey: campaignsKey });

  /** Crée le brouillon (première saisie) ou enregistre les modifications. */
  async function persist(value: Draft): Promise<string> {
    const body = bodyOf(value) as never;
    if (id.current) {
      await data(
        browserApi.PATCH('/v1/admin/campaigns/{id}', { params: { path: { id: id.current } }, body }),
      );
    } else {
      const created = await data(browserApi.POST('/v1/admin/campaigns', { body }));
      id.current = created.id;
      setCampaignId(created.id);
      onCreated(created.id);
    }
    void refresh();
    return id.current!;
  }

  const autosave = useAutosave({
    value: draft,
    save: persist,
    enabled: Boolean(campaignId || draft.subject.trim() || !isEmptyHtml(draft.html)),
    initialSavedAt: campaign?.updatedAt ?? null,
  });

  /** Enregistre avant une action (aperçu, test, programmation) et renvoie l'identifiant de l'envoi. */
  async function ready(): Promise<string | null> {
    if (autosave.dirty || !id.current) {
      const ok = id.current
        ? await autosave.flush()
        : await persist(draft).then(
            () => true,
            () => false,
          );
      if (!ok || !id.current) {
        toast.error('Le brouillon n’a pas pu être enregistré.');
        return null;
      }
    }
    return id.current;
  }

  function validate() {
    const next: typeof errors = {};
    if (!draft.subject.trim()) next.subject = 'Saisissez l’objet de l’e-mail.';
    if (isEmptyHtml(draft.html)) next.html = 'Rédigez le contenu de l’e-mail.';
    setErrors(next);
    return !next.subject && !next.html;
  }

  const cancel = useMutation({
    mutationFn: (campaignId: string) =>
      data(browserApi.POST('/v1/admin/campaigns/{id}/cancel', { params: { path: { id: campaignId } } })),
    onSuccess: () => {
      toast.success('Programmation annulée : l’envoi repasse en brouillon.');
      void refresh();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const remove = useMutation({
    mutationFn: (campaignId: string) =>
      data(browserApi.DELETE('/v1/admin/campaigns/{id}', { params: { path: { id: campaignId } } })),
    onSuccess: () => {
      setDialog(null);
      toast.success('Brouillon supprimé.');
      void refresh();
      onCreated('');
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });

  const scheduled = campaign?.status === 'PROGRAMMEE';
  const allSegment = segments.data?.find((item) => item.segment.kind === 'ALL');
  const draftSegment = segmentKey(draft.segment);
  const selectedSegment = segments.data?.find((item) => segmentKey(item.segment) === draftSegment);

  return (
    <AdminCard aria-labelledby="campaign-composer" className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h2 id="campaign-composer" className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          {campaign ? (scheduled ? 'Envoi programmé' : 'Brouillon') : 'Nouvel envoi'}
        </h2>
        <p className="font-ui text-[13px] leading-5 text-text-muted">
          {scheduled && campaign?.scheduledAt
            ? `Programmé le ${formatStamp(campaign.scheduledAt)} : les modifications sont prises en compte jusqu’à l’envoi.`
            : 'Rédigez, prévisualisez, programmez'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="campaign-subject"
          className="font-ui text-[14px] leading-5 font-semibold text-text-main"
        >
          Objet{' '}
          <span aria-hidden className="text-brand-primary">
            *
          </span>
        </label>
        <textarea
          id="campaign-subject"
          rows={2}
          required
          maxLength={150}
          value={draft.subject}
          placeholder="Novembre : sorties culturelles et nouveaux services"
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? 'campaign-subject-error' : undefined}
          onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
          className={cn(compactInputClass, 'resize-none px-4 py-3 text-[15px] leading-6')}
        />
        {errors.subject && (
          <p
            id="campaign-subject-error"
            role="alert"
            className="font-ui text-[13px] leading-4 text-feedback-error"
          >
            {errors.subject}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
          Destinataires
        </legend>
        <div className="flex flex-wrap gap-2">
          {(segments.data ?? []).map((item) => {
            const key = segmentKey(item.segment);
            const selected = key === draftSegment;
            return (
              <label
                key={key}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 font-ui text-[14px] leading-5 font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand-primary has-focus-visible:ring-offset-2',
                  selected
                    ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                    : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-50',
                )}
              >
                <input
                  type="radio"
                  name="campaign-segment"
                  value={key}
                  checked={selected}
                  onChange={() => setDraft((current) => ({ ...current, segment: item.segment }))}
                  className="sr-only"
                />
                {selected && <Check aria-hidden size={14} />}
                {item.segment.kind === 'ALL' ? `${item.label} (${formatNumber(item.count)})` : item.label}
              </label>
            );
          })}
        </div>
        {draft.segment.kind !== 'ALL' && (
          <p className="font-ui text-[12px] leading-4 text-text-muted">
            {formatNumber(selectedSegment?.count ?? 0)} inscrits sur {formatNumber(allSegment?.count ?? 0)}.
          </p>
        )}
      </fieldset>

      <RichTextEditor
        label="Contenu de l’e-mail"
        variant="labels"
        tools={['bold', 'italic', 'link', 'image', 'button']}
        value={draft.html}
        onChange={(html) => setDraft((current) => ({ ...current, html }))}
        placeholder="Bonjour {prénom}, …"
        minHeight={200}
        help="{prénom} est remplacé par le prénom de chaque inscrit."
        error={errors.html}
      />

      <SavedNote savedAt={autosave.savedAt} saving={autosave.pending} error={autosave.error} />

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          className={compactButtonClass}
          onClick={async () => {
            if (await ready()) setDialog('preview');
          }}
        >
          <Eye aria-hidden size={16} />
          Aperçu
        </button>
        <button
          type="button"
          className={compactButtonClass}
          onClick={async () => {
            if (await ready()) setDialog('test');
          }}
        >
          <Send aria-hidden size={16} />
          Test
        </button>
        <button
          type="button"
          className={cn(compactPrimaryClass, 'flex-1 whitespace-nowrap')}
          onClick={async () => {
            if (validate() && (await ready())) setDialog('schedule');
          }}
        >
          <CalendarDays aria-hidden size={16} />
          {scheduled ? 'Modifier la date' : 'Programmer'}
        </button>
      </div>
      {campaign && (
        <div className="-mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {scheduled ? (
            <button
              type="button"
              onClick={() => cancel.mutate(campaign.id)}
              className="inline-flex items-center gap-1.5 font-ui text-[13px] leading-5 font-semibold text-text-muted hover:text-text-main"
            >
              <X aria-hidden size={14} />
              Annuler la programmation
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDialog('delete')}
              className="inline-flex items-center gap-1.5 font-ui text-[13px] leading-5 font-semibold text-feedback-error hover:underline"
            >
              <Trash2 aria-hidden size={14} />
              Supprimer le brouillon
            </button>
          )}
        </div>
      )}

      <PreviewDialog open={dialog === 'preview'} id={campaignId} onClose={() => setDialog(null)} />
      <TestDialog open={dialog === 'test'} id={campaignId} onClose={() => setDialog(null)} />
      <ScheduleDialog
        open={dialog === 'schedule'}
        id={campaignId}
        current={campaign?.scheduledAt ?? null}
        recipients={selectedSegment?.count ?? null}
        onClose={() => setDialog(null)}
        onScheduled={() => {
          setDialog(null);
          void refresh();
        }}
        onContentErrors={(next) => {
          setDialog(null);
          setErrors(next);
        }}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={() => id.current && remove.mutate(id.current)}
        title="Supprimer ce brouillon ?"
        description="Le brouillon et son contenu sont supprimés définitivement."
        confirmLabel="Supprimer le brouillon"
        destructive
        pending={remove.isPending}
      />
    </AdminCard>
  );
}

/** Aperçu : rendu HTML réel de l'envoi (`GET …/preview`). */
export function PreviewDialog({
  open,
  id,
  onClose,
}: {
  open: boolean;
  id: string | null;
  onClose: () => void;
}) {
  return (
    <EmailPreviewDialog
      open={open && Boolean(id)}
      onClose={onClose}
      queryKey={[...campaignsKey, 'preview', id]}
      load={() => data(browserApi.GET('/v1/admin/campaigns/{id}/preview', { params: { path: { id: id! } } }))}
      description="Rendu tel que reçu par les inscrits."
    />
  );
}

function TestDialog({ open, id, onClose }: { open: boolean; id: string | null; onClose: () => void }) {
  return (
    <EmailTestDialog
      open={open}
      onClose={onClose}
      send={(email) =>
        data(
          browserApi.POST('/v1/admin/campaigns/{id}/test', {
            params: { path: { id: id! } },
            body: { email },
          }),
        )
      }
    />
  );
}

/** Valeurs des champs date et heure (heure locale) d'une date ISO ; demain à 9 h par défaut. */
function dateParts(iso: string | null) {
  const date = iso ? new Date(iso) : new Date(Date.now() + 86_400_000);
  if (!iso) date.setHours(9, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function ScheduleDialog({
  open,
  id,
  current,
  recipients,
  onClose,
  onScheduled,
  onContentErrors,
}: {
  open: boolean;
  id: string | null;
  current: string | null;
  recipients: number | null;
  onClose: () => void;
  onScheduled: () => void;
  /** 422 sur l'objet ou le contenu (`subject`, `html`) : erreurs affichées dans le compositeur. */
  onContentErrors: (errors: { subject?: string; html?: string }) => void;
}) {
  const [parts, setParts] = useState(() => dateParts(current));
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setParts(dateParts(current));
      setError(null);
    }
  }
  const schedule = useMutation({
    mutationFn: (scheduledAt: string) =>
      data(
        browserApi.POST('/v1/admin/campaigns/{id}/schedule', {
          params: { path: { id: id! } },
          body: { scheduledAt },
        }),
      ),
    onSuccess: (campaign) => {
      toast.success(`Envoi programmé le ${formatStamp(campaign.scheduledAt!)}.`);
      onScheduled();
    },
    onError: (caught) => {
      const fields = caught instanceof ApiError ? caught.fieldErrors : {};
      if (fields.subject || fields.html) {
        onContentErrors({ subject: fields.subject, html: fields.html });
        toast.error(fields.subject ?? fields.html!);
        return;
      }
      const message = fields.scheduledAt ?? errorMessage(caught);
      setError(message);
      toast.error(message);
    },
  });

  function submit() {
    const date = new Date(`${parts.day}T${parts.time}`);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      setError('Choisissez une date et une heure à venir.');
      return;
    }
    schedule.mutate(date.toISOString());
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Programmer l’envoi"
      description={
        recipients == null
          ? 'L’e-mail partira à la date choisie.'
          : `L’e-mail partira à la date choisie vers ${formatNumber(recipients)} inscrits.`
      }
      maxWidth={460}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={schedule.isPending} onClick={submit}>
            Programmer
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date d’envoi" error={error}>
          {(control) => (
            <Input
              {...control}
              type="date"
              value={parts.day}
              onChange={(event) => setParts((value) => ({ ...value, day: event.target.value }))}
            />
          )}
        </Field>
        <Field label="Heure">
          {(control) => (
            <Input
              {...control}
              type="time"
              value={parts.time}
              onChange={(event) => setParts((value) => ({ ...value, time: event.target.value }))}
            />
          )}
        </Field>
      </div>
    </Modal>
  );
}
