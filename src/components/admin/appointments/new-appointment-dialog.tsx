'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, User } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { sidebarCountsKey } from '@/components/admin/shell/sidebar';
import { Button } from '@/components/ui/button';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type {
  AdminAppointmentInput,
  AppointmentFormat,
  AppointmentReason,
  AvailabilityConfig,
} from '@/lib/api/schema';
import { toE164 } from '@/lib/phone';
import { appointmentsKey } from './appointment-actions';
import { isDateKey, parseTime, zonedInstant, type DateKey } from './calendar-utils';
import { FORMAT_LABELS, REASON_LABELS, type Appointment } from './labels';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

type Values = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  reason: AppointmentReason | '';
  format: AppointmentFormat | '';
  date: string;
  time: string;
  duration: string;
  location: string;
  videoLink: string;
  notes: string;
  notifyClient: boolean;
};

/** Chemins d'erreur du contrat → champs du formulaire. */
const FIELD_OF: Record<string, keyof Values> = {
  'contact.fullName': 'fullName',
  'contact.email': 'email',
  'contact.phone': 'phone',
  'contact.city': 'city',
  'contact.country': 'country',
  reason: 'reason',
  format: 'format',
  startsAt: 'date',
  durationMinutes: 'duration',
  location: 'location',
  videoLink: 'videoLink',
  notes: 'notes',
};

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Indiquez le nom du contact.';
  if (!EMAIL.test(values.email.trim())) errors.email = 'Indiquez une adresse e-mail valide.';
  if (!toE164(values.phone)) errors.phone = 'Indiquez un numéro avec l’indicatif (+237, +33…).';
  if (!values.reason) errors.reason = 'Choisissez le motif.';
  if (!values.format) errors.format = 'Choisissez le format.';
  if (!isDateKey(values.date)) errors.date = 'Indiquez la date du rendez-vous.';
  if (parseTime(values.time) === null) errors.time = 'Indiquez l’heure du rendez-vous.';
  if (values.videoLink.trim()) {
    try {
      new URL(values.videoLink.trim());
    } catch {
      errors.videoLink = 'Indiquez une adresse complète (https://…).';
    }
  }
  return errors;
}

