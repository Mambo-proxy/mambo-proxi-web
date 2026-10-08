'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  Check,
  CircleCheck,
  Contact,
  FileText,
  Handshake,
  BriefcaseBusiness,
  Mail,
  Phone,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useRef, useState } from 'react';
import { StatusPill } from '@/components/admin/editor/editor-ui';
import { ActionMenu, type ActionMenuItem } from '@/components/admin/ui/action-menu';
import { AdminCard, ContactAvatar, locationLabel } from '@/components/admin/ui/admin-ui';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { formatClock, formatStamp } from '@/lib/format/date';
import { formatPhone } from '@/lib/phone';
import { whatsappUrl } from '@/lib/whatsapp';
import { useAppointmentAction } from './appointment-actions';
import { dayKeyOf, dayLabel, formatDuration } from './calendar-utils';
import {
  FORMAT_LABELS,
  REASON_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
  appointmentTitle,
  durationOf,
  shownStart,
  type Appointment,
} from './labels';

const quickAction =
  'flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3 py-2.5 font-ui text-[14px] leading-5 font-semibold whitespace-nowrap text-text-main hover:bg-neutral-50 [&_svg]:size-4';

const relatedLink =
  'flex items-center gap-2.5 rounded-md border border-border-default px-3.5 py-3 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-icon-default';

/** Liens vers les écrans liés : demandes du contact, fiche contact, partenariat ou candidature selon le motif. */
function relatedLinks(appointment: Appointment) {
  const links: { href: string; label: string; icon: typeof FileText }[] = [
    {
      href: `${adminRoutes.requests}?q=${encodeURIComponent(appointment.contact.email)}`,
      label: 'Demandes de ce contact',
      icon: FileText,
    },
    { href: `${adminRoutes.contacts}/${appointment.contact.id}`, label: 'Fiche contact', icon: Contact },
  ];
  if (appointment.reason === 'PARTENARIAT')
    links.push({
      href: adminRoutes.partners,
      label: 'Partenaires et demandes de partenariat',
      icon: Handshake,
    });
  if (appointment.reason === 'RECRUTEMENT')
    links.push({ href: adminRoutes.jobs, label: 'Recrutement et candidatures', icon: BriefcaseBusiness });
  return links;
}

/**
 * Détail d'un rendez-vous (non maquetté, langage du détail des demandes) : motif et objet, statut, date et horaire
 * (heure de Douala), contact et actions rapides, format, lieu ou lien visio, message du client, notes internes,
 * liens vers les écrans liés, actions du contrat (confirmer, proposer un autre créneau, terminer, annuler).
 * Dans la colonne de droite à partir de 1280 px, en panneau superposé en dessous.
 */
