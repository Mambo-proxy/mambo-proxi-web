import type { MetadataRoute } from 'next';
import { absoluteUrl, isIndexable } from '@/lib/seo/site';

/** Pages sans intérêt pour les moteurs : back-office, liens personnels des e-mails, confirmations. */
const PRIVATE_PATHS = [
  '/admin',
  '/questionnaire',
  '/newsletter',
  '/rendez-vous',
  '/devis/confirmation',
  '/maintenance',
  '/dev',
  '/api',
];

/** `robots.txt` : tout est bloqué hors production (`SITE_ENV`). */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
