'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Mail, Smartphone, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/mini';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, PhoneInput, Select, Textarea } from '@/components/ui/field';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { toast } from '@/components/ui/toaster';
import { useStaggerIn } from '@/components/ui/use-stagger-in';
import { browserApi } from '@/lib/api/browser';
import { ApiError, formErrorMessage, toApiError } from '@/lib/api/errors';
import { trimmed, useFormCommon, type FieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

export type ContactTab = 'CONTACT' | 'INFORMATION';

/**
 * Sujets proposés : valeur enregistrée en français (lue par l'équipe dans le back-office), libellé dans la langue de
 * la page (`forms.contact.subjects`).
 */
const SUBJECTS = [
  ['quote', 'Une demande de devis'],
  ['service', 'Une question sur un service'],
  ['realEstate', 'Immobilier'],
  ['partnership', 'Partenariat'],
  ['careers', 'Recrutement'],
  ['press', 'Presse et médias'],
  ['other', 'Autre'],
] as const;

/**
 * Villes proposées (champ « Ville » de la maquette), Douala par défaut ; « Hors du Cameroun » n'envoie ni ville ni
 * pays. Valeurs en français (fiche contact), libellés traduits (`forms.contact.cities`).
 */
const CITIES = [
  ['douala', 'Douala'],
  ['yaounde', 'Yaoundé'],
  ['other', 'Autre ville du Cameroun'],
] as const;
const ABROAD = 'Hors du Cameroun';

type ContactMessages = ReturnType<typeof useTranslations<'forms.contact'>>;

function makeSchema(rules: FieldRules, t: ContactMessages) {
  return z.object({
    fullName: rules.fullName,
    email: rules.email,
    phone: rules.optionalPhone,
    city: z.string(),
    subject: z.string(),
    serviceSlug: z.string(),
    message: trimmed(z.minLength(10, t('messageTooShort')), z.maxLength(3000, t('messageTooLong'))),
    consent: rules.consent,
  });
}

type FormInput = z.input<ReturnType<typeof makeSchema>>;
type FormOutput = z.output<ReturnType<typeof makeSchema>>;

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
  city: 'Douala',
  subject: '',
  serviceSlug: '',
  message: '',
  consent: false as unknown as true,
};

/**
 * `ContactForm` ouvert sur l'onglet de l'adresse (`?onglet=information`). La page étant prérendue, l'adresse
 * n'est lue que dans le navigateur : à placer sous `<Suspense>`, avec en repli `ContactForm` sur
 * « Nous contacter » (même rendu que sans paramètre).
 */
export function ContactFormFromUrl(props: Omit<ContactFormProps, 'initialTab'>) {
  const onglet = useSearchParams().get('onglet');
  return <ContactForm {...props} initialTab={onglet === 'information' ? 'INFORMATION' : 'CONTACT'} />;
}

/**
 * Carte « Écrivez-nous » (Contact `69:7807`) : onglets « Nous contacter » / « Demande d’information »
 * (le second ajoute le service concerné), envoi `POST /v1/contact-messages` et confirmation en place.
 */
export function ContactForm({ initialTab, serviceGroups }: ContactFormProps) {
  const t = useTranslations('forms.contact');
  const common = useFormCommon();
  const schema = useMemo(() => makeSchema(common.rules, t), [common.rules, t]);
  const [tab, setTab] = useState<ContactTab>(initialTab);
  // Changement d'onglet : les champs du formulaire réapparaissent en cascade.
  const formRef = useStaggerIn<HTMLFormElement>(tab);
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
            country: values.city && values.city !== ABROAD ? 'CM' : null,
            city: values.city && values.city !== ABROAD ? values.city : null,
          },
          subject: values.subject || null,
          serviceSlug: tab === 'INFORMATION' ? values.serviceSlug || null : null,
          message: values.message,
          consent: true,
          antiSpam: await antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setSent(data);
      form.reset(EMPTY);
    } catch (caught) {
      const fieldOf = (path: string) => path.replace(/^contact\./, '') as keyof FormInput;
      if (caught instanceof ApiError) {
        for (const [path, message] of Object.entries(caught.fieldErrors)) {
          if (fieldOf(path) in schema.shape) form.setError(fieldOf(path), { message });
        }
      }
      // Erreur sur un champ sans message à l'écran : son message plutôt que « Vérifiez les champs signalés ».
      toast.error(
        formErrorMessage(caught, (path) => fieldOf(path) in schema.shape, common.t('unexpectedError')),
      );
    }
  }

  const title = tab === 'CONTACT' ? t('titleContact') : t('titleInformation');

  return (
    <div className="flex flex-col gap-5 rounded-[28px] border border-border-default bg-neutral-0 p-5 md:p-10">
      <SegmentedTabs
        label={t('tabsLabel')}
        value={tab}
        onChange={changeTab}
        options={[
          { value: 'CONTACT', label: t('tabContact') },
          { value: 'INFORMATION', label: t('tabInformation'), shortLabel: t('tabInformationShort') },
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
            {common.t('reference')} <span className="font-semibold text-text-main">{sent.reference}</span>
          </p>
          <Button variant="outline" onClick={() => setSent(null)}>
            {t('writeAnother')}
          </Button>
        </div>
      ) : (
        <form
          ref={formRef}
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label={title}
          className="flex flex-col gap-5"
        >
          <input {...antiSpam.honeypotProps} />
          <div {...antiSpam.widgetProps} />
          <div className="grid gap-4 md:grid-cols-2 md:gap-y-5 max-md:[&>*:nth-child(3)]:mt-1 max-md:[&>*:nth-child(n+5)]:mt-1">
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
            <Field label={t('phone')} error={errors.phone?.message}>
              {(control) => <PhoneInput icon={Smartphone} {...control} {...form.register('phone')} />}
            </Field>
            <Field label={t('city')} error={errors.city?.message}>
              {(control) => (
                <Select {...control} {...form.register('city')}>
                  {CITIES.map(([key, value]) => (
                    <option key={key} value={value}>
                      {t(`cities.${key}`)}
                    </option>
                  ))}
                  <option value={ABROAD}>{t('cities.abroad')}</option>
                </Select>
              )}
            </Field>
            {tab === 'INFORMATION' && (
              <Field label={t('service')} className="md:col-span-2" error={errors.serviceSlug?.message}>
                {(control) => (
                  <Select {...control} {...form.register('serviceSlug')}>
                    <option value="">{t('servicePlaceholder')}</option>
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
            <Field label={t('subject')} className="md:col-span-2" error={errors.subject?.message}>
              {(control) => (
                <Select {...control} {...form.register('subject')}>
                  <option value="">{t('subjectPlaceholder')}</option>
                  {SUBJECTS.map(([key, value]) => (
                    <option key={key} value={value}>
                      {t(`subjects.${key}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t('message')} required error={errors.message?.message} className="md:col-span-2">
              {(control) => (
                <Textarea
                  placeholder={t('messagePlaceholder')}
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
              label={common.t('consentText')}
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
            {t('submit')}
          </Button>
        </form>
      )}
    </div>
  );
}
