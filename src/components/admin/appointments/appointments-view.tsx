'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { CompactSegmented } from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { cn } from '@/lib/cn';
import { CancelDialog, ProposeDialog } from './appointment-actions';
import { AppointmentPanel } from './appointment-panel';
import {
  CALENDAR_VIEWS,
  dayKeyOf,
  hourRange,
  isDateKey,
  minutesOfDay,
  monthOf,
  parseTime,
  shiftDate,
  todayKey,
  viewRange,
  viewTitle,
  weekdayOf,
  zonedInstant,
  type CalendarView,
} from './calendar-utils';
import { AgendaList, DayStrip, MonthGrid, TimeGrid } from './calendar-views';
import { durationOf, shownStart, type Appointment } from './labels';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { PendingList } from './pending-list';

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'jour', label: 'Jour' },
  { value: 'semaine', label: 'Semaine' },
  { value: 'mois', label: 'Mois' },
];

const DESKTOP_QUERY = '(min-width: 768px)';

/** Vrai sous 768 px (vue jour en liste par défaut). */
function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(DESKTOP_QUERY);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => !window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/** État lu dans l'adresse : `?vue=jour|semaine|mois&date=yyyy-MM-dd&id=…&nouveau=1`. */
export function useCalendarParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const mobile = useIsMobile();
  const today = todayKey();
  const rawView = params.get('vue') as CalendarView | null;
  const rawDate = params.get('date');
  const state = {
    view:
      rawView && CALENDAR_VIEWS.includes(rawView)
        ? rawView
        : mobile
          ? ('jour' as const)
          : ('semaine' as const),
    date: isDateKey(rawDate) ? rawDate : today,
    id: params.get('id'),
    adding: params.get('nouveau') === '1',
    today,
  };

  const update = useCallback(
    (changes: Partial<Record<'vue' | 'date' | 'id' | 'nouveau', string | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '' || (key === 'date' && value === todayKey())) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}` as Route, { scroll: false });
    },
    [params, pathname, router],
  );

  return { ...state, update };
}

const navButton =
  'flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main';

/**
 * Rendez-vous (`93:11364`) : barre de période (précédent, titre, suivant, « Aujourd'hui » hors période en cours) et
 * sélecteur Jour / Semaine / Mois ; calendrier (752 px) et colonne « À confirmer » (340 px), remplacée par le détail
 * du rendez-vous ouvert. En mobile : liste par jour (vue jour par défaut). Vue, date et rendez-vous ouvert sont
 * conservés dans l'adresse.
 */
export function AppointmentsView() {
  const { view, date, id, adding, today, update } = useCalendarParams();
  const mobile = useIsMobile();
  const [proposeFor, setProposeFor] = useState<Appointment | null>(null);
  const [cancelFor, setCancelFor] = useState<Appointment | null>(null);

  // Vue jour : la semaine entière est chargée (bandeau des jours en mobile).
  const range = viewRange(view === 'jour' ? 'semaine' : view, date);
  const from = zonedInstant(range.start);
  const to = zonedInstant(range.end);
  const list = useQuery({
    queryKey: ['appointments', { from, to }],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/appointments', { params: { query: { from, to } } })) as Promise<{
        data: Appointment[];
        pending: Appointment[];
      }>,
    placeholderData: keepPreviousData,
  });
  const config = useQuery({
    queryKey: ['availability-config'],
    queryFn: () => data(browserApi.GET('/v1/admin/availability')),
  });
  const appointments = useMemo(() => list.data?.data ?? [], [list.data]);

  // Jours affichés : lundi → samedi, dimanche s'il est ouvert ou occupé.
  const sundayOpen =
    config.data?.rules.some((rule) => rule.weekday === 7) ||
    appointments.some((item) => weekdayOf(dayKeyOf(shownStart(item))) === 7);
  const visibleDays = range.days.filter((key) => sundayOpen || weekdayOf(key) !== 7);
  const shownDays = view === 'jour' ? [date] : visibleDays;

  const hours = hourRange([
    ...(config.data?.rules ?? []).map((rule) => ({
      start: parseTime(rule.startTime) ?? 480,
      end: parseTime(rule.endTime) ?? 1080,
    })),
    ...appointments.map((item) => {
      const start = minutesOfDay(shownStart(item));
      return { start, end: start + durationOf(item) };
    }),
  ]);

  const title = viewTitle(view, date, view === 'mois' ? range.days : shownDays);
  const inRange =
    view === 'jour'
      ? date === today
      : view === 'mois'
        ? date.slice(0, 7) === today.slice(0, 7)
        : range.days.includes(today);
  const open = (appointment: Appointment) => update({ id: appointment.id });
  const closePanel = useCallback(() => update({ id: null }), [update]);

  const calendar =
    list.isError && !list.data ? (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-border-default bg-neutral-0 p-6"
      >
        <p className="font-ui text-[15px] leading-6">Impossible de charger les rendez-vous.</p>
        <button
          type="button"
          onClick={() => void list.refetch()}
          className="rounded-[10px] border border-border-strong px-3.5 py-2.5 font-ui text-[14px] font-semibold"
        >
          Réessayer
        </button>
      </div>
    ) : !list.data ? (
      <Skeleton className="h-[607px] rounded-lg" />
    ) : view === 'mois' ? (
      <MonthGrid
        days={visibleDays}
        month={monthOf(date)}
        appointments={appointments}
        today={today}
        selectedId={id}
        onOpen={open}
        onDay={(day) => update({ vue: 'jour', date: day })}
      />
    ) : mobile ? (
      <AgendaList days={shownDays} appointments={appointments} today={today} selectedId={id} onOpen={open} />
    ) : (
      <TimeGrid
        variant={view === 'jour' ? 'day' : 'week'}
        days={shownDays}
        startHour={hours.startHour}
        endHour={hours.endHour}
        appointments={appointments}
        today={today}
        selectedId={id}
        onOpen={open}
      />
    );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => update({ date: shiftDate(view, date, -1) })}
            aria-label={
              view === 'jour'
                ? 'Jour précédent'
                : view === 'semaine'
                  ? 'Semaine précédente'
                  : 'Mois précédent'
            }
            className={navButton}
          >
            <ArrowLeft aria-hidden size={16} />
          </button>
          <h2
            aria-live="polite"
            className="min-w-0 font-ui text-[15px] leading-6 font-semibold text-text-main md:text-[16px]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => update({ date: shiftDate(view, date, 1) })}
            aria-label={
              view === 'jour' ? 'Jour suivant' : view === 'semaine' ? 'Semaine suivante' : 'Mois suivant'
            }
            className={navButton}
          >
            <ChevronRight aria-hidden size={16} />
          </button>
          {!inRange && (
            <button
              type="button"
              onClick={() => update({ date: null })}
              className="rounded-[10px] border border-border-strong bg-neutral-0 px-3 py-1.5 font-ui text-[13px] leading-5 font-semibold text-text-main hover:bg-neutral-50"
            >
              Aujourd’hui
            </button>
          )}
        </div>
        <CompactSegmented
          label="Affichage du calendrier"
          value={view}
          options={VIEW_OPTIONS}
          onChange={(vue) => update({ vue, id: null })}
          className="max-md:w-full max-md:[&>button]:flex-1 max-md:[&>button]:justify-center"
        />
      </div>

      {view === 'jour' && mobile && (
        <DayStrip
          days={visibleDays}
          value={date}
          today={today}
          appointments={appointments}
          onChange={(day) => update({ date: day })}
        />
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div
          aria-busy={list.isFetching}
          className={cn('min-w-0', list.isFetching && list.data && 'opacity-80')}
        >
          {calendar}
        </div>
        {id ? (
          <AppointmentPanel
            key={id}
            id={id}
            onClose={closePanel}
            onPropose={setProposeFor}
            onCancel={setCancelFor}
          />
        ) : null}
        <div className={cn(id && 'xl:hidden')}>
          <PendingList
            pending={list.data?.pending}
            loading={list.isPending}
            onOpen={open}
            onPropose={setProposeFor}
          />
        </div>
      </div>

      <ProposeDialog appointment={proposeFor} onClose={() => setProposeFor(null)} />
      <CancelDialog appointment={cancelFor} onClose={() => setCancelFor(null)} />
      <NewAppointmentDialog
        open={adding}
        defaultDate={date >= today ? date : today}
        config={config.data}
        onClose={() => update({ nouveau: null })}
        onCreated={(created) => update({ nouveau: null, date: dayKeyOf(created.startsAt), id: created.id })}
      />
    </div>
  );
}
