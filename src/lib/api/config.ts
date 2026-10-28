/** Mocks MSW activés (développement et tests) : `NEXT_PUBLIC_API_MOCKING=enabled`. */
export const isApiMocking = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

/**
 * Relais same-origin de l'API (`API_RELAY_TARGET`, site et API sur deux domaines différents) : `next.config.ts`
 * réécrit `/v1/*` vers l'API et publie `NEXT_PUBLIC_API_RELAY=enabled` au build. Le navigateur appelle alors les
 * routes à cookies (`/v1/admin`, `/v1/auth`) sur l'origine du site. Sans effet avec les mocks.
 */
export const isApiRelay = !isApiMocking && process.env.NEXT_PUBLIC_API_RELAY === 'enabled';

/**
 * Routes relayées par le site : celles qui ont besoin des cookies de session (`mp_at`, `mp_rt`) ou du jeton CSRF
 * (`mp_csrf`). Les autres (lectures publiques, formulaires, envois de CV, mesure d'audience, médias, fichiers signés)
 * restent des appels directs à l'API : l'API voit l'adresse IP du visiteur et rien ne transite par l'hébergeur.
 */
export function isRelayedRoute(pathname: string): boolean {
  return /^\/v1\/(?:admin|auth)(?:\/|$)/.test(pathname);
}

const DEFAULT_API_URL = 'http://localhost:4000';

/**
 * URL de base de l'API. Côté serveur, `API_INTERNAL_URL` permet de passer par le réseau interne
 * (ex. `http://api:4000` dans Docker) ; le navigateur utilise toujours l'URL publique (routes relayées : voir
 * `isRelayedRoute`, appliqué par `browserApi`).
 */
export function getApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  if (typeof window === 'undefined') return process.env.API_INTERNAL_URL || publicUrl;
  return publicUrl;
}
