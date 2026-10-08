'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChipToggle } from '@/components/admin/editor/chip-select';
import { AddItemButton, EditorLayout, EditorSection, SideCard } from '@/components/admin/editor/editor-ui';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AppointmentFormat, AvailabilityConfig } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import {
  WEEKDAY_NAMES,
  exceptionKey,
  fromConfig,
  mapServerErrors,
  newKey,
  newRange,
  rangeKey,
  slotsPerWeek,
  toConfig,
  validateForm,
  type AvailabilityForm,
} from './availability-model';
import { addDays, todayKey } from './calendar-utils';
import { FORMAT_LABELS } from './labels';

const FORMATS = Object.entries(FORMAT_LABELS) as [AppointmentFormat, string][];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180];
const NOTICES = [
  { value: 0, label: 'Aucun délai' },
  { value: 2, label: '2 heures' },
  { value: 12, label: '12 heures' },
  { value: 24, label: '24 heures' },
  { value: 48, label: '48 heures' },
  { value: 72, label: '3 jours' },
  { value: 168, label: '1 semaine' },
];
const HORIZONS = [14, 30, 60, 90, 180, 365];

const durationLabel = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60}` : ''}`;

/** Petite saisie d'heure des plages (40 px, Inter 14). */
const timeInput =
  'h-10 w-[104px] rounded-[10px] border border-border-strong bg-neutral-0 px-3 font-ui text-[14px] leading-5 text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset aria-invalid:border-feedback-error aria-invalid:ring-1 aria-invalid:ring-feedback-error';

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="font-ui text-[13px] leading-4 text-feedback-error">
      {message}
    </p>
  );
}

