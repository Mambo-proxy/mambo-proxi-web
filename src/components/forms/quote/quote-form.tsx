'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Lock, Mail, Smartphone, User } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { CategorySummary, QuoteField, QuoteRequestInput, ServiceSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { COUNTRIES } from '@/lib/countries';
import { frenchTypography } from '@/lib/format/typography';
import { CONSENT_TEXT } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';
import { whatsappUrl } from '@/lib/whatsapp';
import { NeedField } from './need-field';
import {
  CONTACT_PREFERENCES,
  quoteSchema,
  STEP_FIELDS,
  toNeeds,
  type QuoteFormInput,
  type QuoteFormOutput,
} from './quote-schema';
import { QuoteProgress, StepCard, type StepState } from './quote-steps';
import { QuoteSummary } from './quote-summary';

export type QuoteCategory = CategorySummary & { services: ServiceSummary[] };

type QuoteFormProps = {
  categories: QuoteCategory[];
  /** Champs dynamiques de l'étape 2, par rubrique (`quoteFields`). */
  fieldsByCategory: Record<string, QuoteField[]>;
  /** Pré-sélection depuis `?rubrique=` ou `?service=`. */
  initialCategory: string | null;
  initialService: string | null;
  whatsapp: { number: string; message: string } | null;
};

/** Brouillon conservé le temps de la session (le consentement n'est jamais mémorisé). */
const DRAFT_KEY = 'mp_devis_brouillon';

type Step = 1 | 2 | 3;

/** Champs du formulaire pouvant recevoir une erreur renvoyée par l'API. */
const FIELD_NAMES = new Set<string>(Object.values(STEP_FIELDS).flat());

/**
 * Formulaire de devis en 3 étapes (`70:8077`, cahier §7.1) : rubrique et service, besoin (champs propres à la
 * rubrique + description), coordonnées. Validation à chaque étape, brouillon en `sessionStorage`,
 * envoi `POST /v1/quote-requests` puis redirection vers la confirmation.
 */
