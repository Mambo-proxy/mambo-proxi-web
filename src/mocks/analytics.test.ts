import { beforeEach, describe, expect, it } from 'vitest';
import type { AnalyticsBatchAccepted, AnalyticsSummary, Problem } from '@/lib/api/schema';
import { resetAnalyticsStore } from './data/analytics';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille' };
const VISITOR = '6f1c2a4e-8b3d-4c7a-9e21-5d0f3b7a1c88';

async function call<T>(path: string, init: RequestInit = {}) {
  const response = await resolveMockRequest(new Request(`${API}${path}`, init));
  return { status: response.status, body: (await response.json()) as T };
}

const send = (body: unknown, contentType = 'text/plain;charset=UTF-8') =>
  call<AnalyticsBatchAccepted & Problem>('/v1/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const summary = (query = '') =>
  call<AnalyticsSummary>(`/v1/admin/analytics/summary${query}`, { headers: session });

const now = () => new Date().toISOString();
const pageView = (path = '/', lang = 'fr') => ({
  type: 'page_view',
  path,
  lang,
  occurredAt: now(),
  device: 'mobile',
});
const action = (name: string, path = '/') => ({
  type: 'action',
  action: name,
  step: 'click',
  path,
  lang: 'fr',
  occurredAt: now(),
  device: 'desktop',
});

describe('mesure d’audience simulée : envoi des événements', () => {
  beforeEach(() => resetAnalyticsStore());

  it('accepte un lot sans consentement envoyé en text/plain (navigator.sendBeacon)', async () => {
    const { status, body } = await send({ consent: false, events: [pageView(), action('whatsapp')] });
    expect(status).toBe(202);
    expect(body).toEqual({ accepted: 2, rejected: 0 });
  });

  it('accepte un lot avec consentement et identifiant en application/json', async () => {
    const { status, body } = await send(
      { consent: true, visitorId: VISITOR, events: [pageView('/devis')] },
      'application/json',
    );
    expect(status).toBe(202);
    expect(body.accepted).toBe(1);
  });

  it('refuse un identifiant de visiteur sans consentement (422)', async () => {
    const { status, body } = await send({ consent: false, visitorId: VISITOR, events: [pageView()] });
    expect(status).toBe(422);
    expect(body.errors?.map((error) => error.path)).toContain('visitorId');
  });

  it('refuse un JSON illisible (400) et un lot de plus de 16 Kio (413)', async () => {
    expect((await send('{pas du json')).status).toBe(400);
    const large = { consent: false, events: [{ ...pageView(), path: `/${'a'.repeat(17_000)}` }] };
    expect((await send(large)).status).toBe(413);
  });

  it('valide les événements : lot vide, plus de 50 événements, action inconnue (422)', async () => {
    expect((await send({ consent: false, events: [] })).status).toBe(422);
    expect(
      (await send({ consent: false, events: Array.from({ length: 51 }, () => pageView()) })).status,
    ).toBe(422);
    const unknown = await send({ consent: false, events: [action('telechargement')] });
    expect(unknown.status).toBe(422);
    expect(unknown.body.errors?.[0]?.path).toBe('events.0.action');
  });

  it('rejette les événements trop anciens et les pages du back-office', async () => {
    const old = { ...pageView(), occurredAt: new Date(Date.now() - 2 * 86_400_000).toISOString() };
    const { status, body } = await send({ consent: false, events: [old, pageView('/admin'), pageView()] });
    expect(status).toBe(202);
    expect(body).toEqual({ accepted: 1, rejected: 2 });
  });
});

describe('mesure d’audience simulée : statistiques', () => {
  beforeEach(() => resetAnalyticsStore());

  it('demande une session (401) et la permission analytics:read (403 pour un éditeur)', async () => {
    expect((await call('/v1/admin/analytics/summary')).status).toBe(401);
    const editor = await call('/v1/admin/analytics/summary', {
      headers: { [MOCK_COOKIE_HEADER]: 'mp_at=usr_equipe' },
    });
    expect(editor.status).toBe(403);
  });

  it('un point par jour selon la période, toutes les actions triées', async () => {
    for (const [period, days] of [
      ['7d', 7],
      ['30d', 30],
      ['90d', 90],
    ] as const) {
      const { status, body } = await summary(`?period=${period}`);
      expect(status).toBe(200);
      expect(body.period).toBe(period);
      expect(body.series).toHaveLength(days);
      expect(body.actions).toHaveLength(12);
      const counts = body.actions.map((item) => item.count);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
      expect(body.topPages.length).toBeLessThanOrEqual(10);
      expect(body.totals.pageViews.value).toBe(body.series.reduce((sum, point) => sum + point.pageViews, 0));
    }
  });

  it('30 jours par défaut, période inconnue refusée (422)', async () => {
    expect((await summary()).body.period).toBe('30d');
    expect((await summary('?period=12m')).status).toBe(422);
  });

  it('les événements reçus dans la session s’ajoutent aux statistiques', async () => {
    const before = (await summary('?period=7d')).body;
    await send({
      consent: true,
      visitorId: VISITOR,
      events: [pageView('/devis'), action('quote', '/devis'), action('quote', '/devis')],
    });
    const after = (await summary('?period=7d')).body;
    expect(after.totals.pageViews.value).toBe((before.totals.pageViews.value ?? 0) + 1);
    expect(after.totals.actions.value).toBe((before.totals.actions.value ?? 0) + 2);
    const quotes = (body: AnalyticsSummary) =>
      body.actions.find((item) => item.action === 'quote')?.count ?? 0;
    expect(quotes(after)).toBe(quotes(before) + 2);
    expect(after.series.at(-1)?.visitors).toBe((before.series.at(-1)?.visitors ?? 0) + 1);
  });

  it('filtre par langue : pages vues anglaises minoritaires', async () => {
    const all = (await summary('?period=30d')).body.totals.pageViews.value ?? 0;
    const en = (await summary('?period=30d&lang=en')).body.totals.pageViews.value ?? 0;
    expect(en).toBeGreaterThan(0);
    expect(en).toBeLessThan(all / 2);
  });
});
