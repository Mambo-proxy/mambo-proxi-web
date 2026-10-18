import { Mail, Smartphone, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { AppointmentForm } from '@/components/forms/appointment-form';
import { ContactForm, type ContactTab } from '@/components/forms/contact-form';
import { Agency } from '@/components/sections/contact/agency';
import { AccentText } from '@/components/ui/accent-text';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { seoMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = seoMetadata({
  title: 'Contact',
  description:
    'Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous à l’agence de Douala : choisissez ce qui vous convient, nous vous répondons rapidement.',
  path: '/contact',
});

type SearchParams = { searchParams: Promise<{ onglet?: string }> };

type ContactMethod = {
  icon: LucideIcon | ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  whatsapp?: boolean;
};

/** Contact (desktop `69:7651`, mobile `69:8178`) : moyens de contact, formulaires, rendez-vous, agence. Pas de bandeau CTA. */
export default async function ContactPage({ searchParams }: SearchParams) {
  const { onglet } = await searchParams;
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    unwrap(
      api.GET('/v1/categories', {
        params: { query: { include: 'services' } },
        ...cached([cacheTags.categories, cacheTags.services]),
      }),
    ),
  ]);
  const { contact } = settings;
  const methods: ContactMethod[] = [
    {
      icon: Smartphone,
      label: 'France',
      value: contact.phoneFranceDisplay ?? contact.phoneFrance,
      href: `tel:${contact.phoneFrance}`,
    },
    {
      icon: Smartphone,
      label: 'Cameroun',
      value: contact.phoneCameroonDisplay ?? contact.phoneCameroon,
      href: `tel:${contact.phoneCameroon}`,
    },
    ...(settings.whatsapp.enabled
      ? [
          {
            icon: WhatsappIcon,
            label: 'WhatsApp',
            value: 'Réponse rapide, 7j/7',
            href: whatsappUrl(settings.whatsapp.number, settings.whatsapp.message),
            external: true,
            whatsapp: true,
          },
        ]
      : []),
    { icon: Mail, label: 'E-mail', value: contact.email, href: `mailto:${contact.email}` },
  ];
  const serviceGroups = categories.map((category) => ({
    name: category.name,
    services: (category.services ?? []).map((service) => ({ slug: service.slug, name: service.name })),
  }));
  const initialTab: ContactTab = onglet === 'information' ? 'INFORMATION' : 'CONTACT';

  return (
    <>
      <section className="bg-neutral-50">
        <div className="container-site flex flex-col gap-5 pt-5 pb-14 xl:gap-10 xl:pt-12 xl:pb-[72px]">
          <Breadcrumb items={[{ label: 'Accueil', href: routes.home }, { label: 'Contact' }]} />
          <div className="flex flex-col gap-4 xl:max-w-[820px]">
            <p className="text-web-eyebrow">Contact</p>
            <h1 className="font-brand text-[34px] leading-10 font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[56px] xl:leading-[62px]">
              <AccentText text="Parlons de ==votre projet.==" />
            </h1>
            <p className="text-web-lead text-text-muted">
              {frenchTypography(
                'Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous : choisissez ce qui vous convient, nous vous répondons rapidement.',
              )}
            </p>
          </div>
          <ul className="grid gap-2.5 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
            {methods.map(({ icon: MethodIcon, label, value, href, external, whatsapp }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex h-full items-center gap-4 rounded-[22px] border border-border-default bg-neutral-0 p-4 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-2 md:flex-col md:items-start md:gap-3.5 md:p-6"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-[13px]',
                      whatsapp ? 'bg-whatsapp/10 text-whatsapp-hover' : 'bg-orange-50 text-text-brand',
                    )}
                  >
                    <MethodIcon size={20} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-ui text-[14px] leading-5 font-medium tracking-[0.005em] text-text-muted">
                      {label}
                    </span>
                    <span className="font-ui text-[16px] leading-6 font-semibold break-words text-text-main">
                      {value}
                      {external && <span className="sr-only"> (nouvel onglet)</span>}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-neutral-0 py-14 xl:py-24">
        <div className="container-site grid items-start gap-10 xl:grid-cols-2 xl:gap-8">
          <ContactForm initialTab={initialTab} serviceGroups={serviceGroups} />
          <AppointmentForm />
        </div>
      </section>

      <Agency settings={settings} />
    </>
  );
}
