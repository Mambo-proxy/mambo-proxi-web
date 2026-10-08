import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  AdminService,
  AdminServiceListItem,
  CategoryFields,
  PreviewToken,
  Problem,
  PublishStatus,
  ReorderInput,
  ServiceFields,
} from '@/lib/api/schema';
import type { Category } from '@/components/admin/services/service-utils';
import { adminMedia } from './admin-media';
import { jsonBody, matches, mockId, slugify } from '../admin-utils';
import { adminCategories, adminServices, withCompleteness } from '../data/admin-services';
import { problem } from '../problem';

type FieldErrors = NonNullable<Problem['errors']>;

const SERVICE_NOT_FOUND = 'Ce service n’existe pas ou a été supprimé.';
const CATEGORY_NOT_FOUND = 'Cette rubrique n’existe pas ou a été supprimée.';

const categoryOrder = (slug: string) =>
  adminCategories.find((category) => category.slug === slug)?.sortOrder ?? Number.MAX_SAFE_INTEGER;

/** Services triés par rubrique (ordre des rubriques) puis par ordre d'affichage. */
const sorted = (list: AdminService[]) =>
  [...list].sort(
    (a, b) => categoryOrder(a.category.slug) - categoryOrder(b.category.slug) || a.sortOrder - b.sortOrder,
  );

function toListItem(service: AdminService): AdminServiceListItem {
  const {
    id,
    slug,
    name,
    category,
    status,
    showInMenu,
    featuredOnHome,
    sortOrder,
    visual,
    path,
    requests30d,
    completeness,
    toComplete,
    isDemo,
    updatedAt,
  } = service;
  return {
    id,
    slug,
    name,
    category,
    status,
    showInMenu,
    featuredOnHome,
    sortOrder,
    visual,
    path,
    requests30d,
    completeness,
    toComplete,
    isDemo,
    updatedAt,
  };
}

const findService = (id: string) => adminServices.find((service) => service.id === id) ?? null;
const findCategory = (id: string) => adminCategories.find((category) => category.id === id) ?? null;
const nextVersion = (version: string) => `v${(Number(version.replace(/\D/g, '')) || 0) + 1}`;

function tooLong(errors: FieldErrors, path: string, value: unknown, max: number, label: string) {
  if (typeof value === 'string' && value.length > max)
    errors.push({ path, code: 'too_long', message: `${label} : ${max} caractères au maximum.` });
}

/** Validation des champs d'un service (création : `required`), messages en français comme l'API. */
function validateService(body: ServiceFields, required: boolean): FieldErrors {
  const errors: FieldErrors = [];
  if (required || body.name !== undefined) {
    if (!body.name?.trim())
      errors.push({ path: 'name', code: 'required', message: 'Indiquez le nom du service.' });
    else if (body.name.trim().length < 2)
      errors.push({ path: 'name', code: 'too_short', message: 'Le nom doit compter au moins 2 caractères.' });
  }
  tooLong(errors, 'name', body.name, 120, 'Nom du service');
  if (required || body.categoryId !== undefined) {
    if (!body.categoryId)
      errors.push({ path: 'categoryId', code: 'required', message: 'Choisissez une rubrique.' });
    else if (!findCategory(body.categoryId))
      errors.push({ path: 'categoryId', code: 'invalid', message: 'Cette rubrique n’existe pas.' });
  }
  if (required && !body.tagline?.trim())
    errors.push({ path: 'tagline', code: 'required', message: 'Écrivez une phrase d’accroche.' });
  tooLong(errors, 'tagline', body.tagline, 120, 'Phrase d’accroche');
  tooLong(errors, 'summary', body.summary, 240, 'Description courte');
  tooLong(errors, 'seoTitle', body.seoTitle, 60, 'Titre pour Google');
  tooLong(errors, 'seoDescription', body.seoDescription, 160, 'Description pour Google');
  if (body.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug))
    errors.push({
      path: 'slug',
      code: 'invalid',
      message: 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement.',
    });
  if ((body.galleryImageIds?.length ?? 0) > 3)
    errors.push({ path: 'galleryImageIds', code: 'too_many', message: '3 visuels au maximum.' });
  if ((body.relatedServiceIds?.length ?? 0) > 6)
    errors.push({ path: 'relatedServiceIds', code: 'too_many', message: '6 services liés au maximum.' });
  if ((body.featuredReviewIds?.length ?? 0) > 6)
    errors.push({ path: 'featuredReviewIds', code: 'too_many', message: '6 témoignages au maximum.' });
  body.steps?.forEach((step, index) =>
    tooLong(errors, `steps.${index}.title`, step.title, 120, `Étape ${index + 1}`),
  );
  body.faq?.forEach((item, index) =>
    tooLong(errors, `faq.${index}.question`, item.question, 200, `Question ${index + 1}`),
  );
  return errors;
}