export function QuoteForm({
  categories,
  fieldsByCategory,
  initialCategory,
  initialService,
  whatsapp,
}: QuoteFormProps) {
  const router = useRouter();
  const antiSpam = useAntiSpam();
  const [step, setStep] = useState<Step>(initialService ? 2 : 1);
  const heading1 = useRef<HTMLHeadingElement>(null);
  const heading2 = useRef<HTMLHeadingElement>(null);
  const heading3 = useRef<HTMLHeadingElement>(null);

  const form = useForm<QuoteFormInput, unknown, QuoteFormOutput>({
    // Le schéma dépend des champs propres à la rubrique choisie.
    resolver: (data, context, options) =>
      zodResolver(quoteSchema(fieldsByCategory[data.categorySlug] ?? []))(data, context, options),
    mode: 'onTouched',
    defaultValues: {
      categorySlug: initialCategory ?? '',
      serviceSlug: initialService ?? '',
      needs: {},
      description: '',
      fullName: '',
      email: '',
      phone: '',
      country: '',
      contactPreference: 'WHATSAPP',
      consent: false as unknown as true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const values = useWatch({ control: form.control });

  const categorySlug = values.categorySlug ?? '';
  const fields = fieldsByCategory[categorySlug] ?? [];
  const category = categories.find((item) => item.slug === categorySlug) ?? null;
  const service =
    categories.flatMap((item) => item.services).find((item) => item.slug === values.serviceSlug) ?? null;

  // Reprise du brouillon de la session ; la pré-sélection de l'adresse reste prioritaire.
  useEffect(() => {
    let draft: Partial<QuoteFormInput> | null = null;
    try {
      draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null');
    } catch {
      draft = null;
    }
    if (!draft) return;
    const preset = initialCategory || initialService;
    const restored = {
      ...form.getValues(),
      ...draft,
      ...(preset
        ? { categorySlug: initialCategory ?? '', serviceSlug: initialService ?? '', needs: {} }
        : {}),
      consent: false as unknown as true,
    };
    form.reset(restored);
    // Service déjà choisi dans le brouillon : on reprend à l'étape 2, une fois les valeurs rétablies.
    if (restored.serviceSlug && !preset) requestAnimationFrame(() => setStep(2));
    // Une seule fois, au chargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarde du brouillon à chaque modification.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, consent: undefined }));
    } catch {
      // Stockage indisponible (navigation privée…) : le brouillon n'est simplement pas conservé.
    }
  }, [values]);

  function goTo(next: Step) {
    setStep(next);
    requestAnimationFrame(() => {
      const heading = { 1: heading1, 2: heading2, 3: heading3 }[next].current;
      heading?.focus({ preventScroll: true });
      heading?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function chooseCategory(slug: string) {
    if (slug === categorySlug) return;
    form.setValue('categorySlug', slug, { shouldValidate: true });
    form.setValue('serviceSlug', '');
    form.setValue('needs', {});
    setStep(1);
  }

  function chooseService(slug: string) {
    form.setValue('serviceSlug', slug, { shouldValidate: true });
    if (step === 1) setStep(2);
  }

  function clearService() {
    form.setValue('serviceSlug', '');
    goTo(1);
  }

  async function continueToContact() {
    const valid = await form.trigger([...STEP_FIELDS[1], ...STEP_FIELDS[2]], { shouldFocus: true });
    if (valid) goTo(3);
  }

  async function onSubmit(data: QuoteFormOutput) {
    try {
      const {
        data: accepted,
        error,
        response,
      } = await browserApi.POST('/v1/quote-requests', {
        body: {
          categorySlug: data.categorySlug,
          serviceSlug: data.serviceSlug,
          needs: toNeeds(fields, data.needs),
          description: data.description,
          contact: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
          } as QuoteRequestInput['contact'],
          contactPreference: data.contactPreference,
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !accepted) throw toApiError(error, response);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Rien à nettoyer.
      }
      router.push(`/devis/confirmation?ref=${encodeURIComponent(accepted.reference)}` as Route);
    } catch (caught) {
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          const name = path.replace(/^contact\./, '') as keyof QuoteFormInput;
          if (FIELD_NAMES.has(name)) form.setError(name, { message });
        }
      }
      toast.error(errorMessage(caught));
    }
  }

  function onInvalid(invalid: typeof errors) {
    const first = ([1, 2, 3] as const).find((index) => STEP_FIELDS[index].some((name) => name in invalid));
    if (first && first !== step) setStep(first);
  }

  const states: [StepState, StepState, StepState] = [
    step > 1 ? 'done' : 'active',
    step > 2 ? 'done' : step === 2 ? 'active' : 'upcoming',
    step === 3 ? 'active' : 'upcoming',
  ];
  const whatsappHref = whatsapp
    ? whatsappUrl(whatsapp.number, whatsapp.message, service ? `Service : ${service.name}` : undefined)
    : null;
  const needsErrors = (errors.needs ?? {}) as Record<string, { message?: string } | undefined>;

  return (
    <>
      <div className="container-site pb-8 xl:pb-12">
        <QuoteProgress states={states} />
      </div>
      <div className="container-site grid items-start gap-4 pt-6 pb-14 md:pt-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8 xl:pt-12 xl:pb-24">
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="flex min-w-0 flex-col gap-4"
          aria-label="Demande de devis gratuit"
        >
          <input {...antiSpam.honeypotProps} />

          <StepCard
            number={1}
            state={states[0]}
            title="Quel service vous intéresse ?"
            subtitle="Choisissez une rubrique puis un service."
            headingRef={heading1}
          >
            <fieldset>
              <legend className="sr-only">Rubrique</legend>
              <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-wrap">
                {categories.map((item) => {
                  const selected = item.slug === categorySlug;
                  return (
                    <label
                      key={item.slug}
                      className={cn(
                        'flex min-h-[150px] cursor-pointer flex-col gap-2.5 rounded-[18px] border p-4 transition-colors duration-150 has-[:focus-visible]:focus-ring md:min-h-[136px] md:w-[178px]',
                        selected
                          ? 'border-brand-primary bg-orange-50 shadow-[inset_0_0_0_1px_var(--mp-color-brand-primary)]'
                          : 'border-border-default bg-neutral-0 hover:border-border-strong',
                      )}
                    >
                      <input
                        type="radio"
                        name="categorySlug"
                        value={item.slug}
                        checked={selected}
                        onChange={() => chooseCategory(item.slug)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={cn(
                          'flex size-9 items-center justify-center rounded-[11px]',
                          selected ? 'bg-neutral-0 text-text-brand' : 'bg-neutral-50 text-text-main',
                        )}
                      >
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="flex flex-col gap-2.5">
                        <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                          {item.name}
                        </span>
                        <span className="text-caption text-text-muted">{item.serviceCount} services</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.categorySlug && (
                <p className="mt-2 text-[13px] leading-4 text-feedback-error">
                  {errors.categorySlug.message}
                </p>
              )}
            </fieldset>
            {category && (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
                  Service
                </legend>
                <div className="flex flex-wrap gap-2">
                  {category.services.map((item) => {
                    const selected = item.slug === values.serviceSlug;
                    return (
                      <label
                        key={item.slug}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                          selected
                            ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                            : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
                        )}
                      >
                        <input
                          type="radio"
                          name="serviceSlug"
                          value={item.slug}
                          checked={selected}
                          onChange={() => chooseService(item.slug)}
                          className="sr-only"
                        />
                        {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
                        {item.shortName ?? item.name}
                      </label>
                    );
                  })}
                </div>
                {errors.serviceSlug && (
                  <p className="text-[13px] leading-4 text-feedback-error">{errors.serviceSlug.message}</p>
                )}
              </fieldset>
            )}
          </StepCard>

          <StepCard number={2} state={states[1]} title="Parlez-nous de votre besoin" headingRef={heading2}>
            <div className="grid gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-5">
              {fields.map((field) => (
                <NeedField
                  key={`${categorySlug}-${field.name}`}
                  field={field}
                  registration={form.register(`needs.${field.name}`)}
                  error={needsErrors[field.name]?.message}
                  value={values.needs?.[field.name]}
                />
              ))}
              <Field
                label="Décrivez votre besoin"
                required
                help="Plus votre description est précise, plus le devis sera juste."
                error={errors.description?.message}
                className="md:col-span-2"
              >
                {(control) => <Textarea rows={4} {...control} {...form.register('description')} />}
              </Field>
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-muted hover:text-text-main"
              >
                Retour
                <ArrowLeft aria-hidden size={16} />
              </button>
              <Button type="button" onClick={continueToContact}>
                Continuer
              </Button>
            </div>
          </StepCard>

          <StepCard
            number={3}
            state={states[2]}
            title="Vos coordonnées"
            subtitle="Nom, e-mail, téléphone et pays."
            headingRef={heading3}
          >
            <div className="grid gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-5">
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
            </div>
            <fieldset className="flex flex-col">
              <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
                {frenchTypography('Comment préférez-vous être recontacté ?')}
              </legend>
              <div className="flex flex-wrap gap-2">
                {CONTACT_PREFERENCES.map((preference) => {
                  const selected = values.contactPreference === preference.value;
                  return (
                    <label
                      key={preference.value}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium tracking-[0.005em] transition-colors duration-150 has-[:focus-visible]:focus-ring',
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                          : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
                      )}
                    >
                      <input
                        type="radio"
                        value={preference.value}
                        className="sr-only"
                        {...form.register('contactPreference')}
                      />
                      {selected && <Check aria-hidden size={14} strokeWidth={2.5} />}
                      {preference.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <Checkbox
                id="devis-consent"
                label={CONSENT_TEXT}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? 'devis-consent-error' : undefined}
                {...form.register('consent')}
              />
              {errors.consent && (
                <p id="devis-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                  {errors.consent.message}
                </p>
              )}
            </div>
            <p className="flex items-center gap-2 text-caption text-text-muted">
              <Lock aria-hidden size={16} />
              Formulaire protégé contre les envois automatiques
            </p>
            <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
              Envoyer ma demande de devis
            </Button>
          </StepCard>
        </form>

        <aside
          aria-label="Récapitulatif"
          className="flex flex-col gap-4 xl:sticky xl:top-[calc(var(--site-header-h,85px)+24px)]"
        >
          <QuoteSummary service={service} onClear={clearService} whatsappHref={whatsappHref} />
        </aside>
      </div>
    </>
  );
}
