/** Mocks MSW activés (développement et tests) : `NEXT_PUBLIC_API_MOCKING=enabled`. */
export const isApiMocking = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

const DEFAULT_API_URL = 'http://localhost:4000';

/**
 * URL de base de l'API. Côté serveur, `API_INTERNAL_URL` permet de passer par le réseau interne
 * (ex. `http://api:4000` dans Docker) ; le navigateur utilise toujours l'URL publique.
 */
export function getApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  if (typeof window === 'undefined') return process.env.API_INTERNAL_URL ?? publicUrl;
  return publicUrl;
}
