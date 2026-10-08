import { getResponse } from 'msw';
import { handlers } from './handlers';
import { problem } from './problem';
import { MOCK_COOKIE_HEADER, MOCK_SET_COOKIE_HEADER } from './session';

/**
 * Dans le navigateur, une requête construite en JavaScript ne porte pas les cookies (et l'en-tête `cookie` y est
 * interdit) : ceux du document sont recopiés dans `x-mock-cookie` pour que les gestionnaires simulés voient la
 * session, et les cookies décrits par la réponse simulée sont déposés dans le document.
 */
function withDocumentCookies(request: Request): Request {
  if (typeof document === 'undefined' || !document.cookie) return request;
  const headers = new Headers(request.headers);
  headers.set(MOCK_COOKIE_HEADER, document.cookie);
  return new Request(request, { headers });
}

function applyMockCookies(response: Response) {
  const cookies = response.headers.get(MOCK_SET_COOKIE_HEADER);
  if (!cookies || typeof document === 'undefined') return;
  for (const cookie of JSON.parse(cookies) as string[]) document.cookie = cookie;
}

/** Résout une requête vers l'API avec les gestionnaires MSW (utilisé par le transport du client). */
export async function resolveMockRequest(request: Request): Promise<Response> {
  const response =
    (await getResponse(handlers, withDocumentCookies(request))) ??
    problem(501, `Requête non simulée : ${request.url}.`);
  applyMockCookies(response);
  return response;
}
