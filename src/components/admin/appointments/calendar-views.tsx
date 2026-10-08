'use client';

import { StatusPill } from '@/components/admin/editor/editor-ui';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { cn } from '@/lib/cn';
import { formatClock } from '@/lib/format/date';
import {
  dayHeader,
  dayKeyOf,
  dayLabel,
  dayOfMonth,
  formatMinutes,
  layoutLanes,
  minutesOfDay,
  monthOf,
  weekdayShort,
  type DateKey,
} from './calendar-utils';
import {
  DOT_STYLES,
  EVENT_STYLES,
  STATUS_LABELS,
  STATUS_TONES,
  appointmentTitle,
  durationOf,
  placeLabel,
  shownStart,
  type Appointment,
} from './labels';

/** Hauteur d'une heure dans la grille (maquette : 56 px). */
const HOUR_HEIGHT = 56;

type ViewProps = {
  appointments: Appointment[];
  today: DateKey;
  selectedId: string | null;
  onOpen: (appointment: Appointment) => void;
};

/** Rendez-vous d'un jour, triés par heure. */
export function appointmentsOn(appointments: Appointment[], day: DateKey): Appointment[] {
  return appointments
    .filter((item) => dayKeyOf(shownStart(item)) === day)
    .sort((a, b) => shownStart(a).localeCompare(shownStart(b)));
}

/** Heures de début et de fin affichées (« 14:00 – 15:00 »). */
function timeRange(appointment: Appointment): string {
  const start = minutesOfDay(shownStart(appointment));
  return `${formatMinutes(start)} – ${formatMinutes((start + durationOf(appointment)) % (24 * 60))}`;
}

/** Nom accessible d'un rendez-vous : titre, jour, horaire, lieu, statut. */
function eventLabel(appointment: Appointment): string {
  return [
    appointmentTitle(appointment),
    dayLabel(dayKeyOf(shownStart(appointment))),
    timeRange(appointment),
    placeLabel(appointment),
    STATUS_LABELS[appointment.status],
  ].join(', ');
}

/**
 * Grille horaire (vue semaine `93:11535` et vue jour) : en-têtes de jours 44 px, colonne des heures 56 px, une
 * ligne par heure (56 px, filets `neutral/100`), colonnes séparées par `border/default` ; rendez-vous positionnés
 * selon l'heure et la durée (côte à côte s'ils se chevauchent).
 */
