'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminJobOffer, PublishStatus } from '@/lib/api/schema';

export const jobsKey = ['jobs'] as const;
export const jobKey = (id: string) => ['job', id] as const;

const STATUS_MESSAGES: Record<PublishStatus, string> = {
  PUBLISHED: 'Offre publiée sur le site.',
  DRAFT: 'Offre dépubliée : elle n’apparaît plus sur le site.',
  ARCHIVED: 'Offre archivée : elle n’apparaît plus sur le site.',
};

/** Publication, dépublication, archivage et suppression d'une offre (liste et éditeur). */
export function useOfferActions() {
  const client = useQueryClient();

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PublishStatus }) =>
      data(browserApi.PATCH('/v1/admin/jobs/{id}', { params: { path: { id } }, body: { status } })),
    onSuccess: (offer: AdminJobOffer) => {
      client.setQueryData(jobKey(offer.id), offer);
      void client.invalidateQueries({ queryKey: jobsKey });
      toast.success(STATUS_MESSAGES[offer.status]);
    },
    // Publication refusée (offre incomplète) : premier motif précis plutôt que le message générique.
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? (Object.values(error.fieldErrors)[0] ?? errorMessage(error))
          : errorMessage(error),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => data(browserApi.DELETE('/v1/admin/jobs/{id}', { params: { path: { id } } })),
    onSuccess: (_result, id) => {
      client.removeQueries({ queryKey: jobKey(id) });
      void client.invalidateQueries({ queryKey: jobsKey });
      void client.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Offre supprimée. Ses candidatures restent consultables.');
    },
  });

  return { setStatus, remove };
}
