'use client';

import { CircleCheck, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import { fieldRules } from '@/lib/forms/schemas';
import { useAntiSpam } from '@/lib/forms/use-anti-spam';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string };

/**
 * « Me prévenir » (Suivi Mambo `83:9528`) : e-mail + bouton (empilés en mobile) → inscription à la lettre avec la
 * source `suivi-mambo` et double opt-in (e-mail de confirmation), comme le formulaire du pied de page.
 */
export function NotifyForm() {
  const antiSpam = useAntiSpam();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = fieldRules.email.safeParse(email);
    if (!parsed.success) {
      setState({ kind: 'error', message: parsed.error.issues[0]?.message ?? 'Adresse e-mail invalide.' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      const { data, error, response } = await browserApi.POST('/v1/newsletter/subscriptions', {
        body: {
          email: parsed.data,
          source: 'suivi-mambo',
          tags: ['suivi-mambo'],
          consent: true,
          antiSpam: antiSpam.build(),
        },
      });
      if (!response.ok || !data) throw toApiError(error, response);
      setState({
        kind: 'done',
        message: data.alreadySubscribed
          ? 'Vous êtes déjà inscrit : nous vous préviendrons dès l’ouverture de Suivi Mambo.'
          : 'Merci ! Confirmez votre adresse dans l’e-mail que nous venons de vous envoyer : nous vous préviendrons dès l’ouverture.',
      });
    } catch (caught) {
      setState({ kind: 'error', message: errorMessage(caught) });
    }
  }

  if (state.kind === 'done') {
    return (
      <p role="status" className="flex items-start gap-3 font-ui text-[16px] leading-6 text-text-main">
        <CircleCheck aria-hidden size={22} className="mt-px shrink-0 text-vert-600" />
        {state.message}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-label="Être prévenu de l’ouverture"
      className="flex flex-col gap-2"
    >
      <input {...antiSpam.honeypotProps} />
      <div className="flex flex-col gap-2.5 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Votre adresse e-mail</span>
          <Mail
            aria-hidden
            size={18}
            className="pointer-events-none absolute top-1/2 left-[18px] -translate-y-1/2 text-icon-default"
          />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Votre adresse e-mail"
            aria-invalid={state.kind === 'error' ? true : undefined}
            aria-describedby="suivi-message"
            className="w-full rounded-md border border-border-strong bg-neutral-0 py-3.5 pr-[18px] pl-12 font-ui text-[16px] leading-6 text-text-main placeholder:text-text-subtle focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none aria-invalid:border-feedback-error"
          />
        </label>
        <Button type="submit" loading={state.kind === 'sending'} className="max-md:w-full md:self-center">
          Me prévenir
        </Button>
      </div>
      <p
        id="suivi-message"
        aria-live="polite"
        className="text-[13px] leading-4 text-feedback-error empty:hidden"
      >
        {state.kind === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