/** Slug libre dans la rubrique (suffixe `-2`, `-3`… si besoin). */
function uniqueSlug(base: string, categorySlug: string, exceptId?: string) {
  const taken = (slug: string) =>
    adminServices.some(
      (service) => service.slug === slug && service.category.slug === categorySlug && service.id !== exceptId,
    );
  let slug = base || 'service';
  for (let index = 2; taken(slug); index += 1) slug = `${base}-${index}`;
  return slug;
}

const nextSortOrder = (categorySlug: string) =>
  Math.max(
    0,
    ...adminServices
      .filter((service) => service.category.slug === categorySlug)
      .map((service) => service.sortOrder),
  ) + 1;

const mediaImage = (id: string | null | undefined) => {
  const media = id ? adminMedia.find((item) => item.id === id) : null;
  if (!media) return null;
  const { url, width, height, alt, focalPoint, blurDataUrl, variants } = media;
  return { id: media.id, url, width, height, alt, focalPoint, blurDataUrl, variants };
};

/** Applique des champs au service (création ou PATCH) et recalcule les champs dérivés. */
function apply(service: AdminService, body: ServiceFields): AdminService {
  const { categoryId, coverImageId, ...fields } = body;
  const next: AdminService = { ...service };
  for (const [key, value] of Object.entries(fields))
    if (value !== undefined) (next as Record<string, unknown>)[key] = value;
  if (categoryId !== undefined) {
    const category = findCategory(categoryId);
    if (category && category.slug !== service.category.slug) {
      next.category = { slug: category.slug, name: category.name };
      next.sortOrder = nextSortOrder(category.slug);
    }
  }
  if (coverImageId !== undefined) next.coverImage = mediaImage(coverImageId);
  if (body.slug !== undefined || categoryId !== undefined)
    next.slug = uniqueSlug(next.slug, next.category.slug, service.id);
  next.path = `/services/${next.category.slug}/${next.slug}`;
  next.visual = { illustration: next.illustration, image: next.coverImage ?? null, alt: '' };
  next.updatedAt = new Date().toISOString();
  return withCompleteness(next);
}

function replace(service: AdminService) {
  const index = adminServices.findIndex((item) => item.id === service.id);
  if (index >= 0) adminServices[index] = service;
  else adminServices.push(service);
  return service;
}

function withCounts(category: Category): Category {
  return {
    ...category,
    serviceCount: adminServices.filter((service) => service.category.slug === category.slug).length,
  };
}

function validateCategory(body: CategoryFields, required: boolean): FieldErrors {
  const errors: FieldErrors = [];
  const need = (path: keyof CategoryFields, message: string) => {
    if ((required || body[path] !== undefined) && !String(body[path] ?? '').trim())
      errors.push({ path, code: 'required', message });
  };
  need('name', 'Indiquez le nom de la rubrique.');
  need('tagline', 'Écrivez une accroche.');
  need('description', 'Écrivez une description.');
  need('icon', 'Indiquez une icône.');
  need('tint', 'Choisissez une teinte.');
  tooLong(errors, 'name', body.name, 80, 'Nom');
  tooLong(errors, 'tagline', body.tagline, 120, 'Accroche');
  tooLong(errors, 'description', body.description, 600, 'Description');
  tooLong(errors, 'heroLead', body.heroLead, 400, 'Texte d’introduction');
  tooLong(errors, 'seoTitle', body.seoTitle, 60, 'Titre pour Google');
  tooLong(errors, 'seoDescription', body.seoDescription, 160, 'Description pour Google');
  if (body.icon && !/^[A-Z][A-Za-z0-9]*$/.test(body.icon))
    errors.push({
      path: 'icon',
      code: 'invalid',
      message: 'Nom d’icône invalide (ex. « Sparkles », « Building2 »).',
    });
  if (body.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug))
    errors.push({
      path: 'slug',
      code: 'invalid',
      message: 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement.',
    });
  return errors;
}

