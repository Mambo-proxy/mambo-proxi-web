import { describe, expect, it } from 'vitest';
import type { AdminEvent, Event, RequestListItem } from '@/lib/api/schema';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const headers = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

async function call<T>(method: string, path: string, body?: unknown) {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }),
  );
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as T };
}

describe('agenda du back-office simulé', () => {
  it('à venir, passés, inscriptions et places', async () => {
    const upcoming = await call<AdminEvent[]>('GET', '/v1/admin/events');
    expect(upcoming.body.map((event) => event.slug)).toEqual([
      'nuit-des-saveurs-camerounaises',
      'randonnee-cascades-lobe',
      'visite-ateliers-artisans',
      'soiree-jazz-bonapriso',
      'marche-artisanal-yaounde',
      'festival-arts-douala',
    ]);
    expect(upcoming.body[0]).toMatchObject({ registrationsCount: 2, seatsTaken: 6, remainingPlaces: 34 });
    const past = await call<AdminEvent[]>('GET', '/v1/admin/events?period=past');
    expect(past.body.map((event) => event.slug)).toEqual(['soiree-contes-akwa', 'atelier-cuisine-ndole']);

    const detail = await call<AdminEvent & { registrations: RequestListItem[] }>(
      'GET',
      `/v1/admin/events/${upcoming.body[0]!.id}`,
    );
    expect(detail.body.registrations).toHaveLength(2);
    expect(detail.body.registrations.every((item) => item.type === 'EVENEMENT')).toBe(true);
  });

  it('création en brouillon, contrôles, publication sur le site', async () => {
    const invalid = await call<{ errors: { path: string }[] }>('POST', '/v1/admin/events', {
      title: ' ',
      illustration: 'evenement',
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.errors.map((error) => error.path)).toEqual(['title', 'startsAt', 'city', 'tag']);

    const created = await call<AdminEvent>('POST', '/v1/admin/events', {
      title: 'Brunch musical',
      startsAt: '2027-02-07T10:00:00.000Z',
      city: 'Douala',
      tag: 'Concert',
      illustration: 'evenement',
      capacity: 40,
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ slug: 'brunch-musical', status: 'DRAFT', remainingPlaces: 40 });
    const site = async () =>
      (await call<{ data: Event[] }>('GET', '/v1/events')).body.data.map((event) => event.slug);
    expect(await site()).not.toContain('brunch-musical');
    await call('PATCH', `/v1/admin/events/${created.body.id}`, { status: 'PUBLISHED' });
    expect(await site()).toContain('brunch-musical');

    const tooSmall = await call('PATCH', '/v1/admin/events/evt_saveurs', { capacity: 3 });
    expect(tooSmall.status).toBe(422);
    expect((await call('DELETE', `/v1/admin/events/${created.body.id}`)).status).toBe(204);
  });
});
