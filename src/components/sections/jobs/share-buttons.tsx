'use client';

import { Mail } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { LinkedinIcon, WhatsappIcon } from '@/components/brand/social-icons';

const subscribe = () => () => {};

/**
 * Partage d'une offre (`82:9165`) : « Partager : » et 3 boutons ronds 34 (WhatsApp, LinkedIn, e-mail).
 * L'adresse de la page est lue dans le navigateur (l'adresse publique du site n'est pas encore définie).
 */
export function ShareButtons({ title }: { title: string }) {
  const url = useSyncExternalStore(
    subscribe,
    () => window.location.href.split('#')[0] ?? '',
    () => '',
  );
  const links = [
    {
      label: 'Partager sur WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
      icon: <WhatsappIcon size={16} />,
    },
    {
      label: 'Partager sur LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <LinkedinIcon size={16} />,
    },
    {
      label: 'Partager par e-mail',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      icon: <Mail aria-hidden size={16} />,
    },
  ];
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-caption text-text-muted">Partager :</span>
      <ul className="flex gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={link.href.startsWith('mailto:') ? link.label : `${link.label} (nouvel onglet)`}
              className="flex size-[34px] items-center justify-center rounded-full border border-border-default text-text-main hover:bg-neutral-100"
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
