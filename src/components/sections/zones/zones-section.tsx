import type { DynamicSection, ServiceAreas } from '@/lib/api/schema';
import { SiteLink as Link } from '@/i18n/site-link';
import { frenchTypography } from '@/lib/format/typography';
import { QuarterList } from './quarter-list';
import { LazyZonesMap } from './lazy-zones-map';

/**
 * Carte des zones d'intervention : accueil (Figma `290:31634`, mobile `290:31736`) et page Zones d'intervention
 * (`256:12724`, `256:12824`) : fond blanc, py 88 (56), sur-titre Inter SemiBold 13 orange, titre Poppins 40 (28/34 en
 * mobile), gap 12 ; carte et recherche à 40 (28) px, puis la liste des quartiers par zone sur la page Zones.
 */
export function ZonesSection({
  section,
  areas,
  withQuarterList = false,
}: {
  section: DynamicSection;
  areas: ServiceAreas;
  withQuarterList?: boolean;
}) {
  return (
    <section
      id={section.anchor ?? undefined}
      className="scroll-mt-(--site-header-h,0px) bg-neutral-0 py-14 xl:py-[88px]"
    >
      <div className="container-site flex flex-col gap-7 xl:gap-10">
        <div className="flex flex-col gap-3">
          {section.eyebrow && (
            <p className="font-ui text-[13px] leading-[1.2] font-semibold text-text-brand uppercase">
              {frenchTypography(section.eyebrow)}
            </p>
          )}
          {section.title && (
            <h2 className="font-brand text-[28px] leading-[34px] font-semibold text-text-main md:text-[40px] md:leading-[1.5]">
              {frenchTypography(section.title)}
            </h2>
          )}
        </div>
        <LazyZonesMap
          areas={areas}
          link={
            section.link && (
              <Link
                href={section.link.href}
                className="self-start rounded-xs font-ui text-[14px] leading-[1.2] font-semibold text-text-brand hover:underline"
              >
                {frenchTypography(section.link.label)} →
              </Link>
            )
          }
        />
        {withQuarterList && <QuarterList areas={areas} />}
      </div>
    </section>
  );
}
