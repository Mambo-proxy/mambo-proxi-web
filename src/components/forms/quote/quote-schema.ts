import type { useTranslations } from 'next-intl';
import * as z from 'zod/mini';
import type { ContactPreference, QuoteField } from '@/lib/api/schema';
import { trimmed, type FieldRules } from '@/lib/forms/schemas';

/** Préférences de contact proposées ; libellés dans la langue de la page (`forms.quote.contactPreferences`). */
export const CONTACT_PREFERENCES: ReadonlyArray<ContactPreference> = ['WHATSAPP', 'TELEPHONE', 'EMAIL'];

export type QuoteMessages = ReturnType<typeof useTranslations<'forms.quote'>>;

/** Règle d'un champ dynamique : valeurs saisies en texte, converties à l'envoi (voir `toNeeds`). */
function needRule(field: QuoteField, t: QuoteMessages) {
  const base = field.required
    ? trimmed(z.minLength(1, t('validation.needRequired', { label: field.label })))
    : trimmed();
  if (field.type !== 'number') return base;
  return base.check(
    z.refine(
      (value) => {
        if (!value) return true;
        const number = Number(value);
        return (
          Number.isInteger(number) &&
          (field.min == null || number >= field.min) &&
          (field.max == null || number <= field.max)
        );
      },
      t('validation.needNumber', { min: String(field.min ?? 1), max: String(field.max ?? 999) }),
    ),
  );
}

/**
 * Schéma du formulaire de devis pour les champs dynamiques de la rubrique choisie, messages dans la langue de la page
 * (règles communes de `useFormCommon`, textes `forms.quote`).
 */
export function makeQuoteSchema(fields: QuoteField[], rules: FieldRules, t: QuoteMessages) {
  return z.object({
    categorySlug: z.string().check(z.minLength(1, t('validation.categoryRequired'))),
    serviceSlug: z.string().check(z.minLength(1, t('validation.serviceRequired'))),
    needs: z.object(Object.fromEntries(fields.map((field) => [field.name, needRule(field, t)]))),
    description: trimmed(
      z.minLength(20, t('validation.descriptionTooShort')),
      z.maxLength(3000, t('validation.descriptionTooLong')),
    ),
    fullName: rules.fullName,
    email: rules.email,
    phone: rules.phone,
    city: z.string().check(z.minLength(1, t('validation.cityRequired'))),
    contactPreference: z.enum(['WHATSAPP', 'TELEPHONE', 'EMAIL']),
    consent: rules.consent,
  });
}

export type QuoteFormInput = z.input<ReturnType<typeof makeQuoteSchema>>;
export type QuoteFormOutput = z.output<ReturnType<typeof makeQuoteSchema>>;

/** Champs de chaque étape, pour la validation étape par étape. */
export const STEP_FIELDS = {
  1: ['categorySlug', 'serviceSlug'],
  2: ['needs', 'description'],
  3: ['fullName', 'email', 'phone', 'city', 'contactPreference', 'consent'],
} as const;

/** Valeurs des champs dynamiques au format du contrat : nombres convertis, champs vides à `null`. */
export function toNeeds(fields: QuoteField[], values: Record<string, string | undefined>) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values[field.name]?.trim() ?? '';
      if (!value) return [field.name, null];
      return [field.name, field.type === 'number' ? Number(value) : value];
    }),
  );
}