export const adminServiceHandlers: HttpHandler[] = [
  // ───────────── Services ─────────────
  http.get('*/v1/admin/services', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const category = params.get('category');
    const status = params.get('status') as PublishStatus | null;
    const q = params.get('q');
    const base = adminServices.filter(
      (service) => (!status || service.status === status) && matches(q, service.name, service.path),
    );
    const countsByCategory = Object.fromEntries(
      adminCategories.map((item) => [
        item.slug,
        base.filter((service) => service.category.slug === item.slug).length,
      ]),
    );
    return HttpResponse.json({
      data: sorted(base.filter((service) => !category || service.category.slug === category)).map(toListItem),
      countsByCategory,
    });
  }),

  http.post('*/v1/admin/services', async ({ request }) => {
    const body = await jsonBody<ServiceFields>(request);
    const errors = validateService(body, true);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const category = findCategory(body.categoryId!)!;
    const name = body.name!.trim();
    const draft: AdminService = {
      id: mockId('svc'),
      slug: '',
      name,
      shortName: null,
      category: { slug: category.slug, name: category.name },
      status: 'DRAFT',
      showInMenu: true,
      featuredOnHome: false,
      sortOrder: nextSortOrder(category.slug),
      visual: { illustration: 'accueil', image: null, alt: '' },
      path: '',
      requests30d: 0,
      completeness: 0,
      toComplete: false,
      isDemo: false,
      updatedAt: new Date().toISOString(),
      tagline: '',
      summary: '',
      icon: 'Sparkles',
      illustration: 'accueil',
      coverImage: null,
      galleryImageIds: [],
      cities: [],
      audiences: [],
      steps: [],
      advantages: [],
      faq: [],
      quoteBullets: [],
      relatedServiceIds: [],
      featuredReviewIds: [],
      showWhatsapp: true,
      seoTitle: `${name} | MAMBO Proxi`.slice(0, 60),
      seoDescription: (body.summary || body.tagline || '').slice(0, 160) || null,
      publishedAt: null,
      completenessDetail: { percent: 0, criteria: [] },
      version: 'v1',
    };
    const created = apply(draft, { ...body, slug: slugify(body.slug || name), categoryId: undefined });
    adminServices.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch('*/v1/admin/services/reorder', async ({ request }) => {
    const { scope, ids } = await jsonBody<ReorderInput>(request);
    if (!Array.isArray(ids) || ids.length === 0)
      return problem(422, 'L’ordre envoyé est vide.', [{ path: 'ids', message: 'Ordre manquant.' }]);
    const items = ids.map(findService);
    if (items.some((item) => !item) || (scope && items.some((item) => item!.category.slug !== scope)))
      return problem(422, 'L’ordre envoyé ne correspond pas aux services de la rubrique.', [
        { path: 'ids', message: 'Services inconnus ou d’une autre rubrique.' },
      ]);
    items.forEach((item, index) => {
      item!.sortOrder = index + 1;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/services/:id', ({ params }) => {
    const service = findService(String(params.id));
    return service ? HttpResponse.json(service) : problem(404, SERVICE_NOT_FOUND);
  }),

  http.patch('*/v1/admin/services/:id', async ({ request, params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const ifMatch = request.headers.get('If-Match');
    if (ifMatch && ifMatch !== service.version)
      return problem(
        412,
        'Ce service a été modifié ailleurs entre-temps. Rechargez la page pour voir la dernière version.',
      );
    const body = await jsonBody<ServiceFields>(request);
    if (Object.keys(body).length === 0) return problem(422, 'Aucune modification envoyée.');
    const errors = validateService(body, false);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    if (body.slug !== undefined) body.slug = slugify(body.slug);
    const next = apply(service, body);
    next.version = nextVersion(service.version);
    return HttpResponse.json(replace(next));
  }),

  http.delete('*/v1/admin/services/:id', ({ params }) => {
    const index = adminServices.findIndex((item) => item.id === String(params.id));
    if (index < 0) return problem(404, SERVICE_NOT_FOUND);
    if (adminServices[index]!.status === 'PUBLISHED')
      return problem(409, 'Ce service est publié : dépubliez-le avant de le supprimer.');
    adminServices.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/services/:id/publish', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const errors = validateService(
      { name: service.name, tagline: service.tagline, categoryId: findCategoryId(service) },
      true,
    );
    if (errors.length)
      return problem(422, 'Complétez le nom, la rubrique et la phrase d’accroche avant de publier.', errors);
    const next: AdminService = {
      ...service,
      status: 'PUBLISHED',
      publishedAt: service.publishedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: nextVersion(service.version),
    };
    return HttpResponse.json(replace(next));
  }),

  http.post('*/v1/admin/services/:id/unpublish', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const next: AdminService = {
      ...service,
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
      version: nextVersion(service.version),
    };
    return HttpResponse.json(replace(next));
  }),

  http.post('*/v1/admin/services/:id/duplicate', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const copy: AdminService = withCompleteness({
      ...structuredClone(service),
      id: mockId('svc'),
      name: `${service.name} (copie)`.slice(0, 120),
      slug: uniqueSlug(`${service.slug}-copie`, service.category.slug),
      status: 'DRAFT',
      showInMenu: false,
      featuredOnHome: false,
      sortOrder: nextSortOrder(service.category.slug),
      requests30d: 0,
      isDemo: false,
      publishedAt: null,
      updatedAt: new Date().toISOString(),
      version: 'v1',
    });
    copy.path = `/services/${copy.category.slug}/${copy.slug}`;
    adminServices.push(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),

  http.get('*/v1/admin/services/:id/preview-token', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const token = `preview-${service.id}-${Date.now().toString(36)}`;
    const origin = typeof location === 'undefined' ? 'http://localhost:3000' : location.origin;
    const body: PreviewToken = {
      token,
      url: `${origin}${service.path}?preview=${token}`,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
    return HttpResponse.json(body);
  }),

  http.get('*/v1/admin/services/:id/completeness', ({ params }) => {
    const service = findService(String(params.id));
    return service ? HttpResponse.json(service.completenessDetail) : problem(404, SERVICE_NOT_FOUND);
  }),

  // ───────────── Rubriques ─────────────
  http.get('*/v1/admin/categories', () =>
    HttpResponse.json([...adminCategories].sort((a, b) => a.sortOrder - b.sortOrder).map(withCounts)),
  ),

  http.post('*/v1/admin/categories', async ({ request }) => {
    const body = await jsonBody<CategoryFields>(request);
    const errors = validateCategory(body, true);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const slug = slugify(body.slug || body.name!);
    if (adminCategories.some((category) => category.slug === slug))
      return problem(409, 'Une rubrique utilise déjà cette adresse.', [
        { path: 'slug', message: 'Cette adresse est déjà utilisée par une autre rubrique.' },
      ]);
    const category: Category = {
      heroTitle: body.name!,
      heroLead: body.description!,
      audiences: [],
      processSteps: [],
      groups: [],
      quoteFields: [],
      status: 'DRAFT',
      illustration: 'accueil',
      ...body,
      id: mockId('cat'),
      name: body.name!.trim(),
      slug,
      sortOrder: Math.max(0, ...adminCategories.map((item) => item.sortOrder)) + 1,
      serviceCount: 0,
      updatedAt: new Date().toISOString(),
    };
    adminCategories.push(category);
    return HttpResponse.json(withCounts(category), { status: 201 });
  }),

  http.patch('*/v1/admin/categories/reorder', async ({ request }) => {
    const { ids } = await jsonBody<ReorderInput>(request);
    if (!Array.isArray(ids) || ids.some((id) => !findCategory(id)))
      return problem(422, 'L’ordre envoyé ne correspond pas aux rubriques.');
    ids.forEach((id, index) => {
      findCategory(id)!.sortOrder = index + 1;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/categories/:id', ({ params }) => {
    const category = findCategory(String(params.id));
    return category ? HttpResponse.json(withCounts(category)) : problem(404, CATEGORY_NOT_FOUND);
  }),

  http.patch('*/v1/admin/categories/:id', async ({ request, params }) => {
    const category = findCategory(String(params.id));
    if (!category) return problem(404, CATEGORY_NOT_FOUND);
    const body = await jsonBody<CategoryFields>(request);
    const errors = validateCategory(body, false);
    if (errors.length) return problem(422, 'Certains champs sont à corriger.', errors);
    const previousSlug = category.slug;
    Object.assign(category, body, { updatedAt: new Date().toISOString() });
    if (body.name !== undefined || body.slug !== undefined) {
      // Les services suivent le nouveau nom et la nouvelle adresse de leur rubrique.
      adminServices.forEach((service, index) => {
        if (service.category.slug !== previousSlug) return;
        adminServices[index] = {
          ...service,
          category: { slug: category.slug, name: category.name },
          path: `/services/${category.slug}/${service.slug}`,
        };
      });
    }
    return HttpResponse.json(withCounts(category));
  }),

  http.delete('*/v1/admin/categories/:id', ({ params }) => {
    const index = adminCategories.findIndex((item) => item.id === String(params.id));
    if (index < 0) return problem(404, CATEGORY_NOT_FOUND);
    if (withCounts(adminCategories[index]!).serviceCount > 0)
      return problem(
        409,
        'Cette rubrique contient encore des services : déplacez-les ou supprimez-les d’abord.',
      );
    adminCategories.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

function findCategoryId(service: AdminService) {
  return adminCategories.find((category) => category.slug === service.category.slug)?.id;
}
