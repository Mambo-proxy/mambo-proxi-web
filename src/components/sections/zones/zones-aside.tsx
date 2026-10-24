import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import type { ServiceAreas } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { TONES } from './zone-tones';

/**
 * Colonne « Trouvez votre quartier » à droite de la carte (gap 20) : titre, recherche (`children`), légende, lien
 * facultatif. Rendue avec la page, même pendant le chargement de la carte (ancre `#trouver-votre-quartier`).
 */
export function ZonesAside({
  areas,
  link,
  children,
}: {
  areas: ServiceAreas;
  link?: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations('zones');

  return (
    <div
      id="trouver-votre-quartier"
      className="flex min-w-0 flex-1 scroll-mt-(--site-header-h,0px) flex-col gap-5"
    >
      <h3 className="font-brand text-[22px] leading-[1.5] font-semibold text-text-main">{t('searchTitle')}</h3>
      {children}
      <p className="font-ui text-[14px] leading-[1.2] font-semibold text-text-main">{t('legend')}</p>
      <ul className="flex flex-col gap-5">
        {areas.zones.map((zone) => (
          <li
            key={zone.key}
            className="flex items-center gap-2.5 font-ui text-[14px] leading-[1.2] font-medium text-text-main"
          >
            <span aria-hidden className={cn('size-3 shrink-0 rounded-full', TONES[zone.tone].dot)} />
            {zone.name}
          </li>
        ))}
      </ul>
      {link}
    </div>
  );
}
