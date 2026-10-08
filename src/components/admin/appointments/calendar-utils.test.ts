import { describe, expect, it } from 'vitest';
import {
  dayHeader,
  dayKeyOf,
  formatDuration,
  hourRange,
  isDateKey,
  layoutLanes,
  minutesOfDay,
  shiftDate,
  startOfWeek,
  viewRange,
  viewTitle,
  zonedInstant,
} from './calendar-utils';

describe('calendrier des rendez-vous', () => {
  it('semaine du lundi au dimanche et titre de la maquette', () => {
    const { days, start, end } = viewRange('semaine', '2026-11-12');
    expect(start).toBe('2026-11-09');
    expect(end).toBe('2026-11-16');
    expect(viewTitle('semaine', '2026-11-12', days.slice(0, 6))).toBe('Semaine du 9 au 14 novembre 2026');
    expect(viewTitle('semaine', '2026-09-28', viewRange('semaine', '2026-09-28').days.slice(0, 6))).toBe(
      'Semaine du 28 septembre au 3 octobre 2026',
    );
    expect(viewTitle('semaine', '2026-12-30', viewRange('semaine', '2026-12-30').days)).toBe(
      'Semaine du 28 décembre 2026 au 3 janvier 2027',
    );
    expect(dayHeader('2026-11-12')).toBe('Jeu 12');
  });

  it('mois : semaines complètes et navigation', () => {
    const { days } = viewRange('mois', '2026-11-12');
    expect(days[0]).toBe('2026-10-26');
    expect(days.at(-1)).toBe('2026-12-06');
    expect(days).toHaveLength(42);
    expect(viewTitle('mois', '2026-11-12', days)).toBe('Novembre 2026');
    expect(shiftDate('mois', '2026-01-31', -1)).toBe('2025-12-01');
    expect(shiftDate('semaine', '2026-11-12', 1)).toBe('2026-11-16');
    expect(shiftDate('jour', '2026-11-30', 1)).toBe('2026-12-01');
    expect(viewTitle('jour', '2026-11-01', ['2026-11-01'])).toBe('Dimanche 1er novembre 2026');
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09');
  });

  it('heures de Douala (UTC+1)', () => {
    const instant = zonedInstant('2026-11-12', 14 * 60);
    expect(instant).toBe('2026-11-12T13:00:00.000Z');
    expect(minutesOfDay(instant)).toBe(840);
    expect(dayKeyOf('2026-11-12T23:30:00.000Z')).toBe('2026-11-13');
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('2026-02-28')).toBe(true);
  });

  it('rendez-vous qui se chevauchent côte à côte', () => {
    const lanes = layoutLanes([
      { id: 'a', start: 540, end: 600 },
      { id: 'b', start: 570, end: 660 },
      { id: 'c', start: 600, end: 630 },
      { id: 'd', start: 700, end: 760 },
    ]);
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get('b')).toEqual({ lane: 1, lanes: 2 });
    expect(lanes.get('c')).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get('d')).toEqual({ lane: 0, lanes: 1 });
  });

  it('plage horaire et durées', () => {
    expect(hourRange([])).toEqual({ startHour: 8, endHour: 18 });
    expect(hourRange([{ start: 7 * 60 + 30, end: 19 * 60 + 15 }])).toEqual({ startHour: 7, endHour: 20 });
    expect(formatDuration(90)).toBe('1\u00A0h\u00A030');
    expect(formatDuration(45)).toBe('45\u00A0min');
  });
});
