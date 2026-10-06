'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CircleCheck, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { Event } from '@/lib/api/schema';
import { formatWeekdayDate } from '@/lib/format/date';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

const schema = z.object({
  fullName: fieldRules.fullName,
  email: fieldRules.email,
  phone: fieldRules.phone,
  seats: z.coerce.number().int().min(1).max(10),
  consent: fieldRules.consent,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

/**
 * « Je participe » (Agenda, non maquetté : style des formulaires du site) : modale d'inscription à un événement —
 * nom, e-mail, téléphone/WhatsApp, nombre de places, consentement → `POST /v1/event-registrations`.
 */
export function EventRegistrationDialog({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const antiSpam = useAntiSpam();
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', seats: 1, consent: false as unknown as true },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormOutput) {
    setFailure(null);
    try {
      const { data, error, response } = await browserApi.POST('/v1/event-registrations', {
        body: {
          eventSlug: event.slug,
          seats: values.seats,
          contact: { fullName: values.fullName, email: values.email, phone: values.phone },
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setDone(data.message);
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          const field = path.replace(/^contact\./, '') as keyof FormInput;
          if (field in schema.shape) form.setError(field, { message });
        }
      }
      setFailure(errorMessage(caught));
    }
  }

  function close() {
    setOpen(false);
    if (done) {
      setDone(null);
      form.reset();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/cta inline-flex cursor-pointer items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
      >
        Je participe
        <span className="sr-only"> : {event.title}</span>
        <ArrowRight
          aria-hidden
          size={16}
          className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
        />
      </button>
      <Modal
        open={open}
        onClose={close}
        title={done ? 'Inscription envoyée' : 'Je participe'}
        description={`${event.title} · ${formatWeekdayDate(event.startsAt)} · ${event.city}`}
      >
        {done ? (
          <div role="status" className="flex flex-col items-start gap-4 pb-2">
            <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
              <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
              {done}
            </p>
            <Button variant="outline" onClick={close}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 pb-2">
            <input {...antiSpam.honeypotProps} />
            <Field label="Nom et prénom" required error={errors.fullName?.message}>
              {(control) => (
                <Input icon={User} autoComplete="name" {...control} {...form.register('fullName')} />
              )}
            </Field>
            <Field label="E-mail" required error={errors.email?.message}>
              {(control) => (
                <Input
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  {...control}
                  {...form.register('email')}
                />
              )}
            </Field>
            <Field
              label="Téléphone / WhatsApp"
              required
              help="Avec l'indicatif du pays."
              error={errors.phone?.message}
            >
              {(control) => <PhoneInput {...control} {...form.register('phone')} />}
            </Field>
            <Field label="Nombre de places" required error={errors.seats?.message}>
              {(control) => (
                <Select {...control} {...form.register('seats')}>
                  {Array.from({ length: 10 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <Checkbox
                id={`consent-${event.slug}`}
                label={CONSENT_TEXT}
                aria-invalid={errors.consent ? true : undefined}
                {...form.register('consent')}
              />
              {errors.consent && (
                <p className="pl-8 text-[13px] leading-4 text-feedback-error">{errors.consent.message}</p>
              )}
            </div>
            {failure && (
              <p
                role="alert"
                className="rounded-md bg-feedback-error-subtle px-4 py-3 font-ui text-[14px] leading-5 text-feedback-error"
              >
                {failure}
              </p>
            )}
            <Button type="submit" loading={isSubmitting} fullWidth>
              Confirmer ma participation
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
