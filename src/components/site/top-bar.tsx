import { Mail, Smartphone } from 'lucide-react';
import { SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/brand/social-icons';
import type { SiteSettings } from '@/lib/api/schema';

/**
 * Barre supérieure desktop (Figma `45:25`) : 36 px, fond `neutral/900`, px 80 ;
 * coordonnées Inter Medium 13/16 `neutral/200` (icônes 14 orange), horaires `neutral/400`, réseaux 16 px.
 */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const { contact, social } = settings;
  const item =
    'inline-flex items-center gap-1.5 rounded-xs hover:text-neutral-0 focus-visible:focus-ring-inverse';
  return (
    <div className="hidden h-9 items-center justify-between bg-neutral-900 px-20 font-ui text-[13px] leading-4 tracking-[0.01em] xl:flex">
      <ul className="flex items-center gap-7 font-medium text-neutral-200">
        <li>
          <a href={`tel:${contact.phoneFrance}`} className={item}>
            <Smartphone aria-hidden size={14} className="text-brand-primary" />
            <span className="whitespace-pre">{`France  ${contact.phoneFranceDisplay}`}</span>
          </a>
        </li>
        <li>
          <a href={`tel:${contact.phoneCameroon}`} className={item}>
            <Smartphone aria-hidden size={14} className="text-brand-primary" />
            <span className="whitespace-pre">{`Cameroun  ${contact.phoneCameroonDisplay}`}</span>
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`} className={item}>
            <Mail aria-hidden size={14} className="text-brand-primary" />
            {contact.email}
          </a>
        </li>
      </ul>
      <div className="flex items-center gap-5">
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
                  aria-label={`${SOCIAL_LABELS[network as keyof typeof SOCIAL_LABELS]} (nouvel onglet)`}
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
