import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  AdminService,
  AdminServiceListItem,
  CategoryFields,
  PreviewToken,
  PublishStatus,
  ReorderInput,
  ServiceFields,
} from '@/lib/api/schema';
import type { Category } from '@/components/admin/services/service-utils';
import { adminMedia } from './admin-media';
import { jsonBody, matches, mockId, slugify, uniqueSlug } from '../admin-utils';
import {
  PREVIEW_TOKEN_TTL_MS,
  SLUG_PATTERN,
  nothingSent,
  parseIfMatch,
  previewUrl,
  reorderInputErrors,
  slugErrors,
  tooLong,
  tooMany,
  uniqueIds,
} from '../content-rules';
import { adminCategories, adminServices, withCompleteness } from '../data/admin-services';
import { adminReviews } from '../data/admin-reviews';
import { unknownMediaErrors, type MediaReference } from '../media-refs';
import { invalidQuery, problem, validationProblem, type FieldErrors } from '../problem';

/**
 * Back-office — Services et rubriques (`/v1/admin/services*`, `/v1/admin/categories*`), mêmes règles que l'API
 * (`src/modules/catalog/admin-*`) : slugs uniques (tirés du nom et suffixés `-2`, `-3`…, ou 409 pour un slug choisi
 * déjà pris), verrouillage optimiste `If-Match` (412), références contrôlées (rubrique, images de la médiathèque,
 * services liés, avis publiés), ordre complet et sans doublon. Les redirections 301 créées par l'API au changement
 * d'adresse d'un contenu publié ne sont pas simulées (les mocks ne servent pas de redirections).
 */

const SERVICE_NOT_FOUND = 'Ce service n’existe pas ou a été supprimé.';
const CATEGORY_NOT_FOUND = 'Cette rubrique n’existe pas ou a été supprimée.';
const SITE_NAME_SUFFIX = ' | MAMBO Proxi';
const TINTS = ['orange-50', 'neutral-100', 'vert-50', 'neutral-900'];
const STATUSES: PublishStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const ICON_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const ICON_MESSAGE = 'Nom d’icône invalide (ex. « Sparkles », « Building2 »).';

/** Textes facultatifs : une chaîne vide est enregistrée `null` (`nullableText` de l'API). */
const NULLABLE_SERVICE_TEXTS = [
  'shortName',
  'offersEyebrow',
  'offersTitle',
  'offersLead',
  'offersLeadMobile',
  'reviewsTitle',
  'relatedTitle',
  'ctaTitle',
  'ctaText',
  'seoTitle',
  'seoDescription',
] as const;
const NULLABLE_CATEGORY_TEXTS = [
  'eyebrow',
  'audiencesTitle',
  'servicesTitle',
  'servicesLead',
  'processTitle',
  'ctaTitle',
  'ctaText',
  'seoTitle',
  'seoDescription',
] as const;

const categoryOrder = (slug: string) =>
  adminCategories.find((category) => category.slug === slug)?.sortOrder ?? Number.MAX_SAFE_INTEGER;

