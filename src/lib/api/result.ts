import { toApiError } from './errors';

type FetchResult<T> = { data?: T; error?: unknown; response: Response };

/** Renvoie les données d'une réponse réussie, ou lève une `ApiError`. */
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (!response.ok) throw toApiError(error, response);
  return data as T;
}

/** Comme `unwrap`, mais renvoie `null` sur un 404 (la page appelle alors `notFound()`). */
export async function unwrapOrNull<T>(request: Promise<FetchResult<T>>): Promise<T | null> {
  const { data, error, response } = await request;
  if (response.status === 404) return null;
  if (!response.ok) throw toApiError(error, response);
  return data as T;
}
