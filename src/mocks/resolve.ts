import { getResponse } from 'msw';
import { handlers } from './handlers';
import { problem } from './problem';

/** Résout une requête vers l'API avec les gestionnaires MSW (utilisé par le transport du client). */
export async function resolveMockRequest(request: Request): Promise<Response> {
  return (await getResponse(handlers, request)) ?? problem(501, `Requête non simulée : ${request.url}.`);
}
