'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Mail, Smartphone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import { COUNTRIES } from '@/lib/countries';
import { CONSENT_TEXT, fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

export type ContactTab = 'CONTACT' | 'INFORMATION';

/** Sujets proposés (liste du formulaire, à rendre administrable si besoin). */
const SUBJECTS = [
  'Une demande de devis',
  'Une question sur un service',
  'Immobilier',
  'Partenariat',
  'Recrutement',
  'Presse et médias',
  'Autre',
];

const schema = z.object({
  fullName: fieldRules.fullName,
  email: fieldRules.email,
  phone: fieldRules.optionalPhone,
  country: z.string(),
  subject: z.string(),
  serviceSlug: z.string(),
  message: z
    .string()
    .trim()
    .min(10, 'Merci d’écrire votre message (10 caractères au moins).')
    .max(3000, 'Ce message est trop long (3 000 caractères au plus).'),
  consent: fieldRules.consent,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

type ServiceGroup = { name: string; services: { slug: string; name: string }[] };

type ContactFormProps = {
  initialTab: ContactTab;
  /** Services proposés dans « Demande d’information », par rubrique. */
  serviceGroups: ServiceGroup[];
};

const EMPTY: FormInput = {
  fullName: '',
  email: '',
  phone: '',
  country: 'CM',
  subject: '',
  serviceSlug: '',
  message: '',
  consent: false as unknown as true,
};

/**
 * Carte « Écrivez-nous » (Contact `69:7807`) : onglets « Nous contacter » / « Demande d’information »
 * (le second ajoute le service concerné), envoi `POST /v1/contact-messages` et confirmation en place.
 */
export function ContactForm({ initialTab, serviceGroups }: ContactFormProps) {
  const [tab, setTab] = useState<ContactTab>(initialTab);
  const [sent, setSent] = useState<{ message: string; reference: string } | null>(null);
  const antiSpam = useAntiSpam();
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: EMPTY,
  });
  const { errors, isSubmitting } = form.formState;

  function changeTab(next: ContactTab) {
    setTab(next);
    setSent(null);
    const url = new URL(window.location.href);
    if (next === 'INFORMATION') url.searchParams.set('onglet', 'information');
    else url.searchParams.delete('onglet');
    window.history.replaceState(null, '', url);
  }

  async function onSubmit(values: FormOutput) {
    try {
      const { data, error, response } = await browserApi.POST('/v1/contact-messages', {
        body: {
          type: tab,
          contact: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            country: values.country || null,
          },
          subject: values.subject || null,
          serviceSlug: tab === 'INFORMATION' ? values.serviceSlug || null : null,
          message: values.message,
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setSent(data);
      form.reset(EMPTY);
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

  const title = tab === 'CONTACT' ? 'Écrivez-nous' : 'Demande d’information';

  return (
    <div className="flex flex-col gap-5 rounded-[28px] border border-border-default bg-neutral-0 p-5 md:p-10">
      <SegmentedTabs
        label="Type de message"
        value={tab}
        onChange={changeTab}
        options={[
          { value: 'CONTACT', label: 'Nous contacter' },
          { value: 'INFORMATION', label: 'Demande d’information', shortLabel: 'Information' },
        ]}
        className="md:w-auto md:self-start"
        fullWidth
      />
      <h2 className="font-brand text-[24px] leading-8 font-semibold tracking-[-0.02em] text-text-main md:text-[26px]">
        {title}
      </h2>
      {sent ? (
        <div role="status" className="flex flex-col items-start gap-4">
          <p className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
            <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
            {sent.message}
          </p>
          <p className="font-ui text-[14px] leading-5 text-text-muted">
            Référence : <span className="font-semibold text-text-main">{sent.reference}</span>
          </p>
          <Button variant="outline" onClick={() => setSent(null)}>
            Écrire un autre message
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label={title}
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5">
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
            <Field label="Téléphone / WhatsApp" error={errors.phone?.message}>
              {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
            </Field>
            <Field label="Pays" error={errors.country?.message}>
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
            {tab === 'INFORMATION' && (
              <Field label="Service concerné" className="md:col-span-2">
                {(control) => (
                  <Select {...control} {...form.register('serviceSlug')}>
                    <option value="">Choisir un service</option>
                    {serviceGroups.map((group) => (
                      <optgroup key={group.name} label={group.name}>
                        {group.services.map((service) => (
                          <option key={service.slug} value={service.slug}>
                            {service.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            <Field label="Sujet" className="md:col-span-2">
              {(control) => (
                <Select {...control} {...form.register('subject')}>
                  <option value="">Choisir un sujet</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Message" required error={errors.message?.message} className="md:col-span-2">
              {(control) => (
                <Textarea
                  placeholder="Votre message…"
                  className="min-h-[130px]"
                  {...control}
                  {...form.register('message')}
                />
              )}
            </Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              id="contact-consent"
              label={CONSENT_TEXT}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
              {...form.register('consent')}
            />
            {errors.consent && (
              <p id="contact-consent-error" className="pl-8 text-[13px] leading-4 text-feedback-error">
                {errors.consent.message}
              </p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting} className="max-md:w-full md:self-start">
            Envoyer le message
          </Button>
        </form>
      )}
    </div>
  );
}
