'use client';

import { useRef } from 'react';
import type { AntiSpam } from '@/lib/api/schema';
import { useTurnstile } from './use-turnstile';

/**
 * Protection anti-spam des formulaires publics (contrat `AntiSpam`) : horodatage d'ouverture du formulaire, champ
 * piège invisible et jeton Cloudflare Turnstile (widget invisible, chargé au premier focus dans le formulaire).
 */
export function useAntiSpam() {
  const startedAt = useRef(new Date().toISOString());
  const honeypot = useRef<HTMLInputElement>(null);
  const turnstile = useTurnstile();
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
    /** Conteneur du widget Turnstile, à placer dans le `<form>` (`<div {...widgetProps} />`). */
    widgetProps: turnstile.widgetProps,
    /** Données anti-spam de l'envoi ; attend le jeton Turnstile (vide sans clé publique). */
    build: async (): Promise<AntiSpam> => ({
      turnstileToken: await turnstile.token(),
      honeypot: honeypot.current?.value ?? '',
      startedAt: startedAt.current,
    }),
  };
}
