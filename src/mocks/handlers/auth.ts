import { http, HttpResponse } from 'msw';
import type { LoginInput, LoginResult } from '@/lib/api/schema';
import { problem } from '../problem';
import {
  MOCK_TRUSTED_DEVICE_COOKIE,
  clearedSessionCookies,
  mockUsers,
  readCookie,
  sessionCookies,
  sessionUser,
  withCookies,
} from '../session';
import { MOCK_FAILURE_EMAIL } from './forms';

/** Code à 6 chiffres accepté par la simulation. */
export const MOCK_OTP_CODE = '123456';
/** Mots de passe simulant les refus de l'API. */
export const MOCK_WRONG_PASSWORD = 'mauvais';
export const MOCK_LOCKED_PASSWORD = 'verrouille';
/** Jetons simulant un lien expiré (réinitialisation, invitation). */
export const MOCK_EXPIRED_TOKEN = 'expire';

type Challenge = { userId: string; rememberMe: boolean; attempts: number };
const challenges = new Map<string, Challenge>();
let challengeSequence = 0;

const resendAt = () => new Date(Date.now() + 60_000).toISOString();

function hint(email: string) {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 1)}•••••@${domain}`;
}

export const authHandlers = [
  http.post('*/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginInput;
    if (body.email === MOCK_FAILURE_EMAIL)
      return problem(500, 'Une erreur est survenue. Merci de réessayer.');
    if (body.password === MOCK_LOCKED_PASSWORD)
      return problem(
        423,
        'Trop de tentatives. Réessayez dans 15 minutes ou réinitialisez votre mot de passe.',
      );
    const user = mockUsers.find((item) => item.email === body.email.toLowerCase());
    if (!user || body.password === MOCK_WRONG_PASSWORD)
      return problem(401, 'L’adresse e-mail ou le mot de passe est incorrect.');

    // Appareil de confiance : session ouverte sans code.
    if (readCookie(request, MOCK_TRUSTED_DEVICE_COOKIE) === user.id) {
      const result: LoginResult = { status: 'AUTHENTICATED', user };
      return withCookies(result, sessionCookies(user, body.rememberMe ?? false));
    }
    challengeSequence += 1;
    const challengeId = `chl_${challengeSequence}`;
    challenges.set(challengeId, { userId: user.id, rememberMe: body.rememberMe ?? false, attempts: 0 });
    const result: LoginResult = {
      status: 'OTP_REQUIRED',
      challengeId,
      emailHint: hint(user.email),
      resendAvailableAt: resendAt(),
    };
    return HttpResponse.json(result, { status: 202 });
  }),

  http.post('*/v1/auth/verify-otp', async ({ request }) => {
    const body = (await request.json()) as { challengeId: string; code: string; trustDevice?: boolean };
    const challenge = challenges.get(body.challengeId);
    if (!challenge) return problem(401, 'Ce code a expiré. Reconnectez-vous pour en recevoir un nouveau.');
    if (body.code !== MOCK_OTP_CODE) {
      challenge.attempts += 1;
      const left = 5 - challenge.attempts;
      if (left <= 0) {
        challenges.delete(body.challengeId);
        return problem(401, 'Trop d’essais. Reconnectez-vous pour recevoir un nouveau code.');
      }
      return problem(401, `Ce code est incorrect. Il vous reste ${left} essai${left > 1 ? 's' : ''}.`);
    }
    challenges.delete(body.challengeId);
    const user = mockUsers.find((item) => item.id === challenge.userId) ?? mockUsers[0]!;
    const result: LoginResult = { status: 'AUTHENTICATED', user };
    return withCookies(result, sessionCookies(user, challenge.rememberMe, body.trustDevice ?? false));
  }),

  http.post('*/v1/auth/resend-otp', async ({ request }) => {
    const body = (await request.json()) as { challengeId: string };
    const challenge = challenges.get(body.challengeId);
    if (!challenge) return problem(401, 'Ce code a expiré. Reconnectez-vous pour en recevoir un nouveau.');
    const user = mockUsers.find((item) => item.id === challenge.userId) ?? mockUsers[0]!;
    const result: LoginResult = {
      status: 'OTP_REQUIRED',
      challengeId: body.challengeId,
      emailHint: hint(user.email),
      resendAvailableAt: resendAt(),
    };
    return HttpResponse.json(result, { status: 202 });
  }),

  http.get('*/v1/auth/me', ({ request }) => {
    const user = sessionUser(request);
    return user
      ? HttpResponse.json(user)
      : problem(401, 'Votre session a expiré. Merci de vous reconnecter.');
  }),

  http.post('*/v1/auth/logout', () => withCookies(null, clearedSessionCookies, { status: 204 })),

  http.post('*/v1/auth/refresh', ({ request }) =>
    sessionUser(request)
      ? new HttpResponse(null, { status: 204 })
      : problem(401, 'Votre session a expiré. Merci de vous reconnecter.'),
  ),

  http.post('*/v1/auth/forgot-password', () =>
    HttpResponse.json(
      {
        message: 'Si un compte correspond à cette adresse, vous allez recevoir un lien de réinitialisation.',
      },
      { status: 202 },
    ),
  ),

  ...['reset-password', 'accept-invite'].map((path) =>
    http.post(`*/v1/auth/${path}`, async ({ request }) => {
      const body = (await request.json()) as { token: string; password: string };
      if (body.token === MOCK_EXPIRED_TOKEN)
        return problem(
          410,
          path === 'reset-password'
            ? 'Ce lien a expiré. Demandez un nouveau lien de réinitialisation.'
            : 'Cette invitation a expiré. Demandez à un administrateur de vous inviter à nouveau.',
        );
      if (body.password.length < 12)
        return problem(422, 'Le mot de passe est trop court.', [
          { path: 'password', message: '12 caractères minimum.' },
        ]);
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];
