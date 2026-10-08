'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { ChipToggle } from '@/components/admin/editor/chip-select';
import { sidebarCountsKey } from '@/components/admin/shell/sidebar';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AppointmentAction } from '@/lib/api/schema';
import { formatClock } from '@/lib/format/date';
import {
  dayKeyOf,
  formatMinutes,
  isDateKey,
  minutesOfDay,
  parseTime,
  todayKey,
  zonedInstant,
} from './calendar-utils';
import { appointmentTitle, shortStamp, shownStart, type Appointment } from './labels';

/** Clé des listes de rendez-vous (toutes périodes). */
export const appointmentsKey = ['appointments'] as const;

const SUCCESS: Record<AppointmentAction['action'], string> = {
  confirm: 'Rendez-vous confirmé\u00A0: le client reçoit un e-mail de confirmation.',
  propose: 'Nouveau créneau proposé au client par e-mail.',
  cancel: 'Rendez-vous annulé\u00A0: le client est prévenu par e-mail.',
  complete: 'Rendez-vous marqué comme terminé.',
  notes: 'Note enregistrée.',
};

/**
 * Action sur un rendez-vous (`PATCH /v1/admin/appointments/{id}`) : met à jour le détail, les listes, le compteur
 * de la barre latérale et le tableau de bord. Les erreurs de validation (422) sont affichées par le formulaire.
 */
export function useAppointmentAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AppointmentAction }) =>
      data(browserApi.PATCH('/v1/admin/appointments/{id}', { params: { path: { id } }, body: action })),
    onSuccess: (updated, { action }) => {
      client.setQueryData(['appointment', updated.id], updated);
      void client.invalidateQueries({ queryKey: appointmentsKey });
      void client.invalidateQueries({ queryKey: sidebarCountsKey });
      void client.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(SUCCESS[action.action]);
    },
    onError: (error) => {
      if (!(error instanceof ApiError && (error.status === 422 || error.status === 401)))
        toast.error(errorMessage(error));
    },
  });
}

function ProposeForm({ appointment, onDone }: { appointment: Appointment; onDone: () => void }) {
  const action = useAppointmentAction();
  const start = shownStart(appointment);
  const today = todayKey();
  const initialDay = dayKeyOf(start) > today ? dayKeyOf(start) : today;
  const [date, setDate] = useState(initialDay);
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slots = useQuery({
    queryKey: ['availability', date, appointment.format],
    enabled: isDateKey(date),
    queryFn: () =>
      data(
        browserApi.GET('/v1/appointments/availability', {
          params: { query: { from: date, to: date, format: appointment.format } },
        }),
      ),
  });
  const daySlots = slots.data?.days[0]?.slots ?? [];
  const closedReason = slots.data?.days[0]?.closedReason;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    const minutes = parseTime(time);
    if (!isDateKey(date)) next.date = 'Indiquez la date proposée.';
    if (minutes === null) next.time = 'Indiquez l’heure proposée.';
    else if (isDateKey(date) && new Date(zonedInstant(date, minutes)).getTime() < Date.now())
      next.date = 'Choisissez une date à venir.';
    setErrors(next);
    if (Object.keys(next).length || minutes === null) return;
    action.mutate(
      {
        id: appointment.id,
        action: {
          action: 'propose',
          proposedStartsAt: zonedInstant(date, minutes),
          message: message.trim() || null,
        },
      },
      {
        onSuccess: onDone,
        onError: (error) => {
          if (error instanceof ApiError && error.status === 422)
            setErrors({ date: error.fieldErrors.proposedStartsAt ?? errorMessage(error) });
        },
      },
    );
  }

  return (
    <form id={`propose-${appointment.id}`} noValidate onSubmit={submit} className="flex flex-col gap-5">
      <p className="font-ui text-[14px] leading-5 text-text-muted">
        {appointmentTitle(appointment)} — créneau demandé&nbsp;: {shortStamp(start)}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date proposée" required error={errors.date}>
          {(control) => (
            <Input
              {...control}
              type="date"
              min={today}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setTime('');
              }}
            />
          )}
        </Field>
        <Field label="Heure (heure de Douala)" required error={errors.time}>
          {(control) => (
            <Input
              {...control}
              type="time"
              step={900}
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          )}
        </Field>
      </div>
      <div role="group" aria-label="Créneaux libres ce jour-là" className="flex flex-col gap-2">
        <p className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          Créneaux libres ce jour-là
        </p>
        {slots.isPending && isDateKey(date) ? (
          <p className="font-ui text-[13px] leading-5 text-text-muted">Recherche des créneaux…</p>
        ) : daySlots.length ? (
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const value = formatMinutes(minutesOfDay(slot.startsAt));
              return (
                <ChipToggle key={slot.startsAt} selected={time === value} onClick={() => setTime(value)}>
                  {formatClock(slot.startsAt)}
                </ChipToggle>
              );
            })}
          </div>
        ) : (
          <p className="font-ui text-[13px] leading-5 text-text-muted">
            {closedReason
              ? `${closedReason}. Vous pouvez tout de même proposer une heure.`
              : 'Aucun créneau libre ce jour-là. Vous pouvez tout de même proposer une heure.'}
          </p>
        )}
      </div>
      <Field label="Message au client" help={'Facultatif\u00A0: joint à l’e-mail de proposition.'}>
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[88px]"
          />
        )}
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" size="sm" loading={action.isPending}>
          Proposer ce créneau
        </Button>
      </div>
    </form>
  );
}

/** « Autre créneau » : date et heure proposées (créneaux libres suggérés), message facultatif au client. */
export function ProposeDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      title="Proposer un autre créneau"
      description="Le client reçoit un e-mail avec un bouton pour accepter le nouveau créneau."
      maxWidth={560}
    >
      {appointment && <ProposeForm key={appointment.id} appointment={appointment} onDone={onClose} />}
    </Modal>
  );
}

function CancelForm({ appointment, onDone }: { appointment: Appointment; onDone: () => void }) {
  const action = useAppointmentAction();
  const [message, setMessage] = useState('');
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        action.mutate(
          { id: appointment.id, action: { action: 'cancel', message: message.trim() || null } },
          { onSuccess: onDone },
        );
      }}
      className="flex flex-col gap-5"
    >
      <p className="font-ui text-[14px] leading-5 text-text-main">
        {appointmentTitle(appointment)} — {shortStamp(shownStart(appointment))}
      </p>
      <Field label="Message au client" help={'Facultatif\u00A0: joint à l’e-mail d’annulation.'}>
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-[88px]"
          />
        )}
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={onDone}>
          Garder le rendez-vous
        </Button>
        <Button type="submit" variant="dark" size="sm" loading={action.isPending}>
          Annuler le rendez-vous
        </Button>
      </div>
    </form>
  );
}

/** Confirmation de l'annulation (irréversible : le client est prévenu par e-mail). */
export function CancelDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      title={'Annuler ce rendez-vous\u00A0?'}
      description="Le client reçoit un e-mail d’annulation. Cette action est définitive."
      maxWidth={500}
    >
      {appointment && <CancelForm key={appointment.id} appointment={appointment} onDone={onClose} />}
    </Modal>
  );
}
