import { describe, expect, it } from 'vitest';
import type { AdminAppointment, AvailabilityConfig } from '@/lib/api/schema';
import { computeAvailability } from './data/admin-appointments';
import { resolveMockRequest } from './resolve';
import { MOCK_COOKIE_HEADER } from './session';

const API = 'http://localhost:4000';
const session = { [MOCK_COOKIE_HEADER]: 'mp_at=usr_mireille', 'Content-Type': 'application/json' };

const config: AvailabilityConfig = {
  rules: [
    { weekday: 1, startTime: '09:00', endTime: '12:00', slotMinutes: 60, formats: ['AGENCE', 'VISIO'] },
    { weekday: 6, startTime: '09:00', endTime: '11:00', slotMinutes: 60, formats: ['TELEPHONE'] },
  ],
  exceptions: [{ date: '2026-11-16', closed: true, label: 'Fermeture' }],
  minNoticeHours: 24,
  maxAdvanceDays: 60,
};

describe('disponibilités simulées', () => {
  // Lundi 9 novembre 2026, 06:00 heure de Douala.
  const now = Date.parse('2026-11-09T05:00:00.000Z');
  const booked = {
    status: 'CONFIRME',
    startsAt: '2026-11-14T09:00:00.000Z', // samedi 10:00 à Douala
    endsAt: '2026-11-14T10:00:00.000Z',
    proposedStartsAt: null,
  } as AdminAppointment;

  it('applique règles, délai de prévenance, rendez-vous pris et fermetures', () => {
    const { days } = computeAvailability(config, [booked], '2026-11-09', '2026-11-16', { now });
    const byDate = Object.fromEntries(days.map((day) => [day.date, day]));
    // Lundi même : moins de 24 h avant chaque créneau.
    expect(byDate['2026-11-09']).toMatchObject({ available: false, closedReason: null });
    expect(byDate['2026-11-10']).toMatchObject({ available: false, closedReason: 'Fermé le mardi' });
    // Samedi : 09:00 libre, 10:00 pris.
    expect(byDate['2026-11-14']?.slots.map((slot) => slot.startsAt)).toEqual(['2026-11-14T08:00:00.000Z']);
    expect(byDate['2026-11-16']).toMatchObject({ available: false, closedReason: 'Fermeture' });
  });

  it('filtre par format', () => {
    const { days } = computeAvailability(config, [], '2026-11-14', '2026-11-14', { now, format: 'VISIO' });
    expect(days[0]?.slots).toEqual([]);
  });
});

describe('rendez-vous simulés', () => {
  it('confirme un rendez-vous à confirmer et met à jour le compteur', async () => {
    const counts = async () =>
      (await (
        await resolveMockRequest(new Request(`${API}/v1/admin/sidebar-counts`, { headers: session }))
      ).json()) as {
        appointments: number;
      };
    expect((await counts()).appointments).toBe(3);
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/appointments/apt_0139`, {
        method: 'PATCH',
        headers: session,
        body: JSON.stringify({ action: 'confirm' }),
      }),
    );
    expect(response.status).toBe(200);
    expect(((await response.json()) as AdminAppointment).status).toBe('CONFIRME');
    expect((await counts()).appointments).toBe(2);
  });

  it('valide la saisie manuelle champ par champ', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/appointments`, {
        method: 'POST',
        headers: session,
        body: JSON.stringify({ contact: { fullName: 'A', email: 'x', phone: '06' }, reason: 'DEVIS' }),
      }),
    );
    expect(response.status).toBe(422);
    const body = (await response.json()) as { errors: { path: string }[] };
    expect(body.errors.map((error) => error.path)).toEqual([
      'contact.fullName',
      'contact.email',
      'contact.phone',
      'format',
      'startsAt',
    ]);
  });

  it('refuse des disponibilités incohérentes', async () => {
    const response = await resolveMockRequest(
      new Request(`${API}/v1/admin/availability`, {
        method: 'PUT',
        headers: session,
        body: JSON.stringify({ ...config, rules: [{ ...config.rules[0], endTime: '08:00' }] }),
      }),
    );
    expect(response.status).toBe(422);
    const body = (await response.json()) as { errors: { path: string }[] };
    expect(body.errors[0]?.path).toBe('rules[0].endTime');
  });
});
