import type { Problem } from './schema';

const FALLBACK_MESSAGE = 'Une erreur est survenue. Merci de réessayer dans quelques instants.';

/** Erreur renvoyée par l'API (RFC 9457), avec les messages en français prêts à afficher. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: Problem;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.status = problem.status;
    this.problem = problem;
  }

  /** Erreurs de validation indexées par chemin de champ (`contact.email` → message). */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries((this.problem.errors ?? []).map((error) => [error.path, error.message]));
  }
}

export function isProblem(value: unknown): value is Problem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Problem).title === 'string' &&
    typeof (value as Problem).status === 'number'
  );
}

/** Convertit l'erreur d'une réponse (corps éventuellement vide ou non conforme) en `ApiError`. */
export function toApiError(error: unknown, response: Response): ApiError {
  if (isProblem(error)) return new ApiError(error);
  return new ApiError({
    type: 'about:blank',
    title: response.statusText || 'Erreur',
    status: response.status,
    detail: FALLBACK_MESSAGE,
  });
}

/** Message à afficher pour n'importe quelle erreur (réseau compris). */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.problem.detail ?? error.problem.title;
  return FALLBACK_MESSAGE;
}
