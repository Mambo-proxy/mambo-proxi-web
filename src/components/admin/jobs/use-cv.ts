'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import { transport } from '@/lib/api/transport';

type CvAction = { id: string; mode: 'download' | 'open' };

/**
 * CV d'une candidature : `GET /v1/admin/applications/{id}/cv` renvoie une URL signée (5 min), puis le fichier est
 * téléchargé (nom d'origine) ou ouvert dans un nouvel onglet. Si le stockage refuse la lecture depuis la page
 * (CORS), l'URL signée est ouverte directement.
 */
export function useCv() {
  return useMutation({
    mutationFn: async ({ id, mode }: CvAction) => {
      // Onglet ouvert dès le clic (sinon bloqué comme fenêtre surgissante), rempli une fois le fichier reçu.
      const tab = mode === 'open' ? window.open('', '_blank') : null;
      try {
        const signed = await data(
          browserApi.GET('/v1/admin/applications/{id}/cv', { params: { path: { id } } }),
        );
        let href = signed.url;
        let objectUrl: string | null = null;
        try {
          const response = await transport(new Request(signed.url));
          if (!response.ok) throw new Error(String(response.status));
          objectUrl = URL.createObjectURL(await response.blob());
          href = objectUrl;
        } catch {
          // Lecture impossible depuis la page : le navigateur suit l'URL signée.
        }
        if (tab) tab.location.href = href;
        else {
          const link = document.createElement('a');
          link.href = href;
          link.download = signed.fileName;
          if (!objectUrl) link.target = '_blank';
          link.rel = 'noopener';
          document.body.append(link);
          link.click();
          link.remove();
        }
        if (objectUrl) window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return signed;
      } catch (error) {
        tab?.close();
        throw error;
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
