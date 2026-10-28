import { beforeEach, describe, expect, it } from 'vitest';
import type { AdminPage, AdminPageSummary, PreviewToken, Problem } from '@/lib/api/schema';
import { resetAdminPages } from './data/admin-pages';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(method: string, path: string, body?: unknown) {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, { method, headers: session, body: body ? JSON.stringify(body) : undefined }),
  );
  return { status: response.status, body: (await response.json()) as T };
}

describe('pages & textes simulées', () => {
  beforeEach(() => resetAdminPages());

  it('liste les pages du site dans l’ordre de la maquette, avec les textes du site', async () => {
    const { body } = await call<AdminPageSummary[]>('GET', '/v1/admin/pages');
    expect(body.map((page) => page.title).slice(0, 3)).toEqual([
      'Accueil',
      'Nos services',
      'Zones d’intervention',
    ]);
    expect(body.find((page) => page.key === 'mentions-legales')).toMatchObject({
      hasDraft: true,
      group: 'legales',
    });
    const { body: home } = await call<AdminPage>('GET', '/v1/admin/pages/accueil');
    expect(home.sections[0]).toMatchObject({ type: 'hero', adminLabel: 'Section principale' });
    expect(home.allowedSectionTypes).not.toContain('dynamic');
  });

  it('enregistre le brouillon, refuse un brouillon invalide, publie puis annule', async () => {
    const { body: home } = await call<AdminPage>('GET', '/v1/admin/pages/accueil');
    const invalid = home.sections.map((section) =>
      section.type === 'hero' ? { ...section, title: '' } : section,
    );
    const refused = await call<Problem>('PUT', '/v1/admin/pages/accueil', { sections: invalid });
    expect(refused.status).toBe(422);
    expect(refused.body.errors).toContainEqual({
      path: 'sections.0.title',
      message: 'Ce champ est obligatoire.',
    });

    const edited = home.sections.map((section) =>
      section.type === 'hero' ? { ...section, title: 'Nouveau ==titre==' } : section,
    );
    const saved = await call<AdminPage>('PUT', '/v1/admin/pages/accueil', {
      sections: edited,
      seo: home.seo,
    });
    expect(saved.body).toMatchObject({ hasDraft: true, updatedBy: { name: 'Mireille Bell' } });

    const published = await call<AdminPage>('POST', '/v1/admin/pages/accueil/publish');
    expect(published.body.hasDraft).toBe(false);
    expect(published.body.sections[0]).toMatchObject({ title: 'Nouveau ==titre==' });

    await call('PUT', '/v1/admin/pages/accueil', { sections: home.sections });
    const discarded = await call<AdminPage>('POST', '/v1/admin/pages/accueil/discard');
    expect(discarded.body).toMatchObject({ hasDraft: false });
    expect(discarded.body.sections[0]).toMatchObject({ title: 'Nouveau ==titre==' });
  });

  it('fournit un jeton d’aperçu de 30 minutes et répond 404 pour une page inconnue', async () => {
    const { body } = await call<PreviewToken>('GET', '/v1/admin/pages/mission/preview-token');
    expect(body.url).toMatch(/\/mission\?preview=apercu_/);
    const minutes = (new Date(body.expiresAt).getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(29);
    expect(minutes).toBeLessThanOrEqual(30);
    const missing = await call<Problem>('GET', '/v1/admin/pages/inconnue');
    expect(missing.status).toBe(404);
    expect(missing.body.type).toBe('https://api.mamboproxi.com/problems/not-found');
  });

  it('règles de l’API : sections exigées, source automatique figée, identifiants uniques, images connues', async () => {
    const noSections = await call<Problem>('PUT', '/v1/admin/pages/contact', { seo: {} });
    expect(noSections.status).toBe(422);
    expect(noSections.body).toMatchObject({
      type: 'https://api.mamboproxi.com/problems/validation-error',
      errors: [
        { path: 'sections', code: 'required', message: 'Le brouillon doit contenir la liste des sections.' },
      ],
    });

    const { body: contact } = await call<AdminPage>('GET', '/v1/admin/pages/contact');
    const changed = contact.sections.map((section) =>
      section.type === 'dynamic' && section.id === 'moyens' ? { ...section, source: 'agency-map' } : section,
    );
    const source = await call<Problem>('PUT', '/v1/admin/pages/contact', { sections: changed });
    expect(source.status).toBe(422);
    expect(source.body.errors).toEqual([
      {
        path: 'sections.1.source',
        code: 'read_only',
        message: 'Le contenu de cette section vient d’un autre écran : sa source ne peut pas être modifiée.',
      },
    ]);

    const hero = contact.sections[0]!;
    const twice = await call<Problem>('PUT', '/v1/admin/pages/contact', { sections: [hero, hero] });
    expect(twice.status).toBe(422);
    expect(twice.body.errors?.map((error) => error.path)).toEqual(['sections.1.id']);
    const image = await call<Problem>('PUT', '/v1/admin/pages/contact', {
      sections: [{ ...hero, visual: { illustration: 'accueil', image: { id: 'med_inconnue' }, alt: '' } }],
    });
    expect(image.body.errors).toEqual([
      {
        path: 'sections.0.visual.image',
        code: 'unknown_media',
        message: 'Cette image n’existe pas dans la médiathèque.',
      },
    ]);
    // Photos des données d'amorçage : connues de la médiathèque.
    const { body: home } = await call<AdminPage>('GET', '/v1/admin/pages/accueil');
    expect((await call('PUT', '/v1/admin/pages/accueil', { sections: home.sections })).status).toBe(200);
  });

  it('version anglaise : statut, enregistrement avec le brouillon, sections périmées, erreurs', async () => {
    const { body: contact } = await call<AdminPage>('GET', '/v1/admin/pages/contact');
    expect(contact.translations.en).toBeNull();
    expect(contact.translationStatus.en).toEqual({
      state: 'MISSING',
      missingSectionIds: ['hero', 'rendez-vous'],
      outdatedSectionIds: [],
    });

    const [hero, , appointment] = contact.sections;
    const saved = await call<AdminPage>('PUT', '/v1/admin/pages/contact', {
      sections: contact.sections,
      translations: {
        en: {
          title: 'Contact',
          sections: [
            { ...hero, title: 'Let’s talk about ==your project.==', visual: null, enabled: false },
            { ...appointment, title: 'Book an appointment' },
          ],
        },
      },
    });
    expect(saved.status).toBe(200);
    expect(saved.body.translationStatus.en.state).toBe('UP_TO_DATE');
    // Champs non textuels repris du français.
    expect(saved.body.translations.en?.sections[0]).toMatchObject({
      title: 'Let’s talk about ==your project.==',
      enabled: true,
    });

    // Texte français modifié sans l'anglais : section à revoir, traduction gardée.
    const french = contact.sections.map((section) =>
      section.id === 'hero' ? { ...section, title: 'Écrivez-nous' } : section,
    );
    const outdated = await call<AdminPage>('PUT', '/v1/admin/pages/contact', { sections: french });
    expect(outdated.body.translationStatus.en).toMatchObject({
      state: 'OUTDATED',
      outdatedSectionIds: ['hero'],
    });
    expect(outdated.body.translations.en?.sections[0]).toMatchObject({
      title: 'Let’s talk about ==your project.==',
    });

    const refused = await call<Problem>('PUT', '/v1/admin/pages/contact', {
      sections: french,
      translations: { en: { sections: [appointment, hero] } },
    });
    expect(refused.status).toBe(422);
    expect(refused.body.errors?.map((error) => [error.path, error.code])).toEqual([
      ['translations.en.sections.1.id', 'section_order'],
    ]);
  });

  it('assainit le HTML des articles comme l’API', async () => {
    const { body: page } = await call<AdminPage>('GET', '/v1/admin/pages/cgu');
    const sections = page.sections.map((section) =>
      section.type === 'richText'
        ? {
            ...section,
            articles: section.articles.map((article, index) =>
              index === 0
                ? {
                    ...article,
                    html: '<p onclick="x()"><b>Gras</b> <a href="javascript:alert(1)">piège</a> <a href="/contact" target="_blank">contact</a></p><script>alert(1)</script>',
                  }
                : article,
            ),
          }
        : section,
    );
    const saved = await call<AdminPage>('PUT', '/v1/admin/pages/cgu', { sections });
    const article = saved.body.sections.find((section) => section.type === 'richText');
    expect(article?.type === 'richText' && article.articles[0]?.html).toBe(
      '<p><strong>Gras</strong> piège <a href="/contact">contact</a></p>',
    );
  });
});
