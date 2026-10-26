/**
 * Renouvellement de la session du back-office côté navigateur. Le jeton d'accès (`mp_at`) dure 15 minutes : une
 * requête du back-office qui reçoit `401` déclenche `POST /v1/auth/refresh` (cookie `mp_rt`), puis est rejouée une
 * fois. Plusieurs requêtes refusées en même temps partagent le même renouvellement.
 */

/** Résultat d'un renouvellement : `refreshed` (204, avec ou sans nouveaux cookies), `expired` (401), `failed`. */
export type RefreshOutcome = 'refreshed' | 'expired' | 'failed';

/**
 * Routes authentifiées qui déclenchent le renouvellement : celles du back-office (`/v1/admin`). Jamais les routes
 * `/v1/auth/*` (connexion, code, renouvellement, déconnexion…) : leur `401` a un autre sens et provoquerait une boucle.
 */
export function isRefreshableRoute(url: string): boolean {
  return /\/v1\/admin(?:\/|$)/.test(new URL(url).pathname);
}

export interface SessionRefreshOptions {
  /** Envoi d'une requête (transport du client). */
  send: (request: Request) => Promise<Response>;
  /** Appel de `POST /v1/auth/refresh`. */
  refresh: () => Promise<RefreshOutcome>;
  /** Session définitivement expirée (renouvellement refusé) : retour à l'écran de connexion. */
  onExpired: () => void;
  /** Mise à jour de la copie rejouée (jeton CSRF renouvelé avec la session). */
  prepareReplay?: (request: Request) => Request;
}

/**
 * Enveloppe un transport : sur un `401` d'une route du back-office, renouvelle la session une seule fois (promesse
 * partagée) puis rejoue la requête d'origine une fois. La requête est copiée avant le premier envoi : un corps déjà
 * lu ne se relit pas. Le `401` d'un rejeu est rendu tel quel (pas de boucle).
 */
export function withSessionRefresh(options: SessionRefreshOptions) {
  let pending: Promise<RefreshOutcome> | null = null;
  // Nombre de renouvellements réussis : une requête partie avant le dernier renouvellement est rejouée sans en
  // demander un autre.
  let generation = 0;

  function refreshOnce(): Promise<RefreshOutcome> {
    pending ??= options
      .refresh()
      .catch((): RefreshOutcome => 'failed')
      .then((outcome) => {
        if (outcome === 'refreshed') generation += 1;
        return outcome;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  }

  return async function send(request: Request): Promise<Response> {
    if (!isRefreshableRoute(request.url)) return options.send(request);
    const replay = request.clone();
    const sentAt = generation;
    const response = await options.send(request);
    if (response.status !== 401) return response;

    const outcome = generation !== sentAt ? 'refreshed' : await refreshOnce();
    if (outcome === 'expired') {
      options.onExpired();
      return response;
    }
    if (outcome !== 'refreshed') return response;
    return options.send(options.prepareReplay ? options.prepareReplay(replay) : replay);
  };
}
