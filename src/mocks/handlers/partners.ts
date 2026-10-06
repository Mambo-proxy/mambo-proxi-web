import { http, HttpResponse } from 'msw';
import type { Partner } from '@/lib/api/schema';

const LABELS = {
  EXPERIENCE: 'Prestataires Expérience',
  IMMOBILIER: 'Immobilier',
  ENTREPRISES: 'Entreprises & prestataires',
} as const;

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
    return HttpResponse.json(
      category ? partners.filter((partner) => partner.category === category) : partners,
    );
  }),
];
