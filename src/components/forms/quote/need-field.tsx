import { Calendar, MapPin, Users } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import type { QuoteField } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

const DEFAULT_CITIES = ['Douala', 'Yaoundé', 'Kribi', 'Autre'];

/** Date du jour au format `AAAA-MM-JJ` (borne basse des champs date). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type NeedFieldProps = {
  field: QuoteField;
  registration: UseFormRegisterReturn;
  error?: string;
  /** Valeur courante (puces). */
  value?: string;
};

/**
 * Champ dynamique de l'étape « Votre besoin » (`quoteFields` de la rubrique, administrables) :
 * date (icône calendrier), ville (liste + repère), nombre (icône personnes), liste, texte, zone de texte ou puces.
 */
export function NeedField({ field, registration, error, value }: NeedFieldProps) {
  const label = frenchTypography(field.label);
  const help = field.helpText ? frenchTypography(field.helpText) : undefined;
  const placeholder = field.placeholder ?? undefined;
  const className = cn(field.width === 'full' && 'md:col-span-2');

  if (field.type === 'chips') {
    return (
      <fieldset className={cn('flex flex-col gap-3', className)}>
        <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold text-text-main">
          {label}
          {field.required && <span className="text-text-brand"> *</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => (
            <label
              key={option}
              className={cn(
                'inline-flex cursor-pointer items-center rounded-full border px-3.5 py-[9px] font-ui text-[14px] leading-5 font-medium has-[:focus-visible]:focus-ring',
                value === option
                  ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                  : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-100',
              )}
            >
              <input type="radio" value={option} className="sr-only" {...registration} />
              {option}
            </label>
          ))}
        </div>
        {error && <p className="text-[13px] leading-4 text-feedback-error">{error}</p>}
      </fieldset>
    );
  }

  return (
    <Field label={label} required={field.required} help={help} error={error} className={className}>
      {(control) => {
        switch (field.type) {
          case 'date':
            return <Input type="date" icon={Calendar} min={today()} {...control} {...registration} />;
          case 'number':
            return (
              <Input
                type="number"
                inputMode="numeric"
                icon={Users}
                min={field.min ?? undefined}
                max={field.max ?? undefined}
                placeholder={placeholder}
                {...control}
                {...registration}
              />
            );
          case 'city':
          case 'select': {
            const options = field.options?.length ? field.options : DEFAULT_CITIES;
            return (
              <Select icon={field.type === 'city' ? MapPin : undefined} {...control} {...registration}>
                <option value="">Choisir</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            );
          }
          case 'textarea':
            return <Textarea placeholder={placeholder} {...control} {...registration} />;
          default:
            return <Input placeholder={placeholder} {...control} {...registration} />;
        }
      }}
    </Field>
  );
}
