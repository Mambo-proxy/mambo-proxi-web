import { CalendarCheck, Mail, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { Logo } from '@/components/brand/logo';
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/brand/social-icons';
import type { Navigation, SiteSettings } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { NewsletterForm } from './newsletter-form';

type SiteFooterProps = {
  navigation: Navigation;
  settings: SiteSettings;
  whatsappHref: string | null;
};

const linkClass =
  'inline-block rounded-xs font-ui text-[14px] leading-5 text-neutral-300 transition-colors hover:text-neutral-0 focus-visible:focus-ring-inverse';

/**
 * Pied de page (Figma desktop `46:87`, mobile `46:189`) : ruban `gradient/lien` 4 px, fond `neutral/900` ;
 * carte newsletter `neutral/800` (en mobile, champs collés au texte) ; marque + 4 colonnes ; barre basse
 * (copyright, liens légaux). Contenu à 100 px du haut en desktop, 68 px en mobile.
 */
export function SiteFooter({ navigation, settings, whatsappHref }: SiteFooterProps) {
  const t = useTranslations('site');
  const { footer, legal } = navigation;
  const { contact, whatsapp } = settings;
  const socials = [
    ...settings.social.map(({ network, url }) => ({ network, url })),
    ...(whatsappHref ? [{ network: 'whatsapp', url: whatsappHref }] : []),
  ].filter(({ network }) => network in SOCIAL_ICONS) as { network: keyof typeof SOCIAL_ICONS; url: string }[];
  const contacts = [
    ...(whatsappHref
      ? [
          {
            icon: Smartphone,
            label: `${t('footer.whatsapp')} · ${whatsapp.numberDisplay ?? contact.phoneCameroonDisplay}`,
            href: whatsappHref,
            external: true,
          },
        ]
      : []),
    {
      icon: Smartphone,
      label: `${t('footer.cameroon')} · ${contact.phoneCameroonDisplay}`,
      href: `tel:${contact.phoneCameroon}`,
    },
    { icon: Mail, label: contact.email, href: `mailto:${contact.email}` },
    { icon: CalendarCheck, label: t('footer.appointment'), href: '/contact#rendez-vous', internal: true },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-0">
      <div aria-hidden className="h-1 bg-gradient-lien" />
      <div className="container-site flex flex-col gap-10 pt-16 pb-7 xl:gap-14 xl:pt-24 xl:pb-9">
        <section
          id="lettre-mambo"
          aria-labelledby="newsletter-title"
          className="flex scroll-mt-(--site-header-h,0px) flex-col rounded-[20px] bg-neutral-800 p-6 xl:flex-row xl:items-center xl:justify-between xl:gap-1 xl:rounded-[28px] xl:p-10"
        >
          <div className="flex min-w-0 flex-col gap-2 xl:max-w-[376px] xl:flex-[1_1_376px]">
            <p className="font-ui text-[12px] leading-4 font-semibold tracking-[0.08em] text-orange-400 uppercase xl:text-[13px]">
              {footer.newsletter.eyebrow}
            </p>
            <h2
              id="newsletter-title"
              className="font-brand text-[22px] leading-7 font-semibold xl:text-[28px] xl:leading-9"
            >
              {frenchTypography(footer.newsletter.title)}
            </h2>
            <p className="font-ui text-[14px] leading-5 text-neutral-300">
              {frenchTypography(footer.newsletter.text)}
            </p>
          </div>
          <NewsletterForm />
        </section>

        <div className="flex flex-col gap-8 xl:flex-row xl:gap-10">
          <div className="flex flex-col gap-5 xl:w-[300px] xl:shrink-0">
            <Logo variant="stacked" inverse className="h-[152px]" />
            <p className="font-ui text-[14px] leading-[22px] text-neutral-300">
              {frenchTypography(footer.about)}
            </p>
            <ul className="flex gap-2.5">
              {socials.map(({ network, url }) => {
                const SocialIcon = SOCIAL_ICONS[network];
                return (
                  <li key={network}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('newTab', { label: SOCIAL_LABELS[network] })}
                      className="flex size-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-0 transition-colors hover:bg-neutral-800 focus-visible:focus-ring-inverse"
                    >
                      <SocialIcon size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-7 xl:flex-1 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto] xl:gap-8 wide:grid-cols-4 wide:gap-7">
            {footer.columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3.5">
                <h2 className="font-ui text-[15px] leading-6 font-semibold">
                  {frenchTypography(column.title)}
                </h2>
                <ul className="flex flex-col gap-3.5 text-[14px] leading-5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {frenchTypography(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div className="col-span-2 flex flex-col gap-3.5 xl:col-auto">
              <h2 className="font-ui text-[15px] leading-6 font-semibold">{t('footer.contactTitle')}</h2>
              <ul className="flex flex-col gap-3.5 text-[14px] leading-5">
                {contacts.map(({ icon: ContactIcon, label, href, external, internal }) => {
                  const content = (
                    <>
                      <ContactIcon aria-hidden size={16} className="shrink-0 text-orange-400" />
                      {label}
                    </>
                  );
                  const className = `${linkClass} inline-flex items-center gap-2 whitespace-nowrap`;
                  return (
                    <li key={href} className="flex">
                      {internal ? (
                        <Link href={href} className={className}>
                          {content}
                        </Link>
                      ) : (
                        <a
                          href={href}
                          className={className}
                          {...(external
                            ? {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                                'aria-label': t('newTab', { label }),
                              }
                            : {})}
                        >
                          {content}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-neutral-800 pt-6 font-ui text-[13px] leading-4 tracking-[0.01em] text-neutral-400 xl:flex-row xl:items-center xl:justify-between">
          <p>{footer.copyright}</p>
          <ul className="flex flex-wrap gap-x-3.5 gap-y-2 xl:gap-6">
            {legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-xs hover:text-neutral-0 focus-visible:focus-ring-inverse"
                >
                  {frenchTypography(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
