import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import * as z from 'zod/mini';
import { toE164 } from '@/lib/phone';

/**
 * Texte saisi sans les espaces de début et de fin, puis contrôlé (`z.minLength`, `z.maxLength`…). Les formulaires
 * publics utilisent `zod/mini` (une dizaine de Ko au lieu de ~85 Ko pour `zod`) : règles passées à `.check()`.
 */
export const trimmed = (...checks: Parameters<z.ZodMiniString['check']>) =>
  z.string().check(z.trim(), ...checks);

/** Messages des règles communes, dans la langue de la page (`forms.common` de `messages/<langue>.json`). */
export type FieldRuleMessages = {
  fullNameRequired: string;
  fullNameTooLong: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneFormat: string;
  consentRequired: string;
};

/** Numéro converti au format E.164 ; erreur « indicatif du pays » s'il ne peut pas l'être. */
function toE164OrIssue(value: string, issues: z.core.$ZodRawIssue[], message: string): string {
  const phone = toE164(value);
  if (phone) return phone;
  issues.push({ code: 'custom', message, input: value });
  return z.NEVER;
}

/**
 * Règles de validation communes aux formulaires publics, messages prêts à afficher dans la langue de la page.
 * Elles reprennent les contraintes du contrat (ContactIdentity, Consent) ; l'API reste la référence.
 */
export function createFieldRules(messages: FieldRuleMessages) {
  return {
    fullName: trimmed(z.minLength(2, messages.fullNameRequired), z.maxLength(120, messages.fullNameTooLong)),
    email: z.pipe(trimmed(), z.email(messages.emailInvalid)),
    /** Téléphone saisi librement, converti au format E.164 attendu par l'API. */
    phone: z.pipe(
      trimmed(z.minLength(1, messages.phoneRequired)),
      z.transform((value: string, context) => toE164OrIssue(value, context.issues, messages.phoneFormat)),
    ),
    /** Téléphone facultatif (Contact) : vide → `null`, sinon converti en E.164. */
    optionalPhone: z.pipe(
      trimmed(),
      z.transform((value: string, context) =>
        value ? toE164OrIssue(value, context.issues, messages.phoneFormat) : null,
      ),
    ),
    consent: z.literal(true, { error: messages.consentRequired }),
  };
}

export type FieldRules = ReturnType<typeof createFieldRules>;

/**
 * Règles communes et textes partagés des formulaires publics dans la langue de la page : à appeler dans le composant,
 * puis construire le schéma du formulaire avec `useMemo` (`makeSchema(rules, t)`).
 */
export function useFormCommon() {
  const t = useTranslations('forms.common');
  const rules = useMemo(
    () =>
      createFieldRules({
        fullNameRequired: t('fullNameRequired'),
        fullNameTooLong: t('fullNameTooLong'),
        emailInvalid: t('emailInvalid'),
        phoneRequired: t('phoneRequired'),
        phoneFormat: t('phoneFormat'),
        consentRequired: t('consentRequired'),
      }),
    [t],
  );
  return { rules, t };
}
