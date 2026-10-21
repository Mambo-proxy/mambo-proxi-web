import { http, HttpResponse } from 'msw';
import type { Partner } from '@/lib/api/schema';
import { langOf } from '../data/catalogue';

const LABELS = {
  EXPERIENCE: 'Prestataires Expérience',
  IMMOBILIER: 'Immobilier',
  ENTREPRISES: 'Entreprises & prestataires',
} as const;

/** Libellés des catégories servis en anglais (`?lang=en`). */
const LABELS_EN: Record<keyof typeof LABELS, string> = {
  EXPERIENCE: 'Experience providers',
  IMMOBILIER: 'Real estate',
  ENTREPRISES: 'Businesses & providers',
};

/** Partenaires simulés : les 8 tuiles de la maquette Partenaires (logos à fournir). */
const ORDER = [
  'EXPERIENCE',
  'IMMOBILIER',
  'ENTREPRISES',
  'EXPERIENCE',
  'IMMOBILIER',
  'ENTREPRISES',
  'EXPERIENCE',
  'ENTREPRISES',
] as const;

export const partners: Partner[] = ORDER.map((category, index) => ({
  id: `prt_${index + 1}`,
  name: `Logo partenaire ${index + 1}`,
  category,
  categoryLabel: LABELS[category],
  logo: null,
  url: null,
}));

export const partnerHandlers = [
  http.get('*/v1/partners', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const localized =
      langOf(request) === 'en'
        ? partners.map((partner) => ({ ...partner, categoryLabel: LABELS_EN[partner.category] }))
        : partners;
    return HttpResponse.json(
      category ? localized.filter((partner) => partner.category === category) : localized,
    );
  }),
];
