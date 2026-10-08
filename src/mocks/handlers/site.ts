import { http, HttpResponse } from 'msw';
import type { SitemapEntry } from '@/lib/api/schema';
import { categories, services } from '../data/catalogue';
import { jobs } from './jobs';

const UPDATED_AT = '2026-10-05T08:00:00.000Z';

const STATIC_PAGES: [path: string, priority: number, changeFrequency: SitemapEntry['changeFrequency']][] = [
  ['/', 1, 'weekly'],
  ['/services', 0.9, 'weekly'],
  ['/devis', 0.9, 'monthly'],
  ['/contact', 0.8, 'monthly'],
  ['/avis-clients', 0.7, 'weekly'],
  ['/qui-sommes-nous', 0.6, 'monthly'],
  ['/mission', 0.6, 'monthly'],
  ['/partenaires', 0.6, 'monthly'],
  ['/formation', 0.6, 'monthly'],
  ['/recrutement', 0.6, 'weekly'],
  ['/inscription', 0.5, 'monthly'],
  ['/suivi-mambo', 0.4, 'monthly'],
  ['/mentions-legales', 0.2, 'yearly'],
  ['/confidentialite', 0.2, 'yearly'],
  ['/cookies', 0.2, 'yearly'],
  ['/cgu', 0.2, 'yearly'],
];

/** Plan du site simulé : pages fixes, rubriques, services et offres publiés. */
const sitemap: SitemapEntry[] = [
  ...STATIC_PAGES.map(([path, priority, changeFrequency]) => ({
    path,
    priority,
    changeFrequency,
    lastModified: UPDATED_AT,
  })),
  ...categories.map((category) => ({
    path: category.href,
    lastModified: UPDATED_AT,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })),
  ...services.map((service) => ({
    path: service.href,
    lastModified: UPDATED_AT,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })),
  ...jobs.map((job) => ({
    path: `/recrutement/${job.slug}`,
    lastModified: job.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  })),
];

export const siteHandlers = [http.get('*/v1/sitemap', () => HttpResponse.json(sitemap))];
