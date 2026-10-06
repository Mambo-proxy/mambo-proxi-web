const NBSP = '\u00A0';
const NARROW_NBSP = '\u202F';

/**
 * Typographie française à l'affichage, sans changer les mots (les maquettes ont des espaces ordinaires) :
 * - espace fine insécable avant `; ! ?` et avant `%` ;
 * - espace insécable avant `:` et à l'intérieur des guillemets « » ;
 * - espace insécable entre un nombre et son unité (« 24 h », « 5 Mo », « 30 jours »…).
 * Seules les espaces existantes sont remplacées : aucune espace n'est ajoutée.
 */
export function frenchTypography(text: string): string {
  return text
    .replace(/[ \u00A0\u202F]+([;!?])/g, `${NARROW_NBSP}$1`)
    .replace(/(\d)[ \u00A0\u202F]+%/g, `$1${NARROW_NBSP}%`)
    .replace(/[ \u00A0\u202F]+:/g, `${NBSP}:`)
    .replace(/«[ \u00A0\u202F]+/g, `«${NBSP}`)
    .replace(/[ \u00A0\u202F]+»/g, `${NBSP}»`)
    .replace(
      /(\d)[ \u00A0\u202F]+(h|min|j|km|cm|kg|Mo|Ko|Go|€|FCFA|XAF|ans?|jours?|mois|semaines?|heures?|minutes?|places?|personnes?)(?=$|[^\p{L}\d])/gu,
      `$1${NBSP}$2`,
    );
}
