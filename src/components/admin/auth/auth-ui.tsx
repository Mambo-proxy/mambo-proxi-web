'use client';

import { CircleAlert, Eye, EyeOff, Lock } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Titre Poppins SemiBold 30/38 et sous-titre Inter 16/24 `text/muted` des écrans d'accès. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-brand text-[26px] leading-[34px] font-semibold tracking-[-0.01em] text-text-main sm:text-[30px] sm:leading-[38px]">
        {title}
      </h1>
      {children && <div className="font-ui text-[16px] leading-6 text-text-muted">{children}</div>}
    </div>
  );
}

/** Message d'erreur général du formulaire (identifiants refusés, compte verrouillé…), annoncé immédiatement. */
export function FormAlert({ message }: { message: string | null }) {
  return (
    <div role="alert" aria-live="assertive" className={cn(!message && 'sr-only')}>
      {message && (
        <p className="flex items-start gap-2 rounded-md border border-feedback-error/30 bg-feedback-error-subtle px-4 py-3 font-ui text-[14px] leading-5 text-feedback-error">
          <CircleAlert aria-hidden size={18} className="mt-px shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
}

/** Mention « Connexion sécurisée · double vérification par e-mail » (cadenas 14, caption `text/muted`). */
export function SecurityNote() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-center font-ui text-[12px] leading-4 text-text-muted">
      <Lock aria-hidden size={14} />
      Connexion sécurisée · double vérification par e-mail
    </p>
  );
}

const controlClass = [
  'w-full rounded-md border border-border-strong bg-neutral-0 py-3.5 pr-12 pl-[44px] font-ui text-[16px] leading-6 text-text-main',
  'placeholder:text-text-subtle transition-colors duration-150 ease-standard',
  'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:ring-inset focus:outline-none',
  'aria-invalid:border-feedback-error aria-invalid:ring-1 aria-invalid:ring-feedback-error aria-invalid:ring-inset',
];

/** Mot de passe avec cadenas à gauche et bouton « Afficher / Masquer » à droite. */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock
        aria-hidden
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-icon-default"
      />
      <input type={visible ? 'text' : 'password'} className={cn(controlClass, className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-pressed={visible}
        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-icon-default hover:text-text-main"
      >
        {visible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
      </button>
    </div>
  );
}
