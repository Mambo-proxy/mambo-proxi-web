'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CircleCheck, Lock, Mail, Smartphone, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, formErrorMessage, toApiError } from '@/lib/api/errors';
import type { PartnerRequestInput, PartnershipType } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { trimmed, useFormCommon, type FieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

/** Types de partenariat du contrat, libellés dans la langue de la page (`forms.partner.types`). */
export const PARTNERSHIP_TYPES: ReadonlyArray<PartnershipType> = [
  'PRESTATAIRE_EXPERIENCE',
  'IMMOBILIER',
  'ENTREPRISE_PRESTATAIRE',
  'AUTRE',
];

/** Ville hors liste : valeur envoyée en français (lue par l'équipe), libellé traduit (`forms.partner.otherCity`). */
const OTHER_CITY = 'Autre ville';

/**
 * Lieux proposés au format « Pays · Ville » de la maquette (code pays ISO + ville). Noms de pays traduits
 * (`forms.partner.countries`).
 */
const LOCATIONS: ReadonlyArray<{ country: 'CM' | 'FR'; cities: string[] }> = [
  { country: 'CM', cities: ['Douala', 'Yaoundé', 'Kribi', 'Bafoussam', 'Garoua', OTHER_CITY] },
  { country: 'FR', cities: ['Paris', 'Lyon', 'Marseille', 'Lille', OTHER_CITY] },
];

type PartnerMessages = ReturnType<typeof useTranslations<'forms.partner'>>;

function makeSchema(rules: FieldRules, t: PartnerMessages) {
  return z.object({
    partnershipType: z.enum(['PRESTATAIRE_EXPERIENCE', 'IMMOBILIER', 'ENTREPRISE_PRESTATAIRE', 'AUTRE'], {
      error: t('partnershipTypeRequired'),
    }),
    organization: trimmed(
      z.minLength(1, t('organizationRequired')),
      z.maxLength(120, t('organizationTooLong')),
    ),
    activity: trimmed(z.minLength(1, t('activityRequired')), z.maxLength(120, t('activityTooLong'))),
    fullName: rules.fullName,
    email: rules.email,
    phone: rules.phone,
    location: z.string().check(z.minLength(1, t('locationRequired'))),
    presentation: trimmed(z.maxLength(3000, t('presentationTooLong'))),
    consent: rules.consent,
  });
}

type FormInput = z.input<ReturnType<typeof makeSchema>>;
type FormOutput = z.output<ReturnType<typeof makeSchema>>;

/** Valeur initiale du type depuis `?type=` (lien « Je candidate » sans JavaScript). */
function isPartnershipType(value: string | null | undefined): value is PartnershipType {
  return PARTNERSHIP_TYPES.some((type) => type === value);
}

/**
 * `PartnerForm` sur le type de partenariat de l'adresse (`?type=`). La page étant prérendue, l'adresse n'est
 * lue que dans le navigateur : à placer sous `<Suspense>`, avec en repli `PartnerForm` sur le premier type
 * (même rendu que sans paramètre).
 */
export function PartnerFormFromUrl() {
  return <PartnerForm initialType={useSearchParams().get('type')} />;
}

/**
 * Carte formulaire « Devenir partenaire » (`65:6011`) : type de partenariat (puces), structure, activité, identité,
 * pays et ville, présentation, consentement, mention anti-spam → `POST /v1/partner-requests`.
 * Les liens « Je candidate » des cartes présélectionnent le type et font défiler jusqu'ici.
 */
export function PartnerForm({ initialType }: { initialType: string | null }) {
  const t = useTranslations('forms.partner');
  const common = useFormCommon();
  const schema = useMemo(() => makeSchema(common.rules, t), [common.rules, t]);
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<{ message: string; reference: string } | null>(null);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      // Premier type présélectionné, comme sur la maquette (`65:6017`).
      partnershipType: isPartnershipType(initialType) ? initialType : 'PRESTATAIRE_EXPERIENCE',
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
          antiSpam: await antiSpam.build(),
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
      // Erreur sur un champ absent du formulaire : son message plutôt que « Vérifiez les champs signalés ».
      toast.error(
        formErrorMessage(
          caught,
          (path) => {
            const name = path.replace(/^contact\./, '') as keyof FormInput;
            return name in schema.shape;
          },
          common.t('unexpectedError'),
        ),
      );
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
            {common.t('reference')} <span className="font-semibold text-text-main">{done.reference}</span>
          </p>
          <Button variant="outline" onClick={() => setDone(null)}>
            {t('sendAnother')}
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label={t('formLabel')}
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div {...antiSpam.widgetProps} />
          <fieldset>
            <legend className="mb-2.5 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
              {t('partnershipType')}
              <span className="text-text-brand"> *</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {PARTNERSHIP_TYPES.map((type) => {
                const selected = partnershipType === type;
                return (
                  <label
                    key={type}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                      selected
                        ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                        : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
                    )}
                  >
                    <input
                      type="radio"
                      value={type}
                      className="sr-only"
                      {...form.register('partnershipType')}
                    />
                    {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
                    {t(`types.${type}`)}
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
          {/* En mobile, champs groupés par deux comme les rangées du desktop : 16 dans une paire, 20 entre deux (`65:6419`). */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5 max-md:[&>*:nth-child(2n+3)]:mt-1">
            <Field label={t('organization')} required error={errors.organization?.message}>
              {(control) => (
                <Input
                  autoComplete="organization"
                  placeholder={t('organizationPlaceholder')}
                  {...control}
                  {...form.register('organization')}
                />
              )}
            </Field>
            <Field label={t('activity')} required error={errors.activity?.message}>
              {(control) => (
                <Input placeholder={t('activityPlaceholder')} {...control} {...form.register('activity')} />
              )}
            </Field>
            <Field label={t('fullName')} required error={errors.fullName?.message}>
              {(control) => (
                <Input
                  icon={User}
                  autoComplete="name"
                  placeholder={t('fullNamePlaceholder')}
                  {...control}
                  {...form.register('fullName')}
                />
              )}
            </Field>
            <Field label={t('email')} required error={errors.email?.message}>
              {(control) => (
                <Input
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                  {...control}
                  {...form.register('email')}
                />
              )}
            </Field>
            <Field label={t('phone')} required error={errors.phone?.message}>
              {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
            </Field>
            <Field label={t('location')} required error={errors.location?.message}>
              {(control) => (
                <Select {...control} {...form.register('location')}>
                  <option value="">{t('locationPlaceholder')}</option>
                  {LOCATIONS.map((location) => {
                    const countryName = t(`countries.${location.country}`);
                    return (
                      <optgroup key={location.country} label={countryName}>
                        {location.cities.map((city) => (
                          <option key={city} value={`${location.country}|${city}`}>
                            {`${countryName} · ${city === OTHER_CITY ? t('otherCity') : city}`}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </Select>
              )}
            </Field>
            <Field label={t('presentation')} error={errors.presentation?.message} className="md:col-span-2">
              {(control) => (
                <Textarea
                  rows={3}
                  className="min-h-[120px]"
                  placeholder={t('presentationPlaceholder')}
                  {...control}
                  {...form.register('presentation')}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="partenaire-consent"
              label={common.t('consentText')}
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
          {/* Une seule ligne : en mobile, la mention empiète sur la marge intérieure, comme sur la maquette (`65:6477`). */}
          <p className="flex items-center gap-2 text-caption text-text-muted max-md:-mr-3 max-md:whitespace-nowrap">
            <Lock aria-hidden size={16} />
            {t('antiSpam')}
          </p>
          <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
            {t('submit')}
          </Button>
        </form>
      )}
    </div>
  );
}
