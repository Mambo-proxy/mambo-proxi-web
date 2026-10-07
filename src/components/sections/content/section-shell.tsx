import type { ReactNode } from 'react';
import type { SectionTone } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

/** Fond des sections selon le ton choisi dans le back-office (contrat `SectionTone`). */
export const TONE_BACKGROUND: Record<SectionTone, string> = {
  light: 'bg-neutral-0',
  muted: 'bg-neutral-50',
  dark: 'bg-neutral-900',
  green: 'bg-vert-50',
  orange: 'bg-orange-50',
};

type SectionShellProps = {
  section: { anchor?: string | null; tone?: SectionTone };
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

/**
 * Enveloppe commune des sections éditoriales : fond selon le ton, py 96 (56 en mobile), conteneur du site ;
 * l'ancre éventuelle tient compte de la hauteur de l'en-tête collant.
 */
export function SectionShell({ section, children, className, innerClassName }: SectionShellProps) {
  return (
    <section
      id={section.anchor ?? undefined}
      className={cn(
        'scroll-mt-(--site-header-h,0px) py-14 xl:py-24',
        TONE_BACKGROUND[section.tone ?? 'light'],
        className,
      )}
    >
      <div className={cn('container-site', innerClassName)}>{children}</div>
    </section>
  );
}
