import { StatusPill } from '@/components/admin/editor/editor-ui';
import type { ApplicationStatus } from '@/lib/api/schema';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES } from './labels';

/** Statut d'une candidature (pilule, pastille 6 px) : Nouveau, Lu, Retenu, Refusé. */
export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <StatusPill tone={APPLICATION_STATUS_TONES[status]}>{APPLICATION_STATUS_LABELS[status]}</StatusPill>;
}
