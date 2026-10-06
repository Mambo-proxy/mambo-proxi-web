/**
 * Étiquettes de cache Next.js. L'API appelle `POST /api/revalidate` avec ces mêmes étiquettes
 * à chaque publication depuis le back-office (docs/05 §3.4).
 */
export const cacheTags = {
  settings: 'settings',
  navigation: 'navigation',
  redirects: 'redirects',
  sitemap: 'sitemap',
  categories: 'categories',
  services: 'services',
  reviews: 'reviews',
  partners: 'partners',
  trainings: 'trainings',
  jobs: 'jobs',
  events: 'events',
  page: (key: string) => `page:${key}`,
  category: (slug: string) => `category:${slug}`,
  service: (slug: string) => `service:${slug}`,
  job: (slug: string) => `job:${slug}`,
} as const;
