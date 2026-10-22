'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useId, type ComponentProps, type ReactNode } from 'react';
import type {
  AdminMagazineArticle,
  AdminMagazineEditionSummary,
  MagazineEditionStatus,
} from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatDayMonthYear, formatRelative } from '@/lib/format/date';

export const magazineKey = ['magazine'] as const;
export const magazineArticlesKey = ['magazine', 'articles'] as const;
export const magazineEditionKey = (id: string) => ['magazine', 'edition', id] as const;

/** Rafraîchit la liste, les articles et les éditions ouvertes après une modification. */
export function useRefreshMagazine() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: magazineKey });
}

export const EDITION_STATUS_LABELS: Record<MagazineEditionStatus, string> = {
  DRAFT: 'Brouillon',
  SCHEDULED: 'Programmée',
  PUBLISHED: 'Publiée',
  ARCHIVED: 'Archivée',
};

const STATUS_STYLES: Record<MagazineEditionStatus, { badge: string; dot: string }> = {
  PUBLISHED: { badge: 'bg-vert-50 text-vert-700', dot: 'bg-vert-500' },
  SCHEDULED: { badge: 'bg-orange-50 text-text-brand', dot: 'bg-brand-primary' },
  DRAFT: { badge: 'bg-neutral-100 text-text-muted', dot: 'bg-neutral-500' },
  ARCHIVED: { badge: 'bg-neutral-50 text-text-muted', dot: 'bg-neutral-300' },
};

/** Statut d'une édition (`267:1653`) : pilule padding 4/10, pastille 6 px, Inter SemiBold 12/16. */
export function EditionStatusBadge({
  status,
  children,
}: {
  status: MagazineEditionStatus;
  children?: ReactNode;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
        style.badge,
      )}
    >
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />
      {children ?? EDITION_STATUS_LABELS[status]}
    </span>
  );
}

/** « N° 1 — Ensemble vers un bien-être global », « Hors-série — Solidarité et culture ». */
export function editionName(edition: Pick<AdminMagazineEditionSummary, 'label' | 'title'>): string {
  return edition.title ? `${edition.label} — ${edition.title}` : edition.label;
}

/** Titre de l'écran d'édition : « Édition n° 1 », « Hors-série ». */
export function editionHeading(edition: Pick<AdminMagazineEditionSummary, 'number'>): string {
  return edition.number === null ? 'Hors-série' : `Édition n°\u00A0${edition.number}`;
}

/**
 * Ligne secondaire d'une édition (`267:1643`) : « Édition spéciale · 2 oct. 2026 », « Programmée · 6 nov. 2026 »,
 * « Brouillon · modifié hier », « Brouillon · 3 articles à traduire » (brouillon non modifié depuis une semaine).
 */
export function editionSubline(edition: AdminMagazineEditionSummary, now = Date.now()): string {
  if (edition.status === 'PUBLISHED' && edition.publishAt)
    return `${edition.subtitle || 'Publiée'} · ${formatDayMonthYear(edition.publishAt)}`;
  if (edition.status === 'SCHEDULED' && edition.publishAt)
    return `Programmée · ${formatDayMonthYear(edition.publishAt)}`;
  const label = EDITION_STATUS_LABELS[edition.status];
  const recent = now - new Date(edition.updatedAt).getTime() < 7 * 86_400_000;
  if (!recent && edition.toTranslate > 0)
    return `${label} · ${edition.toTranslate} article${edition.toTranslate > 1 ? 's' : ''} à traduire`;
  return `${label} · modifié ${formatRelative(edition.updatedAt, now)}`;
}

/** Pilule de langue d'un article (`269:2074`) : « FR », « EN » (vert) ou « EN à traduire » (orange). */
export function LanguagePill({ tone, children }: { tone: 'done' | 'todo'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-ui text-[12px] leading-[15px] font-medium whitespace-nowrap',
        tone === 'done' ? 'bg-vert-100 text-vert-800' : 'bg-orange-50 text-text-brand',
      )}
    >
      {children}
    </span>
  );
}

export function ArticleLanguages({ article }: { article: Pick<AdminMagazineArticle, 'languages'> }) {
  const translated = article.languages.includes('en');
  return (
    <span className="flex shrink-0 gap-3.5">
      <LanguagePill tone="done">FR</LanguagePill>
      <LanguagePill tone={translated ? 'done' : 'todo'}>{translated ? 'EN' : 'EN à traduire'}</LanguagePill>
    </span>
  );
}

export type EditingLanguage = 'fr' | 'en';

/**
 * Langue en cours d'édition (`269:2006`) : pilules « Français · complet » / « English · 4 / 6 traduits » ; la
 * pilule active est sombre (`neutral/900`, texte blanc), l'autre `neutral/100`.
 */
export function LanguageSwitch({
  value,
  onChange,
  labels,
}: {
  value: EditingLanguage;
  onChange: (language: EditingLanguage) => void;
  labels: Record<EditingLanguage, string>;
}) {
  return (
    <div role="group" aria-label="Langue modifiée" className="flex flex-wrap gap-2">
      {(['fr', 'en'] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={value === language}
          onClick={() => onChange(language)}
          className={cn(
            'rounded-full px-2.5 py-1 font-ui text-[12px] leading-[15px] font-medium whitespace-nowrap transition-colors',
            value === language
              ? 'bg-neutral-900 text-neutral-0'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
          )}
        >
          {labels[language]}
        </button>
      ))}
    </div>
  );
}

/** Carte des écrans du Magazine (`269:2014`) : bordure `border/default`, rayon 16, padding 24, écart 16. */
export function MagazineCard({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-border-default bg-neutral-0 p-[18px] md:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="font-brand text-[18px] leading-[27px] font-semibold text-text-main">
          {title}
        </h2>
        {action}
      </div>
      {subtitle && <p className="-mt-1 font-ui text-[13px] leading-4 text-text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}

/** Champ compact du Magazine (`269:2017`) : libellé Inter Medium 13 `neutral/700`, écart 6. */
export function CompactField({
  label,
  help,
  error,
  className,
  children,
}: {
  label: ReactNode;
  help?: ReactNode;
  error?: string | null;
  className?: string;
  children: (control: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : help ? `${id}-help` : undefined;
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-ui text-[13px] leading-4 font-medium text-neutral-700">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {help && !error && (
        <p id={`${id}-help`} className="font-ui text-[12px] leading-4 text-text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Saisie compacte (`269:2019`) : bordure `border/strong`, rayon 10, padding 11/14, Inter 14. */
export const compactInputClass = cn(
  'w-full rounded-[10px] border border-border-strong bg-neutral-0 px-3.5 py-[11px] font-ui text-[14px] leading-[17px] text-text-main',
  'placeholder:text-text-subtle transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:ring-inset focus:outline-none',
  'aria-invalid:border-feedback-error aria-invalid:ring-1 aria-invalid:ring-feedback-error aria-invalid:ring-inset',
);

export function CompactInput({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(compactInputClass, className)} {...props} />;
}

/** Bouton secondaire compact (`269:2039` « Remplacer l’image ») : bordure `border/strong`, rayon 10, padding 11/18. */
export const compactButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 px-[18px] py-[11px] font-ui text-[14px] leading-[17px] font-semibold text-text-main transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60';

/** Bouton principal compact (`269:2139` « Mettre à jour ») : orange, rayon 10, padding 11/18. */
export const compactPrimaryClass =
  'inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-primary px-[18px] py-[11px] font-ui text-[14px] leading-[17px] font-semibold text-text-on-primary transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60';
