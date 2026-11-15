import { isApiMocking } from './config';
import { transport, type Transport } from './transport';

/**
 * Appels serveur du site vers l'API (rendus, renouvellement de session) : ils arrivent tous de l'adresse du serveur
 * Next.js et partageraient sinon un seul quota de la limitation de débit de l'API. L'en-tête `x-internal-token` les
 * fait reconnaître ; le jeton est dérivé de `REVALIDATE_SECRET`, déjà partagé par l'API et le site (même calcul dans
 * `mambo-proxi-api/src/common/throttling/internal-request.ts`). Jamais envoyé depuis le navigateur.
 */
const INTERNAL_TOKEN_HEADER = 'x-internal-token';
const INTERNAL_TOKEN_LABEL = 'mambo-proxi:internal-api';

let token: Promise<string | null> | null = null;

async function computeToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(INTERNAL_TOKEN_LABEL));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function internalToken(): Promise<string | null> {
  const secret = process.env.REVALIDATE_SECRET;
  if (typeof window !== 'undefined' || isApiMocking || !secret) return Promise.resolve(null);
  return (token ??= computeToken(secret));
}

/** Transport des appels serveur : ajoute le jeton des appels internes quand le secret est configuré. */
export const serverTransport: Transport = async (request, init) => {
  const value = await internalToken();
  if (value) request.headers.set(INTERNAL_TOKEN_HEADER, value);
  return transport(request, init);
};
