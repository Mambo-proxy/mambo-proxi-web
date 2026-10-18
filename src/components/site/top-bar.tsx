import { Mail, Smartphone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/brand/social-icons';
import type { SiteSettings } from '@/lib/api/schema';
import { LanguageSwitch } from './language-switch';

/**
 * Barre supérieure desktop (Figma `45:25`) : 36 px, fond `neutral/900`, px 80 ;
 * WhatsApp, téléphone et e-mail en Inter Medium 13/16 `neutral/200` (icônes 14 orange), gap 28 ;
 * à droite (gap 20) : langue FR | EN, horaires `neutral/400`, réseaux 16 px (gap 14).
 */
export async function TopBar({
  settings,
  whatsappHref,
}: {
  settings: SiteSettings;
  whatsappHref: string | null;
}) {
  const t = await getTranslations('site');
  const { contact, social, whatsapp } = settings;
  const item =
    'inline-flex items-center gap-2 rounded-xs hover:text-neutral-0 focus-visible:focus-ring-inverse';
  const contacts = [
    whatsappHref && {
      key: 'whatsapp',
      href: whatsappHref,
      external: true,
      icon: Smartphone,
      text: `${t('topBar.whatsapp')}  ${whatsapp.numberDisplay ?? contact.phoneCameroonDisplay}`,
    },
    {
      key: 'phone',
      href: `tel:${contact.phoneCameroon}`,
      external: false,
      icon: Smartphone,
      text: `${t('topBar.phone')}  ${contact.phoneCameroonDisplay}`,
    },
    { key: 'email', href: `mailto:${contact.email}`, external: false, icon: Mail, text: contact.email },
  ].filter((entry) => !!entry);

  return (
    <div className="hidden h-9 items-center justify-between bg-neutral-900 px-20 font-ui text-[13px] leading-4 tracking-[0.01em] xl:flex">
      <ul className="flex items-center gap-7 font-medium text-neutral-200">
        {contacts.map(({ key, href, external, icon: ContactIcon, text }) => (
          <li key={key}>
            <a
              href={href}
              className={item}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('newTab', { label: text }) }
                : {})}
            >
              <ContactIcon aria-hidden size={14} className="text-brand-primary" />
              <span className="whitespace-pre">{text}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-5">
        <LanguageSwitch variant="bar" />
        <p className="text-neutral-400">{contact.hoursLabel}</p>
        <ul className="flex items-center gap-3.5 text-neutral-200">
          {social.map(({ network, url }) => {
            const SocialIcon = SOCIAL_ICONS[network as keyof typeof SOCIAL_ICONS];
            if (!SocialIcon) return null;
            return (
              <li key={network}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('newTab', { label: SOCIAL_LABELS[network as keyof typeof SOCIAL_LABELS] })}
                  className="flex rounded-xs hover:text-neutral-0 focus-visible:focus-ring-inverse"
                >
                  <SocialIcon size={16} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
