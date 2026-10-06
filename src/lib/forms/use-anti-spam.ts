'use client';

import { useRef } from 'react';
import type { AntiSpam } from '@/lib/api/schema';

/**
 * Protection anti-spam des formulaires publics (contrat `AntiSpam`) : horodatage d'ouverture du formulaire et champ
 * piège invisible. Le jeton Turnstile sera ajouté avec le widget (voir TASKS.md).
 */
export function useAntiSpam() {
  const startedAt = useRef(new Date().toISOString());
  const honeypot = useRef<HTMLInputElement>(null);
  return {
    /** Champ piège à placer dans le formulaire : invisible, doit rester vide. */
    honeypotProps: {
      ref: honeypot,
      type: 'text',
      name: 'website',
      tabIndex: -1,
      autoComplete: 'off',
      'aria-hidden': true,
      className: 'hidden',
    } as const,
    build: (): AntiSpam => ({
      turnstileToken: '',
      honeypot: honeypot.current?.value ?? '',
      startedAt: startedAt.current,
    }),
  };
}
