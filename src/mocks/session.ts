import { HttpResponse } from 'msw';
import type { CurrentUser } from '@/lib/api/schema';
import { problem } from './problem';

/**
 * Session simulée du back-office. L'API réelle dépose des cookies `httpOnly` ; une réponse simulée ne peut pas en
 * déposer : elle les décrit dans l'en-tête `x-mock-set-cookie`, appliqué au navigateur par `resolveMockRequest`.
 */
export const MOCK_SESSION_COOKIE = 'mp_at';
export const MOCK_TRUSTED_DEVICE_COOKIE = 'mp_td';
export const MOCK_SET_COOKIE_HEADER = 'x-mock-set-cookie';
export const MOCK_COOKIE_HEADER = 'x-mock-cookie';

export const mockUsers: CurrentUser[] = [
  {
    id: 'usr_mireille',
    email: 'mireille@mamboproxi.com',
    name: 'Mireille Bell',
    firstName: 'Mireille',
    initials: 'MB',
    role: 'ADMIN',
    lastLoginAt: '2026-10-05T07:58:00.000Z',
  },
  {
    id: 'usr_equipe',
    email: 'equipe.douala@mamboproxi.com',
    name: 'Équipe Douala',
    firstName: 'Équipe',
    initials: 'ED',
    role: 'EDITOR',
    lastLoginAt: '2026-10-04T16:20:00.000Z',
  },
];

export function readCookie(request: Request, name: string): string | null {
  const prefix = `${name}=`;
  const header = request.headers.get('cookie') || request.headers.get(MOCK_COOKIE_HEADER) || '';
  const entry = header.split(/;\s*/).find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/** Utilisateur de la session simulée (cookie `mp_at=<id>`), ou `null`. */
export function sessionUser(request: Request): CurrentUser | null {
  const id = readCookie(request, MOCK_SESSION_COOKIE);
  return mockUsers.find((user) => user.id === id) ?? null;
}

/** Réponse 401 si la requête n'a pas de session simulée. */
export function requireSession(request: Request) {
  return sessionUser(request) ? null : problem(401, 'Votre session a expiré. Merci de vous reconnecter.');
}

/** Cookies de session à déposer (format `document.cookie`). */
export function sessionCookies(user: CurrentUser, rememberMe: boolean, trustDevice = false): string[] {
  const maxAge = rememberMe ? '; max-age=2592000' : '';
  return [
    `${MOCK_SESSION_COOKIE}=${user.id}; path=/; samesite=lax${maxAge}`,
    `mp_csrf=mock-csrf-token; path=/; samesite=lax${maxAge}`,
    ...(trustDevice
      ? [`${MOCK_TRUSTED_DEVICE_COOKIE}=${user.id}; path=/; samesite=lax; max-age=2592000`]
      : []),
  ];
}

export const clearedSessionCookies = [
  `${MOCK_SESSION_COOKIE}=; path=/; max-age=0`,
  'mp_csrf=; path=/; max-age=0',
];

/** Réponse JSON accompagnée des cookies simulés. */
export function withCookies(body: unknown, cookies: string[], init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set(MOCK_SET_COOKIE_HEADER, JSON.stringify(cookies));
  return body === null
    ? new HttpResponse(null, { ...init, headers })
    : HttpResponse.json(body, { ...init, headers });
}
