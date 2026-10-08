'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

const LENGTH = 6;

/**
 * Code à 6 chiffres (écran non maquetté, langage des champs du back-office) : 6 cases 52 × 60, rayon 12, focus
 * bordure 2 px orange. Saisie chiffre par chiffre avec passage automatique à la case suivante, retour arrière,
 * flèches, et collage du code entier dans n'importe quelle case. Code complet → `onComplete`.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? '');

  function update(next: string) {
    const code = next.replace(/\D/g, '').slice(0, LENGTH);
    onChange(code);
    if (code.length === LENGTH) onComplete(code);
    return code;
  }

  function focus(index: number) {
    inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }

  function onInput(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = digits.slice();
    next[index] = digit;
    update(next.join(''));
    focus(index + 1);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = digits.slice();
      if (next[index]) next[index] = '';
      else if (index > 0) {
        next[index - 1] = '';
        focus(index - 1);
      }
      onChange(next.join('').slice(0, LENGTH));
    } else if (event.key === 'ArrowLeft') focus(index - 1);
    else if (event.key === 'ArrowRight') focus(index + 1);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const code = update(event.clipboardData.getData('text'));
    focus(code.length);
  }

  return (
    <div role="group" aria-label="Code de vérification à 6 chiffres" className="flex justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          value={digit}
          onChange={(event) => onInput(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={`Chiffre ${index + 1} sur ${LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-[60px] w-full max-w-[56px] min-w-0 rounded-md border border-border-strong bg-neutral-0 text-center font-brand text-[24px] leading-8 font-semibold text-text-main',
            'transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset',
            'aria-invalid:border-feedback-error aria-invalid:ring-1 aria-invalid:ring-feedback-error aria-invalid:ring-inset',
            'disabled:bg-neutral-50',
          )}
        />
      ))}
    </div>
  );
}