function NewAppointmentForm({
  defaultDate,
  config,
  onCreated,
  onCancel,
}: {
  defaultDate: DateKey;
  config: AvailabilityConfig | undefined;
  onCreated: (appointment: Appointment) => void;
  onCancel: () => void;
}) {
  const client = useQueryClient();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    country: 'CM',
    reason: '',
    format: '',
    date: defaultDate,
    time: '09:00',
    duration: String(config?.rules[0]?.slotMinutes ?? 60),
    location: config?.agencyAddress ?? '',
    videoLink: config?.defaultVideoLink ?? '',
    notes: '',
    notifyClient: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const create = useMutation({
    mutationFn: (body: AdminAppointmentInput) =>
      data(browserApi.POST('/v1/admin/appointments', { body })) as Promise<Appointment>,
    onSuccess: (created) => {
      void client.invalidateQueries({ queryKey: appointmentsKey });
      void client.invalidateQueries({ queryKey: sidebarCountsKey });
      toast.success(
        values.notifyClient
          ? 'Rendez-vous ajouté\u00A0: le client reçoit un e-mail de confirmation.'
          : 'Rendez-vous ajouté au calendrier.',
      );
      onCreated(created);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const next: Partial<Record<keyof Values, string>> = {};
        for (const [path, message] of Object.entries(error.fieldErrors)) {
          const field = FIELD_OF[path];
          if (field) next[field] = message;
        }
        setErrors(next);
        setFormError(Object.keys(next).length ? null : errorMessage(error));
      } else setFormError(errorMessage(error));
    },
  });

  function focusFirstError() {
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError();
      return;
    }
    create.mutate(
      {
        contact: {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: toE164(values.phone) ?? values.phone,
          ...(values.city.trim() ? { city: values.city.trim() } : {}),
          ...(values.country ? { country: values.country } : {}),
        },
        reason: values.reason as AppointmentReason,
        format: values.format as AppointmentFormat,
        startsAt: zonedInstant(values.date, parseTime(values.time) ?? 0),
        durationMinutes: Number(values.duration),
        location: values.format === 'AGENCE' ? values.location.trim() || null : null,
        videoLink: values.format === 'VISIO' ? values.videoLink.trim() || null : null,
        notes: values.notes.trim() || null,
        notifyClient: values.notifyClient,
      },
      { onError: focusFirstError },
    );
  }

  return (
    <form
      ref={form}
      noValidate
      onSubmit={submit}
      aria-label="Nouveau rendez-vous"
      className="flex flex-col gap-5"
    >
      {formError && (
        <p
          role="alert"
          className="rounded-md bg-feedback-error-subtle p-3 font-ui text-[14px] leading-5 text-feedback-error"
        >
          {formError}
        </p>
      )}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-ui text-[16px] leading-6 font-semibold text-text-main">Contact</legend>
        <Field label="Nom et prénom" required error={errors.fullName}>
          {(control) => (
            <Input
              {...control}
              icon={User}
              autoComplete="off"
              value={values.fullName}
              onChange={(event) => set('fullName', event.target.value)}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" required error={errors.email}>
            {(control) => (
              <Input
                {...control}
                type="email"
                icon={Mail}
                autoComplete="off"
                value={values.email}
                onChange={(event) => set('email', event.target.value)}
              />
            )}
          </Field>
          <Field label="Téléphone / WhatsApp" required error={errors.phone}>
            {(control) => (
              <PhoneInput
                {...control}
                value={values.phone}
                onChange={(event) => set('phone', event.target.value)}
              />
            )}
          </Field>
          <Field label="Ville" error={errors.city}>
            {(control) => (
              <Input {...control} value={values.city} onChange={(event) => set('city', event.target.value)} />
            )}
          </Field>
          <Field label="Pays" error={errors.country}>
            {(control) => (
              <Select
                {...control}
                value={values.country}
                onChange={(event) => set('country', event.target.value)}
              >
                <option value="CM">Cameroun</option>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="">Autre pays</option>
              </Select>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-ui text-[16px] leading-6 font-semibold text-text-main">
          Rendez-vous
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Motif" required error={errors.reason}>
            {(control) => (
              <Select
                {...control}
                value={values.reason}
                onChange={(event) => set('reason', event.target.value as AppointmentReason)}
              >
                <option value="">Choisir…</option>
                {Object.entries(REASON_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Format" required error={errors.format}>
            {(control) => (
              <Select
                {...control}
                value={values.format}
                onChange={(event) => set('format', event.target.value as AppointmentFormat)}
              >
                <option value="">Choisir…</option>
                {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Date" required error={errors.date}>
            {(control) => (
              <Input
                {...control}
                type="date"
                value={values.date}
                onChange={(event) => set('date', event.target.value)}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Heure" required error={errors.time} help="Heure de Douala">
              {(control) => (
                <Input
                  {...control}
                  type="time"
                  step={900}
                  value={values.time}
                  onChange={(event) => set('time', event.target.value)}
                />
              )}
            </Field>
            <Field label="Durée" error={errors.duration}>
              {(control) => (
                <Select
                  {...control}
                  value={values.duration}
                  onChange={(event) => set('duration', event.target.value)}
                >
                  {DURATIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes < 60
                        ? `${minutes} min`
                        : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60}` : ''}`}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </div>
        {values.format === 'AGENCE' && (
          <Field label="Lieu" error={errors.location}>
            {(control) => (
              <Input
                {...control}
                value={values.location}
                onChange={(event) => set('location', event.target.value)}
              />
            )}
          </Field>
        )}
        {values.format === 'VISIO' && (
          <Field
            label="Lien de visio"
            error={errors.videoLink}
            help={'Facultatif\u00A0: un lien est créé automatiquement s’il est vide.'}
          >
            {(control) => (
              <Input
                {...control}
                type="url"
                placeholder="https://"
                value={values.videoLink}
                onChange={(event) => set('videoLink', event.target.value)}
              />
            )}
          </Field>
        )}
        <Field label="Notes internes" error={errors.notes}>
          {(control) => (
            <Textarea
              {...control}
              rows={2}
              maxLength={2000}
              className="min-h-[72px]"
              placeholder="Objet du rendez-vous, informations pour l’équipe…"
              value={values.notes}
              onChange={(event) => set('notes', event.target.value)}
            />
          )}
        </Field>
        <Switch
          label="Envoyer la confirmation et le rappel au client"
          checked={values.notifyClient}
          onChange={(event) => set('notifyClient', event.target.checked)}
        />
      </fieldset>

      <div className="flex flex-col-reverse gap-2 border-t border-border-default pt-5 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" size="sm" loading={create.isPending}>
          Ajouter le rendez-vous
        </Button>
      </div>
    </form>
  );
}

/** Saisie manuelle d'un rendez-vous (`AdminAppointmentInput`) : il est enregistré directement comme confirmé. */
export function NewAppointmentDialog({
  open,
  defaultDate,
  config,
  onClose,
  onCreated,
}: {
  open: boolean;
  defaultDate: DateKey;
  config: AvailabilityConfig | undefined;
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un rendez-vous"
      description={'Rendez-vous pris par téléphone, WhatsApp ou à l’agence\u00A0: il est enregistré comme confirmé.'}
      maxWidth={640}
    >
      {open && (
        <NewAppointmentForm
          defaultDate={defaultDate}
          config={config}
          onCreated={onCreated}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
