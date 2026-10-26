'use client';

import { Archive, Eye, EyeOff, Pencil, Send, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useState } from 'react';
import { ConfirmDialog, PublishStatusBadge } from '@/components/admin/editor/editor-ui';
import { useCan } from '@/components/admin/shell/permissions';
import { ActionMenu, type ActionMenuItem } from '@/components/admin/ui/action-menu';
import { adminRoutes } from '@/lib/admin/routes';
import { cn } from '@/lib/cn';
import { applicationsCountLabel, offerMeta, type JobOffer } from './labels';
import { useOfferActions } from './use-offer-actions';

/** Adresse de l'éditeur d'une offre. */
export const offerEditorHref = (id: string) => `${adminRoutes.jobs}/offres/${id}` as Route;
/** Page publique d'une offre (aperçu). */
export const offerSiteHref = (slug: string) => `/recrutement/${slug}`;

const iconButton =
  'flex size-8 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main';

/**
 * Actions d'une offre : aperçu sur le site, modifier, menu (candidatures, publication, archivage, suppression).
 * Sans `content:write` : consultation et candidatures seulement.
 */
function OfferActions({
  offer,
  onApplications,
  onDelete,
}: {
  offer: JobOffer;
  onApplications: () => void;
  onDelete: () => void;
}) {
  const { setStatus } = useOfferActions();
  const canWrite = useCan()('content:write');
  const published = offer.status === 'PUBLISHED';
  const writeItems: ActionMenuItem[] = [
    published
      ? {
          label: 'Dépublier',
          icon: EyeOff,
          onSelect: () => setStatus.mutate({ id: offer.id, status: 'DRAFT' }),
        }
      : {
          label: 'Publier',
          icon: Send,
          onSelect: () => setStatus.mutate({ id: offer.id, status: 'PUBLISHED' }),
        },
    ...(offer.status !== 'ARCHIVED'
      ? [
          {
            label: 'Archiver',
            icon: Archive,
            onSelect: () => setStatus.mutate({ id: offer.id, status: 'ARCHIVED' }),
          },
        ]
      : []),
    { label: 'Supprimer', icon: Trash2, danger: true, onSelect: onDelete },
  ];
  const items: ActionMenuItem[] = [
    { label: 'Voir les candidatures', icon: Users, onSelect: onApplications },
    ...(canWrite ? writeItems : []),
  ];
  return (
    <div className="flex items-center justify-end gap-2.5">
      {published ? (
        <a
          href={offerSiteHref(offer.slug)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Voir l’offre « ${offer.title} » sur le site (nouvel onglet)`}
          className={iconButton}
        >
          <Eye aria-hidden size={16} />
        </a>
      ) : (
        <button
          type="button"
          aria-disabled
          aria-label={`Aperçu de l’offre « ${offer.title} » : disponible une fois l’offre publiée`}
          title="Aperçu disponible une fois l’offre publiée"
          className={cn(iconButton, 'cursor-not-allowed opacity-40 hover:bg-transparent')}
        >
          <Eye aria-hidden size={16} />
        </button>
      )}
      <Link
        href={offerEditorHref(offer.id)}
        aria-label={`${canWrite ? 'Modifier' : 'Consulter'} l’offre « ${offer.title} »`}
        className={iconButton}
      >
        <Pencil aria-hidden size={16} />
      </Link>
      <ActionMenu label={`Autres actions pour l’offre « ${offer.title} »`} items={items} />
    </div>
  );
}

/**
 * Tableau des offres (`93:21881`) : Offre (intitulé, dates), Lieu, Contrat, Candidatures, Statut, actions ;
 * cartes empilées sous 1 280 px. Suppression après confirmation (les candidatures sont conservées).
 */
export function OffersTable({
  offers,
  onApplications,
}: {
  offers: JobOffer[];
  onApplications: (id: string) => void;
}) {
  const { remove } = useOfferActions();
  const [deleting, setDeleting] = useState<JobOffer | null>(null);

  return (
    <>
      {/* Mobile et tablette : cartes. */}
      <ul className="divide-y divide-border-default xl:hidden">
        {offers.map((offer) => (
          <li key={offer.id} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <Link
                  href={offerEditorHref(offer.id)}
                  className="rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main hover:underline"
                >
                  {offer.title}
                </Link>
                <span className="font-ui text-[12px] leading-4 text-text-muted">{offerMeta(offer)}</span>
              </div>
              <PublishStatusBadge status={offer.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 font-ui text-[13px] leading-5 text-text-main">
                {offer.city} · {offer.contractType}
                <span className="text-text-muted">
                  {' '}
                  · {offer.applicationsCount} candidature{offer.applicationsCount > 1 ? 's' : ''}
                  {offer.newApplicationsCount
                    ? ` dont ${offer.newApplicationsCount} nouvelle${offer.newApplicationsCount > 1 ? 's' : ''}`
                    : ''}
                </span>
              </p>
              <OfferActions
                offer={offer}
                onApplications={() => onApplications(offer.id)}
                onDelete={() => setDeleting(offer)}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop : tableau (`93:21881`). */}
      <table className="hidden w-full table-fixed border-collapse font-ui text-[14px] leading-5 text-text-main xl:table">
        <caption className="sr-only">Offres d’emploi</caption>
        <thead>
          <tr className="border-b border-border-default bg-neutral-50 text-left text-[12px] leading-4 text-text-muted">
            <th scope="col" className="py-3 pl-5 font-semibold">
              Offre
            </th>
            <th scope="col" className="w-[166px] py-3 pl-4 font-semibold">
              Lieu
            </th>
            <th scope="col" className="w-[136px] py-3 pl-4 font-semibold">
              Contrat
            </th>
            <th scope="col" className="w-[126px] py-3 pl-4 font-semibold">
              Candidatures
            </th>
            <th scope="col" className="w-[126px] py-3 pl-4 font-semibold">
              Statut
            </th>
            <th scope="col" className="w-[146px] py-3 pr-5 pl-4 font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-b border-border-default last:border-b-0 hover:bg-neutral-50">
              <td className="max-w-0 py-3.5 pl-5">
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={offerEditorHref(offer.id)}
                    className="truncate rounded-xs font-semibold hover:underline"
                  >
                    {offer.title}
                  </Link>
                  <span className="truncate text-[12px] leading-4 text-text-muted">{offerMeta(offer)}</span>
                </div>
              </td>
              <td className="max-w-0 truncate py-3.5 pl-4">{offer.city}</td>
              <td className="max-w-0 truncate py-3.5 pl-4">{offer.contractType}</td>
              <td className="py-3.5 pl-4 whitespace-nowrap">
                {applicationsCountLabel(offer.applicationsCount, offer.newApplicationsCount)}
              </td>
              <td className="py-3.5 pl-4">
                <PublishStatusBadge status={offer.status} />
              </td>
              <td className="py-3.5 pr-5 pl-4">
                <OfferActions
                  offer={offer}
                  onApplications={() => onApplications(offer.id)}
                  onDelete={() => setDeleting(offer)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Supprimer cette offre ?"
        description={
          deleting
            ? `« ${deleting.title} » sera retirée du site et du back-office. Les candidatures reçues sont conservées. Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer l’offre"
        destructive
        pending={remove.isPending}
      />
    </>
  );
}
