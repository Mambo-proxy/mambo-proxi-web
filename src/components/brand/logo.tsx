import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type LogoProps = {
  /** `horizontal` (en-têtes) ou `stacked` (pied de page). */
  variant?: 'horizontal' | 'stacked';
  /** Version blanche pour les fonds sombres. */
  inverse?: boolean;
  className?: string;
  priority?: boolean;
};

const FILES = {
  horizontal: { src: 'logo-horizontal', width: 288, height: 80 },
  stacked: { src: 'logo-stacked', width: 302, height: 290 },
} as const;

/**
 * Logo officiel (public/brand, exporté de Figma, jamais modifié), lien vers l'accueil.
 * La taille d'affichage est donnée par `className` (ex. `h-10 w-auto`).
 */
export function Logo({ variant = 'horizontal', inverse = false, className, priority = false }: LogoProps) {
  const file = FILES[variant];
  return (
    <Link href="/" aria-label="MAMBO Proxi — accueil" className={cn('inline-flex shrink-0', className)}>
      <Image
        src={`/brand/${file.src}${inverse ? '-white' : ''}.svg`}
        alt=""
        width={file.width}
        height={file.height}
        priority={priority}
        unoptimized
        className="h-full w-auto"
      />
    </Link>
  );
}
