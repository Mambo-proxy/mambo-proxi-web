'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { toast } from '@/components/ui/toaster';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import { downloadBlob } from '@/lib/admin/download';
import { useExportQuery } from './requests-view';

/** Bouton secondaire « Exporter » de la barre supérieure (`87:10931`) : CSV des demandes filtrées. */
export function ExportRequestsButton() {
  const query = useExportQuery();
  const [pending, setPending] = useState(false);

  async function exportCsv() {
    setPending(true);
    try {
      const { data, error, response } = await browserApi.GET('/v1/admin/requests/export.csv', {
        params: { query },
        parseAs: 'blob',
      });
      if (!response.ok || !data) throw toApiError(error, response);
      downloadBlob(data, `demandes-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void exportCsv()}
      disabled={pending}
      className={topbarSecondaryClass}
    >
      <Download aria-hidden size={16} />
      Exporter
    </button>
  );
}
