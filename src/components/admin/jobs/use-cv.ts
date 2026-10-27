'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import { transport } from '@/lib/api/transport';

type CvAction = { id: string; mode: 'download' | 'open' };

/** URL signée du CV (`SignedUrl`, 5 min) : `GET /v1/admin/applications/{id}/cv`. */
const signCv = (id: string) =>
  data(browserApi.GET('/v1/admin/applications/{id}/cv', { params: { path: { id } } }));

/** Lecture du fichier signé ; `null` si la page ne peut pas le lire (réseau, CORS). */
async function fetchSigned(url: string): Promise<Response | null> {
  try {
    return await transport(new Request(url));
  } catch {
    return null;
  }
}

/**
 * CV d'une candidature : `GET /v1/admin/applications/{id}/cv` renvoie une URL signée (5 min, `GET /v1/files/{token}`
 * de l'API), puis le fichier est téléchargé (nom d'origine) ou ouvert dans un nouvel onglet. Lien déjà périmé
 * (410 `link-expired`, horloges décalées) : un nouveau lien est demandé une fois. Fichier absent (404) : message
 * de l'API. Si la page ne peut pas lire le fichier (CORS), l'URL signée est ouverte directement.
 */
export function useCv() {
  return useMutation({
    mutationFn: async ({ id, mode }: CvAction) => {
      // Onglet ouvert dès le clic (sinon bloqué comme fenêtre surgissante), rempli une fois le fichier reçu.
      const tab = mode === 'open' ? window.open('', '_blank') : null;
      try {
        let signed = await signCv(id);
        let response = await fetchSigned(signed.url);
        if (response?.status === 410) {
          signed = await signCv(id);
          response = await fetchSigned(signed.url);
        }
        if (response && !response.ok) throw toApiError(await response.json().catch(() => null), response);
        let href = signed.url;
        let objectUrl: string | null = null;
        if (response) {
          objectUrl = URL.createObjectURL(await response.blob());
          href = objectUrl;
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
