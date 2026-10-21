import { getTranslations } from 'next-intl/server';
import type { ServiceAreas, ZoneQuarter } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { TONES } from './zone-tones';

function quarterLabel(quarter: ZoneQuarter) {
  return quarter.detail ? `${quarter.name} (${quarter.detail})` : quarter.name;
}

/**
 * « Les quartiers, zone par zone » (page Zones d'intervention `256:12796`, mobile `256:12896`) : titre Poppins 28 (22),
 * cartes bordées rayon 20, p 22, gap 12, sur 4 colonnes espacées de 20 ; quartiers Inter Medium 14/24, un par ligne,
 * à la suite séparés par « · » en mobile (cartes empilées, gap 14), sauf la zone spéciale. Note de l'API en dessous.
 */
export async function QuarterList({ areas }: { areas: ServiceAreas }) {
  const t = await getTranslations('zones');
  return (
    <div id="quartiers-par-zone" className="flex scroll-mt-(--site-header-h,0px) flex-col gap-6">
      <h3 className="font-brand text-[22px] leading-[1.5] font-semibold text-text-main md:text-[28px]">
        {t('listTitle')}
      </h3>
      <ul className="grid gap-3.5 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
        {areas.zones.map((zone) => {
          const stacked = zone.tone === 'special';
          return (
            <li
              key={zone.key}
              id={zone.key}
              className="flex scroll-mt-(--site-header-h,0px) flex-col gap-3 rounded-[20px] border border-border-default bg-neutral-0 p-[22px] font-ui"
            >
              <h4 className="flex items-center gap-2.5 text-[16px] leading-[1.2] font-semibold text-text-main">
                <span aria-hidden className={cn('size-3.5 shrink-0 rounded-full', TONES[zone.tone].dot)} />
                {zone.name}
              </h4>
              <p className="text-[14px] leading-[1.2] text-text-muted">
                {frenchTypography(zone.description)}
              </p>
              <ul className="text-[14px] leading-6 font-medium text-text-main">
                {zone.quarters.map((quarter, index) => (
                  <li key={quarter.name} className={cn(!stacked && 'max-md:inline')}>
                    {!stacked && index > 0 && (
                      <span aria-hidden className="md:hidden">
                        {' · '}
                      </span>
                    )}
                    {quarterLabel(quarter)}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      {areas.note && (
        <p className="max-w-[900px] font-ui text-[14px] leading-[1.2] text-text-muted">
          {frenchTypography(areas.note)}
        </p>
      )}
    </div>
  );
}
