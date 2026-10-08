'use client';

import { CalendarDays, Check, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { useAppointmentAction } from './appointment-actions';
import { FORMAT_LABELS, REASON_LABELS, displayName, shortStamp, type Appointment } from './labels';

const cardButton =
  'flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] px-3 font-ui text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors disabled:opacity-60 [&_svg]:size-4';

function PendingCard({
  appointment,
  onOpen,
  onPropose,
}: {
  appointment: Appointment;
  onOpen: () => void;
  onPropose: () => void;
}) {
  const action = useAppointmentAction();
  const name = displayName(appointment.contact);
  const details = [REASON_LABELS[appointment.reason], appointment.subject, FORMAT_LABELS[appointment.format]]
    .filter(Boolean)
    .join(' · ');
  return (
    <li className="flex flex-col gap-2.5 rounded-lg border border-border-default bg-neutral-0 p-[18px]">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-ui text-[14px] leading-5 font-semibold text-text-main">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-xs text-left hover:underline"
            aria-label={`${name} — voir le détail du rendez-vous`}
          >
            {name}
          </button>
        </h3>
        <p className="font-ui text-[12px] leading-4 text-text-muted">{details}</p>
      </div>
      <p className="flex items-center gap-2 font-ui text-[13px] leading-5 font-medium text-text-main">
        <CalendarDays aria-hidden size={14} className="shrink-0 text-brand-primary" />
        {shortStamp(appointment.startsAt)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={action.isPending}
          onClick={() => action.mutate({ id: appointment.id, action: { action: 'confirm' } })}
          aria-label={`Confirmer le rendez-vous de ${name}`}
          className={cn(cardButton, 'bg-brand-primary text-text-on-primary hover:bg-brand-primary-hover')}
        >
          {action.isPending ? <Spinner /> : <Check aria-hidden />}
          Confirmer
        </button>
        <button
          type="button"
          onClick={onPropose}
          aria-label={`Proposer un autre créneau à ${name}`}
          className={cn(
            cardButton,
            'border border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-50',
          )}
        >
          Autre créneau
        </button>
      </div>
    </li>
  );
}

/**
 * Colonne « À confirmer » (`93:11650`) : compteur, une carte par demande de rendez-vous (nom, motif · format, date,
 * « Confirmer » / « Autre créneau »), encart d'information sur l'e-mail de confirmation et le rappel.
 */
export function PendingList({
  pending,
  loading,
  onOpen,
  onPropose,
}: {
  pending: Appointment[] | undefined;
  loading: boolean;
  onOpen: (appointment: Appointment) => void;
  onPropose: (appointment: Appointment) => void;
}) {
  return (
    <section aria-labelledby="pending-title" className="flex flex-col gap-3">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <h2 id="pending-title" className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          À confirmer
        </h2>
        {pending && pending.length > 0 && (
          <span className="rounded-full bg-brand-primary px-2 py-0.5 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-on-primary">
            {pending.length}
            <span className="sr-only"> rendez-vous à confirmer</span>
          </span>
        )}
      </div>
      {loading && !pending ? (
        <div aria-hidden className="flex flex-col gap-3">
          <Skeleton className="h-[156px] rounded-lg" />
          <Skeleton className="h-[156px] rounded-lg" />
        </div>
      ) : pending && pending.length > 0 ? (
        <ul className="grid gap-3 md:max-xl:grid-cols-2">
          {pending.map((appointment) => (
            <PendingCard
              key={appointment.id}
              appointment={appointment}
              onOpen={() => onOpen(appointment)}
              onPropose={() => onPropose(appointment)}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-border-default bg-neutral-0 p-[18px] font-ui text-[14px] leading-5 text-text-muted">
          Aucun rendez-vous à confirmer. Les demandes envoyées depuis le site arrivent ici.
        </p>
      )}
      <p className="flex gap-2 rounded-md bg-neutral-100 p-3 font-ui text-[12px] leading-[17px] text-text-muted">
        <Info aria-hidden size={16} className="mt-px shrink-0" />À la confirmation, le client reçoit
        automatiquement un e-mail et un rappel la veille.
      </p>
    </section>
  );
}
