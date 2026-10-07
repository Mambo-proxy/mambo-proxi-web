import { z } from 'zod';
import type { ContactPreference, QuoteField } from '@/lib/api/schema';
import { fieldRules } from '@/lib/forms/schemas';

export const CONTACT_PREFERENCES: ReadonlyArray<{ value: ContactPreference; label: string }> = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'TELEPHONE', label: 'Téléphone' },
  { value: 'EMAIL', label: 'E-mail' },
];

/** Règle d'un champ dynamique : valeurs saisies en texte, converties à l'envoi (voir `toNeeds`). */
function needRule(field: QuoteField) {
  const base = field.required
    ? z.string().trim().min(1, `Merci de renseigner « ${field.label} ».`)
    : z.string().trim();
  if (field.type !== 'number') return base;
  return base.refine(
    (value) => {
      if (!value) return true;
      const number = Number(value);
      return (
        Number.isInteger(number) &&
        (field.min == null || number >= field.min) &&
        (field.max == null || number <= field.max)
      );
    },
    `Merci d’indiquer un nombre entre ${field.min ?? 1} et ${field.max ?? 999}.`,
  );
}

/** Schéma du formulaire de devis pour les champs dynamiques de la rubrique choisie. */
export function quoteSchema(fields: QuoteField[]) {
  return z.object({
    categorySlug: z.string().min(1, 'Merci de choisir une rubrique.'),
    serviceSlug: z.string().min(1, 'Merci de choisir un service.'),
    needs: z.object(Object.fromEntries(fields.map((field) => [field.name, needRule(field)]))),
    description: z
      .string()
      .trim()
      .min(20, 'Merci de décrire votre besoin en quelques phrases (20 caractères au moins).')
      .max(3000, 'Cette description est trop longue (3 000 caractères au plus).'),
    fullName: fieldRules.fullName,
    email: fieldRules.email,
    phone: fieldRules.phone,
    country: z.string().min(1, 'Merci de choisir votre pays de résidence.'),
    contactPreference: z.enum(['WHATSAPP', 'TELEPHONE', 'EMAIL']),
    consent: fieldRules.consent,
  });
}

export type QuoteFormInput = z.input<ReturnType<typeof quoteSchema>>;
export type QuoteFormOutput = z.output<ReturnType<typeof quoteSchema>>;

/** Champs de chaque étape, pour la validation étape par étape. */
export const STEP_FIELDS = {
  1: ['categorySlug', 'serviceSlug'],
  2: ['needs', 'description'],
  3: ['fullName', 'email', 'phone', 'country', 'contactPreference', 'consent'],
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
