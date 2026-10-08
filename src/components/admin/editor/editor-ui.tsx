'use client';

import { CircleAlert, CircleCheck, Plus } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { PublishStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo } from '@/lib/format/date';

/**
 * Éditeur du back-office (« Ajouter un service » `91:10755`) : formulaire 748 px et colonne latérale 340 px,
 * écart 24 px ; une seule colonne sous 1 280 px (colonne latérale au-dessus du formulaire en mobile).
 */
export function EditorLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,748px)_340px] xl:gap-6">
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
      <aside
        aria-label="Publication et aperçu"
        className="flex flex-col gap-4 max-xl:order-first xl:sticky xl:top-[107px]"
      >
        {aside}
      </aside>
    </div>
  );
}

type EditorSectionProps = Omit<ComponentProps<'section'>, 'title'> & {
  /** Numéro de la pastille (sections numérotées de l'éditeur de service) ; absent : pas de pastille. */
  number?: number;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Action à droite du titre (lien, bouton). */
  action?: ReactNode;
};

/**
 * Carte-section (`91:10758`) : fond blanc, bordure `border/default`, rayon 16, padding 28 (18 en mobile), écart 18 ;
 * pastille numérotée 28 px `neutral/900`, titre Inter SemiBold 16/24, sous-titre Inter 13/16 `text/muted`.
 */
export function EditorSection({
  number,
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}: EditorSectionProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-[18px] rounded-lg border border-border-default bg-neutral-0 p-[18px] md:p-7',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {number !== undefined && (
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-ui text-[12px] leading-4 font-semibold text-neutral-0"
          >
            {number}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id={titleId} className="font-ui text-[16px] leading-6 font-semibold text-text-main">
            {title}
          </h2>
          {subtitle && <p className="font-ui text-[13px] leading-4 text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Carte de la colonne latérale (`91:11112`) : padding 22, écart 14, titre Inter SemiBold 16. */
export function SideCard({
  title,
  action,
  className,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-3.5 rounded-lg border border-border-default bg-neutral-0 p-[22px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Aide avec compteur : « Une phrase courte, affichée sous le titre. 72 / 120 caractères. » */
export function charCountHelp(value: string | null | undefined, max: number, help?: string): string {
  const count = `${(value ?? '').length} / ${max} caractères`;
  return help ? `${help} ${count}.` : count;
}

/** Bouton d'ajout d'un élément de liste (`Ajouter un public`) : bordure pointillée, pleine largeur. */
export function AddItemButton({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border-strong p-3',
        'font-ui text-[14px] leading-5 font-semibold text-text-main transition-colors hover:bg-neutral-50',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <Plus aria-hidden size={16} />
      {children}
    </button>
  );
}

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

/** Pastille de statut d'un contenu : Publié (vert), Brouillon (gris), Archivé (gris clair). */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: 'success' | 'neutral' | 'warning' | 'brand' | 'muted';
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    success: 'bg-vert-50 text-vert-800 [--dot:var(--mp-color-vert-500)]',
    neutral: 'bg-neutral-100 text-text-muted [--dot:var(--mp-color-neutral-400)]',
    warning: 'bg-orange-50 text-text-brand [--dot:var(--mp-color-orange-500)]',
    brand: 'bg-orange-50 text-text-brand [--dot:var(--mp-color-orange-500)]',
    muted: 'bg-neutral-50 text-text-muted [--dot:var(--mp-color-neutral-300)]',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--dot)" />
      {children}
    </span>
  );
}

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <StatusPill tone={status === 'PUBLISHED' ? 'success' : status === 'DRAFT' ? 'neutral' : 'muted'}>
      {PUBLISH_STATUS_LABELS[status]}
    </StatusPill>
  );
}

/** « Dernière sauvegarde automatique il y a 1 min » (Inter 12/16 `text/muted`), annoncé poliment. */
export function SavedNote({
  savedAt,
  saving,
  error,
}: {
  savedAt: string | null;
  saving?: boolean;
  error?: boolean;
}) {
  return (
    <p aria-live="polite" className="font-ui text-[12px] leading-4 text-text-muted">
      {error
        ? 'Échec de la sauvegarde automatique : vos modifications ne sont pas encore enregistrées.'
        : saving
          ? 'Enregistrement…'
          : savedAt
            ? `Dernière sauvegarde automatique ${formatAgo(savedAt).toLowerCase()}`
            : 'Modifications enregistrées automatiquement.'}
    </p>
  );
}

/** Carte « Complétude » (`91:11184`) : pourcentage, barre verte, liste de contrôle. */
export function CompletenessCard({
  criteria,
  title,
}: {
  criteria: { label: string; done: boolean }[];
  /** Titre (défaut : « Page complète à 86 % »). */
  title?: string;
}) {
  const done = criteria.filter((item) => item.done).length;
  const percent = criteria.length ? Math.round((done / criteria.length) * 100) : 0;
  return (
    <section
      aria-label="Complétude"
      className="flex flex-col gap-3 rounded-lg border border-border-default bg-neutral-0 p-[22px]"
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          {title ?? `Page complète à ${percent}\u00A0%`}
        </h2>
        <p className="font-ui text-[13px] leading-4 text-text-muted">
          {done} section{done > 1 ? 's' : ''} sur {criteria.length}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Complétude de la page"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className="h-full rounded-full bg-vert-500 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {criteria.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex items-center gap-2 font-ui text-[13px] leading-4',
              item.done ? 'text-text-main' : 'text-text-brand',
            )}
          >
            {item.done ? (
              <CircleCheck aria-hidden size={16} className="shrink-0 text-vert-600" />
            ) : (
              <CircleAlert aria-hidden size={16} className="shrink-0" />
            )}
            {item.label}
            <span className="sr-only">{item.done ? ' : complet' : ' : à compléter'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  /** Action destructrice (suppression, anonymisation) : bouton sombre et libellé explicite. */
  destructive?: boolean;
  pending?: boolean;
};

/** Confirmation d'une action irréversible (suppression, anonymisation, envoi). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  destructive,
  pending,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth={460}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant={destructive ? 'dark' : 'primary'} size="sm" loading={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {null}
    </Modal>
  );
}
