'use client';

import { CircleCheck, Mail, Smartphone, User } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { toE164 } from '@/lib/phone';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; field?: 'email' | 'phone' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALREADY_SUBSCRIBED = 'Vous êtes déjà inscrit(e) à la lettre Mambo : merci de votre fidélité !';

/**
 * Inscription à la lettre Mambo (pied de page, Figma `46:90`) : nom, e-mail, téléphone (WhatsApp) en pilules
 * sombres, bouton « S'abonner ». Double opt-in : l'envoi déclenche l'e-mail de confirmation (le clic vaut
 * consentement, confirmé par l'e-mail). États : envoi, succès, déjà inscrit, erreur (annoncés aux lecteurs d'écran).
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const startedAt = useRef(new Date().toISOString());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const rawPhone = String(data.get('phone') ?? '').trim();
    const phone = rawPhone ? toE164(rawPhone) : null;
    if (!EMAIL.test(email)) {
      setStatus({ kind: 'error', field: 'email', message: 'Merci d’indiquer une adresse e-mail valide.' });
      return;
    }
    if (rawPhone && !phone) {
      setStatus({
        kind: 'error',
        field: 'phone',
        message: 'Merci d’indiquer un numéro avec l’indicatif du pays (ex. +237…).',
      });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const {
        data: result,
        error,
        response,
      } = await browserApi.POST('/v1/newsletter/subscriptions', {
        body: {
          name: String(data.get('name') ?? '').trim() || null,
          email,
          phone,
          source: 'footer',
          consent: true,
          antiSpam: {
            turnstileToken: '',
            honeypot: String(data.get('website') ?? ''),
            startedAt: startedAt.current,
          },
        },
      });
      if (!response.ok || !result) throw toApiError(error, response);
      setStatus({ kind: 'success', message: result.alreadySubscribed ? ALREADY_SUBSCRIBED : result.message });
    } catch (caught) {
      const field = caught instanceof ApiError && caught.fieldErrors.email ? 'email' : undefined;
      setStatus({
        kind: 'error',
        field,
        message:
          field && caught instanceof ApiError ? (caught.fieldErrors.email ?? '') : errorMessage(caught),
      });
    }
  }

  if (status.kind === 'success') {
    return (
      <p
        role="status"
        className="flex items-start gap-3 rounded-[20px] bg-neutral-900 p-5 font-ui text-[15px] leading-6 text-neutral-0 xl:max-w-[560px]"
      >
        <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-500" />
        {status.message}
      </p>
    );
  }

  const field = (name: 'email' | 'phone') =>
    status.kind === 'error' && status.field === name
      ? { 'aria-invalid': true as const, 'aria-describedby': 'newsletter-error' }
      : {};

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Inscription à la lettre Mambo"
      className="flex w-full min-w-0 flex-col gap-2.5 xl:w-auto xl:flex-[0_1_auto]"
    >
      <div className="flex flex-col gap-2.5 xl:flex-row">
        <PillInput icon={User} name="name" label="Votre nom" autoComplete="name" />
        <PillInput
          icon={Mail}
          name="email"
          type="email"
          label="Votre adresse e-mail"
          autoComplete="email"
          required
          {...field('email')}
        />
        <PillInput
          icon={Smartphone}
          name="phone"
          type="tel"
          label="Téléphone (WhatsApp)"
          autoComplete="tel"
          {...field('phone')}
        />
        {/* Champ piège anti-spam : invisible, doit rester vide. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <Button
          type="submit"
          loading={status.kind === 'sending'}
          className="focus-visible:focus-ring-inverse"
        >
          S&apos;abonner
        </Button>
      </div>
      <p
        id="newsletter-error"
        aria-live="polite"
        className={cn('font-ui text-[13px] leading-4 text-orange-200', status.kind !== 'error' && 'sr-only')}
      >
        {status.kind === 'error' ? status.message : ''}
      </p>
    </form>
  );
}

type PillInputProps = React.ComponentProps<'input'> & { icon: typeof User; label: string };

/** Champ pilule sombre : fond `neutral/900`, bordure `neutral/700`, px 20 py 14, placeholder `neutral/400`. */
function PillInput({ icon: InputIcon, label, className, ...props }: PillInputProps) {
  return (
    <label className={cn('relative block min-w-0 xl:w-[231px] xl:shrink', className)}>
      <span className="sr-only">{label}</span>
      <InputIcon
        aria-hidden
        size={18}
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-neutral-400"
      />
      <input
        placeholder={label}
        className={cn(
          'w-full rounded-full border border-neutral-700 bg-neutral-900 py-3.5 pr-2.5 pl-12 font-ui text-[16px] leading-6 text-neutral-0',
          'placeholder:text-neutral-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none',
          'aria-invalid:border-orange-400',
        )}
        {...props}
      />
    </label>
  );
}
