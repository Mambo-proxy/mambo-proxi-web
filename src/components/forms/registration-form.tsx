'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, CircleCheck, Mail, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select } from '@/components/ui/field';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { toast } from '@/components/ui/toaster';
import { useStaggerIn } from '@/components/ui/use-stagger-in';
import { browserApi } from '@/lib/api/browser';
import { ApiError, formErrorMessage, toApiError } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { trimmed, useFormCommon, type FieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';
import { routes } from '@/lib/routes';

export type Profile = 'PARTICULIER' | 'PROFESSIONNEL';

/**
 * Activités principales proposées aux professionnels et partenaires : valeur enregistrée en français (lue par
 * l'équipe dans le back-office), libellé dans la langue de la page (`forms.registration.activities`).
 */
const ACTIVITIES = [
  ['chef', 'Chef, traiteur ou restauration'],
  ['driver', 'Chauffeur ou location de véhicules'],
  ['photo', 'Photographie ou vidéo'],
  ['wellness', 'Bien-être et massage'],
  ['events', 'Décoration et événementiel'],
  ['realEstateAgency', 'Agence immobilière'],
  ['landlord', 'Propriétaire ou bailleur'],
  ['cleaning', 'Entretien et ménage'],
  ['delivery', 'Livraison et courses'],
  ['tourism', 'Tourisme, guide ou culture'],
  ['other', 'Autre'],
] as const;

/**
 * Villes proposées dans « Ville ou quartier » (Douala par défaut) ; « Hors du Cameroun » n'envoie pas de pays.
 * Valeurs en français (fiche contact), libellés traduits (`forms.registration.cities`).
 */
const CITIES = [
  ['douala', 'Douala'],
  ['yaounde', 'Yaoundé'],
  ['other', 'Autre ville du Cameroun'],
  ['abroad', 'Hors du Cameroun'],
] as const;
const ABROAD = 'Hors du Cameroun';

type RegistrationMessages = ReturnType<typeof useTranslations<'forms.registration'>>;

/** Schéma selon le profil : la structure et l'activité sont obligatoires pour un professionnel. */
function makeSchema(profile: Profile, rules: FieldRules, t: RegistrationMessages) {
  const professional = profile === 'PROFESSIONNEL';
  const required = (message: string) => trimmed(z.minLength(1, message), z.maxLength(60, t('fieldTooLong')));
  return z.object({
    profile: z.enum(['PARTICULIER', 'PROFESSIONNEL']),
    organization: professional
      ? trimmed(z.minLength(1, t('organizationRequired')), z.maxLength(120, t('organizationTooLong')))
      : z.string(),
    activity: professional ? z.string().check(z.minLength(1, t('activityRequired'))) : z.string(),
    firstName: required(t('firstNameRequired')),
    lastName: required(t('lastNameRequired')),
    email: rules.email,
    phone: rules.phone,
    city: z.string().check(z.minLength(1, t('cityRequired'))),
    // L'API limite `city` (« quartier, ville ») à 80 caractères : 55 pour le quartier laisse la place à la ville.
    quarter: trimmed(z.maxLength(55, t('quarterTooLong'))),
    interests: z.array(z.string()),
    newsletter: z.boolean(),
    consent: rules.consent,
  });
}

type FormInput = z.input<ReturnType<typeof makeSchema>>;
type FormOutput = z.output<ReturnType<typeof makeSchema>>;

type RegistrationFormProps = {
  initialProfile: Profile;
  categories: { slug: string; name: string }[];
  /** Le profil choisi est remonté pour adapter le panneau illustré. */
  onProfileChange?: (profile: Profile) => void;
};

/**
 * Inscription (`70:10558` particulier, `70:11134` professionnel) : chapô, sélecteur de profil (met à jour `?profil=`),
 * carte formulaire, aide « Une question ? ». Pas de compte avec mot de passe au lot 1 : l'envoi crée une fiche contact
 * (`POST /v1/registrations`). Newsletter décochée par défaut (consentement explicite).
 */
export function RegistrationForm({ initialProfile, categories, onProfileChange }: RegistrationFormProps) {
  const t = useTranslations('forms.registration');
  const common = useFormCommon();
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<string | null>(null);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: (data, context, options) =>
      zodResolver(makeSchema(data.profile, common.rules, t))(data, context, options),
    mode: 'onTouched',
    defaultValues: {
      profile: initialProfile,
      organization: '',
      activity: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: 'Douala',
      quarter: '',
      interests: [],
      newsletter: false,
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const profile = useWatch({ control: form.control, name: 'profile' });
  // Changement d'onglet : les champs du profil choisi apparaissent en cascade.
  const fieldsRef = useStaggerIn<HTMLDivElement>(profile);
  const interests = useWatch({ control: form.control, name: 'interests' }) ?? [];

  function changeProfile(next: Profile) {
    form.setValue('profile', next);
    form.clearErrors(['organization', 'activity']);
    setDone(null);
    onProfileChange?.(next);
    const url = new URL(window.location.href);
    if (next === 'PROFESSIONNEL') url.searchParams.set('profil', 'professionnel');
    else url.searchParams.delete('profil');
    window.history.replaceState(null, '', url);
  }

  function toggleInterest(slug: string) {
    form.setValue(
      'interests',
      interests.includes(slug) ? interests.filter((item) => item !== slug) : [...interests, slug],
    );
  }

  async function onSubmit(values: FormOutput) {
    const professional = values.profile === 'PROFESSIONNEL';
    try {
      const { data, error, response } = await browserApi.POST('/v1/registrations', {
        body: {
          profile: values.profile,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          country: values.city === ABROAD ? null : 'CM',
          city:
            values.city === ABROAD
              ? values.quarter || null
              : [values.quarter, values.city].filter(Boolean).join(', '),
          interests: values.interests,
          organization: professional ? values.organization : null,
          activity: professional ? values.activity : null,
          newsletter: values.newsletter,
          consent: true,
          antiSpam: await antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setDone(data.message);
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          if (path in form.getValues()) form.setError(path as keyof FormInput, { message });
        }
      }
      toast.error(formErrorMessage(caught, (path) => path in form.getValues(), common.t('unexpectedError')));
    }
  }

  return (
    <>
      <p className="font-ui text-[15px] leading-[26px] text-text-muted md:text-[17px]">
        {frenchTypography(t(`copy.${profile}.lead`))}
      </p>
      <SegmentedTabs
        label={t('profileLabel')}
        value={profile}
        onChange={changeProfile}
        fullWidth
        size="lg"
        options={[
          {
            value: 'PARTICULIER',
            label: t('profileIndividual'),
            shortLabel: t('profileIndividualShort'),
          },
          {
            value: 'PROFESSIONNEL',
            label: t('profileProfessional'),
            shortLabel: t('profileProfessionalShort'),
          },
        ]}
      />
      <div className="rounded-3xl border border-border-default bg-neutral-0 p-5 md:p-8">
        {done ? (
          <div role="status" className="flex flex-col items-start gap-4">
            <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
              <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
              {done}
            </p>
            <Link href={routes.devis} className="font-ui text-[14px] leading-5 font-semibold text-text-brand">
              {t('quoteLink')}
            </Link>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            aria-label={t('formLabel')}
            className="flex flex-col gap-[18px]"
          >
            <input {...antiSpam.honeypotProps} />
            <div {...antiSpam.widgetProps} />
            <div
              ref={fieldsRef}
              className="grid gap-4 md:grid-cols-2 md:gap-y-[18px] max-md:[&>*:nth-child(2n+3)]:mt-0.5"
            >
              {profile === 'PROFESSIONNEL' && (
                <>
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
                      <Select {...control} {...form.register('activity')}>
                        <option value="">{t('activityPlaceholder')}</option>
                        {ACTIVITIES.map(([key, value]) => (
                          <option key={key} value={value}>
                            {t(`activities.${key}`)}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </>
              )}
              <Field label={t('firstName')} required error={errors.firstName?.message}>
                {(control) => (
                  <Input
                    autoComplete="given-name"
                    placeholder={t('firstNamePlaceholder')}
                    {...control}
                    {...form.register('firstName')}
                  />
                )}
              </Field>
              <Field label={t('lastName')} required error={errors.lastName?.message}>
                {(control) => (
                  <Input
                    autoComplete="family-name"
                    placeholder={t('lastNamePlaceholder')}
                    {...control}
                    {...form.register('lastName')}
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
                {(control) => (
                  <PhoneInput
                    icon={Smartphone}
                    placeholder="+237 6 00 00 00 00"
                    {...control}
                    {...form.register('phone')}
                  />
                )}
              </Field>
              <Field label={t('city')} required error={errors.city?.message}>
                {(control) => (
                  <Select autoComplete="address-level2" {...control} {...form.register('city')}>
                    {CITIES.map(([key, value]) => (
                      <option key={key} value={value}>
                        {t(`cities.${key}`)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t('quarter')} error={errors.quarter?.message}>
                {(control) => (
                  <Input
                    autoComplete="address-level3"
                    placeholder={t('quarterPlaceholder')}
                    {...control}
                    {...form.register('quarter')}
                  />
                )}
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2.5 font-ui text-[14px] leading-5 font-semibold text-text-main">
                {t(`copy.${profile}.interests`)}
              </legend>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const selected = interests.includes(category.slug);
                  return (
                    <label
                      key={category.slug}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                          : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleInterest(category.slug)}
                        className="sr-only"
                      />
                      {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
                      {category.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <Checkbox
                id="inscription-consent"
                label={common.t('consentText')}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? 'inscription-consent-error' : undefined}
                {...form.register('consent')}
              />
              {errors.consent && (
                <p id="inscription-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                  {errors.consent.message}
                </p>
              )}
            </div>
            <Checkbox id="inscription-newsletter" label={t('newsletter')} {...form.register('newsletter')} />
            <Button type="submit" fullWidth loading={isSubmitting}>
              {t(`copy.${profile}.submit`)}
            </Button>
          </form>
        )}
      </div>
      <p className="flex flex-wrap items-center justify-center gap-1.5 font-ui text-[14px] leading-5 text-text-muted">
        {frenchTypography(t('question'))}
        <Link
          href={routes.contact}
          className="group/help inline-flex items-center gap-1.5 rounded-xs font-semibold tracking-[0.005em] text-text-brand"
        >
          {t('contactLink')}
          <ArrowRight
            aria-hidden
            size={16}
            className="transition-transform duration-200 group-hover/help:translate-x-[3px]"
          />
        </Link>
      </p>
    </>
  );
}
