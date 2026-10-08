'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, Info, Mail, Phone, ShieldX, UserCheck, UserX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { sidebarCountsKey } from '@/components/admin/shell/sidebar';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import {
  AdminCard,
  ContactAvatar,
  REQUEST_STATUS_LABELS,
  locationLabel,
} from '@/components/admin/ui/admin-ui';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { RequestDetail, RequestStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatStamp } from '@/lib/format/date';
import { formatPhone } from '@/lib/phone';
import { whatsappUrl } from '@/lib/whatsapp';

const STEPS: { value: RequestStatus; label: string }[] = [
  { value: 'NOUVELLE', label: 'Nouvelle' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'PRESTATION_REALISEE', label: 'Réalisée' },
  { value: 'CLOTUREE', label: 'Clôturée' },
];

const PREFERENCES = { WHATSAPP: 'WhatsApp', TELEPHONE: 'Téléphone', EMAIL: 'E-mail' } as const;

const quickAction =
  'flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3 py-2.5 font-ui text-[14px] leading-5 font-semibold whitespace-nowrap text-text-main hover:bg-neutral-50 sm:px-3.5 [&_svg]:size-4';

/** E-mail pré-rempli « Préparer le devis » (la génération de devis PDF est hors lot 1). */
function quoteMailto(request: RequestDetail) {
  const firstName = request.contact.fullName.split(' ')[0];
  const subject = `Votre devis MAMBO Proxi — ${request.subject ?? 'votre demande'} (${request.reference})`;
  const body = [
    `Bonjour ${firstName},`,
    '',
    `Merci pour votre demande ${request.reference}. Voici notre proposition :`,
    '',
    '— Prestation : ',
    '— Date et lieu : ',
    '— Montant : ',
    '',
    'Nous restons à votre disposition pour toute question.',
    '',
    'L’équipe MAMBO Proxi',
  ].join('\n');
  return `mailto:${request.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Panneau « Détail de la demande » (`87:11129`) : référence, service, carte client, actions rapides
 * (WhatsApp avec la référence, e-mail, appel), informations, besoin exprimé, statut en 4 étapes, notes internes,
 * historique, « Préparer le devis » et menu (assigner, dupliquer, copier la référence, anonymiser).
 * À droite de la liste à partir de 1280 px, en panneau superposé en dessous.
 */
export function RequestPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { user } = useAdmin();
  const client = useQueryClient();
  const panel = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState('');
  const [anonymize, setAnonymize] = useState(false);
  const detailKey = ['request', id];
  const query = useQuery({
    queryKey: detailKey,
    queryFn: () => data(browserApi.GET('/v1/admin/requests/{id}', { params: { path: { id } } })),
  });
  const request = query.data;

  const refreshLists = () => {
    void client.invalidateQueries({ queryKey: ['requests'] });
    void client.invalidateQueries({ queryKey: sidebarCountsKey });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const updateStatus = useMutation({
    mutationFn: (status: RequestStatus) =>
      data(browserApi.PATCH('/v1/admin/requests/{id}', { params: { path: { id } }, body: { status } })),
    onMutate: async (status) => {
      await client.cancelQueries({ queryKey: detailKey });
      const previous = client.getQueryData<RequestDetail>(detailKey);
      if (previous) client.setQueryData(detailKey, { ...previous, status });
      return { previous };
    },
    onError: (error, _status, context) => {
      if (context?.previous) client.setQueryData(detailKey, context.previous);
      toast.error(errorMessage(error));
    },
    onSuccess: (updated) => {
      client.setQueryData(detailKey, updated);
      toast.success(
        updated.status === 'PRESTATION_REALISEE' && updated.survey?.status === 'SCHEDULED'
          ? 'Statut mis à jour : le questionnaire de satisfaction partira dans 24 h.'
          : `Statut mis à jour : ${REQUEST_STATUS_LABELS[updated.status]}.`,
      );
      refreshLists();
    },
  });

  const assign = useMutation({
    mutationFn: (assignedToId: string | null) =>
      data(browserApi.PATCH('/v1/admin/requests/{id}', { params: { path: { id } }, body: { assignedToId } })),
    onSuccess: (updated) => {
      client.setQueryData(detailKey, updated);
      toast.success(
        updated.assignedTo ? `Demande assignée à ${updated.assignedTo.name}.` : 'Assignation retirée.',
      );
      refreshLists();
    },
  });

  const addNote = useMutation({
    mutationFn: (body: string) =>
      data(browserApi.POST('/v1/admin/requests/{id}/notes', { params: { path: { id } }, body: { body } })),
    onSuccess: () => {
      setNote('');
      toast.success('Note enregistrée.');
      void client.invalidateQueries({ queryKey: detailKey });
    },
  });

  const duplicate = useMutation({
    mutationFn: () =>
      data(browserApi.POST('/v1/admin/requests/{id}/duplicate', { params: { path: { id } } })),
    onSuccess: (copy) => {
      toast.success(`Demande dupliquée : ${copy.reference}.`);
      refreshLists();
    },
  });

  const remove = useMutation({
    mutationFn: () => data(browserApi.DELETE('/v1/admin/requests/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setAnonymize(false);
      toast.success('Demande anonymisée.');
      refreshLists();
      onClose();
    },
  });

  // Sous 1280 px, le panneau est superposé : Échap le ferme et le focus y est placé.
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  const currentStep = request ? STEPS.findIndex((step) => step.value === request.status) : -1;
  const firstName = request?.contact.fullName.split(' ')[0] ?? '';

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-40 bg-surface-overlay xl:hidden" />
      <AdminCard
        ref={panel}
        tabIndex={-1}
        role="region"
        aria-label={request ? `Demande ${request.reference}` : 'Détail de la demande'}
        className={cn(
          'flex flex-col gap-5 p-6 outline-none',
          'max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:z-50 max-xl:w-full max-xl:max-w-[460px] max-xl:overflow-y-auto max-xl:rounded-none max-xl:border-0 max-xl:shadow-4',
          'xl:sticky xl:top-[107px]',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-ui text-[12px] leading-4 text-text-muted">{request?.reference ?? ' '}</p>
            <h2 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
              {request ? (request.subject ?? 'Demande') : 'Chargement…'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le détail"
            className="flex size-8 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100"
          >
            <X aria-hidden size={16} />
          </button>
        </div>

        {query.isError ? (
          <p role="alert" className="font-ui text-[14px] leading-5 text-feedback-error">
            {errorMessage(query.error)}
          </p>
        ) : !request ? (
          <div aria-hidden className="flex flex-col gap-3">
            <Skeleton className="h-[86px] rounded-[14px]" />
            <Skeleton className="h-11 rounded-[10px]" />
            <Skeleton className="h-40 rounded-md" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-[14px] bg-neutral-50 p-3.5">
              <ContactAvatar name={request.contact.fullName} initials={request.contact.initials} size={40} />
              <div className="flex min-w-0 flex-col gap-0.5 font-ui text-[12px] leading-4 text-text-muted">
                <p className="text-[14px] leading-5 font-semibold text-text-main">
                  {request.contact.fullName}
                </p>
                <p className="break-words">
                  {request.contact.email}
                  {request.contact.phone && ` · ${formatPhone(request.contact.phone)}`}
                </p>
                <p>
                  {locationLabel(request.contact.city, request.contact.country)}
                  {request.contactPreference &&
                    ` · contact préféré\u00A0: ${PREFERENCES[request.contactPreference]}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {request.contact.phone && (
                <a
                  href={
                    request.whatsappUrl ??
                    whatsappUrl(
                      request.contact.phone,
                      `Bonjour ${firstName}, c’est MAMBO Proxi au sujet de votre demande ${request.reference}.`,
                    )
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quickAction}
                >
                  <WhatsappIcon aria-hidden />
                  WhatsApp
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              )}
              <a href={`mailto:${request.contact.email}`} className={quickAction}>
                <Mail aria-hidden />
                E-mail
              </a>
              {request.contact.phone && (
                <a href={`tel:${request.contact.phone}`} className={quickAction}>
                  <Phone aria-hidden />
                  Appeler
                </a>
              )}
            </div>

            <dl className="flex flex-col gap-2.5 font-ui text-[14px] leading-5">
              {request.fields.map((field) => (
                <div key={field.key ?? field.label} className="flex justify-between gap-4">
                  <dt className="text-text-muted">{field.label}</dt>
                  <dd className="text-right font-semibold text-text-main">{field.value}</dd>
                </div>
              ))}
              {request.assignedTo && (
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Suivie par</dt>
                  <dd className="text-right font-semibold text-text-main">{request.assignedTo.name}</dd>
                </div>
              )}
            </dl>

            {request.message && (
              <div className="flex flex-col gap-1.5 rounded-md border border-border-default p-3.5">
                <p className="font-ui text-[12px] leading-4 font-semibold text-text-muted">Besoin exprimé</p>
                <p className="font-ui text-[14px] leading-[21px] text-text-main">
                  «&nbsp;{request.message}&nbsp;»
                </p>
              </div>
            )}

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-ui text-[14px] leading-5 font-semibold text-text-main">
                Statut de la demande
              </legend>
              <div className="grid grid-cols-4 gap-1">
                {STEPS.map((step, index) => {
                  const active = step.value === request.status;
                  // Retour en arrière réservé aux administrateurs.
                  const locked = index < currentStep && user.role !== 'ADMIN';
                  return (
                    <button
                      key={step.value}
                      type="button"
                      aria-pressed={active}
                      disabled={locked || updateStatus.isPending}
                      title={
                        locked ? 'Seul un administrateur peut revenir à un statut précédent.' : undefined
                      }
                      onClick={() => !active && updateStatus.mutate(step.value)}
                      className={cn(
                        'rounded-sm border px-1 py-2 font-ui text-[12px] leading-4 font-semibold transition-colors disabled:cursor-not-allowed',
                        active
                          ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                          : 'border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50 disabled:opacity-40',
                      )}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>
              {request.type === 'DEVIS' && (
                <p className="flex gap-2 rounded-md bg-vert-50 p-3 font-ui text-[12px] leading-[17px] text-vert-800">
                  <Info aria-hidden size={16} className="mt-px shrink-0" />
                  {request.survey?.status === 'SCHEDULED' && request.survey.scheduledFor
                    ? `Questionnaire de satisfaction programmé le ${formatStamp(request.survey.scheduledFor)}.`
                    : 'En passant à « Prestation réalisée », le questionnaire de satisfaction est envoyé automatiquement au client.'}
                </p>
              )}
            </fieldset>

            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (note.trim()) addNote.mutate(note.trim());
              }}
            >
              <label
                htmlFor={`note-${id}`}
                className="font-ui text-[14px] leading-5 font-semibold text-text-main"
              >
                Notes internes
              </label>
              {request.notes.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {request.notes.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md bg-neutral-50 p-3 font-ui text-[13px] leading-5 text-text-main"
                    >
                      <p className="whitespace-pre-line">{item.body}</p>
                      <p className="mt-1 text-[12px] leading-4 text-text-muted">
                        {item.author.name} · {formatStamp(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <textarea
                id={`note-${id}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                maxLength={5000}
                placeholder="Ajouter une note pour l’équipe…"
                className="min-h-[72px] w-full resize-y rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 font-ui text-[16px] leading-6 text-text-main placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset"
              />
              {note.trim() && (
                <Button
                  type="submit"
                  variant="dark"
                  size="sm"
                  loading={addNote.isPending}
                  className="self-end"
                >
                  Enregistrer la note
                </Button>
              )}
            </form>

            <section aria-labelledby={`history-${id}`} className="flex flex-col gap-3">
              <h3 id={`history-${id}`} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                Historique
              </h3>
              <ol className="flex flex-col gap-2.5">
                {request.history.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2.5 font-ui text-[12px] leading-4">
                    <span aria-hidden className="mt-1 size-2 shrink-0 rounded-full bg-brand-primary" />
                    <span className="flex-1 text-text-main">{entry.label}</span>
                    <time dateTime={entry.createdAt} className="shrink-0 text-text-muted">
                      {formatStamp(entry.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            </section>

            <div className="flex gap-2">
              <a
                href={quoteMailto(request)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-brand-primary px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-text-on-primary hover:bg-brand-primary-hover"
              >
                <FileText aria-hidden size={16} />
                Préparer le devis
              </a>
              <ActionMenu
                label="Autres actions"
                variant="outline"
                items={[
                  request.assignedTo?.id === user.id
                    ? { label: 'Retirer l’assignation', icon: UserX, onSelect: () => assign.mutate(null) }
                    : {
                        label: 'M’assigner la demande',
                        icon: UserCheck,
                        onSelect: () => assign.mutate(user.id),
                      },
                  { label: 'Dupliquer', icon: Copy, onSelect: () => duplicate.mutate() },
                  {
                    label: 'Copier la référence',
                    icon: FileText,
                    onSelect: () =>
                      void navigator.clipboard
                        ?.writeText(request.reference)
                        .then(() => toast.success('Référence copiée.')),
                  },
                  ...(user.role === 'ADMIN'
                    ? [
                        {
                          label: 'Anonymiser (RGPD)',
                          icon: ShieldX,
                          danger: true,
                          onSelect: () => setAnonymize(true),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </>
        )}
      </AdminCard>

      <Modal
        open={anonymize}
        onClose={() => setAnonymize(false)}
        title="Anonymiser cette demande ?"
        description="Les données personnelles du client (nom, coordonnées, message) seront définitivement effacées. Cette action est irréversible."
        maxWidth={480}
        footer={
          <>
            <Button variant="outline" onClick={() => setAnonymize(false)}>
              Annuler
            </Button>
            <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
              Anonymiser
            </Button>
          </>
        }
      >
        <p className="font-ui text-[14px] leading-5 text-text-muted">
          Demande {request?.reference} — {request?.contact.fullName}
        </p>
      </Modal>
    </>
  );
}