export function AppointmentPanel({
  id,
  onClose,
  onPropose,
  onCancel,
}: {
  id: string;
  onClose: () => void;
  onPropose: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const action = useAppointmentAction();
  const notesAction = useAppointmentAction();
  const query = useQuery({
    queryKey: ['appointment', id],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/appointments/{id}', { params: { path: { id } } }),
      ) as Promise<Appointment>,
  });
  const appointment = query.data;
  const [notes, setNotes] = useState<string | null>(null);
  const savedNotes = appointment?.notes ?? '';
  const draft = notes ?? savedNotes;

  // Sous 1280 px, le panneau est superposé : Échap le ferme et le focus y est placé.
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  const start = appointment ? shownStart(appointment) : null;
  const status = appointment?.status;
  const open = status === 'A_CONFIRMER' || status === 'AUTRE_CRENEAU_PROPOSE' || status === 'CONFIRME';
  const firstName = appointment?.contact.fullName.split(' ')[0] ?? '';

  const menu: ActionMenuItem[] = appointment
    ? [
        ...(status === 'CONFIRME'
          ? [
              {
                label: 'Proposer un autre créneau',
                icon: CalendarClock,
                onSelect: () => onPropose(appointment),
              },
            ]
          : []),
        ...(open
          ? [
              {
                label: 'Annuler le rendez-vous',
                icon: XCircle,
                danger: true,
                onSelect: () => onCancel(appointment),
              },
            ]
          : []),
      ]
    : [];

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-40 bg-surface-overlay xl:hidden" />
      <AdminCard
        ref={panel}
        tabIndex={-1}
        role="region"
        aria-label={appointment ? `Rendez-vous ${appointment.reference}` : 'Détail du rendez-vous'}
        className={cn(
          'flex flex-col gap-5 p-6 outline-none',
          'max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:z-50 max-xl:w-full max-xl:max-w-[460px] max-xl:overflow-y-auto max-xl:rounded-none max-xl:border-0 max-xl:shadow-4',
          'xl:sticky xl:top-[107px]',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-ui text-[12px] leading-4 text-text-muted">{appointment?.reference ?? ' '}</p>
            <h2 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
              {appointment ? appointmentTitle(appointment) : 'Chargement…'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le détail"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100"
          >
            <X aria-hidden size={16} />
          </button>
        </div>

        {query.isError ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="font-ui text-[14px] leading-5 text-feedback-error">{errorMessage(query.error)}</p>
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              Réessayer
            </Button>
          </div>
        ) : !appointment || !start ? (
          <div aria-hidden className="flex flex-col gap-3">
            <Skeleton className="h-16 rounded-[14px]" />
            <Skeleton className="h-[86px] rounded-[14px]" />
            <Skeleton className="h-40 rounded-md" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded-[14px] bg-neutral-50 p-3.5">
              <StatusPill tone={STATUS_TONES[appointment.status]} className="self-start">
                {STATUS_LABELS[appointment.status]}
              </StatusPill>
              <p className="font-ui text-[15px] leading-6 font-semibold text-text-main first-letter:uppercase">
                {dayLabel(dayKeyOf(start), true)}
              </p>
              <p className="font-ui text-[13px] leading-5 text-text-muted">
                {formatClock(start)} · {formatDuration(durationOf(appointment))} · heure de Douala
              </p>
              {appointment.status === 'AUTRE_CRENEAU_PROPOSE' && (
                <p className="font-ui text-[12px] leading-4 text-text-muted">
                  Créneau proposé au client, en attente de sa réponse. Créneau demandé à l’origine&nbsp;:{' '}
                  {formatStamp(appointment.startsAt)}.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ContactAvatar
                name={appointment.contact.fullName}
                initials={appointment.contact.initials}
                size={40}
              />
              <div className="flex min-w-0 flex-col gap-0.5 font-ui text-[12px] leading-4 text-text-muted">
                <p className="text-[14px] leading-5 font-semibold text-text-main">
                  {appointment.contact.fullName}
                </p>
                <p className="break-words">
                  {appointment.contact.email}
                  {appointment.contact.phone && ` · ${formatPhone(appointment.contact.phone)}`}
                </p>
                {(appointment.contact.city || appointment.contact.country) && (
                  <p>{locationLabel(appointment.contact.city, appointment.contact.country)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {appointment.contact.phone && (
                <a
                  href={whatsappUrl(
                    appointment.contact.phone,
                    `Bonjour ${firstName}, c’est MAMBO Proxi au sujet de votre rendez-vous ${appointment.reference}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quickAction}
                >
                  <WhatsappIcon aria-hidden />
                  WhatsApp
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              )}
              <a href={`mailto:${appointment.contact.email}`} className={quickAction}>
                <Mail aria-hidden />
                E-mail
              </a>
              {appointment.contact.phone && (
                <a href={`tel:${appointment.contact.phone}`} className={quickAction}>
                  <Phone aria-hidden />
                  Appeler
                </a>
              )}
            </div>

            <dl className="flex flex-col gap-2.5 font-ui text-[14px] leading-5">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Motif</dt>
                <dd className="text-right font-semibold text-text-main">
                  {REASON_LABELS[appointment.reason]}
                </dd>
              </div>
              {appointment.subject && (
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Objet</dt>
                  <dd className="text-right font-semibold text-text-main">{appointment.subject}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Format</dt>
                <dd className="text-right font-semibold text-text-main">
                  {FORMAT_LABELS[appointment.format]}
                </dd>
              </div>
              {appointment.location && (
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Lieu</dt>
                  <dd className="text-right font-semibold text-text-main">{appointment.location}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Demandé le</dt>
                <dd className="text-right font-semibold text-text-main">
                  {formatStamp(appointment.createdAt)}
                </dd>
              </div>
              {appointment.reminderSentAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Rappel envoyé</dt>
                  <dd className="text-right font-semibold text-text-main">
                    {formatStamp(appointment.reminderSentAt)}
                  </dd>
                </div>
              )}
            </dl>

            {appointment.videoLink && (
              <a
                href={appointment.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(relatedLink, 'break-all')}
              >
                <Video aria-hidden />
                Rejoindre la visio
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            )}

            {appointment.message && (
              <div className="flex flex-col gap-1.5 rounded-md border border-border-default p-3.5">
                <p className="font-ui text-[12px] leading-4 font-semibold text-text-muted">
                  Message du client
                </p>
                <p className="font-ui text-[14px] leading-[21px] text-text-main">
                  «&nbsp;{appointment.message}&nbsp;»
                </p>
              </div>
            )}

            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                notesAction.mutate(
                  { id, action: { action: 'notes', notes: draft.trim() || null } },
                  { onSuccess: () => setNotes(null) },
                );
              }}
            >
              <label
                htmlFor={`apt-notes-${id}`}
                className="font-ui text-[14px] leading-5 font-semibold text-text-main"
              >
                Notes internes
              </label>
              <textarea
                id={`apt-notes-${id}`}
                value={draft}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Ajouter une note pour l’équipe…"
                className="min-h-[72px] w-full resize-y rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 font-ui text-[16px] leading-6 text-text-main placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset"
              />
              {draft.trim() !== savedNotes.trim() && (
                <Button
                  type="submit"
                  variant="dark"
                  size="sm"
                  loading={notesAction.isPending}
                  className="self-end"
                >
                  Enregistrer la note
                </Button>
              )}
            </form>

            <nav aria-label="Écrans liés" className="flex flex-col gap-2">
              {relatedLinks(appointment).map((link) => (
                <Link key={link.label} href={link.href as Route} prefetch={false} className={relatedLink}>
                  <link.icon aria-hidden />
                  {link.label}
                </Link>
              ))}
            </nav>

            {open && (
              <div className="flex gap-2">
                {status === 'CONFIRME' ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    loading={action.isPending}
                    onClick={() => action.mutate({ id, action: { action: 'complete' } })}
                  >
                    <CircleCheck aria-hidden />
                    Marquer comme terminé
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={action.isPending}
                      onClick={() => action.mutate({ id, action: { action: 'confirm' } })}
                    >
                      <Check aria-hidden />
                      Confirmer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onPropose(appointment)}
                    >
                      Autre créneau
                    </Button>
                  </>
                )}
                {menu.length > 0 && <ActionMenu label="Autres actions" variant="outline" items={menu} />}
              </div>
            )}
          </>
        )}
      </AdminCard>
    </>
  );
}
