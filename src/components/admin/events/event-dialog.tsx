'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { ImageField } from '@/components/admin/editor/media-picker';
import { CompactField, CompactInput, compactInputClass } from '@/components/admin/magazine/magazine-ui';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminEvent, EventFields, IllustrationScene, MediaImage } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { dateParts, EVENT_TAGS, toIso } from './event-model';

/** Illustrations proposées tant qu'aucune photo n'est choisie. */
const SCENES: { scene: IllustrationScene; label: string }[] = [
  { scene: 'evenement', label: 'Réception' },
  { scene: 'culture', label: 'Culture' },
  { scene: 'chef', label: 'Cuisine' },
  { scene: 'marche', label: 'Marché' },
  { scene: 'photo', label: 'Photo' },
  { scene: 'formation', label: 'Atelier' },
];

type Draft = {
  title: string;
  tag: string;
  day: string;
  start: string;
  end: string;
  city: string;
  place: string;
  illustration: IllustrationScene;
  image: MediaImage | null;
  description: string;
  capacity: string;
  limited: boolean;
  published: boolean;
};

function draftOf(event: AdminEvent | null): Draft {
  const start = dateParts(event?.startsAt);
  return {
    title: event?.title ?? '',
    tag: event?.tag ?? '',
    day: start.day,
    start: start.time,
    end: event?.endsAt ? dateParts(event.endsAt).time : '',
    city: event?.city ?? 'Douala',
    place: event?.place ?? '',
    illustration: event?.visual.illustration ?? 'evenement',
    image: event?.visual.image ?? null,
    description: event?.description ?? '',
    capacity: event?.capacity ? String(event.capacity) : '',
    limited: event?.limited ?? false,
    published: event ? event.status === 'PUBLISHED' : false,
  };
}

/**
 * Événement de l'agenda (non maquetté, même langage que la modale des formations) : titre, type, date et horaires,
 * lieu, visuel (illustration ou photo de la médiathèque), description, places, publication dans l'agenda du site.
 */
