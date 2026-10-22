import { http, HttpResponse } from 'msw';
import type {
  AdminMagazineArticle,
  AdminMagazineEdition,
  AdminMagazineEditionSummary,
  MagazineArticleFields,
  MagazineEditionFields,
  MagazineLanguage,
  Media,
  MediaImage,
} from '@/lib/api/schema';
import { jsonBody, matches, mockId } from '../admin-utils';
import {
  lastMagazineCampaign,
  MAGAZINE_PHOTOS,
  magazineArticles,
  magazineEditions,
  magazineSubscribers,
  type MagazineArticleRecord,
  type MagazineEditionRecord,
} from '../data/admin-magazine';
import { problem } from '../problem';
import { adminMedia } from './admin-media';

// Photos du magazine proposées dans la médiathèque.
for (const image of new Map(Object.values(MAGAZINE_PHOTOS).map((item) => [item.id, item])).values()) {
  if (adminMedia.some((media) => media.id === image.id)) continue;
  adminMedia.push({
    ...image,
    alt: image.alt ?? null,
    focalPoint: null,
    blurDataUrl: null,
    fileName: image.url.split('/').pop() ?? image.id,
    mimeType: 'image/png',
    size: 180_000,
    status: 'READY',
    usages: [{ kind: 'magazine', label: 'Magazine', href: null }],
    createdAt: '2026-09-20T08:00:00.000Z',
  } satisfies Media);
}

const label = (edition: MagazineEditionRecord) =>
  edition.number === null ? 'Hors-série' : `N°\u00A0${edition.number}`;

const articleLanguages = (article: MagazineArticleRecord): MagazineLanguage[] =>
  article.titleEn && article.bodyEn ? ['fr', 'en'] : ['fr'];

function toArticle(article: MagazineArticleRecord): AdminMagazineArticle {
  const edition = magazineEditions.find((item) => item.id === article.editionId);
  return {
    id: article.id,
    title: article.title,
    titleEn: article.titleEn,
    theme: article.theme,
    themeEn: article.themeEn,
    excerpt: article.excerpt,
    excerptEn: article.excerptEn,
    body: article.body,
    bodyEn: article.bodyEn,
    image: article.image,
    updatedAt: article.updatedAt,
    languages: articleLanguages(article),
    edition: edition ? { id: edition.id, label: label(edition) } : null,
  };
}

