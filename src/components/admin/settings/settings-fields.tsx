'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { EditorSection } from '@/components/admin/editor/editor-ui';
import { Input } from '@/components/ui/field';
import { cn } from '@/lib/cn';

/** Carte de Paramètres (`94:11866`) : carte-section de l'éditeur, padding 24. */
export function SettingsCard({ className, ...props }: ComponentProps<typeof EditorSection>) {
  return <EditorSection className={cn('md:p-6', className)} {...props} />;
}

/** Grille de champs : 2 colonnes (écart 16) dès 640 px, rangées espacées de 18. */
export function FieldGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-[18px] sm:grid-cols-2 sm:gap-x-4', className)}>{children}</div>;
}

type FormattedInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: string;
  /** Valeur enregistrée → texte affiché (« +237 6 00 00 00 00 », « instagram.com/mamboproxi »). */
  format: (value: string) => string;
  /** Texte saisi → valeur enregistrée (E.164, adresse complète). */
  parse: (text: string) => string;
  onValueChange: (value: string) => void;
};

/**
 * Saisie mise en forme : le texte tapé est gardé tel quel pendant la saisie, la valeur enregistrée est sa forme
 * normalisée ; le texte est remis en forme à la sortie du champ ou quand la valeur change ailleurs (numéro WhatsApp
 * présent dans deux cartes).
 */
export function FormattedInput({
  value,
  format,
  parse,
  onValueChange,
  onBlur,
  ...props
}: FormattedInputProps) {
  const [text, setText] = useState(() => format(value));
  if (parse(text) !== value) setText(format(value));
  return (
    <Input
      {...props}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onValueChange(parse(event.target.value));
      }}
      onBlur={(event) => {
        setText(format(value));
        onBlur?.(event);
      }}
    />
  );
}

/** Nombre entier (`NaN` tant que le champ est vide : l'API répond par l'erreur du champ). */
export function NumberInput({
  value,
  onValueChange,
  unit,
  ...props
}: Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  /** Unité affichée à droite (« heures », « jours »). */
  unit?: string;
}) {
  return (
    <div className="relative">
      <Input
        {...props}
        type="number"
        inputMode="numeric"
        value={value == null || Number.isNaN(value) ? '' : value}
        onChange={(event) => onValueChange(event.target.valueAsNumber)}
        className={cn(unit && 'pr-[84px]', props.className)}
      />
      {unit && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-ui text-[14px] leading-5 text-text-muted"
        >
          {unit}
        </span>
      )}
    </div>
  );
}
