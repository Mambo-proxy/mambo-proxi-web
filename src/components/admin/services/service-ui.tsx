import type { PublishStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

export const SERVICE_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

const STATUS_STYLES: Record<PublishStatus, { badge: string; dot: string }> = {
  PUBLISHED: { badge: 'bg-vert-50 text-vert-700', dot: 'bg-vert-500' },
  DRAFT: { badge: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  ARCHIVED: { badge: 'bg-neutral-100 text-text-muted', dot: 'bg-neutral-400' },
};

/** Badge de statut d'un service (`88:10603`) : pilule, pastille 6 px, Inter SemiBold 12/16. */
export function ServiceStatusBadge({ status }: { status: PublishStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
        style.badge,
      )}
    >
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />
      {SERVICE_STATUS_LABELS[status]}
    </span>
  );
}

export const servicesKey = ['admin-services'] as const;
export const categoriesKey = ['admin-categories'] as const;
