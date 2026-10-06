/**
 * Lien WhatsApp `https://wa.me/<numéro>?text=<message>`.
 * Le numéro vient des Paramètres (format E.164, ex. `+237699000000`) ; le message pré-rempli est complété
 * selon le contexte (nom du service, référence de la demande) — docs/05, `SiteSettings.whatsapp`.
 */
export function whatsappUrl(number: string, message?: string, context?: string): string {
  const digits = number.replace(/\D/g, '');
  const text = [message?.trim(), context?.trim()].filter(Boolean).join(' ');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}
