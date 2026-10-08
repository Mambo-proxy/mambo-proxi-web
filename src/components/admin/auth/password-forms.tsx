'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, CircleCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { AuthHeading, FormAlert, PasswordInput } from './auth-ui';

function BackToLogin() {
  return (
    <Link
      href={adminRoutes.login}
      className="inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main hover:underline"
    >
      <ArrowLeft aria-hidden size={16} />
      Retour à la connexion
    </Link>
  );
}

/** Confirmation d'une étape terminée (pastille verte, titre, texte, action). */
function Done({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-full bg-feedback-success-subtle text-feedback-success"
      >
        <CircleCheck size={28} />
      </span>
      <AuthHeading title={title}>{text}</AuthHeading>
      {children}
    </div>
  );
}

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Merci d’indiquer votre adresse e-mail.')
    .pipe(z.email('Saisissez une adresse e-mail valide.')),
});

/** « Mot de passe oublié » (non maquetté) : la réponse est la même que l'adresse existe ou non. */
export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setAlert(null);
    try {
      const { data, error, response } = await browserApi.POST('/v1/auth/forgot-password', { body: values });
      if (!response.ok || !data) throw toApiError(error, response);
      setMessage(data.message);
    } catch (caught) {
      setAlert(errorMessage(caught));
    }
  }

  if (message)
    return (
      <Done title="Vérifiez votre boîte de réception" text={message}>
        <p className="font-ui text-[14px] leading-5 text-text-muted">
          Le lien est valable 1 heure. Pensez à regarder dans les courriers indésirables.
        </p>
        <BackToLogin />
      </Done>
    );

  return (
    <form
      method="post"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label="Mot de passe oublié"
      className="flex flex-col gap-5"
    >
      <BackToLogin />
      <AuthHeading title="Mot de passe oublié">
        Indiquez l’adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de
        passe.
      </AuthHeading>
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
      <Button type="submit" fullWidth loading={isSubmitting}>
        Recevoir le lien
      </Button>
    </form>
  );
}

const MIN_LENGTH = 12;

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(MIN_LENGTH, `Votre mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`)
      .max(256, 'Ce mot de passe est trop long.'),
    confirmation: z.string().min(1, 'Merci de confirmer votre mot de passe.'),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ['confirmation'],
    message: 'Les deux mots de passe ne correspondent pas.',
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const COPY = {
  reset: {
    label: 'Nouveau mot de passe',
    title: 'Choisissez un nouveau mot de passe',
    text: 'Pour votre sécurité, toutes vos sessions ouvertes seront fermées.',
    button: 'Enregistrer le mot de passe',
    doneTitle: 'Mot de passe modifié',
    doneText: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
  },
  invite: {
    label: 'Activation du compte',
    title: 'Bienvenue dans le back-office',
    text: 'Choisissez le mot de passe de votre compte pour activer votre accès.',
    button: 'Activer mon compte',
    doneTitle: 'Compte activé',
    doneText: 'Votre accès est prêt : connectez-vous avec votre adresse e-mail et ce mot de passe.',
  },
} as const;

/**
 * Nouveau mot de passe (lien de réinitialisation) ou acceptation d'une invitation (non maquettés) : 12 caractères
 * minimum (l'API refuse aussi les mots de passe connus pour avoir fuité), confirmation, indicateur de longueur.
 */
export function SetPasswordForm({ mode, token }: { mode: 'reset' | 'invite'; token: string | null }) {
  const copy = COPY[mode];
  const [done, setDone] = useState(false);
  const [alert, setAlert] = useState<string | null>(
    token ? null : 'Ce lien est incomplet. Utilisez le lien reçu par e-mail.',
  );
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmation: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const password = useWatch({ control: form.control, name: 'password' });
  const longEnough = password.length >= MIN_LENGTH;

  async function onSubmit(values: PasswordValues) {
    if (!token) return;
    setAlert(null);
    try {
      const body = { token, password: values.password };
      const { error, response } =
        mode === 'reset'
          ? await browserApi.POST('/v1/auth/reset-password', { body })
          : await browserApi.POST('/v1/auth/accept-invite', { body });
      if (!response.ok) throw toApiError(error, response);
      setDone(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors.password)
        form.setError('password', { message: caught.fieldErrors.password });
      else setAlert(errorMessage(caught));
    }
  }

  if (done)
    return (
      <Done title={copy.doneTitle} text={copy.doneText}>
        <ButtonLink href={adminRoutes.login} fullWidth>
          Se connecter
        </ButtonLink>
      </Done>
    );

  return (
    <form
      method="post"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label={copy.label}
      className="flex flex-col gap-5"
    >
      <AuthHeading title={copy.title}>{copy.text}</AuthHeading>
      <FormAlert message={alert} />
      <Field label="Mot de passe" error={errors.password?.message}>
        {(control) => (
          <PasswordInput
            {...control}
            {...form.register('password')}
            autoComplete="new-password"
            disabled={!token}
            autoFocus
          />
        )}
      </Field>
      <p
        className={cn(
          'flex items-center gap-2 font-ui text-[13px] leading-4',
          longEnough ? 'text-feedback-success' : 'text-text-muted',
        )}
      >
        <Check aria-hidden size={16} className={cn(!longEnough && 'opacity-40')} />
        Au moins {MIN_LENGTH} caractères ({password.length}/{MIN_LENGTH})
      </p>
      <Field label="Confirmer le mot de passe" error={errors.confirmation?.message}>
        {(control) => (
          <PasswordInput
            {...control}
            {...form.register('confirmation')}
            autoComplete="new-password"
            disabled={!token}
          />
        )}
      </Field>
      <Button type="submit" fullWidth loading={isSubmitting} disabled={!token}>
        {copy.button}
      </Button>
      <BackToLogin />
    </form>
  );
}
