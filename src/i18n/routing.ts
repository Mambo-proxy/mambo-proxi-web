import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

/**
 * Site bilingue : français sans préfixe (adresses historiques inchangées), anglais sous `/en` avec des adresses
 * traduites. Les identifiants des rubriques, services et offres (`[rubrique]`, `[service]`, `[slug]`) sont communs aux
 * deux langues. Aucune redirection selon la langue du navigateur : la personne choisit avec le sélecteur FR | EN.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/services': '/services',
    '/services/[rubrique]': '/services/[rubrique]',
    '/services/[rubrique]/[service]': '/services/[rubrique]/[service]',
    '/devis': { fr: '/devis', en: '/free-quote' },
    '/devis/confirmation': { fr: '/devis/confirmation', en: '/free-quote/confirmation' },
    '/contact': '/contact',
    '/inscription': { fr: '/inscription', en: '/sign-up' },
    '/qui-sommes-nous': { fr: '/qui-sommes-nous', en: '/about-us' },
    '/mission': '/mission',
    '/partenaires': { fr: '/partenaires', en: '/partners' },
    '/formation': { fr: '/formation', en: '/training' },
    '/recrutement': { fr: '/recrutement', en: '/careers' },
    '/recrutement/[slug]': { fr: '/recrutement/[slug]', en: '/careers/[slug]' },
    '/avis-clients': { fr: '/avis-clients', en: '/reviews' },
    '/suivi-mambo': { fr: '/suivi-mambo', en: '/mambo-tracking' },
    '/magazine': '/magazine',
    '/zones-d-intervention': { fr: '/zones-d-intervention', en: '/service-areas' },
    // Résultats de la recherche globale : hors du plan du site et non indexée (`noindex`).
    '/recherche': { fr: '/recherche', en: '/search' },
    '/mentions-legales': { fr: '/mentions-legales', en: '/legal-notice' },
    '/confidentialite': { fr: '/confidentialite', en: '/privacy-policy' },
    '/cookies': '/cookies',
    '/cgu': { fr: '/cgu', en: '/terms' },
    '/newsletter/confirmation': '/newsletter/confirmation',
    '/newsletter/desinscription': { fr: '/newsletter/desinscription', en: '/newsletter/unsubscribe' },
    '/rendez-vous/confirmer': { fr: '/rendez-vous/confirmer', en: '/appointment/confirm' },
    '/questionnaire/[token]': { fr: '/questionnaire/[token]', en: '/survey/[token]' },
    '/questionnaire/merci': { fr: '/questionnaire/merci', en: '/survey/thank-you' },
    '/maintenance': '/maintenance',
  },
});

export type AppPathname = keyof typeof routing.pathnames;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
