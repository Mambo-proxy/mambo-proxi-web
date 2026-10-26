import { getApiBaseUrl, isApiMocking } from '@/lib/api/config';
import { transport } from '@/lib/api/transport';

/**
 * Renouvellement de la session au chargement d'un écran du back-office (proxy). Le cookie `mp_at` expire avec le
 * jeton d'accès (15 min) : s'il manque alors que `mp_rt` est présent, le proxy appelle `POST /v1/auth/refresh` avec
 * ce seul cookie, transmet les nouveaux cookies au navigateur et à la page rendue (Server Components, qui ne peuvent
 * pas déposer de cookies). Plusieurs chargements simultanés (préchargements) partagent le même renouvellement.
 */

export type SessionRenewal =
  { kind: 'renewed'; cookies: string[] } | { kind: 'expired'; cookies: string[] } | { kind: 'failed' };

/** Jeton remplacé il y a moins de 10 s : l'API répond 204 sans cookies ; le résultat est donc gardé 10 s. */
const REUSE_WINDOW_MS = 10_000;
const REFRESH_TIMEOUT_MS = 5000;
/** Cookies décrits par une réponse simulée (`src/mocks/session.ts`, non importé ici : jamais livré en production). */
const MOCK_SET_COOKIE_HEADER = 'x-mock-set-cookie';

const renewals = new Map<string, { result: Promise<SessionRenewal>; expiresAt: number }>();

/** Oublie les renouvellements mémorisés (tests). */
export function resetSessionRenewals() {
  renewals.clear();
}

function setCookiesOf(response: Response): string[] {
  const cookies = response.headers.getSetCookie();
  const mocked = isApiMocking ? response.headers.get(MOCK_SET_COOKIE_HEADER) : null;
  return mocked ? [...cookies, ...(JSON.parse(mocked) as string[])] : cookies;
}

async function callRefresh(refreshToken: string, userAgent: string | null): Promise<SessionRenewal> {
  const headers = new Headers({ cookie: `mp_rt=${encodeURIComponent(refreshToken)}` });
  // Appareil de la session renouvelée : celui du navigateur, pas le serveur du site.
  if (userAgent) headers.set('user-agent', userAgent);
  try {
    const response = await transport(
      new Request(`${getApiBaseUrl()}/v1/auth/refresh`, { method: 'POST', headers }),
      { cache: 'no-store', signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS) },
    );
    if (response.ok) return { kind: 'renewed', cookies: setCookiesOf(response) };
    if (response.status === 401) return { kind: 'expired', cookies: setCookiesOf(response) };
    return { kind: 'failed' };
  } catch {
    return { kind: 'failed' };
  }
}

/** Renouvelle la session désignée par `refreshToken` (une seule fois pour des appels simultanés). */
export function renewSession(refreshToken: string, userAgent: string | null): Promise<SessionRenewal> {
  const now = Date.now();
  for (const [token, entry] of renewals) if (entry.expiresAt <= now) renewals.delete(token);
  const known = renewals.get(refreshToken);
  if (known) return known.result;

  const result = callRefresh(refreshToken, userAgent).then((renewal) => {
    // Échec passager (API injoignable) : pas mémorisé, le prochain chargement réessaie.
    if (renewal.kind === 'failed') renewals.delete(refreshToken);
    return renewal;
  });
  renewals.set(refreshToken, { result, expiresAt: now + REUSE_WINDOW_MS });
  return result;
}

/**
 * En-tête `cookie` de la requête transmise à la page, mis à jour avec les cookies déposés (`Set-Cookie`) : valeur
 * vide ou `max-age=0` → cookie retiré.
 */
export function mergeCookieHeader(header: string | null, setCookies: string[]): string {
  const jar = new Map<string, string>();
  for (const pair of (header ?? '').split(/;\s*/)) {
    const index = pair.indexOf('=');
    if (index > 0) jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
  for (const setCookie of setCookies) {
    const [pair = '', ...attributes] = setCookie.split(/;\s*/);
    const index = pair.indexOf('=');
    if (index <= 0) continue;
    const name = pair.slice(0, index);
    const value = pair.slice(index + 1);
    const removed =
      value === '' ||
      attributes.some((attribute) => /^max-age=0$/i.test(attribute) || /^expires=.*1970/i.test(attribute));
    if (removed) jar.delete(name);
    else jar.set(name, value);
  }
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
}
