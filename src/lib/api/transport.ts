import { isApiMocking } from './config';

export type Transport = (request: Request, init?: RequestInit) => Promise<Response>;

/**
 * Transport HTTP du client. Avec les mocks activés, la requête est résolue par les gestionnaires MSW
 * (même code côté serveur et navigateur) ; sinon elle part sur le réseau.
 * La condition est remplacée à la compilation : le code des mocks n'est jamais chargé en production.
 */
let mocks: Promise<typeof import('@/mocks/resolve')> | null = null;
const loadMocks = () => (mocks ??= import('@/mocks/resolve'));

// Dans le navigateur, les mocks sont chargés dès l'ouverture de la page plutôt qu'à la première requête : le
// premier envoi d'un formulaire ne dépend pas du téléchargement de ce module.
if (isApiMocking && typeof window !== 'undefined') void loadMocks();

export const transport: Transport = isApiMocking
  ? async (request) => {
      const { resolveMockRequest } = await loadMocks();
      return resolveMockRequest(request);
    }
  : (request, init) => fetch(request, init);