/** Services triés par rubrique (ordre des rubriques), ordre d'affichage puis slug. */
const sorted = (list: AdminService[]) =>
  [...list].sort(
    (a, b) =>
      categoryOrder(a.category.slug) - categoryOrder(b.category.slug) ||
      a.sortOrder - b.sortOrder ||
      a.slug.localeCompare(b.slug),
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
const categoryIdOf = (service: AdminService) =>
  adminCategories.find((category) => category.slug === service.category.slug)?.id;
const nextVersion = (version: string) => `v${(Number(version.replace(/\D/g, '')) || 0) + 1}`;

/** Réponse `AdminService` : identifiants de la rubrique et de la photo (contrat). */
const respond = (service: AdminService): AdminService => ({
  ...service,
  categoryId: categoryIdOf(service),
  coverImageId: service.coverImage?.id ?? null,
});

const isText = (value: unknown): value is string => typeof value === 'string';

/** Liste d'éléments `{ title, text }` (étapes, avantages) : titre obligatoire, longueurs du contrat. */
function itemErrors(errors: FieldErrors, path: string, items: unknown, max: number) {
  if (items === undefined) return;
  tooMany(errors, path, items, max);
  (Array.isArray(items) ? (items as { title?: unknown; text?: unknown }[]) : []).forEach((item, index) => {
    if (!isText(item.title) || !item.title.trim())
      errors.push({ path: `${path}.${index}.title`, code: 'required', message: 'Indiquez un titre.' });
    tooLong(errors, `${path}.${index}.title`, item.title, 120);
    tooLong(errors, `${path}.${index}.text`, item.text, 600);
  });
}

/** Schéma `ServiceInput` (création) ou `ServicePatch` de l'API, messages en français. */
function serviceSchemaErrors(body: ServiceFields, create: boolean): FieldErrors {
  const errors: FieldErrors = create ? [] : nothingSent(body);
  if (create || body.name !== undefined) {
    if (!isText(body.name))
      errors.push({ path: 'name', code: 'required', message: 'Indiquez le nom du service.' });
    else if (body.name.trim().length < 2)
      errors.push({ path: 'name', code: 'too_short', message: 'Le nom doit compter au moins 2 caractères.' });
    else tooLong(errors, 'name', body.name, 120);
  }
  if ((create || body.categoryId !== undefined) && (!isText(body.categoryId) || body.categoryId === ''))
    errors.push({ path: 'categoryId', code: 'required', message: 'Choisissez une rubrique.' });
  if (create && (!isText(body.tagline) || !body.tagline.trim()))
    errors.push({ path: 'tagline', code: 'required', message: 'Écrivez une phrase d’accroche.' });
  tooLong(errors, 'tagline', body.tagline, 120);
  tooLong(errors, 'summary', body.summary, 240);
  tooLong(errors, 'shortName', body.shortName, 80);
  tooLong(errors, 'seoTitle', body.seoTitle, 60);
  tooLong(errors, 'seoDescription', body.seoDescription, 160);
  tooLong(errors, 'ctaText', body.ctaText, 300);
  slugErrors(errors, body.slug);
  if (body.icon !== undefined && (!isText(body.icon) || !ICON_PATTERN.test(body.icon)))
    errors.push({ path: 'icon', code: 'invalid_format', message: ICON_MESSAGE });
  tooMany(errors, 'galleryImageIds', body.galleryImageIds, 3, '3 visuels au maximum.');
  tooMany(errors, 'relatedServiceIds', body.relatedServiceIds, 6, '6 services liés au maximum.');
  tooMany(errors, 'featuredReviewIds', body.featuredReviewIds, 6, '6 témoignages au maximum.');
  tooMany(errors, 'cities', body.cities, 20);
  tooMany(errors, 'audiences', body.audiences, 12);
  tooMany(errors, 'quoteBullets', body.quoteBullets, 5);
  tooMany(errors, 'offers', body.offers, 12);
  itemErrors(errors, 'steps', body.steps, 10);
  itemErrors(errors, 'advantages', body.advantages, 8);
  if (body.faq !== undefined) {
    tooMany(errors, 'faq', body.faq, 20);
    body.faq.forEach((item, index) => {
      if (!item.question?.trim())
        errors.push({ path: `faq.${index}.question`, code: 'required', message: 'Indiquez la question.' });
      if (!item.answer?.trim())
        errors.push({ path: `faq.${index}.answer`, code: 'required', message: 'Indiquez la réponse.' });
      tooLong(errors, `faq.${index}.question`, item.question, 200);
      tooLong(errors, `faq.${index}.answer`, item.answer, 2000);
    });
  }
  return errors;
}

type OfferRef = { imageId?: string | null; serviceId?: string | null };

/** Images et services présélectionnés des cartes d'un carrousel (`<prefix>.<i>.imageId` / `.serviceId`). */
function offerReferences(prefix: string, offers: OfferRef[] | undefined) {
  const media: MediaReference[] = (offers ?? []).map((offer, index) => ({
    path: `${prefix}.${index}.imageId`,
    id: offer.imageId,
  }));
  const targets: FieldErrors = (offers ?? []).flatMap((offer, index) =>
    isText(offer.serviceId) && !findService(offer.serviceId)
      ? [
          {
            path: `${prefix}.${index}.serviceId`,
            code: 'unknown_service',
            message: 'Ce service n’existe pas.',
          },
        ]
      : [],
  );
  return { media, targets };
}

const isPublishedReview = (id: string) =>
  adminReviews.some((review) => review.id === id && review.status === 'PUBLIE');

/** Références d'un service (après le schéma) : toutes les erreurs ensemble, comme `checkReferences` de l'API. */
function serviceReferenceErrors(serviceId: string | null, body: ServiceFields): FieldErrors {
  const errors: FieldErrors = [];
  if (body.categoryId !== undefined && !findCategory(body.categoryId))
    errors.push({ path: 'categoryId', code: 'unknown_category', message: 'Cette rubrique n’existe pas.' });
  const offers = offerReferences('offers', body.offers as OfferRef[] | undefined);
  errors.push(
    ...unknownMediaErrors([
      ...(body.coverImageId === undefined ? [] : [{ path: 'coverImageId', id: body.coverImageId }]),
      ...(body.galleryImageIds ?? []).map((id, index) => ({ path: `galleryImageIds.${index}`, id })),
      ...offers.media,
    ]),
  );
  (body.relatedServiceIds ?? []).forEach((id, index) => {
    const path = `relatedServiceIds.${index}`;
    if (id === serviceId)
      errors.push({ path, code: 'self_reference', message: 'Un service ne peut pas être lié à lui-même.' });
    else if (!findService(id))
      errors.push({ path, code: 'unknown_service', message: 'Ce service n’existe pas.' });
  });
  errors.push(...offers.targets);
  (body.featuredReviewIds ?? []).forEach((id, index) => {
    if (!isPublishedReview(id))
      errors.push({
        path: `featuredReviewIds.${index}`,
        code: 'unpublished_review',
        message: 'Choisissez un avis publié.',
      });
  });
  return errors;
}

/** Corps normalisé comme par le schéma de l'API : textes coupés, textes facultatifs vides à `null`, listes sans doublon. */
function normalizeService(body: ServiceFields): ServiceFields {
  const next: ServiceFields = { ...body };
  for (const key of ['name', 'tagline', 'summary', 'slug'] as const) {
    const value = next[key];
    if (isText(value)) next[key] = value.trim();
  }
  for (const key of NULLABLE_SERVICE_TEXTS) {
    const value = next[key];
    if (isText(value)) next[key] = value.trim() === '' ? null : value.trim();
  }
  next.galleryImageIds = uniqueIds(next.galleryImageIds);
  next.relatedServiceIds = uniqueIds(next.relatedServiceIds);
  next.featuredReviewIds = uniqueIds(next.featuredReviewIds);
  return next;
}

const serviceSlugTaken = (slug: string, exceptId?: string) =>
  adminServices.some((service) => service.slug === slug && service.id !== exceptId);

/** 409 d'un slug choisi déjà pris par un autre service (unicité sur tout le catalogue, comme la base de l'API). */
const serviceSlugConflict = () =>
  problem(409, 'Un service utilise déjà cette adresse.', [
    { path: 'slug', code: 'slug_taken', message: 'Cette adresse est déjà utilisée par un autre service.' },
  ]);

/** Slug libre tiré d'un nom (`-2`, `-3`… si besoin). */
const freeServiceSlug = (base: string) => uniqueSlug(base, (slug) => serviceSlugTaken(slug), 'service');

/** Titre Google pré-rempli : « Nom | MAMBO Proxi » (60 caractères au plus), comme l'API. */
function defaultSeoTitle(name: string): string {
  const title = `${name}${SITE_NAME_SUFFIX}`;
  return title.length <= 60 ? title : name.slice(0, 60).trim();
}

/** Description Google pré-remplie : description courte, sinon accroche (160 caractères au plus). */
function defaultSeoDescription(summary: string | undefined, tagline: string): string | null {
  const text = (summary !== undefined && summary !== '' ? summary : tagline).slice(0, 160).trim();
  return text === '' ? null : text;
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
  // Photo de la médiathèque ; une photo des données d'amorçage déjà affichée reste celle du service.
  if (coverImageId !== undefined && coverImageId !== service.coverImage?.id)
    next.coverImage = mediaImage(coverImageId);
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

/** Schéma `CategoryInput` (création) ou `CategoryPatch` de l'API. */
function categorySchemaErrors(body: CategoryFields, create: boolean): FieldErrors {
  const errors: FieldErrors = create ? [] : nothingSent(body);
  const need = (path: 'name' | 'tagline' | 'description', message: string, max: number) => {
    const value = body[path];
    if ((create || value !== undefined) && (!isText(value) || !value.trim()))
      errors.push({ path, code: 'required', message });
    else tooLong(errors, path, value, max);
  };
  need('name', 'Indiquez le nom de la rubrique.', 80);
  need('tagline', 'Écrivez une accroche.', 120);
  need('description', 'Écrivez une description.', 600);
  if (create || body.icon !== undefined) {
    if (!isText(body.icon)) errors.push({ path: 'icon', code: 'required', message: 'Indiquez une icône.' });
    else if (!ICON_PATTERN.test(body.icon))
      errors.push({ path: 'icon', code: 'invalid_format', message: ICON_MESSAGE });
  }
  if ((create || body.tint !== undefined) && !TINTS.includes(body.tint as string))
    errors.push({ path: 'tint', code: 'invalid_choice', message: 'Choisissez une teinte.' });
  if (body.status !== undefined && !STATUSES.includes(body.status))
    errors.push({ path: 'status', code: 'invalid_choice', message: 'Statut inconnu.' });
  if (body.heroTitle !== undefined && (!isText(body.heroTitle) || !body.heroTitle.trim()))
    errors.push({ path: 'heroTitle', code: 'required', message: 'Ce champ est obligatoire.' });
  tooLong(errors, 'heroTitle', body.heroTitle, 400);
  tooLong(errors, 'heroLead', body.heroLead, 400);
  tooLong(errors, 'eyebrow', body.eyebrow, 60);
  tooLong(errors, 'seoTitle', body.seoTitle, 60);
  tooLong(errors, 'seoDescription', body.seoDescription, 160);
  tooLong(errors, 'ctaText', body.ctaText, 300);
  slugErrors(errors, body.slug);
  tooMany(errors, 'audiences', body.audiences, 6);
  tooMany(errors, 'quoteFields', body.quoteFields, 12);
  tooMany(errors, 'offerSections', body.offerSections, 4);
  itemErrors(errors, 'processSteps', body.processSteps, 8);
  return errors;
}

/** Image, témoignage (avis publié), images et services présélectionnés des carrousels d'une rubrique. */
function categoryReferenceErrors(body: CategoryFields): FieldErrors {
  const sections = (body.offerSections ?? []) as { offers?: OfferRef[] }[];
  const offers = sections.map((section, index) =>
    offerReferences(`offerSections.${index}.offers`, section.offers),
  );
  const errors = unknownMediaErrors([
    ...(body.imageId === undefined ? [] : [{ path: 'imageId', id: body.imageId }]),
    ...offers.flatMap((item) => item.media),
  ]);
  if (isText(body.testimonialId) && !isPublishedReview(body.testimonialId))
    errors.push({ path: 'testimonialId', code: 'unpublished_review', message: 'Choisissez un avis publié.' });
  errors.push(...offers.flatMap((item) => item.targets));
  return errors;
}

function normalizeCategory(body: CategoryFields): CategoryFields {
  const next: CategoryFields = { ...body };
  for (const key of ['name', 'tagline', 'description', 'slug', 'heroTitle', 'heroLead'] as const) {
    const value = next[key];
    if (isText(value)) next[key] = value.trim();
  }
  for (const key of NULLABLE_CATEGORY_TEXTS) {
    const value = next[key];
    if (isText(value)) next[key] = value.trim() === '' ? null : value.trim();
  }
  return next;
}

const categorySlugTaken = (slug: string, exceptId?: string) =>
  adminCategories.some((category) => category.slug === slug && category.id !== exceptId);

const categorySlugConflict = () =>
  problem(409, 'Une rubrique utilise déjà cette adresse.', [
    { path: 'slug', code: 'slug_taken', message: 'Cette adresse est déjà utilisée par une autre rubrique.' },
  ]);

/** Paramètres de `GET /v1/admin/services` (400 `invalid-query`, comme l'API). */
function listQueryErrors(params: URLSearchParams): FieldErrors {
  const errors: FieldErrors = [];
  const category = params.get('category');
  const status = params.get('status');
  const q = params.get('q');
  if (category && !SLUG_PATTERN.test(category.trim()))
    errors.push({
      path: 'category',
      code: 'invalid_format',
      message: 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement.',
    });
  if (status && !STATUSES.includes(status as PublishStatus))
    errors.push({ path: 'status', code: 'invalid_choice', message: 'Statut inconnu.' });
  if (q) tooLong(errors, 'q', q, 120);
  return errors;
}

export const adminServiceHandlers: HttpHandler[] = [
  // ───────────── Services ─────────────
  http.get('*/v1/admin/services', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const queryErrors = listQueryErrors(params);
    if (queryErrors.length) return invalidQuery(queryErrors);
    const category = params.get('category')?.trim() || null;
    const status = (params.get('status') || null) as PublishStatus | null;
    const q = params.get('q')?.trim() || null;
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
    const raw = await jsonBody<ServiceFields>(request);
    const schemaErrors = serviceSchemaErrors(raw, true);
    if (schemaErrors.length) return validationProblem(schemaErrors);
    const body = normalizeService(raw);
    const referenceErrors = serviceReferenceErrors(null, body);
    if (referenceErrors.length) return validationProblem(referenceErrors);
    let slug: string;
    if (body.slug !== undefined) {
      if (serviceSlugTaken(body.slug)) return serviceSlugConflict();
      slug = body.slug;
    } else slug = freeServiceSlug(slugify(body.name!));
    const category = findCategory(body.categoryId!)!;
    const name = body.name!;
    const draft: AdminService = {
      id: mockId('svc'),
      slug,
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
      seoTitle: body.seoTitle === undefined ? defaultSeoTitle(name) : body.seoTitle,
      seoDescription:
        body.seoDescription === undefined
          ? defaultSeoDescription(body.summary, body.tagline!)
          : body.seoDescription,
      publishedAt: null,
      completenessDetail: { percent: 0, criteria: [] },
      version: 'v1',
    };
    const created = apply(draft, { ...body, slug, categoryId: undefined });
    adminServices.push(created);
    return HttpResponse.json(respond(created), { status: 201 });
  }),

  // Ordre d'une rubrique : services connus, sans doublon, tous de la même rubrique (celle de `scope` si précisée).
  http.patch('*/v1/admin/services/reorder', async ({ request }) => {
    const { scope, ids } = await jsonBody<ReorderInput>(request);
    const inputErrors = reorderInputErrors(ids);
    if (inputErrors.length) return validationProblem(inputErrors);
    const items = ids.map(findService);
    const scopes = new Set(items.map((item) => item?.category.slug));
    if (items.some((item) => !item) || scopes.size !== 1 || (scope && !scopes.has(scope)))
      return validationProblem(
        [{ path: 'ids', code: 'invalid_order', message: 'Services inconnus ou d’une autre rubrique.' }],
        'L’ordre envoyé ne correspond pas aux services de la rubrique.',
      );
    items.forEach((item, index) => {
      item!.sortOrder = index + 1;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/services/:id', ({ params }) => {
    const service = findService(String(params.id));
    return service ? HttpResponse.json(respond(service)) : problem(404, SERVICE_NOT_FOUND);
  }),

  http.patch('*/v1/admin/services/:id', async ({ request, params }) => {
    const raw = await jsonBody<ServiceFields>(request);
    const schemaErrors = serviceSchemaErrors(raw, false);
    if (schemaErrors.length) return validationProblem(schemaErrors);
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const expected = parseIfMatch(request.headers.get('If-Match'));
    if (expected !== undefined && expected !== service.version)
      return problem(
        412,
        'Ce service a été modifié ailleurs entre-temps. Rechargez la page pour voir la dernière version.',
      );
    const body = normalizeService(raw);
    // Service en ligne : l'accroche reste obligatoire.
    if (service.status === 'PUBLISHED' && body.tagline === '')
      return validationProblem([
        { path: 'tagline', code: 'required', message: 'Écrivez une phrase d’accroche.' },
      ]);
    const referenceErrors = serviceReferenceErrors(service.id, body);
    if (referenceErrors.length) return validationProblem(referenceErrors);
    if (body.slug !== undefined && body.slug !== service.slug && serviceSlugTaken(body.slug, service.id))
      return serviceSlugConflict();
    const next = apply(service, body);
    next.version = nextVersion(service.version);
    return HttpResponse.json(respond(replace(next)));
  }),

  http.delete('*/v1/admin/services/:id', ({ params }) => {
    const index = adminServices.findIndex((item) => item.id === String(params.id));
    if (index < 0) return problem(404, SERVICE_NOT_FOUND);
    const service = adminServices[index]!;
    if (service.status === 'PUBLISHED')
      return problem(409, 'Ce service est publié : dépubliez-le avant de le supprimer.');
    adminServices.splice(index, 1);
    // Les autres fiches ne le proposent plus parmi leurs services liés.
    adminServices.forEach((item, position) => {
      if (item.relatedServiceIds.includes(service.id))
        adminServices[position] = withCompleteness({
          ...item,
          relatedServiceIds: item.relatedServiceIds.filter((id) => id !== service.id),
        });
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/services/:id/publish', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const errors: FieldErrors = [];
    if (service.name.trim().length < 2)
      errors.push({ path: 'name', code: 'required', message: 'Indiquez le nom du service.' });
    if (service.tagline.trim() === '')
      errors.push({ path: 'tagline', code: 'required', message: 'Écrivez une phrase d’accroche.' });
    if (errors.length)
      return validationProblem(
        errors,
        'Complétez le nom, la rubrique et la phrase d’accroche avant de publier.',
      );
    const now = new Date();
    // Date de la première publication, ou maintenant si elle était programmée plus tard.
    const publishedAt =
      service.publishedAt && new Date(service.publishedAt) <= now ? service.publishedAt : now.toISOString();
    const next: AdminService = {
      ...service,
      status: 'PUBLISHED',
      publishedAt,
      updatedAt: now.toISOString(),
      version: nextVersion(service.version),
    };
    return HttpResponse.json(respond(replace(next)));
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
    return HttpResponse.json(respond(replace(next)));
  }),

  http.post('*/v1/admin/services/:id/duplicate', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const slug = freeServiceSlug(slugify(`${service.slug}-copie`));
    const copy: AdminService = withCompleteness({
      ...structuredClone(service),
      id: mockId('svc'),
      name: `${service.name} (copie)`.slice(0, 120),
      slug,
      path: `/services/${service.category.slug}/${slug}`,
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
    adminServices.push(copy);
    return HttpResponse.json(respond(copy), { status: 201 });
  }),

  // Aperçu de la fiche, quel que soit son statut, pendant 30 minutes (comme l'API).
  http.get('*/v1/admin/services/:id/preview-token', ({ params }) => {
    const service = findService(String(params.id));
    if (!service) return problem(404, SERVICE_NOT_FOUND);
    const token = `preview-${service.id}-${Date.now().toString(36)}`;
    const body: PreviewToken = {
      token,
      url: previewUrl(service.path, token),
      expiresAt: new Date(Date.now() + PREVIEW_TOKEN_TTL_MS).toISOString(),
    };
    return HttpResponse.json(body);
  }),

  http.get('*/v1/admin/services/:id/completeness', ({ params }) => {
    const service = findService(String(params.id));
    return service ? HttpResponse.json(service.completenessDetail) : problem(404, SERVICE_NOT_FOUND);
  }),

  // ───────────── Rubriques ─────────────
  http.get('*/v1/admin/categories', () =>
    HttpResponse.json(
      [...adminCategories]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
        .map(withCounts),
    ),
  ),

  http.post('*/v1/admin/categories', async ({ request }) => {
    const raw = await jsonBody<CategoryFields>(request);
    const schemaErrors = categorySchemaErrors(raw, true);
    if (schemaErrors.length) return validationProblem(schemaErrors);
    const body = normalizeCategory(raw);
    const referenceErrors = categoryReferenceErrors(body);
    if (referenceErrors.length) return validationProblem(referenceErrors);
    // Slug choisi : 409 s'il est pris ; sinon tiré du nom, suffixé `-2`, `-3`… si besoin.
    let slug: string;
    if (body.slug !== undefined) {
      if (categorySlugTaken(body.slug)) return categorySlugConflict();
      slug = body.slug;
    } else
      slug = uniqueSlug(
        slugify(body.name!) || 'rubrique',
        (candidate) => categorySlugTaken(candidate),
        'rubrique',
      );
    const category: Category = {
      audiences: [],
      processSteps: [],
      groups: [],
      quoteFields: [],
      illustration: 'accueil',
      imageId: null,
      testimonialId: null,
      highlight: null,
      ...body,
      heroTitle: body.heroTitle ?? body.name!,
      heroLead: body.heroLead ?? body.description!,
      status: body.status ?? 'DRAFT',
      id: mockId('cat'),
      name: body.name!,
      slug,
      sortOrder: Math.max(0, ...adminCategories.map((item) => item.sortOrder)) + 1,
      serviceCount: 0,
      updatedAt: new Date().toISOString(),
    } as Category;
    adminCategories.push(category);
    return HttpResponse.json(withCounts(category), { status: 201 });
  }),

  http.patch('*/v1/admin/categories/reorder', async ({ request }) => {
    const { ids } = await jsonBody<ReorderInput>(request);
    const inputErrors = reorderInputErrors(ids);
    if (inputErrors.length) return validationProblem(inputErrors);
    if (ids.some((id) => !findCategory(id)))
      return validationProblem(
        [{ path: 'ids', code: 'invalid_order', message: 'Rubriques inconnues.' }],
        'L’ordre envoyé ne correspond pas aux rubriques.',
      );
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
    const raw = await jsonBody<CategoryFields>(request);
    const schemaErrors = categorySchemaErrors(raw, false);
    if (schemaErrors.length) return validationProblem(schemaErrors);
    const category = findCategory(String(params.id));
    if (!category) return problem(404, CATEGORY_NOT_FOUND);
    const body = normalizeCategory(raw);
    const referenceErrors = categoryReferenceErrors(body);
    if (referenceErrors.length) return validationProblem(referenceErrors);
    if (body.slug !== undefined && body.slug !== category.slug && categorySlugTaken(body.slug, category.id))
      return categorySlugConflict();
    const previousSlug = category.slug;
    const defined = Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
    Object.assign(category, defined, { updatedAt: new Date().toISOString() });
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
