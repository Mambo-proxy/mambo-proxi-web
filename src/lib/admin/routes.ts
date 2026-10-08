import type { Route } from 'next';

/** Adresses du back-office (les écrans sont ajoutés au fil de la phase 1.4 : conversion en `Route`). */
export const adminRoutes = {
  dashboard: '/admin' as Route,
  login: '/admin/connexion' as Route,
  forgotPassword: '/admin/mot-de-passe-oublie' as Route,
  requests: '/admin/demandes' as Route,
  appointments: '/admin/rendez-vous' as Route,
  services: '/admin/services' as Route,
  newService: '/admin/services/nouveau' as Route,
  pages: '/admin/pages' as Route,
  reviews: '/admin/avis' as Route,
  partners: '/admin/partenaires' as Route,
  trainings: '/admin/formations' as Route,
  jobs: '/admin/recrutement' as Route,
  events: '/admin/agenda' as Route,
  contacts: '/admin/contacts' as Route,
  newsletter: '/admin/newsletter' as Route,
  settings: '/admin/parametres' as Route,
  users: '/admin/utilisateurs' as Route,
  media: '/admin/mediatheque' as Route,
  activity: '/admin/journal' as Route,
} as const;

/**
 * Page de retour après connexion (`?suite=`) : uniquement une adresse du back-office, jamais une adresse externe
 * (`//exemple.com`) ni l'écran de connexion lui-même.
 */
export function safeNextPath(value: string | null | undefined): Route {
  if (!value || !value.startsWith('/admin') || value.startsWith('//') || value.startsWith('/admin/connexion'))
    return adminRoutes.dashboard;
  return value as Route;
}
