import { http, HttpResponse, type HttpHandler } from 'msw';
import type { AdminService, PublishStatus, ServicePatch } from '@/lib/api/schema';
import { jsonBody, mockId, slugify } from '../admin-utils';
import { adminCategories, adminServices, completenessOf } from '../data/admin-services';
import { problem } from '../problem';

const NOT_FOUND = 'Ce service n’existe pas ou a été supprimé.';

const find = (id: string) => adminServices.find((service) => service.id === id) ?? null;
const findCategory = (idOrSlug: string) =>
  adminCategories.find((category) => category.id === idOrSlug || category.slug === idOrSlug) ?? null;

/** Identifiant de rubrique accepté : identifiant du back-office ou slug (compatibilité). */
const categoryRef = (idOrSlug: string | undefined) => {
  const category = idOrSlug ? findCategory(idOrSlug) : null;
  return category ? { slug: category.slug ?? '', name: category.name ?? '' } : null;
};

const messages = {
  name: 'Indiquez le nom du service.',
  categoryId: 'Choisissez une rubrique.',
  tagline: 'Écrivez une phrase d’accroche (120 caractères au maximum).',
  slug: 'Cette adresse de page est déjà utilisée par un autre service.',
};

/** Contrôles de l'API (nom, rubrique, accroche) pour la création et l'enregistrement. */
function validate(body: ServicePatch, partial: boolean) {
  const errors: { path: string; message: string }[] = [];
  if ((!partial || body.name !== undefined) && !body.name?.trim())
    errors.push({ path: 'name', message: messages.name });
  if ((!partial || body.categoryId !== undefined) && !categoryRef(body.categoryId))
    errors.push({ path: 'categoryId', message: messages.categoryId });
  if ((!partial || body.tagline !== undefined) && !body.tagline?.trim())
    errors.push({ path: 'tagline', message: messages.tagline });
  if ((body.tagline ?? '').length > 120)
    errors.push({ path: 'tagline', message: '120 caractères au maximum.' });
  if ((body.seoTitle ?? '').length > 60)
    errors.push({ path: 'seoTitle', message: '60 caractères au maximum.' });
  if ((body.seoDescription ?? '').length > 160)
    errors.push({ path: 'seoDescription', message: '160 caractères au maximum.' });
  return errors;
}

/** Applique les champs reçus et recalcule la complétude (comme l'API). */
function apply(service: AdminService, body: ServicePatch) {
  const { categoryId, ...fields } = body;
  const category = categoryRef(categoryId);
  Object.assign(service, fields);
  if (category) service.category = category;
  if (fields.slug) service.slug = slugify(fields.slug);
  if (fields.illustration) service.visual = { ...service.visual, illustration: fields.illustration };
  service.path = `/services/${service.category.slug}/${service.slug}`;
  service.completenessDetail = completenessOf(service);
  service.completeness = service.completenessDetail.percent;
  service.toComplete = service.completeness < 100;
  service.updatedAt = new Date().toISOString();
  service.version = String(Number(service.version) + 1);
}

const uniqueSlug = (value: string) => {
  const base = slugify(value) || 'service';
  let slug = base;
  let index = 2;
  while (adminServices.some((service) => service.slug === slug)) slug = `${base}-${index++}`;
  return slug;
};

