import * as z from 'zod/mini';
import { toE164 } from '@/lib/phone';

/**
 * Texte saisi sans les espaces de début et de fin, puis contrôlé (`z.minLength`, `z.maxLength`…). Les formulaires
 * publics utilisent `zod/mini` (une dizaine de Ko au lieu de ~85 Ko pour `zod`) : règles passées à `.check()`.
 */
export const trimmed = (...checks: Parameters<z.ZodMiniString['check']>) =>
  z.string().check(z.trim(), ...checks);

const PHONE_FORMAT = 'Merci d’indiquer un numéro avec l’indicatif du pays (ex. +237…).';

/** Numéro converti au format E.164 ; erreur « indicatif du pays » s'il ne peut pas l'être. */
function toE164OrIssue(value: string, issues: z.core.$ZodRawIssue[]): string {
  const phone = toE164(value);
  if (phone) return phone;
  issues.push({ code: 'custom', message: PHONE_FORMAT, input: value });
  return z.NEVER;
}

/**
 * Règles de validation communes aux formulaires publics, messages en français prêts à afficher.
 * Elles reprennent les contraintes du contrat (ContactIdentity, Consent) ; l'API reste la référence.
 */
export const fieldRules = {
  fullName: trimmed(
    z.minLength(2, 'Merci d’indiquer votre nom et votre prénom.'),
    z.maxLength(120, 'Ce nom est trop long (120 caractères au plus).'),
  ),
  email: z.pipe(trimmed(), z.email('Merci d’indiquer une adresse e-mail valide.')),
  /** Téléphone saisi librement, converti au format E.164 attendu par l'API. */
  phone: z.pipe(
    trimmed(z.minLength(1, 'Merci d’indiquer un numéro de téléphone.')),
    z.transform((value: string, context) => toE164OrIssue(value, context.issues)),
  ),
  /** Téléphone facultatif (Contact) : vide → `null`, sinon converti en E.164. */
  optionalPhone: z.pipe(
    trimmed(),
    z.transform((value: string, context) => (value ? toE164OrIssue(value, context.issues) : null)),
  ),
  consent: z.literal(true, {
    error: 'Merci d’accepter le traitement de vos données pour envoyer votre demande.',
  }),
};

/** Texte de consentement des formulaires (maquette Contact, apostrophe droite d'origine). */
export const CONSENT_TEXT =
  "J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.";
