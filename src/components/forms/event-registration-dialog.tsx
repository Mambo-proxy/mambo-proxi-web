'use client';

import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Event } from '@/lib/api/schema';

// Formulaire et validation chargés au premier clic, hors du JavaScript initial de la rubrique.
const EventRegistrationModal = dynamic(
  () => import('./event-registration-modal').then((module) => module.EventRegistrationModal),
  { ssr: false },
);

/** « Je participe » (Agenda) : ouvre la modale d'inscription à l'événement. */
export function EventRegistrationDialog({ event }: { event: Event }) {
  const t = useTranslations('rubrique');
  const [open, setOpen] = useState(false);
  // Gardée montée après la première ouverture : la confirmation reste affichée si la modale est rouverte.
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="group/cta inline-flex cursor-pointer items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
      >
        {t('join')}
        <span className="sr-only"> : {event.title}</span>
        <ArrowRight
          aria-hidden
          size={16}
          className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
        />
      </button>
      {loaded && <EventRegistrationModal event={event} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
