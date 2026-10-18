import { http, HttpResponse, type HttpHandler } from 'msw';
import { validateSections } from '@/components/admin/pages/page-model';
import type { PageDraftInput, PreviewToken } from '@/lib/api/schema';
import { actorOf, jsonBody, mockId } from '../admin-utils';
import { adminPages, findAdminPage, toAdminPage, toSummary } from '../data/admin-pages';
import { problem } from '../problem';
import { sessionUser } from '../session';

const notFound = () => problem(404, 'Cette page n’existe pas.');

/** Adresse du site pour l'aperçu : celle du document qui exécute les mocks, sinon le domaine de production. */
const siteOrigin = () =>
  typeof location !== 'undefined' && location.origin.startsWith('http')
    ? location.origin
    : 'https://mamboproxi.com';

/** Back-office — Pages & textes (`/v1/admin/pages*`). */
export const adminPageHandlers: HttpHandler[] = [
  http.get('*/v1/admin/pages', () => HttpResponse.json(adminPages.map(toSummary))),

  http.get('*/v1/admin/pages/:key', ({ params }) => {
    const page = findAdminPage(String(params.key));
    return page ? HttpResponse.json(toAdminPage(page)) : notFound();
  }),

  // Sauvegarde automatique du brouillon : mêmes règles de validation que le formulaire.
  http.put('*/v1/admin/pages/:key', async ({ params, request }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    const body = await jsonBody<Partial<PageDraftInput>>(request);
    if (!Array.isArray(body.sections))
      return problem(400, 'Le brouillon doit contenir la liste des sections.');
    if (body.sections.length > 40)
      return problem(422, 'Une page compte au plus 40 sections.', [
        { path: 'sections', message: 'Une page compte au plus 40 sections.' },
      ]);
    const allowed = toAdminPage(page).allowedSectionTypes;
    // Types autorisés sur la page ; les sections déjà publiées (dont les contenus automatiques) restent acceptées.
    const forbidden = body.sections.findIndex(
      (section) =>
        !allowed.includes(section.type) &&
        !page.published.sections.some(
          (existing) => existing.type === section.type && existing.id === section.id,
        ),
    );
    if (forbidden >= 0)
      return problem(422, 'Ce type de section n’est pas disponible sur cette page.', [
        {
          path: `sections.${forbidden}.type`,
          message: 'Ce type de section n’est pas disponible sur cette page.',
        },
      ]);
    const errors = validateSections(body.sections);
    if (Object.keys(errors).length > 0)
      return problem(
        422,
        'Certains champs sont à corriger.',
        Object.entries(errors).map(([path, message]) => ({ path, message })),
      );
    page.draft = { sections: body.sections, seo: body.seo ?? page.draft?.seo ?? page.published.seo };
    page.updatedAt = new Date().toISOString();
    page.updatedBy = actorOf(sessionUser(request));
    return HttpResponse.json(toAdminPage(page));
  }),

  // Publication : le brouillon devient la version publiée (lue par `GET /v1/pages/{key}`).
  http.post('*/v1/admin/pages/:key/publish', ({ params, request }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    if (page.draft) {
      page.published = page.draft;
      page.draft = null;
      const now = new Date().toISOString();
      page.publishedAt = now;
      page.updatedAt = now;
      page.updatedBy = actorOf(sessionUser(request));
    }
    return HttpResponse.json(toAdminPage(page));
  }),

  http.post('*/v1/admin/pages/:key/discard', ({ params }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    page.draft = null;
    page.updatedAt = page.publishedAt ?? page.updatedAt;
    return HttpResponse.json(toAdminPage(page));
  }),

  http.get('*/v1/admin/pages/:key/preview-token', ({ params }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    const token = mockId('apercu');
    const body: PreviewToken = {
      token,
      url: `${siteOrigin()}${page.path}?preview=${token}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    return HttpResponse.json(body);
  }),
];