export function EventDialog({
  open,
  onClose,
  event,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Événement modifié ; `null` pour en créer un. */
  event: AdminEvent | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(event));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(event));
      setErrors({});
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: () => {
      const body: EventFields = {
        title: draft.title.trim(),
        tag: draft.tag.trim(),
        startsAt: toIso(draft.day, draft.start)!,
        endsAt: draft.end ? toIso(draft.day, draft.end) : null,
        city: draft.city.trim(),
        place: draft.place.trim() || null,
        illustration: draft.illustration,
        imageId: draft.image?.id ?? null,
        description: draft.description.trim() || null,
        capacity: draft.capacity ? Number(draft.capacity) : null,
        limited: draft.limited,
        status: draft.published ? 'PUBLISHED' : 'DRAFT',
      };
      // Schémas `allOf` du contrat générés avec `Record<string, never>` : le corps est typé par `EventFields`.
      return event
        ? data(
            browserApi.PATCH('/v1/admin/events/{id}', {
              params: { path: { id: event.id } },
              body: body as never,
            }),
          )
        : data(browserApi.POST('/v1/admin/events', { body: body as never }));
    },
    onSuccess: () => {
      toast.success(event ? 'Événement enregistré.' : 'Événement ajouté.');
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
    if (!draft.title.trim()) next.title = 'Saisissez le titre de l’événement.';
    if (!draft.tag.trim()) next.tag = 'Saisissez le type (ex. « Concert »).';
    if (!toIso(draft.day, draft.start)) next.startsAt = 'Choisissez la date et l’heure de début.';
    if (draft.end && draft.end <= draft.start) next.endsAt = 'La fin doit être après le début.';
    if (!draft.city.trim()) next.city = 'Saisissez la ville.';
    if (draft.capacity && !(Number(draft.capacity) >= 1))
      next.capacity = 'Indiquez un nombre de places supérieur à 0, ou laissez vide.';
    setErrors(next);
    if (!Object.keys(next).length) save.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? `Modifier « ${event.title} »` : 'Nouvel événement'}
      description="L’événement publié s’affiche dans l’agenda de la rubrique Culture & événementiel, avec son formulaire d’inscription."
      maxWidth={720}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={save.isPending} onClick={submit}>
            {event ? 'Enregistrer' : 'Ajouter l’événement'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
          <CompactField label="Titre" error={errors.title}>
            {(control) => (
              <CompactInput
                {...control}
                value={draft.title}
                placeholder="Nuit des saveurs camerounaises"
                maxLength={120}
                onChange={(change) => set('title', change.target.value)}
              />
            )}
          </CompactField>
          <CompactField label="Type" error={errors.tag} help="Affiché sur la carte.">
            {(control) => (
              <CompactInput
                {...control}
                list="event-tags"
                value={draft.tag}
                maxLength={40}
                onChange={(change) => set('tag', change.target.value)}
              />
            )}
          </CompactField>
          <datalist id="event-tags">
            {EVENT_TAGS.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <CompactField label="Date" error={errors.startsAt}>
            {(control) => (
              <CompactInput
                {...control}
                type="date"
                value={draft.day}
                onChange={(change) => set('day', change.target.value)}
              />
            )}
          </CompactField>
          <CompactField label="Début">
            {(control) => (
              <CompactInput
                {...control}
                type="time"
                value={draft.start}
                onChange={(change) => set('start', change.target.value)}
              />
            )}
          </CompactField>
          <CompactField label="Fin" error={errors.endsAt} help="Facultatif.">
            {(control) => (
              <CompactInput
                {...control}
                type="time"
                value={draft.end}
                onChange={(change) => set('end', change.target.value)}
              />
            )}
          </CompactField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CompactField label="Ville" error={errors.city}>
            {(control) => (
              <CompactInput
                {...control}
                value={draft.city}
                maxLength={80}
                onChange={(change) => set('city', change.target.value)}
              />
            )}
          </CompactField>
          <CompactField label="Lieu" help="Quartier ou adresse (facultatif).">
            {(control) => (
              <CompactInput
                {...control}
                value={draft.place}
                placeholder="Bonapriso"
                maxLength={120}
                onChange={(change) => set('place', change.target.value)}
              />
            )}
          </CompactField>
        </div>
        <div className="flex flex-col gap-2">
          <span id="event-scene-label" className="font-ui text-[13px] leading-4 font-medium text-neutral-700">
            Illustration (tant qu’aucune photo n’est choisie)
          </span>
          <div role="radiogroup" aria-labelledby="event-scene-label" className="flex flex-wrap gap-2">
            {SCENES.map(({ scene, label }, index) => {
              const checked = draft.illustration === scene;
              return (
                <button
                  key={scene}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={label}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => set('illustration', scene)}
                  onKeyDown={(key) => {
                    const delta = key.key === 'ArrowRight' ? 1 : key.key === 'ArrowLeft' ? -1 : 0;
                    if (!delta) return;
                    key.preventDefault();
                    const next = (index + delta + SCENES.length) % SCENES.length;
                    set('illustration', SCENES[next]!.scene);
                    (key.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                  }}
                  className={cn(
                    'relative h-12 w-[72px] overflow-hidden rounded-sm border-2 transition-colors',
                    checked ? 'border-brand-primary' : 'border-transparent hover:border-border-strong',
                  )}
                >
                  <Image
                    src={`/illustrations/${scene}.svg`}
                    alt=""
                    fill
                    sizes="72px"
                    unoptimized
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <ImageField
          label="Photo"
          help="Facultatif : remplace l’illustration sur la carte de l’agenda."
          value={draft.image}
          onChange={(image) => set('image', image)}
        />
        <CompactField label="Description" help="Facultatif : programme, accès, ce qui est compris.">
          {(control) => (
            <textarea
              {...control}
              rows={3}
              value={draft.description}
              maxLength={3000}
              onChange={(change) => set('description', change.target.value)}
              className={cn(compactInputClass, 'resize-y')}
            />
          )}
        </CompactField>
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <CompactField label="Nombre de places" error={errors.capacity} help="Vide : sans limite.">
            {(control) => (
              <CompactInput
                {...control}
                type="number"
                inputMode="numeric"
                min={1}
                value={draft.capacity}
                onChange={(change) => set('capacity', change.target.value)}
              />
            )}
          </CompactField>
          <Switch
            label="Afficher « Places limitées »"
            checked={draft.limited}
            onChange={(change) => set('limited', change.target.checked)}
            className="pb-2"
          />
        </div>
        <Switch
          label="Publié dans l’agenda du site"
          checked={draft.published}
          onChange={(change) => set('published', change.target.checked)}
        />
      </div>
    </Modal>
  );
}
