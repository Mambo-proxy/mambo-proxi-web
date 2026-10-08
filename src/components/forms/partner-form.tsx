'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CircleCheck, Lock, Mail, Smartphone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { PartnerRequestInput, PartnershipType } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

export const PARTNERSHIP_TYPES: ReadonlyArray<{ value: PartnershipType; label: string }> = [
  { value: 'PRESTATAIRE_EXPERIENCE', label: 'Prestataire Expérience' },
  { value: 'IMMOBILIER', label: 'Immobilier' },
  { value: 'ENTREPRISE_PRESTATAIRE', label: 'Entreprise & prestataire' },
  { value: 'AUTRE', label: 'Autre' },
];

/** Lieux proposés au format « Pays · Ville » de la maquette (code pays ISO + ville). */
const LOCATIONS: ReadonlyArray<{ country: string; countryName: string; cities: string[] }> = [
  {
    country: 'CM',
    countryName: 'Cameroun',
    cities: ['Douala', 'Yaoundé', 'Kribi', 'Bafoussam', 'Garoua', 'Autre ville'],
  },
  { country: 'FR', countryName: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Lille', 'Autre ville'] },
];

const schema = z.object({
  partnershipType: z.enum(['PRESTATAIRE_EXPERIENCE', 'IMMOBILIER', 'ENTREPRISE_PRESTATAIRE', 'AUTRE'], {
    error: 'Merci de choisir un type de partenariat.',
  }),
  organization: z
    .string()
    .trim()
    .min(1, 'Merci d’indiquer le nom de votre structure.')
    .max(120, 'Ce nom est trop long (120 caractères au plus).'),
  activity: z
    .string()
    .trim()
    .min(1, 'Merci d’indiquer votre activité.')
    .max(120, 'Ce texte est trop long (120 caractères au plus).'),
  fullName: fieldRules.fullName,
  email: fieldRules.email,
  phone: fieldRules.phone,
  location: z.string().min(1, 'Merci de choisir votre pays et votre ville.'),
  presentation: z.string().trim().max(3000, 'Ce texte est trop long (3 000 caractères au plus).'),
  consent: fieldRules.consent,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

/** Valeur initiale du type depuis `?type=` (lien « Je candidate » sans JavaScript). */
function isPartnershipType(value: string | null | undefined): value is PartnershipType {
  return PARTNERSHIP_TYPES.some((type) => type.value === value);
}

/**
 * Carte formulaire « Devenir partenaire » (`65:6011`) : type de partenariat (puces), structure, activité, identité,
 * pays et ville, présentation, consentement, mention anti-spam → `POST /v1/partner-requests`.
 * Les liens « Je candidate » des cartes présélectionnent le type et font défiler jusqu'ici.
 */
export function PartnerForm({ initialType }: { initialType: string | null }) {
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<{ message: string; reference: string } | null>(null);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      partnershipType: isPartnershipType(initialType)
        ? initialType
        : (undefined as unknown as PartnershipType),
      organization: '',
      activity: '',
      fullName: '',
      email: '',
      phone: '',
      location: '',
      presentation: '',
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const partnershipType = useWatch({ control: form.control, name: 'partnershipType' });

  // « Je candidate » : présélection du type sans recharger la page.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-partnership-link]');
      if (!link) return;
      const type = new URL(link.href).searchParams.get('type');
      if (!isPartnershipType(type)) return;
      event.preventDefault();
      form.setValue('partnershipType', type, { shouldValidate: true });
      setDone(null);
      const target = document.getElementById('formulaire');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target?.querySelector<HTMLInputElement>(`input[value="${type}"]`)?.focus({ preventScroll: true });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [form]);

  async function onSubmit(values: FormOutput) {
    const [country = '', city = ''] = values.location.split('|');
    try {
      const { data, error, response } = await browserApi.POST('/v1/partner-requests', {
        body: {
          partnershipType: values.partnershipType,
          organization: values.organization,
          activity: values.activity,
          contact: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            country,
            city,
          } as PartnerRequestInput['contact'],
          presentation: values.presentation || null,
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
          if (name in schema.shape) form.setError(name, { message });
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
            Envoyer une autre demande
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Devenir partenaire"
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <fieldset>
            <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
              Type de partenariat<span className="text-text-brand"> *</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {PARTNERSHIP_TYPES.map((type) => {
                const selected = partnershipType === type.value;
                return (
                  <label
                    key={type.value}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                      selected
                        ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                        : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
                    )}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      className="sr-only"
                      {...form.register('partnershipType')}
                    />
                    {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
                    {type.label}
                  </label>
                );
              })}
            </div>
            {errors.partnershipType && (
              <p className="mt-2 text-[13px] leading-4 text-feedback-error">
                {errors.partnershipType.message}
              </p>
            )}
          </fieldset>
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5">
            <Field label="Nom de la structure" required error={errors.organization?.message}>
              {(control) => (
                <Input
                  autoComplete="organization"
                  placeholder="Ex. : Saveurs de Douala"
                  {...control}
                  {...form.register('organization')}
                />
              )}
            </Field>
            <Field label="Activité" required error={errors.activity?.message}>
              {(control) => (
                <Input placeholder="Ex. : chef privé, traiteur" {...control} {...form.register('activity')} />
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
            <Field label="Pays et ville" required error={errors.location?.message}>
              {(control) => (
                <Select {...control} {...form.register('location')}>
                  <option value="">Choisir</option>
                  {LOCATIONS.map((location) => (
                    <optgroup key={location.country} label={location.countryName}>
                      {location.cities.map((city) => (
                        <option key={city} value={`${location.country}|${city}`}>
                          {`${location.countryName} · ${city}`}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              )}
            </Field>
            <Field
              label="Présentez votre activité"
              error={errors.presentation?.message}
              className="md:col-span-2"
            >
              {(control) => (
                <Textarea
                  placeholder="Expérience, zones d’intervention, disponibilités…"
                  {...control}
                  {...form.register('presentation')}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="partenaire-consent"
              label={CONSENT_TEXT}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'partenaire-consent-error' : undefined}
              {...form.register('consent')}
            />
            {errors.consent && (
              <p id="partenaire-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                {errors.consent.message}
              </p>
            )}
          </div>
          <p className="flex items-center gap-2 text-caption text-text-muted">
            <Lock aria-hidden size={16} />
            Formulaire protégé contre les envois automatiques
          </p>
          <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
            Envoyer ma demande
          </Button>
        </form>
      )}
    </div>
  );
}
