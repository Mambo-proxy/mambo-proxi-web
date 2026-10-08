import { describe, expect, it } from 'vitest';
import type { AdminReview, AdminSurveyQuestion, Review, ReviewStats, SidebarCounts } from '@/lib/api/schema';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(path: string, init: RequestInit = {}) {
  const response = await resolveMockRequest(new Request(`${API}${path}`, { headers: session, ...init }));
  const body = response.status === 204 ? null : ((await response.json()) as T);
  return { status: response.status, body: body as T };
}

const sitePage = () => call<{ data: Review[]; meta: { total: number } }>('/v1/reviews?pageSize=50');

describe('avis clients simulés', () => {
  it('statistiques calculées sur les avis (maquette : 4,8 / 5, 92 %, 68 %)', async () => {
    const { body } = await call<ReviewStats>('/v1/admin/reviews/stats');
    expect(body.toValidate).toBe(4);
    expect(body.hidden).toBe(9);
    expect(Math.round(body.average * 10) / 10).toBe(4.8);
    expect(body.recommendationRate).toBe(92);
    expect(body.responseRate).toBe(68);
    const total = Object.values(body.distribution).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(body.published + body.toValidate + (body.hidden ?? 0));
  });

  it('les avis publiés sont ceux du site', async () => {
    const site = await sitePage();
    const admin = await call<{ meta: { total: number }; counts: Record<string, number> }>(
      '/v1/admin/reviews?status=PUBLIE',
    );
    expect(admin.body.counts.PUBLIE).toBe(site.body.meta.total);
  });

  it('liste « À valider » de la maquette, filtre par service', async () => {
    const { body } = await call<{ data: AdminReview[] }>('/v1/admin/reviews?status=A_VALIDER');
    expect(body.data.slice(0, 3).map((review) => review.authorName)).toEqual([
      'Aurélie K.',
      'Hervé D.',
      'Marc O.',
    ]);
    const filtered = await call<{ data: AdminReview[]; counts: Record<string, number> }>(
      '/v1/admin/reviews?status=A_VALIDER&service=location-voiture',
    );
    expect(filtered.body.data.map((review) => review.authorName)).toEqual(['Marc O.']);
  });

  it('publication refusée sans consentement (409)', async () => {
    const { status } = await call('/v1/admin/reviews/rev_marc_o', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PUBLIE' }),
    });
    expect(status).toBe(409);
  });

  it('publier, répondre et mettre en avant : répercuté sur le site et le compteur', async () => {
    const before = (await sitePage()).body.meta.total;
    await call('/v1/admin/reviews/rev_nadia_f', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PUBLIE' }),
    });
    const counts = await call<SidebarCounts>('/v1/admin/sidebar-counts');
    expect(counts.body.reviews).toBe(3);
    expect((await sitePage()).body.meta.total).toBe(before + 1);

    await call('/v1/admin/reviews/rev_nadia_f/reply', {
      method: 'POST',
      body: JSON.stringify({ reply: 'Merci Nadia !' }),
    });
    const featured = await call<AdminReview>('/v1/admin/reviews/rev_nadia_f', {
      method: 'PATCH',
      body: JSON.stringify({ featured: true }),
    });
    expect(featured.body).toMatchObject({ featured: true, reply: 'Merci Nadia !' });
    const site = (await sitePage()).body.data.find((review) => review.id === 'rev_nadia_f');
    expect(site).toMatchObject({ featured: true, reply: 'Merci Nadia !' });

    await call('/v1/admin/reviews/rev_nadia_f', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'MASQUE' }),
    });
    expect((await sitePage()).body.meta.total).toBe(before);
  });

  it('ajout manuel validé puis supprimé', async () => {
    const invalid = await call<{ errors: { path: string }[] }>('/v1/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ authorName: '', rating: 0, text: 'court' }),
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.errors.map((error) => error.path)).toEqual(['authorName', 'rating', 'text']);
    const created = await call<AdminReview>('/v1/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ authorName: 'Léa N.', rating: 5, text: 'Une équipe formidable, merci.' }),
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ verified: false, status: 'A_VALIDER', initials: 'LN' });
    const removed = await call(`/v1/admin/reviews/${created.body.id}`, { method: 'DELETE' });
    expect(removed.status).toBe(204);
  });

  it('questions : validation, 5 actives au plus, ordre enregistré', async () => {
    const { body: questions } = await call<AdminSurveyQuestion[]>('/v1/admin/survey-questions');
    expect(questions.map((question) => question.label)).toEqual([
      'Note globale (1 à 5 étoiles)',
      'Ponctualité et professionnalisme',
      'Qualité de l’information',
      'Recommandation (0 à 10)',
      'Commentaire libre',
    ]);
    const tooMany = await call('/v1/admin/survey-questions', {
      method: 'PUT',
      body: JSON.stringify([...questions, { kind: 'TEXT', label: 'Autre', required: false, active: true }]),
    });
    expect(tooMany.status).toBe(422);
    const invalid = await call<{ errors: { path: string }[] }>('/v1/admin/survey-questions', {
      method: 'PUT',
      body: JSON.stringify([{ kind: 'CHOICE', label: ' ', options: ['Oui'], required: false, active: true }]),
    });
    expect(invalid.body.errors.map((error) => error.path)).toEqual(['0.label', '0.options']);
    const reordered = await call<AdminSurveyQuestion[]>('/v1/admin/survey-questions', {
      method: 'PUT',
      body: JSON.stringify([questions[1], questions[0], ...questions.slice(2)]),
    });
    expect(reordered.body.slice(0, 2).map((question) => [question.id, question.order])).toEqual([
      ['q2', 1],
      ['q1', 2],
    ]);
  });
});
