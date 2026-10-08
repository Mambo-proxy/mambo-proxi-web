/**
 * Script en ligne du gabarit racine : pose la classe `js` avant l'affichage (les états initiaux des animations
 * n'existent qu'avec JavaScript). Son empreinte SHA-256 l'autorise dans la CSP stricte du back-office.
 */
export const JS_CLASS_SCRIPT = "document.documentElement.classList.add('js')";

/** Empreinte CSP (`sha256-…`) d'un script en ligne. */
export async function cspHash(script: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(script));
  return `sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`;
}
