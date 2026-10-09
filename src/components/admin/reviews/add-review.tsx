'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import { useId, useState } from 'react';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { charCountHelp } from '@/components/admin/editor/editor-ui';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { ReviewInput } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { useRefreshReviews } from './review-ui';

type Form = {
  authorName: string;
  city: string;
  rating: number;
  text: string;
  serviceId: string;
  date: string;
  publish: boolean;
};

const EMPTY: Form = {
  authorName: '',
  city: '',
  rating: 0,
  text: '',
  serviceId: '',
  date: '',
  publish: false,
};

/** Services du catalogue (filtre « Tous les services » et ajout manuel), groupés par rubrique. */
export function useServiceOptions(enabled = true) {
  return useQuery({
    queryKey: ['catalogue-services'],
    queryFn: () => data(browserApi.GET('/v1/services')),
    staleTime: 5 * 60_000,
    enabled,
  });
}

/** Note de 1 à 5 étoiles : boutons radio natifs (flèches au clavier), étoiles 28 px. */
function RatingInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
        Note
        <span aria-hidden className="text-text-brand">
          {' *'}
        </span>
      </legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((note) => (
          <label key={note} className="relative cursor-pointer rounded-sm has-focus-visible:focus-ring">
            <input
              type="radio"
              name={name}
              value={note}
              checked={value === note}
              onChange={() => onChange(note)}
              className="peer sr-only"
            />
            <span className="sr-only">
              {note} étoile{note > 1 ? 's' : ''}
            </span>
            <Star
              aria-hidden
              size={28}
              strokeWidth={1.75}
              className={cn(
                'm-0.5',
                note <= value
                  ? 'fill-brand-primary text-brand-primary'
                  : 'fill-transparent text-border-strong',
              )}
            />
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * « Ajouter un avis » (`93:11079`, bouton secondaire de la barre supérieure) : saisie manuelle d'un témoignage
 * recueilli hors questionnaire (marqué « non vérifié » par l'API), à valider ou publié directement.
 */
export function AddReviewButton() {
  const refresh = useRefreshReviews();
  const [open, setOpen] = useState(false);
  // Chargés à l'ouverture seulement : sinon la liste du filtre serait déjà remplie à l'hydratation de la page.
  const services = useServiceOptions(open);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const create = useMutation({
    mutationFn: (body: ReviewInput) => data(browserApi.POST('/v1/admin/reviews', { body })),
    onSuccess: (review) => {
      toast.success(
        review.status === 'PUBLIE'
          ? 'Avis ajouté et publié sur le site.'
          : 'Avis ajouté\u00A0: il est à valider.',
      );
      refresh();
      setOpen(false);
      setForm(EMPTY);
    },
    onError: (error) => {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length) setErrors(error.fieldErrors);
      else toast.error(errorMessage(error));
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!form.authorName.trim()) next.authorName = 'Indiquez le nom affiché (ex. «\u00A0Aurélie K.\u00A0»).';
    if (!form.rating) next.rating = 'Choisissez une note de 1 à 5 étoiles.';
    if (form.text.trim().length < 10) next.text = 'L’avis doit compter au moins 10 caractères.';
    setErrors(next);
    if (Object.keys(next).length) return;
    create.mutate({
      authorName: form.authorName.trim(),
      city: form.city.trim() || null,
      rating: form.rating,
      text: form.text.trim(),
      serviceId: form.serviceId || null,
      date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : null,
      status: form.publish ? 'PUBLIE' : 'A_VALIDER',
    });
  }

  const categories = [...new Set((services.data ?? []).map((service) => service.category.name))];

  return (
    <>
      <button type="button" className={topbarSecondaryClass} onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        Ajouter un avis
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ajouter un avis"
        description={
          'Témoignage recueilli hors questionnaire (téléphone, e-mail…)\u00A0: il sera marqué «\u00A0non vérifié\u00A0».'
        }
        maxWidth={620}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" loading={create.isPending} onClick={submit}>
              Ajouter l’avis
            </Button>
          </>
        }
      >
        <form
          aria-label="Ajouter un avis"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Nom affiché"
              required
              error={errors.authorName}
              help={'Prénom et initiale\u00A0: «\u00A0Aurélie K.\u00A0»'}
            >
              {(control) => (
                <Input
                  {...control}
                  maxLength={60}
                  value={form.authorName}
                  onChange={(event) => set('authorName', event.target.value)}
                />
              )}
            </Field>
            <Field label="Ville" error={errors.city}>
              {(control) => (
                <Input
                  {...control}
                  maxLength={80}
                  value={form.city}
                  onChange={(event) => set('city', event.target.value)}
                />
              )}
            </Field>
          </div>
          <RatingInput value={form.rating} onChange={(value) => set('rating', value)} error={errors.rating} />
          <Field label="Avis" required error={errors.text} help={charCountHelp(form.text, 2000)}>
            {(control) => (
              <Textarea
                {...control}
                maxLength={2000}
                value={form.text}
                onChange={(event) => set('text', event.target.value)}
              />
            )}
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Service" error={errors.serviceId}>
              {(control) => (
                <Select
                  {...control}
                  value={form.serviceId}
                  onChange={(event) => set('serviceId', event.target.value)}
                >
                  <option value="">Aucun service</option>
                  {categories.map((category) => (
                    <optgroup key={category} label={category}>
                      {services.data
                        ?.filter((service) => service.category.name === category)
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Date de la prestation" error={errors.date}>
              {(control) => (
                <Input
                  {...control}
                  type="date"
                  value={form.date}
                  onChange={(event) => set('date', event.target.value)}
                />
              )}
            </Field>
          </div>
          <Switch
            label="Publier directement sur le site"
            checked={form.publish}
            onChange={(event) => set('publish', event.target.checked)}
          />
        </form>
      </Modal>
    </>
  );
}
