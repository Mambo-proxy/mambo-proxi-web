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

  it('fournit un jeton d’aperçu et répond 404 pour une page inconnue', async () => {
    const { body } = await call<PreviewToken>('GET', '/v1/admin/pages/mission/preview-token');
    expect(body.url).toMatch(/\/mission\?preview=apercu_/);
    const missing = await call<Problem>('GET', '/v1/admin/pages/inconnue');
    expect(missing.status).toBe(404);
  });
});
