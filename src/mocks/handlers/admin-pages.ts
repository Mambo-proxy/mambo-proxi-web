import { http, HttpResponse, type HttpHandler } from 'msw';
import { validateSections } from '@/components/admin/pages/page-model';
import type { PageDraftInput, PageSection, PreviewToken } from '@/lib/api/schema';
import { actorOf, jsonBody, mockId } from '../admin-utils';
import { PREVIEW_TOKEN_TTL_MS, previewUrl } from '../content-rules';
import { adminPages, findAdminPage, toAdminPage, toSummary, type StoredPage } from '../data/admin-pages';
import { unknownMediaErrors, visualReferences } from '../media-refs';
import { problem, validationProblem, type FieldErrors } from '../problem';
import { sanitizeRichText } from '../rich-text';
import { sessionUser } from '../session';

const notFound = () => problem(404, 'Cette page n’existe pas.');

/**
 * Règles du brouillon au-delà des champs (comme `checkDraft` de l'API) : identifiants uniques ; type de section
 * autorisé sur la page, sauf pour une section déjà présente (même `id` et `type`, publiée ou dans le brouillon) ;
 * source d'une section automatique (`dynamic`) inchangée ; images connues de la médiathèque.
 */
function draftErrors(page: StoredPage, sections: PageSection[]): FieldErrors {
  const errors: FieldErrors = [];
  const allowed = new Set<string>(toAdminPage(page).allowedSectionTypes);
  const existing = new Map<string, PageSection>();
  for (const section of [...page.published.sections, ...(page.draft?.sections ?? [])])
    existing.set(`${section.id}:${section.type}`, section);
  const seen = new Set<string>();
  sections.forEach((section, index) => {
    const path = `sections.${index}`;
    if (seen.has(section.id))
      errors.push({
        path: `${path}.id`,
        code: 'duplicate',
        message: 'Cet identifiant est déjà utilisé dans la page.',
      });
    seen.add(section.id);
    const previous = existing.get(`${section.id}:${section.type}`);
    if (!allowed.has(section.type) && previous === undefined)
      errors.push({
        path: `${path}.type`,
        code: 'section_not_allowed',
        message: 'Ce type de section n’est pas disponible sur cette page.',
      });
    if (
      section.type === 'dynamic' &&
      previous?.type === 'dynamic' &&
      (previous.source as string) !== (section.source as string)
    )
      errors.push({
        path: `${path}.source`,
        code: 'read_only',
        message: 'Le contenu de cette section vient d’un autre écran : sa source ne peut pas être modifiée.',
      });
  });
  errors.push(...unknownMediaErrors(visualReferences(sections, 'sections')));
  return errors;
}

/** HTML des articles assaini à l'enregistrement (liste blanche du schéma `Html`), comme l'API. */
const sanitized = (sections: PageSection[]): PageSection[] =>
  sections.map((section) =>
    section.type === 'richText'
      ? {
          ...section,
          articles: section.articles.map((article) => ({ ...article, html: sanitizeRichText(article.html) })),
        }
      : section,
  );

/** Back-office — Pages & textes (`/v1/admin/pages*`). */
export const adminPageHandlers: HttpHandler[] = [
  http.get('*/v1/admin/pages', () => HttpResponse.json(adminPages.map(toSummary))),

  http.get('*/v1/admin/pages/:key', ({ params }) => {
    const page = findAdminPage(String(params.key));
    return page ? HttpResponse.json(toAdminPage(page)) : notFound();
  }),

  // Sauvegarde automatique du brouillon : schéma `PageDraftInput` (mêmes règles que le formulaire), puis règles de la page.
  http.put('*/v1/admin/pages/:key', async ({ params, request }) => {
    const body = await jsonBody<Partial<PageDraftInput>>(request);
    if (!Array.isArray(body.sections))
      return validationProblem([
        {
          path: 'sections',
          code: body.sections === undefined ? 'required' : 'invalid_type',
          message: 'Le brouillon doit contenir la liste des sections.',
        },
      ]);
    if (body.sections.length > 40)
      return validationProblem([
        { path: 'sections', code: 'too_many', message: 'Une page compte au plus 40 sections.' },
      ]);
    const fieldErrors = validateSections(body.sections);
    if (Object.keys(fieldErrors).length > 0)
      return validationProblem(Object.entries(fieldErrors).map(([path, message]) => ({ path, message })));
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    const errors = draftErrors(page, body.sections);
    if (errors.length > 0) return validationProblem(errors);
    page.draft = {
      sections: sanitized(body.sections),
      seo: body.seo ?? page.draft?.seo ?? page.published.seo,
    };
    page.updatedAt = new Date().toISOString();
    page.updatedBy = actorOf(sessionUser(request));
    return HttpResponse.json(toAdminPage(page));
  }),

  // Publication : le brouillon devient la version publiée (lue par `GET /v1/pages/{key}`). Sans brouillon, une page
  // déjà publiée est renvoyée telle quelle ; une page jamais publiée l'est.
  http.post('*/v1/admin/pages/:key/publish', ({ params, request }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    if (!page.draft && page.publishedAt !== null) return HttpResponse.json(toAdminPage(page));
    if (page.draft) page.published = page.draft;
    page.draft = null;
    const now = new Date().toISOString();
    page.publishedAt = now;
    page.updatedAt = now;
    page.updatedBy = actorOf(sessionUser(request));
    return HttpResponse.json(toAdminPage(page));
  }),

  // Abandon du brouillon : la version publiée est rétablie (page renvoyée telle quelle s'il n'y a pas de brouillon).
  http.post('*/v1/admin/pages/:key/discard', ({ params }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    if (page.draft) {
      page.draft = null;
      page.updatedAt = new Date().toISOString();
    }
    return HttpResponse.json(toAdminPage(page));
  }),

  // Aperçu du brouillon sur le site, pendant 30 minutes (comme l'API).
  http.get('*/v1/admin/pages/:key/preview-token', ({ params }) => {
    const page = findAdminPage(String(params.key));
    if (!page) return notFound();
    const token = mockId('apercu');
    const body: PreviewToken = {
      token,
      url: previewUrl(page.path, token),
      expiresAt: new Date(Date.now() + PREVIEW_TOKEN_TTL_MS).toISOString(),
    };
    return HttpResponse.json(body);
  }),
];
