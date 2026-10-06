import { isApiMocking } from './config';

export type Transport = (request: Request, init?: RequestInit) => Promise<Response>;

/**
 * Transport HTTP du client. Avec les mocks activés, la requête est résolue par les gestionnaires MSW
 * (même code côté serveur et navigateur) ; sinon elle part sur le réseau.
 * La condition est remplacée à la compilation : le code des mocks n'est jamais chargé en production.
 */
export const transport: Transport = isApiMocking
  ? async (request) => {
      const { resolveMockRequest } = await import('@/mocks/resolve');
      return resolveMockRequest(request);
    }
  : (request, init) => fetch(request, init);
