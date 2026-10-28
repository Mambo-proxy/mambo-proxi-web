import { http, HttpResponse, type HttpHandler } from 'msw';
import { validateSections } from '@/components/admin/pages/page-model';
import { applyEnglishTexts } from '@/components/admin/pages/page-translation';
import type { PageDraftInput, PageSection, PageTranslationInput, PreviewToken } from '@/lib/api/schema';
import { actorOf, jsonBody } from '../admin-utils';
import { PREVIEW_TOKEN_TTL_MS, previewUrl } from '../content-rules';
import {
  adminPages,
  findAdminPage,
  pagePreviewToken,
  sectionTextHash,
  toAdminPage,
  toSummary,
  type StoredEnglish,
  type StoredPage,
} from '../data/admin-pages';
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

/**
 * Version anglaise du brouillon (`translations.en`, comme `englishDraft` de l'API) : `id` alignés sur les sections
 * françaises de l'envoi (même type, sans doublon, dans l'ordre), textes anglais posés sur la section française puis
 * validés comme elle ; empreinte des textes français gardée si les textes anglais de la section n'ont pas changé,
 * sauf pour les sections marquées revues (`reviewedSectionIds`, `id` présents dans l'envoi).
 */
function englishDraft(
  french: PageSection[],
  input: PageTranslationInput,
  previous: StoredEnglish | null,
): { value: StoredEnglish; errors: FieldErrors } {
  const errors: FieldErrors = [];
  const basePath = 'translations.en.sections';
  const rank = new Map(french.map((section, index) => [section.id, index]));
  const before = new Map(previous?.sections.map((section) => [section.id, section]));
  const seen = new Set<string>();
  const sections: PageSection[] = [];
  const sourceHashes: Record<string, string> = {};
  const reviewed = Array.isArray(input.reviewedSectionIds) ? input.reviewedSectionIds : [];
  let last = -1;
  (Array.isArray(input.sections) ? input.sections : []).forEach((section, index) => {
    const path = `${basePath}.${index}`;
    const position = rank.get(section.id);
    const source = position === undefined ? undefined : french[position];
    if (seen.has(section.id))
      errors.push({
        path: `${path}.id`,
        code: 'duplicate',
        message: 'Cette section est déjà traduite plus haut.',
      });
    else if (position === undefined || source === undefined)
      errors.push({
        path: `${path}.id`,
        code: 'unknown_section',
        message: 'Cette section n’existe pas dans la version française.',
      });
    else if (position < last)
      errors.push({
        path: `${path}.id`,
        code: 'section_order',
        message: 'Les sections anglaises doivent suivre l’ordre des sections françaises.',
      });
    else if (section.type !== source.type)
      errors.push({
        path: `${path}.type`,
        code: 'type_mismatch',
        message: 'La section anglaise doit être du même type que la section française.',
      });
    seen.add(section.id);
    if (source === undefined || errors.some((error) => error.path.startsWith(`${path}.`))) return;
    last = position ?? last;
    const translated = sanitized([applyEnglishTexts(source, section) as PageSection])[0] ?? source;
    const fieldErrors = Object.entries(validateSections([translated]));
    if (fieldErrors.length > 0) {
      errors.push(
        ...fieldErrors.map(([field, message]) => ({ path: field.replace(/^sections\.0/, path), message })),
      );
      return;
    }
    sections.push(translated);
    const previousSection = before.get(section.id);
    const unchanged =
      previousSection !== undefined &&
      sectionTextHash(applyEnglishTexts(source, previousSection) as PageSection) ===
        sectionTextHash(translated);
    // Section marquée revue : empreinte du français actuel, même si ses textes anglais n'ont pas changé.
    const hash =
      unchanged && !reviewed.includes(section.id)
        ? (previous?.sourceHashes[section.id] ?? sectionTextHash(source))
        : sectionTextHash(source);
    if (hash !== null) sourceHashes[section.id] = hash;
  });
  const sent = new Set((Array.isArray(input.sections) ? input.sections : []).map((section) => section.id));
  reviewed.forEach((id, index) => {
    if (!sent.has(id))
      errors.push({
        path: `translations.en.reviewedSectionIds.${index}`,
        code: 'unknown_section',
        message: 'Cette section ne fait pas partie de la version anglaise envoyée.',
      });
  });
  if ((input.title?.length ?? 0) > 160)
    errors.push({ path: 'translations.en.title', code: 'too_long', message: '160 caractères au maximum.' });
  const seo = input.seo ?? previous?.seo ?? { title: null, description: null };
  return {
    value: {
      title: input.title ?? null,
      sections,
      seo: { title: seo.title ?? null, description: seo.description ?? null },
      sourceHashes,
    },
    errors,
  };
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
    // Version anglaise : remplacée si elle est envoyée, sinon celle du brouillon (ou publiée) est gardée.
    let english = page.draft?.en ?? page.published.en;
    const input = body.translations?.en;
    if (input) {
      const result = englishDraft(body.sections, input, english);
      if (result.errors.length > 0) return validationProblem(result.errors);
      english = result.value;
    }
    page.draft = {
      sections: sanitized(body.sections),
      seo: body.seo ?? page.draft?.seo ?? page.published.seo,
      en: english,
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
    const expiresAt = Date.now() + PREVIEW_TOKEN_TTL_MS;
    const token = pagePreviewToken(page.key, expiresAt);
    const body: PreviewToken = {
      token,
      url: previewUrl(page.path, token),
      expiresAt: new Date(expiresAt).toISOString(),
    };
    return HttpResponse.json(body);
  }),
];
