import { describe, expect, it } from 'vitest';
import { fillRate, seatsLabel, timeRange, toIso } from './event-model';

describe('agenda', () => {
  it('places réservées et remplissage', () => {
    expect(seatsLabel({ seatsTaken: 6, capacity: 40 })).toBe('6 / 40 places');
    expect(seatsLabel({ seatsTaken: 1, capacity: null })).toBe('1 place réservée');
    expect(seatsLabel({ seatsTaken: 3, capacity: null })).toBe('3 places réservées');
    expect(fillRate({ seatsTaken: 10, capacity: 40 })).toBe(0.25);
    expect(fillRate({ seatsTaken: 10, capacity: null })).toBeNull();
  });

  it('horaires (heure de Douala) et saisie', () => {
    expect(timeRange({ startsAt: '2026-11-14T18:00:00.000Z', endsAt: '2026-11-14T21:30:00.000Z' })).toBe(
      '19:00 – 22:30',
    );
    expect(timeRange({ startsAt: '2026-11-14T18:00:00.000Z', endsAt: null })).toBe('19:00');
    expect(toIso('', '18:00')).toBeNull();
    expect(toIso('2026-11-14', '18:00')).toMatch(/^2026-11-14T/);
  });
});
