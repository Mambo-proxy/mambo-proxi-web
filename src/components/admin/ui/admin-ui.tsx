import type { ComponentProps, ReactNode } from 'react';
import type { RequestStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

/** Carte du back-office : fond blanc, bordure `border/default`, rayon 16. */
export function AdminCard({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('rounded-lg border border-border-default bg-neutral-0', className)} {...props} />
  );
}

/** Titre de carte Inter SemiBold 16/24 et sous-titre 13/16 `text/muted`. */
export function CardTitle({
  title,
  subtitle,
  id,
  level = 2,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="flex flex-col gap-0.5">
      <Heading id={id} className="font-ui text-[16px] leading-6 font-semibold text-text-main">
        {title}
      </Heading>
      {subtitle && (
        <p className="font-ui text-[13px] leading-4 tracking-[0.01em] text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  EN_COURS: 'En cours',
  PRESTATION_REALISEE: 'Prestation réalisée',
  CLOTUREE: 'Clôturée',
};

const STATUS_STYLES: Record<RequestStatus, { badge: string; dot: string }> = {
  NOUVELLE: { badge: 'bg-orange-50 text-orange-700', dot: 'bg-brand-primary' },
  EN_COURS: { badge: 'bg-neutral-100 text-neutral-800', dot: 'bg-neutral-800' },
  PRESTATION_REALISEE: { badge: 'bg-vert-50 text-vert-700', dot: 'bg-vert-500' },
  // Maquette : texte `neutral/500` (#7D776F, 3,9:1) — `text/muted` pour le contraste AA à 12 px.
  CLOTUREE: { badge: 'bg-neutral-100 text-text-muted', dot: 'bg-neutral-400' },
};

/** Badge de statut d'une demande (pilule, pastille 6 px, Inter SemiBold 12/16). */
export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold whitespace-nowrap',
        style.badge,
      )}
    >
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

/** Fonds d'avatar des contacts (maquettes : `orange/200`, `vert/200`, `neutral/200`, `orange/100`, `vert/100`). */
const AVATAR_TINTS = [
  'bg-orange-200',
  'bg-vert-200',
  'bg-neutral-200',
  'bg-orange-100',
  'bg-vert-100',
  'bg-neutral-100',
];

/** Teinte stable déduite du nom (le même contact garde la même couleur partout). */
export function avatarTint(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length] ?? AVATAR_TINTS[0]!;
}

/** Initiales d'un nom complet (« Aurélie Kamga » → « AK »). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`.toUpperCase();
}

/** « Aurélie Kamga » → « Aurélie K. » (nom abrégé des listes). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts.slice(0, -1).join(' ')} ${parts.at(-1)?.[0] ?? ''}.`;
}

/** Avatar d'un contact : initiales Inter SemiBold sur fond teinté (32, 38 ou 40 px). */
export function ContactAvatar({
  name,
  initials,
  size = 32,
}: {
  name: string;
  initials?: string;
  size?: 32 | 38 | 40;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-ui font-semibold text-text-main',
        size === 32 ? 'text-[12px] leading-4' : 'text-[14px] leading-5',
        avatarTint(name),
      )}
    >
      {initials ?? initialsOf(name)}
    </span>
  );
}

/** Code pays → nom affiché (« Paris, France » ; les villes camerounaises sont affichées seules, comme la maquette). */
const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  CA: 'Canada',
  DE: 'Allemagne',
  GB: 'Royaume-Uni',
  US: 'États-Unis',
  CI: 'Côte d’Ivoire',
  SN: 'Sénégal',
  GA: 'Gabon',
};

export function locationLabel(city?: string | null, country?: string | null): string {
  if (!city) return country ? (COUNTRY_NAMES[country] ?? (country === 'CM' ? 'Cameroun' : country)) : '';
  if (!country || country === 'CM') return city;
  return `${city}, ${COUNTRY_NAMES[country] ?? country}`;
}

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Sélecteur compact du back-office (période du tableau de bord `85:10383`, onglets de statut) : conteneur
 * `neutral/100` rayon 12 padding 4 ; onglet 34 px, padding 7/12, rayon 9, Inter 13/20 ; actif blanc + `elevation/1`.
 */
export function CompactSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex gap-1 rounded-md bg-neutral-100 p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              const index = options.findIndex((item) => item.value === value);
              const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
              if (!delta) return;
              event.preventDefault();
              const next = options[(index + delta + options.length) % options.length];
              if (next) {
                onChange(next.value);
                (
                  event.currentTarget.parentElement?.children[options.indexOf(next)] as
                    HTMLElement | undefined
                )?.focus();
              }
            }}
            className={cn(
              'flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 font-ui text-[13px] leading-5 tracking-[0.005em] whitespace-nowrap transition-colors',
              active
                ? 'bg-neutral-0 font-semibold text-text-main shadow-1'
                : 'font-medium text-text-muted hover:text-text-main',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
