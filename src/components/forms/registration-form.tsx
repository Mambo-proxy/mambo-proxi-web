'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, CircleCheck, Mail, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select } from '@/components/ui/field';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { COUNTRIES } from '@/lib/countries';
import { frenchTypography } from '@/lib/format/typography';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';
import { routes } from '@/lib/routes';

export type Profile = 'PARTICULIER' | 'PROFESSIONNEL';

/** Activités principales proposées aux professionnels et partenaires. */
const ACTIVITIES = [
  'Chef, traiteur ou restauration',
  'Chauffeur ou location de véhicules',
  'Photographie ou vidéo',
  'Bien-être et massage',
  'Décoration et événementiel',
  'Agence immobilière',
  'Propriétaire ou bailleur',
  'Entretien et ménage',
  'Livraison et courses',
  'Tourisme, guide ou culture',
  'Autre',
];

const NEWSLETTER_TEXT = 'Je souhaite recevoir la lettre Mambo (une fois par mois).';

const required = (message: string) => z.string().trim().min(1, message).max(60, 'Ce champ est trop long.');

/** Schéma selon le profil : la structure et l'activité sont obligatoires pour un professionnel. */
function schemaFor(profile: Profile) {
  const professional = profile === 'PROFESSIONNEL';
  return z.object({
    profile: z.enum(['PARTICULIER', 'PROFESSIONNEL']),
    organization: professional
      ? z
          .string()
          .trim()
          .min(1, 'Merci d’indiquer le nom de votre structure.')
          .max(120, 'Ce nom est trop long (120 caractères au plus).')
      : z.string(),
    activity: professional ? z.string().min(1, 'Merci de choisir votre activité principale.') : z.string(),
    firstName: required('Merci d’indiquer votre prénom.'),
    lastName: required('Merci d’indiquer votre nom.'),
    email: fieldRules.email,
    phone: fieldRules.phone,
    country: z.string().min(1, 'Merci de choisir votre pays de résidence.'),
    city: z.string().trim().max(80, 'Ce nom de ville est trop long.'),
    interests: z.array(z.string()),
    newsletter: z.boolean(),
    consent: fieldRules.consent,
  });
}

type FormInput = z.input<ReturnType<typeof schemaFor>>;
type FormOutput = z.output<ReturnType<typeof schemaFor>>;

const COPY: Record<Profile, { lead: string; interests: string; submit: string }> = {
  PARTICULIER: {
    lead: 'Enregistrez vos informations une fois : vos prochaines demandes seront plus rapides et mieux suivies.',
    interests: 'Les services qui vous intéressent',
    submit: 'Créer mon compte',
  },
  PROFESSIONNEL: {
    lead: 'Proposez vos services, recevez des demandes et rejoignez notre réseau de partenaires.',
    interests: 'Rubriques dans lesquelles vous intervenez',
    submit: 'Envoyer ma demande d’inscription',
  },
};

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
  const antiSpam = useAntiSpam();
  const [done, setDone] = useState<string | null>(null);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: (data, context, options) => zodResolver(schemaFor(data.profile))(data, context, options),
    mode: 'onTouched',
    defaultValues: {
      profile: initialProfile,
      organization: '',
      activity: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      interests: [],
      newsletter: false,
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const profile = useWatch({ control: form.control, name: 'profile' });
  const interests = useWatch({ control: form.control, name: 'interests' }) ?? [];
  const copy = COPY[profile];

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
          country: values.country,
          city: values.city || null,
          interests: values.interests,
          organization: professional ? values.organization : null,
          activity: professional ? values.activity : null,
          newsletter: values.newsletter,
          consent: true,
          antiSpam: antiSpam.build(),
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
      toast.error(errorMessage(caught));
    }
  }

  return (
    <>
      <p className="font-ui text-[15px] leading-[26px] text-text-muted md:text-[17px]">
        {frenchTypography(copy.lead)}
      </p>
      <SegmentedTabs
        label="Profil"
        value={profile}
        onChange={changeProfile}
        fullWidth
        size="lg"
        options={[
          { value: 'PARTICULIER', label: 'Je suis un particulier', shortLabel: 'Particulier' },
          {
            value: 'PROFESSIONNEL',
            label: 'Je suis un professionnel / partenaire',
            shortLabel: 'Professionnel',
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
              Faire une demande de devis
            </Link>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            aria-label="Inscription"
            className="flex flex-col gap-[18px]"
          >
            <input {...antiSpam.honeypotProps} />
            <div className="grid gap-4 md:grid-cols-2">
              {profile === 'PROFESSIONNEL' && (
                <>
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
                  <Field label="Activité principale" required error={errors.activity?.message}>
                    {(control) => (
                      <Select {...control} {...form.register('activity')}>
                        <option value="">Choisir</option>
                        {ACTIVITIES.map((activity) => (
                          <option key={activity} value={activity}>
                            {activity}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </>
              )}
              <Field label="Prénom" required error={errors.firstName?.message}>
                {(control) => (
                  <Input
                    autoComplete="given-name"
                    placeholder="Votre prénom"
                    {...control}
                    {...form.register('firstName')}
                  />
                )}
              </Field>
              <Field label="Nom" required error={errors.lastName?.message}>
                {(control) => (
                  <Input
                    autoComplete="family-name"
                    placeholder="Votre nom"
                    {...control}
                    {...form.register('lastName')}
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
                {(control) => (
                  <PhoneInput
                    icon={Smartphone}
                    placeholder="+33 6 00 00 00 00"
                    {...control}
                    {...form.register('phone')}
                  />
                )}
              </Field>
              <Field label="Pays de résidence" required error={errors.country?.message}>
                {(control) => (
                  <Select autoComplete="country" {...control} {...form.register('country')}>
                    <option value="">Choisir</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Ville" error={errors.city?.message}>
                {(control) => (
                  <Input
                    autoComplete="address-level2"
                    placeholder="Votre ville"
                    {...control}
                    {...form.register('city')}
                  />
                )}
              </Field>
            </div>
            <fieldset>
              <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold text-text-main">
                {copy.interests}
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
                label={CONSENT_TEXT}
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
            <Checkbox id="inscription-newsletter" label={NEWSLETTER_TEXT} {...form.register('newsletter')} />
            <Button type="submit" fullWidth loading={isSubmitting}>
              {copy.submit}
            </Button>
          </form>
        )}
      </div>
      <p className="flex flex-wrap items-center justify-center gap-1.5 font-ui text-[14px] leading-5 text-text-muted">
        {frenchTypography('Une question ?')}
        <Link
          href={routes.contact}
          className="group/help inline-flex items-center gap-1.5 rounded-xs font-semibold tracking-[0.005em] text-text-brand"
        >
          Contactez-nous
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
