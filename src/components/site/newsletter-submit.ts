import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';

export type NewsletterRequest = {
  name: string | null;
  email: string;
  phone: string | null;
  honeypot: string;
  startedAt: string;
  /** Jeton Turnstile obtenu par le formulaire (vide sans clé publique). */
  turnstileToken: string;
};

export type NewsletterResult =
  | { ok: true; alreadySubscribed: boolean; message: string }
  | { ok: false; message: string; field?: 'email' | 'phone' };

/** Envoi de l'inscription (chargé au premier envoi : le client de l'API reste hors du JavaScript initial). */
export async function subscribeToNewsletter(request: NewsletterRequest): Promise<NewsletterResult> {
  try {
    const {
      data: result,
      error,
      response,
    } = await browserApi.POST('/v1/newsletter/subscriptions', {
      body: {
        name: request.name,
        email: request.email,
        phone: request.phone,
        source: 'footer',
        consent: true,
        antiSpam: {
          turnstileToken: request.turnstileToken,
          honeypot: request.honeypot,
          startedAt: request.startedAt,
        },
      },
    });
    if (!response.ok || !result) throw toApiError(error, response);
    return { ok: true, alreadySubscribed: result.alreadySubscribed ?? false, message: result.message };
  } catch (caught) {
    const fields = caught instanceof ApiError ? caught.fieldErrors : {};
    if (fields.email) return { ok: false, field: 'email', message: fields.email };
    if (fields.phone) return { ok: false, field: 'phone', message: fields.phone };
    return { ok: false, message: errorMessage(caught) };
  }
}