export const adminServiceHandlers: HttpHandler[] = [
  http.get('*/v1/admin/services', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const category = params.get('category');
    const status = params.get('status') as PublishStatus | null;
    const q = params.get('q')?.toLocaleLowerCase('fr') ?? null;
    const search = (service: AdminService) =>
      !q || `${service.name} ${service.slug} ${service.tagline}`.toLocaleLowerCase('fr').includes(q);
    const scoped = adminServices.filter(
      (service) =>
        (!category || service.category.slug === category) && (!status || service.status === status),
    );
    const countsByCategory = Object.fromEntries(
      adminCategories.map((item) => [
        item.slug,
        adminServices.filter(
          (service) =>
            service.category.slug === item.slug && (!status || service.status === status) && search(service),
        ).length,
      ]),
    );
    const order = new Map(adminCategories.map((item, index) => [item.slug, index]));
    const list = scoped
      .filter(search)
      .sort(
        (a, b) =>
          (order.get(a.category.slug) ?? 0) - (order.get(b.category.slug) ?? 0) || a.sortOrder - b.sortOrder,
      );
    // Le contrat ne pagine pas `GET /v1/admin/services` : toute la liste et les compteurs sont renvoyés.
    return HttpResponse.json({ data: list, countsByCategory });
  }),

  http.post('*/v1/admin/services', async ({ request }) => {
    const body = await jsonBody<ServicePatch>(request);
    const errors = validate(body, false);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const category = categoryRef(body.categoryId)!;
    const slug = uniqueSlug(body.slug || body.name!);
    const now = new Date().toISOString();
    const service = {
      id: mockId('svc'),
      slug,
      name: body.name!.trim(),
      shortName: body.shortName ?? null,
      category,
      status: 'DRAFT',
      showInMenu: false,
      featuredOnHome: false,
      sortOrder: adminServices.length + 1,
      visual: { illustration: body.illustration ?? 'accueil', image: null, alt: '' },
      path: `/services/${category.slug}/${slug}`,
      requests30d: 0,
      completeness: 0,
      toComplete: true,
      isDemo: false,
      updatedAt: now,
      tagline: body.tagline!.trim(),
      summary: body.summary ?? '',
      icon: body.icon ?? 'Sparkles',
      illustration: body.illustration ?? 'accueil',
      coverImage: null,
      galleryImageIds: [],
      cities: body.cities ?? ['Douala'],
      audiences: body.audiences ?? [],
      steps: body.steps ?? [],
      advantages: body.advantages ?? [],
      faq: body.faq ?? [],
      quoteBullets: [],
      offersEyebrow: null,
      offersTitle: null,
      offersLead: null,
      offersLeadMobile: null,
      offers: [],
      relatedServiceIds: [],
      featuredReviewIds: [],
      showWhatsapp: true,
      seoTitle: body.seoTitle ?? `${body.name!.trim()} | MAMBO Proxi`,
      seoDescription: body.seoDescription ?? '',
      publishedAt: null,
      completenessDetail: { percent: 0, criteria: [] },
      version: '1',
    } as AdminService;
    service.completenessDetail = completenessOf(service);
    service.completeness = service.completenessDetail.percent;
    adminServices.push(service);
    return HttpResponse.json(service, { status: 201 });
  }),

  http.patch('*/v1/admin/services/reorder', async ({ request }) => {
    const { ids } = await jsonBody<{ ids?: string[] }>(request);
    if (!ids?.length) return problem(422, 'Aucun service à réordonner.');
    ids.map(find).forEach((service, index) => {
      if (!service) return;
      service.sortOrder = index + 1;
      service.updatedAt = new Date().toISOString();
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/services/:id', ({ params }) => {
    const service = find(String(params.id));
    return service ? HttpResponse.json(service) : problem(404, NOT_FOUND);
  }),

  http.patch('*/v1/admin/services/:id', async ({ request, params }) => {
    const service = find(String(params.id));
    if (!service) return problem(404, NOT_FOUND);
    const body = await jsonBody<ServicePatch>(request);
    const errors = validate(body, true);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    if (
      body.slug &&
      adminServices.some((item) => item.id !== service.id && item.slug === slugify(body.slug!))
    )
      return problem(422, 'Certains champs sont à corriger.', [{ path: 'slug', message: messages.slug }]);
    apply(service, body);
    return HttpResponse.json(service);
  }),

  http.delete('*/v1/admin/services/:id', ({ params }) => {
    const index = adminServices.findIndex((service) => service.id === String(params.id));
    if (index < 0) return problem(404, NOT_FOUND);
    if (adminServices[index]!.status === 'PUBLISHED')
      return problem(409, 'Dépubliez ce service avant de le supprimer.');
    adminServices.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/services/:id/publish', ({ params }) => {
    const service = find(String(params.id));
    if (!service) return problem(404, NOT_FOUND);
    const errors = validate(
      { name: service.name, categoryId: service.category.slug, tagline: service.tagline } as ServicePatch,
      false,
    );
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    service.status = 'PUBLISHED';
    service.publishedAt = new Date().toISOString();
    service.updatedAt = service.publishedAt;
    service.version = String(Number(service.version) + 1);
    return HttpResponse.json(service);
  }),

  http.post('*/v1/admin/services/:id/unpublish', ({ params }) => {
    const service = find(String(params.id));
    if (!service) return problem(404, NOT_FOUND);
    service.status = 'DRAFT';
    service.showInMenu = false;
    service.updatedAt = new Date().toISOString();
    service.version = String(Number(service.version) + 1);
    return HttpResponse.json(service);
  }),

  http.post('*/v1/admin/services/:id/duplicate', ({ params }) => {
    const source = find(String(params.id));
    if (!source) return problem(404, NOT_FOUND);
    const copy: AdminService = structuredClone(source);
    copy.id = mockId('svc');
    copy.name = `${source.name} (copie)`;
    copy.slug = uniqueSlug(`${source.slug}-copie`);
    copy.status = 'DRAFT';
    copy.publishedAt = null;
    copy.showInMenu = false;
    copy.featuredOnHome = false;
    copy.sortOrder = adminServices.length + 1;
    copy.isDemo = false;
    copy.path = `/services/${copy.category.slug}/${copy.slug}`;
    copy.updatedAt = new Date().toISOString();
    copy.version = '1';
    copy.seoTitle = `${copy.name} | MAMBO Proxi`;
    adminServices.push(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),

  http.get('*/v1/admin/services/:id/preview-token', ({ params }) => {
    const service = find(String(params.id));
    if (!service) return problem(404, NOT_FOUND);
    return HttpResponse.json({
      token: `preview_${service.id}`,
      url: `${service.path}?preview=preview_${service.id}`,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    });
  }),

  http.get('*/v1/admin/services/:id/completeness', ({ params }) => {
    const service = find(String(params.id));
    if (!service) return problem(404, NOT_FOUND);
    return HttpResponse.json(service.completenessDetail);
  }),

  http.get('*/v1/admin/categories', () => HttpResponse.json(adminCategories)),

  http.patch('*/v1/admin/categories/reorder', async ({ request }) => {
    const { ids } = await jsonBody<{ ids?: string[] }>(request);
    if (!ids?.length) return problem(422, 'Aucune rubrique à réordonner.');
    ids.forEach((id, index) => {
      const category = findCategory(id);
      if (!category) return;
      category.sortOrder = index + 1;
      category.updatedAt = new Date().toISOString();
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/admin/categories/:id', async ({ request, params }) => {
    const category = findCategory(String(params.id));
    if (!category) return problem(404, 'Cette rubrique n’existe pas.');
    const body = await jsonBody<Partial<{ name: string; tagline: string }>>(request);
    if (body.name !== undefined) {
      if (!body.name.trim()) return problem(422, 'Indiquez le nom de la rubrique.');
      category.name = body.name.trim();
    }
    if (body.tagline !== undefined) category.tagline = body.tagline.trim();
    category.updatedAt = new Date().toISOString();
    return HttpResponse.json(category);
  }),
];
