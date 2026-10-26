'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { CompactField, CompactInput, compactInputClass } from '@/components/admin/magazine/magazine-ui';
import { ReadOnlyFieldset } from '@/components/admin/shell/permissions';
import { Button } from '@/components/ui/button';
import { Icon, iconNames } from '@/components/ui/icon';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminTraining, TrainingCategory, TrainingFields } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { TRAINING_AUDIENCES, TRAINING_CATEGORY_LABELS } from './training-labels';

type Draft = {
  title: string;
  category: TrainingCategory;
  audienceLabel: string;
  icon: string;
  duration: string;
  format: string;
  location: string;
  description: string;
  published: boolean;
};

function draftOf(training: AdminTraining | null): Draft {
  return {
    title: training?.title ?? '',
    category: training?.category ?? 'PROFESSIONNELS',
    audienceLabel: training?.audienceLabel ?? TRAINING_AUDIENCES.PROFESSIONNELS,
    icon: training?.icon ?? 'GraduationCap',
    duration: training?.duration ?? '',
    format: training?.format ?? 'Présentiel',
    location: training?.location ?? '',
    description: training?.description ?? '',
    published: training ? training.status === 'PUBLISHED' : false,
  };
}

/**
 * Formation du catalogue (non maquetté, même langage que la modale des zones) : titre, catégorie, public, icône,
 * durée, format et lieu, description, publication sur la page Formation du site.
 */
