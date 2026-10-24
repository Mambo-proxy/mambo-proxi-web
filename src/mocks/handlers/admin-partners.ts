import { http, HttpResponse } from 'msw';
import type { AdminPartner, MediaImage, PartnerFields } from '@/lib/api/schema';
import { jsonBody, mockId } from '../admin-utils';
import { problem } from '../problem';
import { adminMedia } from './admin-media';
import { adminPartners, PARTNER_LABELS, sortedPartners } from './partners';

const CATEGORIES = Object.keys(PARTNER_LABELS);

function mediaImage(id: string | null | undefined): MediaImage | null {
  const media = id ? adminMedia.find((item) => item.id === id) : null;
  if (!media) return null;
  const { url, width, height, alt, focalPoint, blurDataUrl, variants } = media;
  return { id: media.id, url, width, height, alt, focalPoint, blurDataUrl, variants };
}

function validate(body: PartnerFields) {
  const errors: { path: string; message: string }[] = [];
  if (body.name !== undefined && !body.name.trim())
    errors.push({ path: 'name', message: 'Saisissez le nom du partenaire.' });
  if (body.category !== undefined && !CATEGORIES.includes(body.category))
    errors.push({ path: 'category', message: 'Choisissez une catégorie.' });
  if (body.url && !/^https?:\/\/\S+\.\S+/.test(body.url))
    errors.push({ path: 'url', message: 'Saisissez une adresse commençant par https://.' });
  return errors.length ? problem(422, 'Le partenaire n’a pas pu être enregistré.', errors) : null;
}

/** Applique les champs reçus (création ou PATCH) ; `logoImageId` est résolu dans la médiathèque. */
function apply(partner: AdminPartner, body: PartnerFields) {
  const { logoImageId, name, category, url, visible } = body;
  if (name !== undefined) partner.name = name.trim();
  if (category !== undefined) {
    partner.category = category;
    partner.categoryLabel = PARTNER_LABELS[category];
  }
  if (url !== undefined) partner.url = url || null;
  if (visible !== undefined) partner.visible = visible;
  if (logoImageId !== undefined) partner.logo = mediaImage(logoImageId);
}

/** Back-office — Partenaires (`/v1/admin/partners*`) : logos, catégories, visibilité et ordre d'affichage. */
export const adminPartnerHandlers = [
  http.get('*/v1/admin/partners', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const list = sortedPartners();
    return HttpResponse.json(category ? list.filter((partner) => partner.category === category) : list);
  }),

  http.post('*/v1/admin/partners', async ({ request }) => {
    const body = await jsonBody<PartnerFields>(request);
    const error = validate({ ...body, name: body.name ?? '', category: body.category ?? ('' as never) });
    if (error) return error;
    const partner: AdminPartner = {
      id: mockId('prt'),
      name: '',
      category: body.category!,
      categoryLabel: PARTNER_LABELS[body.category!],
      logo: null,
      url: null,
      visible: true,
      sortOrder: Math.max(-1, ...adminPartners.map((item) => item.sortOrder)) + 1,
    };
    apply(partner, body);
    adminPartners.push(partner);
    return HttpResponse.json(partner, { status: 201 });
  }),

  http.patch('*/v1/admin/partners/reorder', async ({ request }) => {
    const { ids = [] } = await jsonBody<{ ids?: string[] }>(request);
    ids.forEach((id, index) => {
      const partner = adminPartners.find((item) => item.id === id);
      if (partner) partner.sortOrder = index;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/admin/partners/:id', async ({ request, params }) => {
    const partner = adminPartners.find((item) => item.id === params.id);
    if (!partner) return problem(404, 'Ce partenaire n’existe plus.');
    const body = await jsonBody<PartnerFields>(request);
    const error = validate(body);
    if (error) return error;
    apply(partner, body);
    return HttpResponse.json(partner);
  }),

  http.delete('*/v1/admin/partners/:id', ({ params }) => {
    const index = adminPartners.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Ce partenaire n’existe plus.');
    adminPartners.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