const articlesOf = (editionId: string) =>
  magazineArticles
    .filter((article) => article.editionId === editionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/** Une édition planifiée dont la date est passée est publiée. */
function refreshStatus(edition: MagazineEditionRecord) {
  if (edition.status === 'SCHEDULED' && edition.publishAt && edition.publishAt <= new Date().toISOString())
    edition.status = 'PUBLISHED';
}

function toSummary(edition: MagazineEditionRecord): AdminMagazineEditionSummary {
  refreshStatus(edition);
  const articles = articlesOf(edition.id);
  const toTranslate = articles.filter((article) => !articleLanguages(article).includes('en')).length;
  return {
    id: edition.id,
    number: edition.number,
    label: label(edition),
    title: edition.title,
    subtitle: edition.subtitle,
    themes: edition.themes,
    cover: edition.cover,
    articlesCount: articles.length,
    toTranslate,
    languages: edition.titleEn && edition.editorialEn ? ['fr', 'en'] : ['fr'],
    readers: edition.readers,
    status: edition.status,
    publishAt: edition.publishAt,
    updatedAt: edition.updatedAt,
  };
}

function toEdition(edition: MagazineEditionRecord): AdminMagazineEdition {
  return {
    ...toSummary(edition),
    titleEn: edition.titleEn,
    subtitleEn: edition.subtitleEn,
    coverId: edition.cover?.id ?? null,
    editorial: edition.editorial,
    editorialEn: edition.editorialEn,
    signature: edition.signature,
    signatureEn: edition.signatureEn,
    articles: articlesOf(edition.id).map(toArticle),
    newsletter: {
      subscribers: magazineSubscribers,
      scheduledAt: edition.newsletterScheduledAt,
      sentAt: edition.newsletterSentAt,
    },
  };
}

function mediaImage(id: string | null | undefined): MediaImage | null | undefined {
  if (id === undefined) return undefined;
  if (id === null) return null;
  const media = adminMedia.find((item) => item.id === id);
  if (!media) return undefined;
  const { id: mediaId, url, width, height, alt, focalPoint, blurDataUrl, variants } = media;
  return { id: mediaId, url, width, height, alt, focalPoint, blurDataUrl, variants };
}

const EDITION_FIELDS = [
  'number',
  'title',
  'titleEn',
  'subtitle',
  'subtitleEn',
  'themes',
  'publishAt',
  'editorial',
  'editorialEn',
  'signature',
  'signatureEn',
] as const;

/** Applique les champs reçus ; renvoie une erreur (422 / 409) ou `null`. */
function applyEdition(edition: MagazineEditionRecord, body: MagazineEditionFields) {
  if (body.title !== undefined && !body.title.trim())
    return problem(422, 'Le titre est obligatoire.', [{ path: 'title', message: 'Saisissez le titre.' }]);
  if (
    body.number !== undefined &&
    body.number !== null &&
    magazineEditions.some((item) => item.id !== edition.id && item.number === body.number)
  )
    return problem(409, `Le numéro ${body.number} est déjà utilisé par une autre édition.`, [
      { path: 'number', message: 'Ce numéro est déjà utilisé.' },
    ]);
  const record = edition as Record<(typeof EDITION_FIELDS)[number], unknown>;
  for (const key of EDITION_FIELDS) if (body[key] !== undefined) record[key] = body[key];
  const cover = mediaImage(body.coverId);
  if (cover !== undefined) edition.cover = cover;
  edition.updatedAt = new Date().toISOString();
  return null;
}

function findEdition(id: unknown) {
  return magazineEditions.find((edition) => edition.id === id) ?? null;
}

const notFound = () => problem(404, 'Cette édition n’existe plus.');

const ARTICLE_FIELDS = [
  'title',
  'titleEn',
  'theme',
  'themeEn',
  'excerpt',
  'excerptEn',
  'body',
  'bodyEn',
] as const;

function applyArticle(article: MagazineArticleRecord, body: MagazineArticleFields) {
  if (body.title !== undefined && !body.title.trim())
    return problem(422, 'Le titre est obligatoire.', [{ path: 'title', message: 'Saisissez le titre.' }]);
  if (body.theme !== undefined && !body.theme.trim())
    return problem(422, 'Le thème est obligatoire.', [{ path: 'theme', message: 'Saisissez le thème.' }]);
  if (body.editionId && !findEdition(body.editionId)) return problem(422, 'Cette édition n’existe plus.');
  const record = article as Record<(typeof ARTICLE_FIELDS)[number], unknown>;
  for (const key of ARTICLE_FIELDS) if (body[key] !== undefined) record[key] = body[key];
  const image = mediaImage(body.imageId);
  if (image !== undefined) article.image = image;
  if (body.editionId !== undefined && body.editionId !== article.editionId) {
    article.editionId = body.editionId;
    article.sortOrder = body.editionId ? articlesOf(body.editionId).length : 0;
  }
  article.updatedAt = new Date().toISOString();
  return null;
}

export const adminMagazineHandlers = [
  http.get('*/v1/admin/magazine', () => {
    // Ordre de la maquette : numéros croissants, hors-séries ensuite.
    const editions = [...magazineEditions].sort(
      (a, b) => (a.number ?? Infinity) - (b.number ?? Infinity) || a.updatedAt.localeCompare(b.updatedAt),
    );
    return HttpResponse.json({
      editions: editions.map(toSummary),
      articlesCount: magazineArticles.length,
      lastCampaign: lastMagazineCampaign,
    });
  }),

  http.post('*/v1/admin/magazine/editions', async ({ request }) => {
    const body = await jsonBody<MagazineEditionFields>(request);
    const numbers = magazineEditions.map((edition) => edition.number ?? 0);
    const edition: MagazineEditionRecord = {
      id: mockId('mag'),
      number: Math.max(0, ...numbers) + 1,
      title: '',
      titleEn: null,
      subtitle: null,
      subtitleEn: null,
      themes: null,
      cover: null,
      editorial: null,
      editorialEn: null,
      signature: 'Mireille Bell, fondatrice de Mambo Proxi',
      signatureEn: null,
      status: 'DRAFT',
      publishAt: null,
      readers: null,
      newsletterScheduledAt: null,
      newsletterSentAt: null,
      updatedAt: new Date().toISOString(),
    };
    const error = applyEdition(edition, { ...body, title: body.title ?? '' });
    if (error) return error;
    magazineEditions.push(edition);
    return HttpResponse.json(toEdition(edition), { status: 201 });
  }),

  http.get('*/v1/admin/magazine/editions/:id', ({ params }) => {
    const edition = findEdition(params.id);
    return edition ? HttpResponse.json(toEdition(edition)) : notFound();
  }),

  http.patch('*/v1/admin/magazine/editions/:id', async ({ request, params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    const error = applyEdition(edition, await jsonBody<MagazineEditionFields>(request));
    return error ?? HttpResponse.json(toEdition(edition));
  }),

  http.delete('*/v1/admin/magazine/editions/:id', ({ params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    if (edition.status === 'PUBLISHED')
      return problem(409, 'Repassez d’abord l’édition en brouillon pour la supprimer.');
    for (const article of articlesOf(edition.id)) article.editionId = null;
    magazineEditions.splice(magazineEditions.indexOf(edition), 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/admin/magazine/editions/:id/publish', async ({ request, params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    if (!edition.title.trim()) return problem(422, 'Donnez un titre à l’édition avant de la publier.');
    const { publishAt } = await jsonBody<{ publishAt?: string | null }>(request);
    const date = publishAt ?? new Date().toISOString();
    edition.publishAt = date;
    edition.status = date > new Date().toISOString() ? 'SCHEDULED' : 'PUBLISHED';
    if (edition.status === 'PUBLISHED') edition.readers ??= 0;
    edition.updatedAt = new Date().toISOString();
    return HttpResponse.json(toEdition(edition));
  }),

  http.post('*/v1/admin/magazine/editions/:id/unpublish', ({ params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    edition.status = 'DRAFT';
    edition.updatedAt = new Date().toISOString();
    return HttpResponse.json(toEdition(edition));
  }),

  http.put('*/v1/admin/magazine/editions/:id/articles', async ({ request, params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    const { ids = [] } = await jsonBody<{ ids?: string[] }>(request);
    if (ids.some((id) => !magazineArticles.some((article) => article.id === id)))
      return problem(422, 'Un des articles n’existe plus.');
    for (const article of articlesOf(edition.id)) if (!ids.includes(article.id)) article.editionId = null;
    ids.forEach((id, index) => {
      const article = magazineArticles.find((item) => item.id === id)!;
      article.editionId = edition.id;
      article.sortOrder = index;
    });
    edition.updatedAt = new Date().toISOString();
    return HttpResponse.json(toEdition(edition));
  }),

  http.get('*/v1/admin/magazine/editions/:id/preview-token', ({ params }) => {
    if (!findEdition(params.id)) return notFound();
    const token = `apercu-${String(params.id)}`;
    const origin = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin;
    return HttpResponse.json({
      token,
      url: `${origin}/magazine?preview=${token}`,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    });
  }),

  http.post('*/v1/admin/magazine/editions/:id/newsletter/test', async ({ request, params }) => {
    if (!findEdition(params.id)) return notFound();
    const { email } = await jsonBody<{ email?: string }>(request);
    if (!email?.includes('@'))
      return problem(422, 'Adresse e-mail invalide.', [
        { path: 'email', message: 'Saisissez une adresse valide.' },
      ]);
    return HttpResponse.json({ message: `Test envoyé à ${email}.` }, { status: 202 });
  }),

  http.post('*/v1/admin/magazine/editions/:id/newsletter/schedule', async ({ request, params }) => {
    const edition = findEdition(params.id);
    if (!edition) return notFound();
    const { scheduledAt } = await jsonBody<{ scheduledAt?: string }>(request);
    if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)))
      return problem(422, 'Choisissez la date et l’heure d’envoi.', [
        { path: 'scheduledAt', message: 'Choisissez la date et l’heure d’envoi.' },
      ]);
    if (scheduledAt <= new Date().toISOString())
      return problem(422, 'Choisissez une date à venir.', [
        { path: 'scheduledAt', message: 'Choisissez une date à venir.' },
      ]);
    refreshStatus(edition);
    if (
      edition.status === 'DRAFT' ||
      edition.status === 'ARCHIVED' ||
      (edition.status === 'SCHEDULED' && edition.publishAt && edition.publishAt > scheduledAt)
    )
      return problem(409, 'Publiez ou programmez l’édition avant la date d’envoi.');
    edition.newsletterScheduledAt = scheduledAt;
    return HttpResponse.json(toEdition(edition));
  }),

  http.get('*/v1/admin/magazine/articles', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const edition = params.get('edition');
    const q = params.get('q');
    const list = magazineArticles
      .filter((article) =>
        edition === 'none' ? article.editionId === null : !edition || article.editionId === edition,
      )
      .filter((article) => matches(q, article.title, article.titleEn, article.theme))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return HttpResponse.json(list.map(toArticle));
  }),

  http.post('*/v1/admin/magazine/articles', async ({ request }) => {
    const body = await jsonBody<MagazineArticleFields>(request);
    const article: MagazineArticleRecord = {
      id: mockId('art'),
      title: '',
      titleEn: null,
      theme: '',
      themeEn: null,
      excerpt: null,
      excerptEn: null,
      body: null,
      bodyEn: null,
      image: null,
      editionId: null,
      sortOrder: 0,
      updatedAt: new Date().toISOString(),
    };
    const error = applyArticle(article, { ...body, title: body.title ?? '', theme: body.theme ?? '' });
    if (error) return error;
    magazineArticles.push(article);
    return HttpResponse.json(toArticle(article), { status: 201 });
  }),

  http.patch('*/v1/admin/magazine/articles/:id', async ({ request, params }) => {
    const article = magazineArticles.find((item) => item.id === params.id);
    if (!article) return problem(404, 'Cet article n’existe plus.');
    const error = applyArticle(article, await jsonBody<MagazineArticleFields>(request));
    return error ?? HttpResponse.json(toArticle(article));
  }),

  http.delete('*/v1/admin/magazine/articles/:id', ({ params }) => {
    const index = magazineArticles.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cet article n’existe plus.');
    magazineArticles.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
