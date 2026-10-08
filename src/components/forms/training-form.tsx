'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CircleCheck, Mail, Smartphone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { TRAINING_REQUEST_EVENT } from '@/components/sections/training/trainings-catalog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { Training } from '@/lib/api/schema';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

/** Valeur de la liste pour une formation hors catalogue (contrat : `trainingSlug: autre`). */
const OTHER = 'autre';

const schema = z
  .object({
    trainingSlug: z.string().min(1, 'Merci de choisir une formation.'),
    otherTraining: z.string().trim().max(200, 'Ce texte est trop long (200 caractères au plus).'),
    organization: z
      .string()
      .trim()
      .min(1, 'Merci d’indiquer votre structure.')
      .max(120, 'Ce nom est trop long (120 caractères au plus).'),
    participants: z
      .string()
      .trim()
      .min(1, 'Merci d’indiquer le nombre de participants.')
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 500, {
        message: 'Merci d’indiquer un nombre entre 1 et 500.',
      }),
    fullName: fieldRules.fullName,
    email: fieldRules.email,
    phone: fieldRules.phone,
    period: z.string().trim().max(120, 'Ce texte est trop long.'),
    message: z.string().trim().max(3000, 'Ce texte est trop long (3 000 caractères au plus).'),
    consent: fieldRules.consent,
  })
  .refine((values) => values.trainingSlug !== OTHER || values.otherTraining.length > 0, {
    path: ['otherTraining'],
    message: 'Merci de préciser la formation souhaitée.',
  });

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

/**
 * Carte « Demande de formation » (`66:6545`) : fond `neutral/50` sans bordure, rayon 28, p 40 (20 en mobile).
 * Formation choisie dans le catalogue (ou « Autre formation »), structure, participants, identité, période, précisions,
 * consentement → `POST /v1/training-requests`. « Demander cette formation » du catalogue présélectionne la formation.
 */
export function TrainingForm({ trainings }: { trainings: Training[] }) {
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<{ message: string; reference: string } | null>(null);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      trainingSlug: '',
      otherTraining: '',
      organization: '',
      participants: '',
      fullName: '',
      email: '',
      phone: '',
      period: '',
      message: '',
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const trainingSlug = useWatch({ control: form.control, name: 'trainingSlug' });

  useEffect(() => {
    function onRequest(event: Event) {
      const slug = (event as CustomEvent<string>).detail;
      form.setValue('trainingSlug', slug, { shouldValidate: true });
      setDone(null);
    }
    window.addEventListener(TRAINING_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(TRAINING_REQUEST_EVENT, onRequest);
  }, [form]);

  async function onSubmit(values: FormOutput) {
    try {
      const { data, error, response } = await browserApi.POST('/v1/training-requests', {
        body: {
          trainingSlug: values.trainingSlug,
          otherTraining: values.trainingSlug === OTHER ? values.otherTraining : null,
          organization: values.organization,
          participants: Number(values.participants),
          period: values.period || null,
          contact: { fullName: values.fullName, email: values.email, phone: values.phone },
          message: values.message || null,
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setDone(data);
      form.reset();
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          const name = path.replace(/^contact\./, '') as keyof FormInput;
          if (name in form.getValues()) form.setError(name, { message });
        }
      }
      toast.error(errorMessage(caught));
    }
  }

  return (
    <div className="rounded-[28px] bg-neutral-50 p-5 md:p-10">
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
            Faire une autre demande
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Demande de formation"
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5">
            <Field
              label="Formation souhaitée"
              required
              error={errors.trainingSlug?.message}
              className="md:col-span-2"
            >
              {(control) => (
                <Select {...control} {...form.register('trainingSlug')}>
                  <option value="">Choisir une formation</option>
                  {trainings.map((training) => (
                    <option key={training.slug} value={training.slug}>
                      {training.title}
                    </option>
                  ))}
                  <option value={OTHER}>Autre formation</option>
                </Select>
              )}
            </Field>
            {trainingSlug === OTHER && (
              <Field
                label="Formation recherchée"
                required
                error={errors.otherTraining?.message}
                className="md:col-span-2"
              >
                {(control) => (
                  <Input placeholder="Thème, objectifs…" {...control} {...form.register('otherTraining')} />
                )}
              </Field>
            )}
            <Field label="Structure" required error={errors.organization?.message}>
              {(control) => (
                <Input
                  autoComplete="organization"
                  placeholder="Entreprise, association, particulier…"
                  {...control}
                  {...form.register('organization')}
                />
              )}
            </Field>
            <Field label="Nombre de participants" required error={errors.participants?.message}>
              {(control) => (
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={500}
                  placeholder="Ex. : 8"
                  {...control}
                  {...form.register('participants')}
                />
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
            <Field label="Période souhaitée" error={errors.period?.message}>
              {(control) => (
                <Input
                  icon={Calendar}
                  placeholder="Ex. : janvier 2027"
                  {...control}
                  {...form.register('period')}
                />
              )}
            </Field>
            <Field label="Précisions" error={errors.message?.message} className="md:col-span-2">
              {(control) => (
                <Textarea
                  rows={3}
                  placeholder="Objectifs, niveau des participants, lieu…"
                  {...control}
                  {...form.register('message')}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="formation-consent"
              label={CONSENT_TEXT}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'formation-consent-error' : undefined}
              {...form.register('consent')}
            />
            {errors.consent && (
              <p id="formation-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                {errors.consent.message}
              </p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
            Envoyer ma demande
          </Button>
        </form>
      )}
    </div>
  );
}