export function TimeGrid({
  days,
  startHour,
  endHour,
  variant,
  appointments,
  today,
  selectedId,
  onOpen,
}: ViewProps & { days: DateKey[]; startHour: number; endHour: number; variant: 'week' | 'day' }) {
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const columns = { gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` };
  const day = variant === 'day';
  return (
    <AdminCard className="overflow-hidden">
      <div style={columns} className="grid border-b border-border-default">
        <span aria-hidden className="h-11" />
        {days.map((key) => (
          <p
            key={key}
            id={`col-${key}`}
            aria-current={key === today ? 'date' : undefined}
            className={cn(
              'flex h-11 items-center justify-center border-l border-border-default font-ui text-[14px] leading-5 font-semibold',
              key === today ? 'text-text-brand' : 'text-text-main',
            )}
          >
            {day ? (
              <span>
                {dayHeader(key)}
                {key === today && <span className="font-medium"> · Aujourd’hui</span>}
              </span>
            ) : (
              <>
                <span aria-hidden>{dayHeader(key)}</span>
                <span className="sr-only">{dayLabel(key)}</span>
              </>
            )}
          </p>
        ))}
      </div>
      <div style={columns} className="grid">
        <div aria-hidden>
          {hours.map((hour, index) => (
            <div
              key={hour}
              style={{ height: HOUR_HEIGHT }}
              className={cn(
                'pt-1.5 text-center font-ui text-[12px] leading-4 text-text-muted',
                index < hours.length - 1 && 'border-b border-neutral-100',
              )}
            >
              {formatMinutes(hour * 60)}
            </div>
          ))}
        </div>
        {days.map((key) => {
          const list = appointmentsOn(appointments, key);
          const spans = list.map((item) => {
            const start = minutesOfDay(shownStart(item));
            return { id: item.id, start, end: start + durationOf(item) };
          });
          const lanes = layoutLanes(spans);
          return (
            <div
              key={key}
              role="group"
              aria-labelledby={`col-${key}`}
              className="relative border-l border-border-default"
            >
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  aria-hidden
                  style={{ height: HOUR_HEIGHT }}
                  className={cn(index < hours.length - 1 && 'border-b border-neutral-100')}
                />
              ))}
              {list.length === 0 && <span className="sr-only">Aucun rendez-vous</span>}
              {list.map((item, index) => {
                const span = spans[index]!;
                const lane = lanes.get(item.id) ?? { lane: 0, lanes: 1 };
                const top = ((span.start - startHour * 60) * HOUR_HEIGHT) / 60 + 2;
                const height = Math.max(24, ((span.end - span.start) * HOUR_HEIGHT) / 60 - 4);
                const selected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item)}
                    aria-label={eventLabel(item)}
                    aria-current={selected ? 'true' : undefined}
                    style={{
                      top,
                      height,
                      left: `calc(3px + (100% - 7px) * ${lane.lane / lane.lanes})`,
                      width: `calc((100% - 7px) / ${lane.lanes} - ${lane.lanes > 1 ? 2 : 0}px)`,
                    }}
                    className={cn(
                      'absolute flex flex-col items-start gap-0.5 overflow-hidden rounded-sm border-l-[3px] text-left transition-shadow hover:shadow-2',
                      day ? 'px-3 py-2' : 'px-2 py-1.5',
                      EVENT_STYLES[item.status],
                      selected && 'shadow-2 ring-2 ring-neutral-900',
                    )}
                  >
                    <span
                      data-title
                      className={cn(
                        'font-ui font-semibold text-text-main',
                        day ? 'text-[13px] leading-[18px]' : 'text-[11px] leading-4',
                      )}
                    >
                      {appointmentTitle(item)}
                    </span>
                    <span
                      className={cn(
                        'font-ui text-text-muted',
                        day ? 'text-[12px] leading-4' : 'text-[10px] leading-4',
                      )}
                    >
                      {day ? timeRange(item) : formatClock(shownStart(item))} ·{' '}
                      {item.status === 'AUTRE_CRENEAU_PROPOSE' ? 'Créneau proposé' : placeLabel(item)}
                      {day && ` · ${STATUS_LABELS[item.status]}`}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

/**
 * Vue mois (non maquettée, même langage) : semaines du lundi au samedi (dimanche si ouvert), trois rendez-vous au
 * plus par jour puis « + n autres » ; le numéro du jour ouvre la vue jour. En mobile : pastilles de couleur.
 */
export function MonthGrid({
  days,
  month,
  appointments,
  today,
  selectedId,
  onOpen,
  onDay,
}: ViewProps & { days: DateKey[]; month: number; onDay: (day: DateKey) => void }) {
  const weekdays = [...new Set(days.map(weekdayShort))];
  const columns = { gridTemplateColumns: `repeat(${weekdays.length}, minmax(0, 1fr))` };
  return (
    <AdminCard className="overflow-hidden">
      <div style={columns} className="grid border-b border-border-default">
        {weekdays.map((name, index) => (
          <p
            key={name}
            className={cn(
              'flex h-11 items-center justify-center font-ui text-[13px] leading-5 font-semibold text-text-main md:text-[14px]',
              index > 0 && 'border-l border-border-default',
            )}
          >
            {name}
          </p>
        ))}
      </div>
      <ul style={columns} className="grid">
        {days.map((key, index) => {
          const list = appointmentsOn(appointments, key);
          const outside = monthOf(key) !== month;
          const isToday = key === today;
          const label = `${dayLabel(key)}\u00A0: ${list.length ? `${list.length} rendez-vous` : 'aucun rendez-vous'}`;
          return (
            <li
              key={key}
              className={cn(
                'flex min-w-0 flex-col gap-1 border-border-default p-1 md:min-h-[112px] md:p-1.5',
                index % weekdays.length > 0 && 'border-l',
                index >= weekdays.length && 'border-t',
                outside && 'bg-neutral-50',
              )}
            >
              <button
                type="button"
                onClick={() => onDay(key)}
                aria-label={`${label} — afficher la journée`}
                aria-current={isToday ? 'date' : undefined}
                className="flex min-h-11 flex-col items-center gap-1 rounded-sm py-1 hover:bg-neutral-50 md:min-h-0 md:flex-row md:self-start md:px-1"
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full font-ui text-[13px] leading-5 font-semibold',
                    isToday
                      ? 'bg-brand-primary text-text-on-primary'
                      : outside
                        ? 'text-text-muted'
                        : 'text-text-main',
                  )}
                >
                  {dayOfMonth(key)}
                </span>
                <span aria-hidden className="flex gap-0.5 md:hidden">
                  {list.slice(0, 3).map((item) => (
                    <span key={item.id} className={cn('size-1.5 rounded-full', DOT_STYLES[item.status])} />
                  ))}
                </span>
              </button>
              <div className="hidden flex-col gap-1 md:flex">
                {list.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item)}
                    aria-label={eventLabel(item)}
                    aria-current={item.id === selectedId ? 'true' : undefined}
                    className={cn(
                      'truncate rounded-xs border-l-[3px] px-1.5 py-0.5 text-left font-ui text-[11px] leading-4 font-semibold text-text-main hover:shadow-1',
                      EVENT_STYLES[item.status],
                      item.id === selectedId && 'ring-2 ring-neutral-900',
                    )}
                  >
                    <span className="font-medium text-text-muted">{formatClock(shownStart(item))}</span>{' '}
                    <span data-title>{appointmentTitle(item)}</span>
                  </button>
                ))}
                {list.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onDay(key)}
                    className="self-start rounded-xs px-1.5 font-ui text-[11px] leading-4 font-semibold text-text-muted hover:text-text-main"
                  >
                    + {list.length - 3} autre{list.length - 3 > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}

/** Rendez-vous d'un jour en liste (mobile) : carte bordée à gauche, horaire, lieu, statut. */
function AgendaItem({
  appointment,
  selected,
  onOpen,
}: {
  appointment: Appointment;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex w-full flex-col items-start gap-1.5 rounded-md border-l-[3px] p-3.5 text-left',
          EVENT_STYLES[appointment.status],
          selected && 'ring-2 ring-neutral-900',
        )}
      >
        <span className="flex w-full items-start justify-between gap-3">
          <span data-title className="font-ui text-[14px] leading-5 font-semibold text-text-main">
            {appointmentTitle(appointment)}
          </span>
          <StatusPill tone={STATUS_TONES[appointment.status]} className="shrink-0">
            {STATUS_LABELS[appointment.status]}
          </StatusPill>
        </span>
        <span className="font-ui text-[13px] leading-5 text-text-muted">
          {timeRange(appointment)} · {placeLabel(appointment)}
        </span>
      </button>
    </li>
  );
}

/** Liste par jour (vues jour et semaine en mobile) : utilisable au doigt, un bouton par rendez-vous. */
export function AgendaList({
  days,
  appointments,
  today,
  selectedId,
  onOpen,
}: ViewProps & { days: DateKey[] }) {
  return (
    <div className="flex flex-col gap-5">
      {days.map((key) => {
        const list = appointmentsOn(appointments, key);
        return (
          <section key={key} aria-labelledby={`agenda-${key}`} className="flex flex-col gap-2">
            <h3
              id={`agenda-${key}`}
              className={cn(
                'font-ui text-[14px] leading-5 font-semibold first-letter:uppercase',
                key === today ? 'text-text-brand' : 'text-text-main',
              )}
            >
              {dayLabel(key)}
              {key === today && ' · aujourd’hui'}
            </h3>
            {list.length ? (
              <ul className="flex flex-col gap-2">
                {list.map((item) => (
                  <AgendaItem
                    key={item.id}
                    appointment={item}
                    selected={item.id === selectedId}
                    onOpen={() => onOpen(item)}
                  />
                ))}
              </ul>
            ) : (
              <p className="rounded-md border border-dashed border-border-default px-3.5 py-3 font-ui text-[13px] leading-5 text-text-muted">
                Aucun rendez-vous.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Bandeau des jours de la semaine (vue jour en mobile) : jour choisi, aujourd'hui, pastille si rendez-vous. */
export function DayStrip({
  days,
  value,
  today,
  appointments,
  onChange,
}: {
  days: DateKey[];
  value: DateKey;
  today: DateKey;
  appointments: Appointment[];
  onChange: (day: DateKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Jours de la semaine"
      style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      className="grid gap-1 rounded-md bg-neutral-100 p-1"
    >
      {days.map((key) => {
        const active = key === value;
        const count = appointmentsOn(appointments, key).length;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            aria-label={`${dayLabel(key)}${count ? `\u00A0: ${count} rendez-vous` : ''}`}
            onClick={() => onChange(key)}
            className={cn(
              'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[9px] font-ui transition-colors',
              active ? 'bg-neutral-0 shadow-1' : 'hover:bg-neutral-50',
            )}
          >
            <span
              className={cn('text-[11px] leading-4', key === today ? 'text-text-brand' : 'text-text-muted')}
            >
              {weekdayShort(key)}
            </span>
            <span
              className={cn(
                'text-[14px] leading-5 font-semibold',
                key === today ? 'text-text-brand' : 'text-text-main',
              )}
            >
              {dayOfMonth(key)}
            </span>
            <span
              aria-hidden
              className={cn('size-1 rounded-full', count ? 'bg-brand-primary' : 'bg-transparent')}
            />
          </button>
        );
      })}
    </div>
  );
}
