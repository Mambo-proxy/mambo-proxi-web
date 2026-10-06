import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@/mocks/node';

// Toute requête non simulée fait échouer le test : aucun appel réseau réel pendant les tests.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