export function TrainingDialog({
  open,
  onClose,
  training,
  onSaved,
  readOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Formation modifiée ; `null` pour en créer une. */
  training: AdminTraining | null;
  onSaved: () => void;
  /** Sans `content:write` : fiche consultée (champs figés, sans enregistrement). */
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState(() => draftOf(training));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(training));
      setErrors({});
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function setCategory(category: TrainingCategory) {
    // Le public suit la catégorie tant qu'il n'a pas été personnalisé.
    setDraft((current) => ({
      ...current,
      category,
      audienceLabel:
        current.audienceLabel === TRAINING_AUDIENCES[current.category]
          ? TRAINING_AUDIENCES[category]
          : current.audienceLabel,
    }));
  }

  const save = useMutation({
    mutationFn: () => {
      const body: TrainingFields = {
        title: draft.title.trim(),
        category: draft.category,
        audienceLabel: draft.audienceLabel.trim() || TRAINING_AUDIENCES[draft.category],
        icon: draft.icon,
        duration: draft.duration.trim(),
        format: draft.format.trim(),
        location: draft.location.trim() || null,
        description: draft.description.trim() || null,
        status: draft.published ? 'PUBLISHED' : 'DRAFT',
      };
      // Schémas `allOf` du contrat générés avec `Record<string, never>` : le corps est typé par `TrainingFields`.
      return training
        ? data(
            browserApi.PATCH('/v1/admin/trainings/{id}', {
              params: { path: { id: training.id } },
              body: body as never,
            }),
          )
        : data(browserApi.POST('/v1/admin/trainings', { body: body as never }));
    },
    onSuccess: () => {
      toast.success(training ? 'Formation enregistrée.' : 'Formation ajoutée.');
      onSaved();
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Saisissez le titre de la formation.';
    if (!draft.duration.trim()) next.duration = 'Saisissez la durée (ex. « 1 jour »).';
    if (!draft.format.trim()) next.format = 'Saisissez le format (ex. « Présentiel »).';
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={training ? (readOnly ? training.title : `Modifier « ${training.title} »`) : 'Nouvelle formation'}
      description="La formation s’affiche dans le catalogue de la page Formation et dans la liste du formulaire de demande."
      maxWidth={680}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {readOnly ? 'Fermer' : 'Annuler'}
          </Button>
          {!readOnly && (
            <Button size="sm" loading={save.isPending} onClick={submit}>
              {training ? 'Enregistrer' : 'Ajouter la formation'}
            </Button>
          )}
        </div>
      }
    >
      <ReadOnlyFieldset readOnly={readOnly}>
        <div className="flex flex-col gap-4">
          <CompactField label="Titre" error={errors.title}>
            {(control) => (
              <CompactInput
                {...control}
                value={draft.title}
                placeholder="Accueil et relation client"
                maxLength={120}
                onChange={(event) => set('title', event.target.value)}
              />
            )}
          </CompactField>
          <div className="grid gap-4 sm:grid-cols-2">
            <CompactField label="Catégorie" error={errors.category}>
              {(control) => (
                <select
                  {...control}
                  value={draft.category}
                  onChange={(event) => setCategory(event.target.value as TrainingCategory)}
                  className={compactInputClass}
                >
                  {(Object.keys(TRAINING_CATEGORY_LABELS) as TrainingCategory[]).map((category) => (
                    <option key={category} value={category}>
                      {TRAINING_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              )}
            </CompactField>
            <CompactField label="Public" help="Affiché sur la carte de la formation.">
              {(control) => (
                <CompactInput
                  {...control}
                  value={draft.audienceLabel}
                  maxLength={80}
                  onChange={(event) => set('audienceLabel', event.target.value)}
                />
              )}
            </CompactField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <CompactField label="Durée" error={errors.duration}>
              {(control) => (
                <CompactInput
                  {...control}
                  value={draft.duration}
                  placeholder="1 jour"
                  maxLength={40}
                  onChange={(event) => set('duration', event.target.value)}
                />
              )}
            </CompactField>
            <CompactField label="Format" error={errors.format}>
              {(control) => (
                <CompactInput
                  {...control}
                  list="training-formats"
                  value={draft.format}
                  maxLength={60}
                  onChange={(event) => set('format', event.target.value)}
                />
              )}
            </CompactField>
            <CompactField label="Lieu" help="Vide pour une formation en ligne.">
              {(control) => (
                <CompactInput
                  {...control}
                  value={draft.location}
                  placeholder="Douala"
                  maxLength={80}
                  onChange={(event) => set('location', event.target.value)}
                />
              )}
            </CompactField>
            <datalist id="training-formats">
              <option value="Présentiel" />
              <option value="En ligne" />
              <option value="Sur site" />
            </datalist>
          </div>
          <div className="flex flex-col gap-2">
            <span
              id="training-icon-label"
              className="font-ui text-[13px] leading-4 font-medium text-neutral-700"
            >
              Icône
            </span>
            <div role="radiogroup" aria-labelledby="training-icon-label" className="flex flex-wrap gap-1.5">
              {iconNames.map((name, index) => {
                const checked = draft.icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={name}
                    title={name}
                    tabIndex={checked ? 0 : -1}
                    onClick={() => set('icon', name)}
                    onKeyDown={(event) => {
                      const delta =
                        event.key === 'ArrowRight' || event.key === 'ArrowDown'
                          ? 1
                          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                            ? -1
                            : 0;
                      if (!delta) return;
                      event.preventDefault();
                      const next = (index + delta + iconNames.length) % iconNames.length;
                      set('icon', iconNames[next]!);
                      (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                    }}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-sm border transition-colors',
                      checked
                        ? 'border-brand-primary bg-orange-50 text-text-brand'
                        : 'border-border-default text-icon-default hover:bg-neutral-50',
                    )}
                  >
                    <Icon name={name} size={18} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
          <CompactField label="Description" help="Facultatif : programme, objectifs, prérequis.">
            {(control) => (
              <textarea
                {...control}
                rows={3}
                value={draft.description}
                maxLength={2000}
                onChange={(event) => set('description', event.target.value)}
                className={cn(compactInputClass, 'resize-y')}
              />
            )}
          </CompactField>
          <Switch
            label="Publiée sur le site"
            checked={draft.published}
            onChange={(event) => set('published', event.target.checked)}
          />
        </div>
      </ReadOnlyFieldset>
    </Modal>
  );
}
