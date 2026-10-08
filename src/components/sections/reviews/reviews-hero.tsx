import { AccentText } from '@/components/ui/accent-text';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Stars } from '@/components/ui/stars';
import type { HeroSection, ReviewSummary } from '@/lib/api/schema';
import { formatNumber, formatPercent, formatRating } from '@/lib/format/number';
import { frenchTypography } from '@/lib/format/typography';

/**
 * Héros des avis (`68:7292`) : texte à gauche, carte « Note globale » à droite (520, p 32, rayon 28) — moyenne
 * Poppins 64/68, étoiles 18, nombre d'avis vérifiés, et répartition des notes (pistes 8 px orange) ;
 * en mobile, la carte passe sous le texte et la répartition sous la note.
 */
export function ReviewsHero({
  section,
  summary,
  breadcrumb,
}: {
  section: HeroSection;
  summary: ReviewSummary;
  breadcrumb: BreadcrumbItem[];
}) {
  const total = Object.values(summary.distribution).reduce((sum, count) => sum + count, 0) || 1;
  return (
    <section className="bg-neutral-50">
      <div className="container-site grid items-center gap-6 pt-5 pb-14 xl:grid-cols-[minmax(0,1fr)_520px] xl:gap-16 xl:pt-12 xl:pb-20">
        <div className="flex flex-col gap-4 xl:gap-[22px]">
          <Breadcrumb items={breadcrumb} />
          {section.eyebrow && <p className="text-web-eyebrow">{frenchTypography(section.eyebrow)}</p>}
          {section.title && (
            <h1 className="text-web-hero tracking-[-0.025em] text-text-main max-xl:tracking-[-0.02em]">
              <AccentText text={section.title} />
            </h1>
          )}
          {section.lead && <p className="text-web-lead text-text-muted">{frenchTypography(section.lead)}</p>}
        </div>
        <div className="flex flex-col gap-4 rounded-[28px] border border-border-default bg-neutral-0 p-5 md:flex-row md:items-center md:gap-8 xl:p-8">
          <div className="flex shrink-0 flex-col gap-1.5">
            <p className="font-brand text-[48px] leading-[52px] font-semibold tracking-[-0.02em] text-text-main xl:text-[64px] xl:leading-[68px]">
              {formatRating(summary.average)}
              <span className="sr-only"> sur 5</span>
            </p>
            <Stars rating={summary.average} size={18} />
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              {`${formatNumber(summary.total)}\u00A0avis vérifiés`}
            </p>
          </div>
          <dl className="flex flex-1 flex-col gap-2">
            {(['5', '4', '3', '2', '1'] as const).map((stars) => {
              const ratio = summary.distribution[stars] / total;
              return (
                <div key={stars} className="flex items-center gap-2.5">
                  <dt className="w-2 font-ui text-[14px] leading-5 font-medium text-text-main">
                    {stars}
                    <span className="sr-only"> étoile{stars === '1' ? '' : 's'}</span>
                  </dt>
                  <dd className="flex flex-1 items-center gap-2.5">
                    <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <span
                        className="block h-full rounded-full bg-brand-primary"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </span>
                    <span className="w-9 text-right font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                      {formatPercent(ratio)}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
