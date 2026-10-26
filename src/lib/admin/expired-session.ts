import { loginRoute } from './routes';

let redirecting = false;

/**
 * Session expirée (renouvellement refusé) : retour à l'écran de connexion, qui ramène ensuite à la page en cours.
 * Rechargement complet volontaire : le cache des données de la session expirée est abandonné. Plusieurs requêtes
 * refusées en même temps ne déclenchent qu'une navigation.
 */
export function redirectToLogin() {
  if (redirecting) return;
  redirecting = true;
  window.location.assign(loginRoute(`${window.location.pathname}${window.location.search}`));
}
