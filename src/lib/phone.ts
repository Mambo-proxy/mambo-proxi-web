/**
 * Numéro saisi → format E.164 attendu par l'API (`PhoneE164`), ou `null` s'il est invalide.
 * Accepte espaces, points, tirets, parenthèses et le préfixe international `00`.
 * Un numéro français national (`06 12 34 56 78`) est complété en `+33` ; sinon l'indicatif est requis.
 */
export function toE164(value: string): string | null {
  const compact = value.trim().replace(/[\s.\-()]/g, '');
  const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  const normalized = /^0[1-9]\d{8}$/.test(international) ? `+33${international.slice(1)}` : international;
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
