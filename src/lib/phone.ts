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

/** Indicatifs les plus fréquents (France, Cameroun, Belgique, Suisse…), du plus long au plus court. */
const COUNTRY_CODES = ['237', '225', '221', '241', '33', '32', '41', '44', '49', '1'];

/**
 * Numéro E.164 → affichage lisible : « +33 6 12 34 56 78 », « +237 6 99 12 34 56 ».
 * Indicatif reconnu puis chiffres groupés par deux (premier chiffre isolé s'ils sont en nombre impair).
 */
export function formatPhone(value: string): string {
  if (!value.startsWith('+')) return value;
  const digits = value.slice(1);
  const code = COUNTRY_CODES.find((prefix) => digits.startsWith(prefix));
  if (!code) return value;
  const rest = digits.slice(code.length);
  const head = rest.length % 2 === 1 ? rest.slice(0, 1) : '';
  const pairs = rest.slice(head.length).match(/\d{2}/g) ?? [];
  return ['+' + code, head, ...pairs].filter(Boolean).join(' ');
}
