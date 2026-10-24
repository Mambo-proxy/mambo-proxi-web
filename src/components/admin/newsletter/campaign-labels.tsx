import { StatusPill } from '@/components/admin/editor/editor-ui';
import type { Campaign, CampaignStatus } from '@/lib/api/schema';
import { formatAgo, formatDayMonth, formatStamp } from '@/lib/format/date';
import { formatPercent } from '@/lib/format/number';

const LABELS: Record<CampaignStatus, string> = {
  BROUILLON: 'Brouillon',
  PROGRAMMEE: 'Programmée',
  EN_COURS_ENVOI: 'En cours d’envoi',
  ENVOYEE: 'Envoyée',
  ANNULEE: 'Annulée',
};

const TONES = {
  BROUILLON: 'neutral',
  PROGRAMMEE: 'warning',
  EN_COURS_ENVOI: 'brand',
  ENVOYEE: 'success',
  ANNULEE: 'muted',
} as const;

/** Statut d'un envoi (`94:11735`) : Programmée (orange), Envoyée (vert), Brouillon (gris). */
export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <StatusPill tone={TONES[status]}>{LABELS[status]}</StatusPill>;
}

/** Envoi encore modifiable dans le compositeur (brouillon ou programmé). */
export const isEditable = (campaign: Pick<Campaign, 'status'>) =>
  campaign.status === 'BROUILLON' || campaign.status === 'PROGRAMMEE';

/** Sous-titre d'un envoi : « Programmée le 2 nov. · 09:00 », « Envoyée le 5 oct. », « Modifié hier ». */
export function campaignSubline(campaign: Campaign, now = Date.now()): string {
  if (campaign.status === 'PROGRAMMEE' && campaign.scheduledAt)
    return `Programmée le ${formatStamp(campaign.scheduledAt)}`;
  if (campaign.status === 'ENVOYEE' && campaign.sentAt)
    return `Envoyée le ${formatDayMonth(campaign.sentAt)}`;
  if (campaign.status === 'EN_COURS_ENVOI') return 'Envoi en cours…';
  const ago = formatAgo(campaign.updatedAt ?? campaign.createdAt, now);
  return /^\d/.test(ago) ? `Modifié le ${ago}` : `Modifié ${ago.toLowerCase()}`;
}

/** Taux d'ouverture d'un envoi parti (« 46 % »), « — » sinon. */
export function openRate(campaign: Pick<Campaign, 'status' | 'opens' | 'recipients'>): string {
  if (campaign.status !== 'ENVOYEE' || campaign.opens == null || !campaign.recipients) return '—';
  return formatPercent(campaign.opens / campaign.recipients);
}

/** Corps vide (éditeur sans texte, ni image, ni bouton). */
export const isEmptyHtml = (html: string | null | undefined) =>
  !html || (!/<(img|a)\b/.test(html) && !html.replace(/<[^>]+>/g, '').trim());