/** Formulaire une fois les réglages chargés. */
function AvailabilityFormView({ initial }: { initial: AvailabilityConfig }) {
  const client = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState<AvailabilityForm>(() => fromConfig(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { config, origins } = toConfig(form);
  const dirty = JSON.stringify(config) !== JSON.stringify(toConfig(fromConfig(saved)).config);

  // Avertissement avant de quitter la page avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (body: AvailabilityConfig) => data(browserApi.PUT('/v1/admin/availability', { body })),
    onSuccess: (result) => {
      setSaved(result);
      setForm(fromConfig(result));
      setErrors({});
      client.setQueryData(['availability-config'], result);
      void client.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Disponibilités enregistrées\u00A0: le formulaire du site propose les nouveaux créneaux.');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422 && Object.keys(error.fieldErrors).length) {
        setErrors(mapServerErrors(error.fieldErrors, origins, form));
        focusFirstError();
      } else toast.error(errorMessage(error));
    },
  });

  function focusFirstError() {
    requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validateForm(form);
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error('Certains réglages sont à corriger.');
      focusFirstError();
      return;
    }
    save.mutate(config);
  }

  const update = (change: (draft: AvailabilityForm) => AvailabilityForm) =>
    setForm((current) => change(current));
  const updateDay = (
    dayIndex: number,
    change: (day: AvailabilityForm['days'][number]) => AvailabilityForm['days'][number],
  ) =>
    update((draft) => ({
      ...draft,
      days: draft.days.map((day, index) => (index === dayIndex ? change(day) : day)),
    }));
  const updateRange = (
    dayIndex: number,
    rangeIndex: number,
    patch: Partial<AvailabilityForm['days'][number]['ranges'][number]>,
  ) =>
    updateDay(dayIndex, (day) => ({
      ...day,
      ranges: day.ranges.map((range, index) => (index === rangeIndex ? { ...range, ...patch } : range)),
    }));
  const updateException = (key: string, patch: Partial<AvailabilityForm['exceptions'][number]>) =>
    update((draft) => ({
      ...draft,
      exceptions: draft.exceptions.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    }));

  const weekly = slotsPerWeek(form);
  const today = todayKey();

  const aside = (
    <>
      <SideCard title="Enregistrement">
        <p aria-live="polite" className="font-ui text-[13px] leading-5 text-text-muted">
          {dirty
            ? 'Modifications non enregistrées.'
            : 'Réglages à jour\u00A0: le formulaire de rendez-vous du site les applique.'}
        </p>
        <Button
          type="submit"
          form="availability-form"
          size="sm"
          fullWidth
          loading={save.isPending}
          disabled={!dirty}
        >
          Enregistrer
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => setForm(fromConfig(saved))}
          >
            Annuler les modifications
          </Button>
        )}
      </SideCard>
      <SideCard title="Aperçu de la semaine">
        <ul className="flex flex-col gap-1.5 font-ui text-[13px] leading-5">
          {form.days.map((day, index) => (
            <li key={WEEKDAY_NAMES[index]} className="flex justify-between gap-3">
              <span className="text-text-muted">{WEEKDAY_NAMES[index]}</span>
              <span className="text-right font-medium text-text-main">
                {day.open ? day.ranges.map((range) => `${range.start} – ${range.end}`).join(', ') : 'Fermé'}
              </span>
            </li>
          ))}
        </ul>
        <p className="font-ui text-[13px] leading-5 text-text-main">
          <strong className="font-semibold">{weekly}</strong> créneau{weekly > 1 ? 'x' : ''} de{' '}
          {durationLabel(form.slotMinutes)} par semaine, hors rendez-vous déjà pris.
        </p>
        <a
          href="/contact#rendez-vous"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
        >
          Voir le formulaire du site
          <ArrowUpRight aria-hidden size={16} />
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </SideCard>
    </>
  );

  return (
    <form id="availability-form" ref={formRef} noValidate onSubmit={submit}>
      <EditorLayout aside={aside}>
        <EditorSection
          number={1}
          title="Jours et horaires"
          subtitle="Plages proposées sur le formulaire de rendez-vous du site, en heure de Douala."
        >
          <ul className="flex flex-col divide-y divide-border-default">
            {form.days.map((day, dayIndex) => {
              const name = WEEKDAY_NAMES[dayIndex] ?? '';
              return (
                <li
                  key={name}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-start"
                >
                  <Switch
                    label={name}
                    checked={day.open}
                    onChange={(event) =>
                      updateDay(dayIndex, (current) => ({ ...current, open: event.target.checked }))
                    }
                    className="lg:w-[150px] lg:shrink-0 lg:pt-2"
                  />
                  {day.open ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      {day.ranges.map((range, rangeIndex) => {
                        const startKey = rangeKey(dayIndex, rangeIndex, 'start');
                        const endKey = rangeKey(dayIndex, rangeIndex, 'end');
                        const formatsKey = rangeKey(dayIndex, rangeIndex, 'formats');
                        const label = `${name}, plage ${rangeIndex + 1}`;
                        return (
                          <div
                            key={rangeIndex}
                            role="group"
                            aria-label={label}
                            className="flex flex-col gap-2 rounded-md bg-neutral-50 p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="time"
                                step={900}
                                aria-label={`${label}\u00A0: début`}
                                aria-invalid={errors[startKey] ? true : undefined}
                                aria-describedby={errors[startKey] ? startKey : undefined}
                                value={range.start}
                                onChange={(event) =>
                                  updateRange(dayIndex, rangeIndex, { start: event.target.value })
                                }
                                className={timeInput}
                              />
                              <span aria-hidden className="font-ui text-[14px] text-text-muted">
                                à
                              </span>
                              <input
                                type="time"
                                step={900}
                                aria-label={`${label}\u00A0: fin`}
                                aria-invalid={errors[endKey] ? true : undefined}
                                aria-describedby={errors[endKey] ? endKey : undefined}
                                value={range.end}
                                onChange={(event) =>
                                  updateRange(dayIndex, rangeIndex, { end: event.target.value })
                                }
                                className={timeInput}
                              />
                              <div
                                role="group"
                                aria-label={`${label}\u00A0: formats proposés`}
                                aria-describedby={errors[formatsKey] ? formatsKey : undefined}
                                className="flex flex-wrap gap-1.5"
                              >
                                {FORMATS.map(([value, text]) => {
                                  const selected = range.formats.includes(value);
                                  return (
                                    <ChipToggle
                                      key={value}
                                      selected={selected}
                                      className="px-3 py-[7px] text-[13px]"
                                      onClick={() =>
                                        updateRange(dayIndex, rangeIndex, {
                                          formats: selected
                                            ? range.formats.filter((item) => item !== value)
                                            : FORMATS.map(([item]) => item).filter(
                                                (item) => item === value || range.formats.includes(item),
                                              ),
                                        })
                                      }
                                    >
                                      {text}
                                    </ChipToggle>
                                  );
                                })}
                              </div>
                              {day.ranges.length > 1 && (
                                <button
                                  type="button"
                                  aria-label={`Supprimer\u00A0: ${label}`}
                                  onClick={() =>
                                    updateDay(dayIndex, (current) => ({
                                      ...current,
                                      ranges: current.ranges.filter((_, index) => index !== rangeIndex),
                                    }))
                                  }
                                  className="ml-auto flex size-10 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100"
                                >
                                  <X aria-hidden size={16} />
                                </button>
                              )}
                            </div>
                            <ErrorText id={startKey} message={errors[startKey]} />
                            <ErrorText id={endKey} message={errors[endKey]} />
                            <ErrorText id={formatsKey} message={errors[formatsKey]} />
                          </div>
                        );
                      })}
                      {day.ranges.length < 4 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateDay(dayIndex, (current) => ({
                              ...current,
                              ranges: [...current.ranges, newRange(current.ranges.at(-1))],
                            }))
                          }
                          className="self-start rounded-sm font-ui text-[13px] leading-5 font-semibold text-text-brand hover:underline"
                        >
                          + Ajouter une plage le {name.toLowerCase()}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="font-ui text-[14px] leading-5 text-text-muted lg:pt-2">Fermé</p>
                  )}
                </li>
              );
            })}
          </ul>
        </EditorSection>

        <EditorSection number={2} title="Durée et délais" subtitle="Appliqués à toutes les plages.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Durée d’un rendez-vous">
              {(control) => (
                <Select
                  {...control}
                  value={form.slotMinutes}
                  onChange={(event) =>
                    update((draft) => ({ ...draft, slotMinutes: Number(event.target.value) }))
                  }
                >
                  {DURATIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {durationLabel(minutes)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field
              label="Délai de prévenance"
              help="Temps minimum avant un rendez-vous."
              error={errors.minNoticeHours}
            >
              {(control) => (
                <Select
                  {...control}
                  value={form.minNoticeHours}
                  onChange={(event) =>
                    update((draft) => ({ ...draft, minNoticeHours: Number(event.target.value) }))
                  }
                >
                  {NOTICES.map((notice) => (
                    <option key={notice.value} value={notice.value}>
                      {notice.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field
              label="Réservation possible"
              help="Jusqu’à combien de jours à l’avance."
              error={errors.maxAdvanceDays}
            >
              {(control) => (
                <Select
                  {...control}
                  value={form.maxAdvanceDays}
                  onChange={(event) =>
                    update((draft) => ({ ...draft, maxAdvanceDays: Number(event.target.value) }))
                  }
                >
                  {HORIZONS.map((days) => (
                    <option key={days} value={days}>
                      {days} jours
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </EditorSection>

        <EditorSection
          number={3}
          title="Fermetures et horaires exceptionnels"
          subtitle="Jours fériés, congés, journées aux horaires réduits."
        >
          {form.exceptions.length > 0 && (
            <ul className="flex flex-col gap-3">
              {form.exceptions.map((exception, index) => {
                const dateKey = exceptionKey(exception.key, 'date');
                const startKey = exceptionKey(exception.key, 'start');
                const endKey = exceptionKey(exception.key, 'end');
                const label = `Fermeture ${index + 1}`;
                return (
                  <li
                    key={exception.key}
                    role="group"
                    aria-label={label}
                    className="flex flex-col gap-3 rounded-md border border-border-default p-3.5"
                  >
                    <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:items-end">
                      <Field label="Date" error={errors[dateKey]}>
                        {(control) => (
                          <Input
                            {...control}
                            type="date"
                            value={exception.date}
                            onChange={(event) => updateException(exception.key, { date: event.target.value })}
                            className="py-2 text-[14px] leading-5"
                          />
                        )}
                      </Field>
                      <Field label="Motif">
                        {(control) => (
                          <Input
                            {...control}
                            placeholder="Fête nationale, congés…"
                            maxLength={80}
                            value={exception.label ?? ''}
                            onChange={(event) =>
                              updateException(exception.key, { label: event.target.value })
                            }
                            className="py-2 text-[14px] leading-5"
                          />
                        )}
                      </Field>
                      <button
                        type="button"
                        aria-label={`Supprimer\u00A0: ${label}`}
                        onClick={() =>
                          update((draft) => ({
                            ...draft,
                            exceptions: draft.exceptions.filter((item) => item.key !== exception.key),
                          }))
                        }
                        className="flex size-10 items-center justify-center self-end rounded-sm text-icon-default hover:bg-neutral-100"
                      >
                        <Trash2 aria-hidden size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch
                        label="Fermé toute la journée"
                        checked={exception.closed}
                        onChange={(event) =>
                          updateException(exception.key, {
                            closed: event.target.checked,
                            startTime: event.target.checked ? null : (exception.startTime ?? '09:00'),
                            endTime: event.target.checked ? null : (exception.endTime ?? '12:00'),
                          })
                        }
                      />
                      {!exception.closed && (
                        <span className="flex items-center gap-2">
                          <input
                            type="time"
                            step={900}
                            aria-label={`${label}\u00A0: ouverture`}
                            aria-invalid={errors[startKey] ? true : undefined}
                            aria-describedby={errors[startKey] ? startKey : undefined}
                            value={exception.startTime ?? ''}
                            onChange={(event) =>
                              updateException(exception.key, { startTime: event.target.value })
                            }
                            className={timeInput}
                          />
                          <span aria-hidden className="font-ui text-[14px] text-text-muted">
                            à
                          </span>
                          <input
                            type="time"
                            step={900}
                            aria-label={`${label}\u00A0: fermeture`}
                            aria-invalid={errors[endKey] ? true : undefined}
                            aria-describedby={errors[endKey] ? endKey : undefined}
                            value={exception.endTime ?? ''}
                            onChange={(event) =>
                              updateException(exception.key, { endTime: event.target.value })
                            }
                            className={timeInput}
                          />
                        </span>
                      )}
                    </div>
                    <ErrorText id={startKey} message={errors[startKey]} />
                    <ErrorText id={endKey} message={errors[endKey]} />
                  </li>
                );
              })}
            </ul>
          )}
          <AddItemButton
            onClick={() =>
              update((draft) => ({
                ...draft,
                exceptions: [
                  ...draft.exceptions,
                  {
                    key: newKey(),
                    id: null,
                    date: addDays(today, 7),
                    closed: true,
                    startTime: null,
                    endTime: null,
                    label: '',
                  },
                ],
              }))
            }
          >
            Ajouter une fermeture
          </AddItemButton>
        </EditorSection>

        <EditorSection number={4} title="Lieu et visio" subtitle="Repris dans les e-mails de confirmation.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Lieu des rendez-vous à l’agence" error={errors.agencyAddress}>
              {(control) => (
                <Input
                  {...control}
                  value={form.agencyAddress}
                  onChange={(event) => update((draft) => ({ ...draft, agencyAddress: event.target.value }))}
                />
              )}
            </Field>
            <Field
              label="Lien de visio par défaut"
              help={'Facultatif\u00A0: sinon, un lien est créé pour chaque rendez-vous.'}
              error={errors.defaultVideoLink}
            >
              {(control) => (
                <Input
                  {...control}
                  type="url"
                  placeholder="https://"
                  value={form.defaultVideoLink}
                  onChange={(event) =>
                    update((draft) => ({ ...draft, defaultVideoLink: event.target.value }))
                  }
                />
              )}
            </Field>
          </div>
        </EditorSection>
      </EditorLayout>
    </form>
  );
}

/** Réglage des disponibilités (`GET/PUT /v1/admin/availability`), non maquetté : langage des éditeurs. */
export function AvailabilityEditor() {
  const query = useQuery({
    queryKey: ['availability-config'],
    queryFn: () => data(browserApi.GET('/v1/admin/availability')),
    // Formulaire initialisé une seule fois : pas de rechargement silencieux pendant la saisie.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  if (query.isError)
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-border-default bg-neutral-0 p-6"
      >
        <p className="font-ui text-[15px] leading-6">Impossible de charger les disponibilités.</p>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          Réessayer
        </Button>
      </div>
    );
  if (!query.data)
    return (
      <div aria-hidden className={cn('grid gap-5 xl:grid-cols-[minmax(0,748px)_340px] xl:gap-6')}>
        <Skeleton className="h-[640px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg max-xl:order-first" />
      </div>
    );
  return <AvailabilityFormView initial={query.data} />;
}
