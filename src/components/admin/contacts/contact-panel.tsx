'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Mail, Phone, Trash2, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { REQUEST_TYPE_LABELS } from '@/components/admin/requests/requests-view';
import { AdminCard, ContactAvatar, locationLabel, RequestStatusBadge } from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { downloadBlob } from '@/lib/admin/download';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { AdminContactListItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatDate, formatStamp } from '@/lib/format/date';
import { interestsLabel, NewsletterBadge, sourceLabel } from './contact-labels';

/** Export RGPD (`GET /v1/admin/contacts/{id}/export`) : fichier JSON de toutes les données du contact. */
export async function exportContactData(contact: Pick<AdminContactListItem, 'id' | 'fullName'>) {
  try {
    const exported = await data(
      browserApi.GET('/v1/admin/contacts/{id}/export', { params: { path: { id: contact.id } } }),
    );
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `donnees-${contact.id}.json`);
    toast.success(`Données de ${contact.fullName} exportées.`);
  } catch (caught) {
    toast.error(errorMessage(caught));
  }
}

/** Droit à l'effacement (`DELETE /v1/admin/contacts/{id}`) ; rafraîchit la liste et les demandes. */
export function useEraseContact(onDone: () => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      data(browserApi.DELETE('/v1/admin/contacts/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      toast.success('Contact effacé, ses demandes sont anonymisées.');
      void client.invalidateQueries({ queryKey: ['contacts'] });
      void client.invalidateQueries({ queryKey: ['requests'] });
      onDone();
    },
    onError: (caught) => toast.error(errorMessage(caught)),
  });
}

/** Confirmation du droit à l'effacement (contact supprimé, demandes anonymisées). */
export function EraseContactDialog({
  contact,
  onClose,
  erase,
}: {
  contact: Pick<AdminContactListItem, 'id' | 'fullName'> | null;
  onClose: () => void;
  erase: ReturnType<typeof useEraseContact>;
}) {
  return (
    <ConfirmDialog
      open={contact !== null}
      onClose={onClose}
      onConfirm={() => contact && erase.mutate(contact.id)}
      title={`Effacer « ${contact?.fullName ?? ''} » ?`}
      description="Droit à l’effacement : le contact est supprimé et ses demandes sont anonymisées. Cette action est définitive."
      confirmLabel="Effacer le contact"
      destructive
      pending={erase.isPending}
    />
  );
}

const dt = 'font-ui text-[13px] leading-5 text-text-muted';
const dd = 'text-right font-ui text-[13px] leading-5 font-semibold text-text-main';

/**
 * Fiche contact (non maquettée, même panneau que le détail d'une demande, superposé à toutes les largeurs) :
 * coordonnées, profil, intérêts, abonnement, demandes, export RGPD et droit à l'effacement.
 */
export function ContactPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [erasing, setErasing] = useState(false);
  const query = useQuery({
    queryKey: ['contacts', 'detail', id],
    queryFn: () => data(browserApi.GET('/v1/admin/contacts/{id}', { params: { path: { id } } })),
  });
  const contact = query.data;
  const erase = useEraseContact(() => {
    setErasing(false);
    onClose();
  });

  // Échap ferme le panneau (hors fenêtre de confirmation) ; le focus y est placé à l'ouverture.
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-40 bg-surface-overlay" />
      <AdminCard
        ref={panel}
        tabIndex={-1}
        role="region"
        aria-label={contact ? `Fiche de ${contact.fullName}` : 'Fiche contact'}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col gap-5 overflow-y-auto rounded-none border-0 p-6 shadow-4 outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {contact && <ContactAvatar name={contact.fullName} initials={contact.initials} size={40} />}
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="truncate font-brand text-[20px] leading-7 font-semibold text-text-main">
                {contact?.fullName ?? 'Chargement…'}
              </h2>
              {contact && (
                <p className="font-ui text-[12px] leading-4 text-text-muted">
                  {contact.profile === 'PROFESSIONNEL' ? 'Professionnel' : 'Particulier'} · contact depuis le{' '}
                  {formatDate(contact.createdAt)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100"
          >
            <X aria-hidden size={16} />
          </button>
        </div>

        {query.isError ? (
          <p role="alert" className="font-ui text-[14px] leading-5 text-feedback-error">
            {errorMessage(query.error)}
          </p>
        ) : !contact ? (
          <div aria-hidden className="flex flex-col gap-3">
            <Skeleton className="h-11 rounded-[10px]" />
            <Skeleton className="h-40 rounded-md" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong px-3 py-2.5 font-ui text-[14px] leading-5 font-semibold hover:bg-neutral-50"
              >
                <Mail aria-hidden size={16} />
                E-mail
              </a>
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong px-3 py-2.5 font-ui text-[14px] leading-5 font-semibold hover:bg-neutral-50"
                >
                  <Phone aria-hidden size={16} />
                  Appeler
                </a>
              ) : (
                <span />
              )}
            </div>

            <dl className="flex flex-col gap-2.5">
              {[
                ['E-mail', contact.email],
                ['Téléphone', contact.phone ?? '—'],
                ['Localisation', locationLabel(contact.city, contact.country)],
                ['Structure', contact.organization ?? '—'],
                ['Intérêts', interestsLabel(contact.interests)],
                ['Origine', sourceLabel(contact.source)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <dt className={dt}>{label}</dt>
                  <dd className={cn(dd, 'min-w-0 break-words')}>{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className={dt}>Newsletter</dt>
                <dd>
                  <NewsletterBadge status={contact.subscriber?.status ?? contact.newsletterStatus} />
                </dd>
              </div>
            </dl>

            <section aria-labelledby="contact-requests" className="flex flex-col gap-2.5">
              <h3
                id="contact-requests"
                className="font-ui text-[15px] leading-5 font-semibold text-text-main"
              >
                Demandes ({contact.requests.length})
              </h3>
              {contact.requests.length === 0 ? (
                <p className="font-ui text-[13px] leading-5 text-text-muted">Aucune demande enregistrée.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border-default rounded-md border border-border-default">
                  {contact.requests.map((request) => (
                    <li key={request.id}>
                      <Link
                        href={`${adminRoutes.requests}?id=${request.id}` as Route}
                        className="flex items-center gap-3 px-3.5 py-3 hover:bg-neutral-50"
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-ui text-[14px] leading-5 font-semibold">
                            {request.subject ?? REQUEST_TYPE_LABELS[request.type]}
                          </span>
                          <span className="font-ui text-[12px] leading-4 text-text-muted">
                            {request.reference} · {formatStamp(request.createdAt)}
                          </span>
                        </span>
                        <RequestStatusBadge status={request.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-auto flex flex-wrap gap-2 border-t border-border-default pt-4">
              <button
                type="button"
                onClick={() => void exportContactData(contact)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-border-strong px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold hover:bg-neutral-50"
              >
                <Download aria-hidden size={16} />
                Exporter ses données
              </button>
              <button
                type="button"
                onClick={() => setErasing(true)}
                className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-feedback-error hover:bg-neutral-100"
              >
                <Trash2 aria-hidden size={16} />
                Effacer le contact
              </button>
            </div>
          </>
        )}
      </AdminCard>
      <EraseContactDialog
        contact={erasing ? (contact ?? null) : null}
        onClose={() => setErasing(false)}
        erase={erase}
      />
    </>
  );
}
