import type { CategoryTint } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/icon';

/** Teinte des pastilles de rubrique (méga-menu, menu mobile) : fond clair + icône foncée, ou fond sombre + icône orange. */
const TINTS: Record<CategoryTint, string> = {
  'orange-50': 'bg-orange-50 text-orange-700',
  'neutral-100': 'bg-neutral-100 text-neutral-700',
  'vert-50': 'bg-vert-50 text-vert-700',
  'neutral-900': 'bg-neutral-900 text-brand-primary',
};

type CategoryBadgeProps = {
  icon: string;
  tint?: CategoryTint;
  /** Fond blanc forcé (menu mobile, sauf rubrique sombre). */
  onLight?: boolean;
  className?: string;
};

/** Pastille 36 × 36 rayon 11, icône 17 px. */
export function CategoryBadge({
  icon,
  tint = 'neutral-100',
  onLight = false,
  className,
}: CategoryBadgeProps) {
  const tone =
    onLight && tint !== 'neutral-900' ? cn('bg-neutral-0', TINTS[tint].split(' ')[1]) : TINTS[tint];
  return (
    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-[11px]', tone, className)}>
      <Icon name={icon} size={17} />
    </span>
  );
}
