import { AccentText } from '@/components/ui/accent-text';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { ResponsiveText } from './responsive-text';

type SectionHeadingProps = {
  eyebrow?: string | null;
  title?: string | null;
  titleMobile?: string | null;
  lead?: string | null;
  /** `null` = même chapô en mobile ; chaîne vide = chapô masqué en mobile. */
  leadMobile?: string | null;
  align?: 'left' | 'center';
  /** Niveau du titre (h2 pour une section, h1 pour un héros). */
  as?: 'h1' | 'h2';
  /** Sur fond sombre : sur-titre `orange/400`, titre blanc, chapô `neutral/300`. */
  inverse?: boolean;
  className?: string;
  /** Taille de titre propre à une maquette (classes `!` : elles priment sur `text-web-section`). */
  titleClassName?: string;
  leadClassName?: string;
};

/**
 * En-tête de section : sur-titre `web/eyebrow`, titre `web/section` (48/56 → 30/36),
 * chapô Inter 18/28 `text/muted` (16/24 en mobile). Écarts de 16 px.
 */
export function SectionHeading({
  eyebrow,
  title,
  titleMobile,
  lead,
  leadMobile,
  align = 'left',
  as: Heading = 'h2',
  inverse = false,
  className,
  titleClassName,
  leadClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && (
        // Chaînes brutes : `cn` confondrait les utilitaires `text-web-*` avec des couleurs de texte.
        <p className={inverse ? 'text-web-eyebrow text-orange-400!' : 'text-web-eyebrow'}>
          {frenchTypography(eyebrow)}
        </p>
      )}
      {title && (
        <Heading
          className={`text-web-section ${inverse ? 'text-neutral-0' : 'text-text-main'} ${titleClassName ?? ''}`}
        >
          <ResponsiveText
            desktop={<AccentText text={title} />}
            mobile={titleMobile ? <AccentText text={titleMobile} /> : null}
          />
        </Heading>
      )}
      {lead && (
        <p
          className={cn(
            'font-ui text-[16px] leading-6 md:text-[18px] md:leading-7',
            inverse ? 'text-neutral-300' : 'text-text-muted',
            leadMobile === '' && 'max-md:hidden',
            leadClassName,
          )}
        >
          <ResponsiveText
            desktop={frenchTypography(lead)}
            mobile={leadMobile ? frenchTypography(leadMobile) : null}
          />
        </p>
      )}
    </div>
  );
}
