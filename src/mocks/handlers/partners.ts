import { http, HttpResponse } from 'msw';
import type { AdminPartner, Partner, PartnerCategory } from '@/lib/api/schema';
import { langOf } from '../data/catalogue';

export const PARTNER_LABELS: Record<PartnerCategory, string> = {
  EXPERIENCE: 'Prestataires Expérience',
  IMMOBILIER: 'Immobilier',
  ENTREPRISES: 'Entreprises & prestataires',
};

/** Libellés des catégories servis en anglais (`?lang=en`). */
const LABELS_EN: Record<PartnerCategory, string> = {
  EXPERIENCE: 'Experience providers',
  IMMOBILIER: 'Real estate',
  ENTREPRISES: 'Businesses & providers',
};

/** Les 8 partenaires de la maquette « BO — Partenaires » (`93:22315`) ; DLA Transports y est masqué. */
const SEEDS: [string, PartnerCategory, boolean][] = [
  ['Saveurs de Douala', 'EXPERIENCE', true],
  ['Immo Bonapriso', 'IMMOBILIER', true],
  ['Kribi Évasion', 'ENTREPRISES', true],
  ['Studio Lumière', 'EXPERIENCE', true],
  ['Résidences Akwa', 'IMMOBILIER', true],
  ['DLA Transports', 'ENTREPRISES', false],
  ['Atelier Bamoun', 'EXPERIENCE', true],
  ['Cabinet Ndoumbe', 'IMMOBILIER', true],
];

/**
 * Partenaires du back-office (logos à fournir) : le site lit les partenaires visibles, dans l'ordre enregistré.
 * Ajouter, masquer ou réordonner un logo dans le back-office met donc à jour `GET /v1/partners`.
 */
export const adminPartners: AdminPartner[] = SEEDS.map(([name, category, visible], index) => ({
  id: `prt_${index + 1}`,
  name,
  category,
  categoryLabel: PARTNER_LABELS[category],
  logo: null,
  url: null,
  visible,
  sortOrder: index,
}));

export const sortedPartners = () => [...adminPartners].sort((a, b) => a.sortOrder - b.sortOrder);

const toPartner = ({ id, name, category, categoryLabel, logo, url }: AdminPartner): Partner => ({
  id,
  name,
  category,
  categoryLabel,
  logo,
  url,
});

export const partnerHandlers = [
  http.get('*/v1/partners', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const visible = sortedPartners()
      .filter((partner) => partner.visible)
      .map(toPartner);
    const localized =
      langOf(request) === 'en'
        ? visible.map((partner) => ({ ...partner, categoryLabel: LABELS_EN[partner.category] }))
        : visible;
    return HttpResponse.json(
      category ? localized.filter((partner) => partner.category === category) : localized,
    );
  }),
];
