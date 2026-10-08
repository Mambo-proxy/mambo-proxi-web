'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Mail, MapPin, Smartphone, User } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dropzone } from '@/components/ui/dropzone';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { JobApplicationInput } from '@/lib/api/schema';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

/** CV : PDF ou Word, 5 Mo au plus (contrat `JobApplicationInput.cv`). */
const CV_ACCEPT = '.pdf,.doc,.docx';
const CV_MAX_SIZE = 5 * 1024 * 1024;

/** Valeur de la liste « Poste visé » pour une candidature spontanée (contrat : `jobSlug` vide). */
const SPONTANEOUS = 'spontanee';

const schema = z.object({
  jobSlug: z.string().min(1, 'Merci de choisir le poste visé.'),
  fullName: fieldRules.fullName,
  email: fieldRules.email,
  phone: fieldRules.phone,
  city: z.string().trim().max(80, 'Ce nom de ville est trop long.'),
  cv: z.custom<File>((value) => value instanceof File, { message: 'Merci de joindre votre CV.' }),
  message: z.string().trim().max(3000, 'Ce message est trop long (3 000 caractères au plus).'),
  consent: fieldRules.consent,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

type ApplicationFormProps = {
  jobs: { slug: string; title: string }[];
  /** Poste présélectionné (`?poste=` depuis « Postuler à cette offre » ou « Candidature spontanée »). */
  initialJob: string | null;
};

/**
 * Carte « Candidature » (Recrutement `67:7005`) : poste visé (offres ouvertes ou candidature spontanée), identité,
 * ville, CV par glisser-déposer, message, consentement → `POST /v1/job-applications` en `multipart/form-data`.
 */
export function ApplicationForm({ jobs, initialJob }: ApplicationFormProps) {
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<{ message: string; reference: string } | null>(null);
  const initial = jobs.some((job) => job.slug === initialJob) ? initialJob! : SPONTANEOUS;
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      jobSlug: initial,
      fullName: '',
      email: '',
      phone: '',
      city: '',
      cv: undefined,
      message: '',
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormOutput) {
    const spam = antiSpam.build();
    const fields: Record<string, string | Blob> = {
      jobSlug: values.jobSlug === SPONTANEOUS ? '' : values.jobSlug,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      city: values.city,
      message: values.message,
      cv: values.cv,
      consent: 'true',
      turnstileToken: spam.turnstileToken,
      honeypot: spam.honeypot ?? '',
      startedAt: spam.startedAt,
    };
    const body = new FormData();
    for (const [name, value] of Object.entries(fields)) body.append(name, value);
    try {
      const { data, error, response } = await browserApi.POST('/v1/job-applications', {
        body: fields as unknown as JobApplicationInput,
        bodySerializer: () => body,
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setDone(data);
      form.reset({ ...form.formState.defaultValues, jobSlug: SPONTANEOUS });
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          if (path in form.getValues()) form.setError(path as keyof FormInput, { message });
        }
      }
      toast.error(errorMessage(caught));
    }
  }

  return (
    <div className="rounded-[28px] border border-border-default bg-neutral-0 p-5 md:p-10">
      {done ? (
        <div role="status" className="flex flex-col items-start gap-4">
          <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
            <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
            {done.message}
          </p>
          <p className="font-ui text-[14px] leading-5 text-text-muted">
            Référence : <span className="font-semibold text-text-main">{done.reference}</span>
          </p>
          <Button variant="outline" onClick={() => setDone(null)}>
            Envoyer une autre candidature
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Candidature"
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5">
            <Field label="Poste visé" required error={errors.jobSlug?.message} className="md:col-span-2">
              {(control) => (
                <Select {...control} {...form.register('jobSlug')}>
                  <option value={SPONTANEOUS}>Candidature spontanée</option>
                  {jobs.map((job) => (
                    <option key={job.slug} value={job.slug}>
                      {job.title}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Nom et prénom" required error={errors.fullName?.message}>
              {(control) => (
                <Input
                  icon={User}
                  autoComplete="name"
                  placeholder="Votre nom complet"
                  {...control}
                  {...form.register('fullName')}
                />
              )}
            </Field>
            <Field label="E-mail" required error={errors.email?.message}>
              {(control) => (
                <Input
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  {...control}
                  {...form.register('email')}
                />
              )}
            </Field>
            <Field label="Téléphone / WhatsApp" required error={errors.phone?.message}>
              {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
            </Field>
            <Field label="Ville" error={errors.city?.message}>
              {(control) => (
                <Input
                  icon={MapPin}
                  autoComplete="address-level2"
                  placeholder="Douala"
                  {...control}
                  {...form.register('city')}
                />
              )}
            </Field>
            <div className="flex flex-col gap-2 md:col-span-2">
              <p id="cv-label" className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                CV
                <span aria-hidden className="text-text-brand">
                  {' '}
                  *
                </span>
              </p>
              <Controller
                control={form.control}
                name="cv"
                render={({ field, fieldState }) => (
                  <Dropzone
                    accept={CV_ACCEPT}
                    maxSize={CV_MAX_SIZE}
                    file={(field.value as File | undefined) ?? null}
                    onFileChange={(file) => {
                      field.onChange(file ?? undefined);
                      field.onBlur();
                    }}
                    label="Glissez votre CV ici ou parcourez vos fichiers"
                    help="PDF ou Word · 5 Mo maximum"
                    error={fieldState.error?.message}
                    aria-describedby="cv-label"
                  />
                )}
              />
            </div>
            <Field label="Message" error={errors.message?.message} className="md:col-span-2">
              {(control) => (
                <Textarea
                  rows={3}
                  placeholder="Présentez-vous en quelques lignes…"
                  {...control}
                  {...form.register('message')}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="candidature-consent"
              label={CONSENT_TEXT}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'candidature-consent-error' : undefined}
              {...form.register('consent')}
            />
            {errors.consent && (
              <p id="candidature-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                {errors.consent.message}
              </p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
            Envoyer ma candidature
          </Button>
        </form>
      )}
    </div>
  );
}
