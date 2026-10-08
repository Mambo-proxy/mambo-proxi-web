'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input } from '@/components/ui/field';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import type { LoginResult } from '@/lib/api/schema';
import { AuthHeading, FormAlert, PasswordInput, SecurityNote } from './auth-ui';
import { OtpInput } from './otp-input';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Merci d’indiquer votre adresse e-mail.')
    .pipe(z.email('Saisissez une adresse e-mail valide.')),
  password: z.string().min(1, 'Merci d’indiquer votre mot de passe.'),
  rememberMe: z.boolean(),
});

type Values = z.infer<typeof schema>;
type Challenge = Extract<LoginResult, { status: 'OTP_REQUIRED' }>;

/**
 * Connexion au back-office (`95:11689`) : e-mail, mot de passe (afficher / masquer), « Rester connecté »,
 * « Mot de passe oublié ? ». Si l'appareil n'est pas reconnu, l'API envoie un code par e-mail : étape 2.
 */
export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const { errors, isSubmitting } = form.formState;

  function enter() {
    router.replace(next as never);
    router.refresh();
  }

  async function onSubmit(values: Values) {
    setAlert(null);
    try {
      const { data, error, response } = await browserApi.POST('/v1/auth/login', { body: values });
      if (!response.ok || !data) throw toApiError(error, response);
      if (data.status === 'AUTHENTICATED') enter();
      else setChallenge(data);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) form.setValue('password', '');
      setAlert(errorMessage(caught));
    }
  }

  if (challenge)
    return (
      <OtpStep
        challenge={challenge}
        onChallenge={setChallenge}
        onBack={() => {
          setChallenge(null);
          form.setValue('password', '');
        }}
        onSuccess={enter}
      />
    );

  return (
    // `post` : envoyé avant le chargement du script, le formulaire ne met pas le mot de passe dans l’adresse.
    <form
      method="post"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label="Connexion au back-office"
      className="flex flex-col gap-5"
    >
      <AuthHeading title="Connexion au back-office">Accès réservé à l’équipe MAMBO Proxi.</AuthHeading>
      <FormAlert message={alert} />
      <Field label="Adresse e-mail" error={errors.email?.message}>
        {(control) => (
          <Input
            {...control}
            {...form.register('email')}
            icon={Mail}
            type="email"
            autoComplete="username"
            inputMode="email"
            autoFocus
          />
        )}
      </Field>
      <Field label="Mot de passe" error={errors.password?.message}>
        {(control) => (
          <PasswordInput {...control} {...form.register('password')} autoComplete="current-password" />
        )}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          id="remember-me"
          {...form.register('rememberMe')}
          label="Rester connecté"
          labelClassName="text-text-main"
        />
        <Link
          href={adminRoutes.forgotPassword}
          className="rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
        >
          Mot de passe oublié&nbsp;?
        </Link>
      </div>
      <Button type="submit" fullWidth loading={isSubmitting}>
        Se connecter
      </Button>
      <SecurityNote />
    </form>
  );
}

function secondsUntil(date: string) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
}

/** Étape 2 (non maquettée) : code à 6 chiffres reçu par e-mail, « Faire confiance à cet appareil », renvoi après 60 s. */
function OtpStep({
  challenge,
  onChallenge,
  onBack,
  onSuccess,
}: {
  challenge: Challenge;
  onChallenge: (challenge: Challenge) => void;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [wait, setWait] = useState(() => secondsUntil(challenge.resendAvailableAt));
  const submitted = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setWait(secondsUntil(challenge.resendAvailableAt)), 1000);
    return () => window.clearInterval(timer);
  }, [challenge.resendAvailableAt]);

  async function verify(value: string) {
    if (value.length !== 6 || submitted.current === value) return;
    submitted.current = value;
    setPending(true);
    setError(null);
    try {
      const {
        data,
        error: apiError,
        response,
      } = await browserApi.POST('/v1/auth/verify-otp', {
        body: { challengeId: challenge.challengeId, code: value, trustDevice },
      });
      if (!response.ok || !data) throw toApiError(apiError, response);
      onSuccess();
    } catch (caught) {
      setError(errorMessage(caught));
      setCode('');
      submitted.current = null;
      setPending(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    try {
      const {
        data,
        error: apiError,
        response,
      } = await browserApi.POST('/v1/auth/resend-otp', {
        body: { challengeId: challenge.challengeId },
      });
      if (!response.ok || !data || data.status !== 'OTP_REQUIRED') throw toApiError(apiError, response);
      onChallenge(data);
      setWait(secondsUntil(data.resendAvailableAt));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === 6) void verify(code);
        else setError('Saisissez les 6 chiffres du code reçu par e-mail.');
      }}
      noValidate
      aria-label="Vérification du code"
      className="flex flex-col gap-5"
    >
      <AuthHeading title="Vérifiez votre identité">
        Saisissez le code à 6 chiffres envoyé à{' '}
        <strong className="text-text-main">{challenge.emailHint}</strong>. Il est valable 10 minutes.
      </AuthHeading>
      <div className="flex flex-col gap-2">
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) setError(null);
          }}
          onComplete={(value) => void verify(value)}
          invalid={Boolean(error)}
          disabled={pending}
          describedBy={error ? 'otp-error' : undefined}
        />
        <p id="otp-error" role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      </div>
      <Checkbox
        id="trust-device"
        checked={trustDevice}
        onChange={(event) => setTrustDevice(event.target.checked)}
        label="Faire confiance à cet appareil pendant 30 jours"
        labelClassName="text-text-main"
      />
      <Button type="submit" fullWidth loading={pending}>
        Valider le code
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3 font-ui text-[14px] leading-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xs font-semibold text-text-main hover:underline"
        >
          <ArrowLeft aria-hidden size={16} />
          Changer de compte
        </button>
        {wait > 0 ? (
          <span className="text-text-muted">Renvoyer le code dans {wait} s</span>
        ) : (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending}
            className="rounded-xs font-semibold text-text-brand hover:underline disabled:opacity-40"
          >
            Renvoyer le code
          </button>
        )}
      </div>
      <SecurityNote />
    </form>
  );
}
