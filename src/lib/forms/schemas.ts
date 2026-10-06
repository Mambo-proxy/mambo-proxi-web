import { z } from 'zod';
import { toE164 } from '@/lib/phone';

/**
 * Règles de validation communes aux formulaires publics, messages en français prêts à afficher.
 * Elles reprennent les contraintes du contrat (ContactIdentity, Consent) ; l'API reste la référence.
 */
export const fieldRules = {
  fullName: z
    .string()
    .trim()
    .min(2, 'Merci d’indiquer votre nom et votre prénom.')
    .max(120, 'Ce nom est trop long (120 caractères au plus).'),
  email: z.string().trim().email('Merci d’indiquer une adresse e-mail valide.'),
  /** Téléphone saisi librement, converti au format E.164 attendu par l'API. */
  phone: z
    .string()
    .trim()
    .min(1, 'Merci d’indiquer un numéro de téléphone.')
    .transform((value, context) => {
      const phone = toE164(value);
      if (!phone) {
        context.addIssue({
          code: 'custom',
          message: 'Merci d’indiquer un numéro avec l’indicatif du pays (ex. +237…).',
        });
        return z.NEVER;
      }
      return phone;
    }),
  consent: z.literal(true, {
    error: 'Merci d’accepter le traitement de vos données pour envoyer votre demande.',
  }),
};

/** Texte de consentement des formulaires (maquette Contact, apostrophe droite d'origine). */
export const CONSENT_TEXT =
  "J'accepte que Mambo Proxi traite mes données pour répondre à ma demande, conformément à la politique de confidentialité.";
