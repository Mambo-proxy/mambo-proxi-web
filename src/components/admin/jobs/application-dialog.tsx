'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Mail, Phone } from 'lucide-react';
import { sidebarCountsKey } from '@/components/admin/shell/sidebar';
import { ContactAvatar, locationLabel } from '@/components/admin/ui/admin-ui';
import { FilterSelect } from '@/components/admin/ui/filters';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { ApplicationStatus } from '@/lib/api/schema';
import { formatStamp } from '@/lib/format/date';
import { formatPhone } from '@/lib/phone';
import { ApplicationStatusBadge } from './badges';
import { APPLICATION_STATUS_LABELS, fileSizeLabel } from './labels';
import { useCv } from './use-cv';
import { jobsKey } from './use-offer-actions';

export const applicationsKey = ['applications'] as const;
const applicationKey = (id: string) => ['application', id] as const;

const action =
  'inline-flex items-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50 disabled:opacity-60 [&_svg]:size-4';

/**
 * Détail d'une candidature (non maquetté, même langage que le détail d'une demande) : coordonnées, poste visé,
 * message, CV et statut. L'ouverture passe une candidature « Nouveau » à « Lu » (contrat `adminGetApplication`).
 */
export function ApplicationDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const client = useQueryClient();
  const cv = useCv();
  const query = useQuery({
    queryKey: applicationKey(id ?? ''),
    queryFn: async () => {
      const application = await data(
        browserApi.GET('/v1/admin/applications/{id}', { params: { path: { id: id ?? '' } } }),
      );
      // Statut « Lu » : listes, compteurs des offres et du menu à jour.
      void client.invalidateQueries({ queryKey: applicationsKey });
      void client.invalidateQueries({ queryKey: jobsKey });
      void client.invalidateQueries({ queryKey: sidebarCountsKey });
      return application;
    },
    enabled: id !== null,
  });
  const setStatus = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      data(
        browserApi.PATCH('/v1/admin/applications/{id}', {
          params: { path: { id: id ?? '' } },
          body: { status },
        }),
      ),
    onSuccess: (application) => {
      client.setQueryData(applicationKey(application.id), application);
      void client.invalidateQueries({ queryKey: applicationsKey });
      void client.invalidateQueries({ queryKey: jobsKey });
      toast.success(`Candidature marquée « ${APPLICATION_STATUS_LABELS[application.status]} ».`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const application = query.data;

  return (
    <Modal
      open={id !== null}
      onClose={onClose}
      title={application ? application.contact.fullName : 'Candidature'}
      description={
        application
          ? `${application.job?.title ?? 'Candidature spontanée'} · reçue le ${formatStamp(application.createdAt)} · ${application.reference}`
          : undefined
      }
      maxWidth={560}
    >
      {!application ? (
        query.isError ? (
          <p role="alert" className="font-ui text-[14px] leading-5 text-feedback-error">
            {errorMessage(query.error)}
          </p>
        ) : (
          <div aria-hidden className="flex flex-col gap-3">
            <Skeleton className="h-10 w-2/3 rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        )
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <ContactAvatar
              name={application.contact.fullName}
              initials={application.contact.initials}
              size={40}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-ui text-[13px] leading-5 text-text-muted">
              <span>{locationLabel(application.contact.city, application.contact.country)}</span>
              <a
                href={`mailto:${application.contact.email}`}
                className="self-start truncate rounded-xs text-text-main hover:underline"
              >
                {application.contact.email}
              </a>
            </div>
            <ApplicationStatusBadge status={application.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${application.contact.email}`} className={action}>
              <Mail aria-hidden />
              Écrire
            </a>
            {application.contact.phone && (
              <a href={`tel:${application.contact.phone}`} className={action}>
                <Phone aria-hidden />
                {formatPhone(application.contact.phone)}
              </a>
            )}
          </div>

          {application.message && (
            <div className="flex flex-col gap-1.5">
              <h3 className="font-ui text-[13px] leading-4 font-semibold text-text-muted">Message</h3>
              <p className="rounded-md bg-neutral-50 p-3.5 font-ui text-[14px] leading-[22px] whitespace-pre-line text-text-main">
                {application.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <h3 className="font-ui text-[13px] leading-4 font-semibold text-text-muted">CV</h3>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-default p-3.5">
              <span className="min-w-0 font-ui text-[14px] leading-5 text-text-main">
                <span className="block truncate font-semibold">{application.cv.fileName}</span>
                {application.cv.size ? (
                  <span className="text-[12px] leading-4 text-text-muted">
                    {fileSizeLabel(application.cv.size)}
                  </span>
                ) : null}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={action}
                  disabled={cv.isPending}
                  onClick={() => cv.mutate({ id: application.id, mode: 'open' })}
                >
                  <ExternalLink aria-hidden />
                  Ouvrir
                </button>
                <button
                  type="button"
                  className={action}
                  disabled={cv.isPending}
                  onClick={() => cv.mutate({ id: application.id, mode: 'download' })}
                >
                  <Download aria-hidden />
                  Télécharger
                </button>
              </div>
            </div>
          </div>

          <FilterSelect
            label="Statut de la candidature"
            value={application.status}
            disabled={setStatus.isPending}
            onChange={(event) => setStatus.mutate(event.target.value as ApplicationStatus)}
            className="sm:w-60"
          >
            {(Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]).map((status) => (
              <option key={status} value={status}>
                Statut : {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </FilterSelect>
        </div>
      )}
    </Modal>
  );
}
