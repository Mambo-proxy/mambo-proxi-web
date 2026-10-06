import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Serveur MSW pour les tests (Vitest) : intercepte `fetch` dans Node avec les mêmes gestionnaires. */
export const server = setupServer(...handlers);
