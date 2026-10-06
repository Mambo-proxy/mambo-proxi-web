import type { Route } from 'next';

/**
 * Liens fixes du gabarit. Les pages correspondantes sont ajoutées en phase 1.3 : la conversion en `Route`
 * évite l'erreur des routes typées tant qu'elles n'existent pas.
 */
export const routes = {
  home: '/' as Route,
  devis: '/devis' as Route,
  inscription: '/inscription' as Route,
  contact: '/contact' as Route,
  rendezVous: '/contact#rendez-vous' as Route,
  cookies: '/cookies' as Route,
} as const;
