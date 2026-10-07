import { ChevronDown, CircleAlert, Phone, type LucideIcon } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Attributs à transmettre au contrôle d'un `Field` (id, description, état invalide). */
export type FieldControlProps = {
  id: string;
  required?: boolean;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
};

type FieldProps = {
  label: ReactNode;
  required?: boolean;
  /** Message d'aide (caption) sous le champ. */
  help?: ReactNode;
  /** Message d'erreur en français, annoncé aux lecteurs d'écran. */
  error?: string | null;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Champ de formulaire (inventaires Contact / Partenaires / Devis) : libellé Inter SemiBold 14/20,
 * astérisque orange pour les champs obligatoires, écart libellé → saisie 8 px.
 */
export function Field({ label, required, help, error, className, children }: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
        {required && (
          <span aria-hidden className="text-text-brand">
            {' *'}
          </span>
        )}
      </label>
      {children({
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {help && !error && (
        <p id={helpId} className="text-caption text-text-muted">
          {help}
        </p>
      )}
      <p
        id={errorId}
        aria-live="polite"
        className={cn(
          'flex items-start gap-1.5 text-[13px] leading-4 text-feedback-error',
          !error && 'sr-only',
        )}
      >
        {error && (
          <>
            <CircleAlert aria-hidden size={16} className="mt-px shrink-0" />
            {error}
          </>
        )}
      </p>
    </div>
  );
}

const controlBase = [
  'w-full rounded-md border border-border-strong bg-neutral-0 font-ui text-[16px] leading-6 text-text-main',
  'placeholder:text-text-subtle transition-colors duration-150 ease-standard',
  'focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:ring-inset focus:outline-none',
  'aria-invalid:border-feedback-error aria-invalid:ring-1 aria-invalid:ring-feedback-error aria-invalid:ring-inset',
  'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-text-disabled',
];

type InputProps = ComponentProps<'input'> & {
  /** Icône 18 px à gauche (maquettes : `Mail`, `Phone`, `User`, `MapPin`…). */
  icon?: LucideIcon;
};

/** Saisie : hauteur 54 (py 14 + 24 + bordure), px 16, rayon 12 ; focus = bordure 2 px orange. */
export function Input({ icon: Icon, className, ...props }: InputProps) {
  if (!Icon) return <input className={cn(controlBase, 'px-4 py-3.5', className)} {...props} />;
  return (
    <div className="relative">
      <Icon
        aria-hidden
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-icon-default"
      />
      <input className={cn(controlBase, 'py-3.5 pr-4 pl-[44px]', className)} {...props} />
    </div>
  );
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBase, 'min-h-[110px] resize-y px-4 py-3.5', className)}
      {...props}
    />
  );
}

/** Liste déroulante native (accessible et adaptée au mobile), chevron 18 px à droite, icône facultative à gauche. */
export function Select({
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<'select'> & { icon?: LucideIcon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          aria-hidden
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-icon-default"
        />
      )}
      <select
        className={cn(
          controlBase,
          'cursor-pointer appearance-none py-3.5 pr-11',
          Icon ? 'pl-[44px]' : 'pl-4',
          // Option « Choisir » (valeur vide) en gris, comme un texte indicatif (muted : contraste AA).
          'has-[option[value=""]:checked]:text-text-muted [&_option]:text-text-main',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        size={18}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-icon-default"
      />
    </div>
  );
}

/**
 * Téléphone (Contact `69:7834`) : saisie simple avec icône, indicatif tapé par l'utilisateur.
 * Icône `Phone` par défaut, `Smartphone` sur le devis (« Téléphone / WhatsApp »).
 */
export function PhoneInput({
  placeholder = '+237 6 00 00 00 00',
  icon = Phone,
  ...props
}: Omit<InputProps, 'type'>) {
  return (
    <Input type="tel" inputMode="tel" autoComplete="tel" icon={icon} placeholder={placeholder} {...props} />
  );
}
