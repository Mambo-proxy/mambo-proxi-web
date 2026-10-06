'use client';

import { useEffect, useState } from 'react';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { cn } from '@/lib/cn';

const SHOW_AFTER_SCROLL = 400;
const SHOW_AFTER_MS = 4000;

/**
 * Bouton WhatsApp flottant (Figma `44:203`) : cercle 64 px (56 en mobile) `#25D366`, icône blanche 30 px,
 * à 28 px du bord (16 en mobile). Apparaît après 400 px de défilement ou 4 s ; anneau pulsant toutes les 6 s ;
 * étiquette « Écrire sur WhatsApp » au survol ; remonte quand le bandeau cookies est affiché.
 */
export function WhatsappFloat({ href }: { href: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const show = () => setVisible(true);
    const timer = setTimeout(show, SHOW_AFTER_MS);
    const onScroll = () => window.scrollY > SHOW_AFTER_SCROLL && show();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [visible]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire sur WhatsApp (nouvel onglet)"
      className={cn(
        'group/wa fixed right-4 bottom-4 z-40 flex items-center xl:right-7 xl:bottom-7',
        'transition-[translate,scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        '[:root[data-cookie-banner]_&]:-translate-y-[220px] md:[:root[data-cookie-banner]_&]:-translate-y-[150px] xl:[:root[data-cookie-banner]_&]:-translate-y-[130px]',
        visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-0 opacity-0',
      )}
    >
      <span
        aria-hidden
        className="mr-3 hidden max-w-0 overflow-hidden rounded-full bg-neutral-900 px-0 py-2 font-ui text-[14px] leading-5 font-semibold whitespace-nowrap text-neutral-0 opacity-0 transition-all duration-300 group-hover/wa:max-w-[220px] group-hover/wa:px-4 group-hover/wa:opacity-100 xl:block"
      >
        Écrire sur WhatsApp
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full bg-whatsapp text-neutral-0 shadow-whatsapp transition-colors group-hover/wa:bg-whatsapp-hover xl:size-16">
        <span
          aria-hidden
          className="absolute inset-0 animate-[wa-pulse_6s_ease-out_infinite] rounded-full bg-whatsapp motion-reduce:hidden"
        />
        <WhatsappIcon size={30} className="relative" />
      </span>
    </a>
  );
}
