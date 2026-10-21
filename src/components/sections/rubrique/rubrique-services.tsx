import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SiteLink as Link } from '@/i18n/site-link';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { CategoryDetail, ServiceSummary } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { tintBadge } from './tint';
import { useTranslations } from 'next-intl';

/**
 * Carte service illustrée (Expérience `60:1665`) : illustration 220 (170 en mobile), icône 18 dans un carré 40,
 * titre Poppins 19/26 (17 en mobile), résumé 15/23 (14 en mobile), actions « Voir le service » et « Devis ↗ ».
 */
function ServiceCard({ service, badge }: { service: ServiceSummary; badge: string }) {
  const t = useTranslations('rubrique');
  const name = service.shortName ?? service.name;
  return (
    <article className="group/card flex flex-col overflow-hidden rounded-xl border border-border-default bg-neutral-0">
      <Visual
        visual={service.visual}
        sizes="(min-width: 1280px) 424px, (min-width: 768px) 50vw, 100vw"
        className="h-[170px] shrink-0 md:h-[220px]"
      />
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-[26px]">
        <div className="flex items-center gap-3">
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-md', badge)}>
            <Icon name={service.icon} size={18} />
          </span>
          <h3 className="font-brand text-[17px] leading-[26px] font-semibold text-text-main md:text-[19px]">
            {frenchTypography(name)}
          </h3>
        </div>
        <p className="font-ui text-[14px] leading-[23px] text-text-muted md:text-[15px]">
          {frenchTypography(service.summary)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <Link
            href={service.href}
            className="group/link inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-main"
          >
            {t('seeService')}
            <span className="sr-only"> {name}</span>
            <ArrowRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/link:translate-x-[3px]"
            />
          </Link>
          <Link
            href={`/devis?service=${service.slug}`}
            className="group/devis inline-flex items-center gap-1 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
          >
            {t('quote')}
            <span className="sr-only"> {t('quoteFor', { name })}</span>
            <ArrowUpRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/devis:translate-x-0.5 group-hover/devis:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Titre d'un groupe de services, suivi d'un filet (Immobilier `61:2327`). */
export function GroupTitle({ children }: { children: string }) {
  return (
    <h3 className="flex items-center gap-4 font-brand text-[22px] leading-8 font-semibold text-text-main xl:text-[24px]">
      <span className="min-w-0 md:shrink-0">{frenchTypography(children)}</span>
      <span aria-hidden className="h-px flex-1 bg-border-default" />
    </h3>
  );
}

export function ServiceGrid({ services, badge }: { services: ServiceSummary[]; badge: string }) {
  return (
    <ul className="grid items-start gap-3.5 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {services.map((service, index) => (
        <Reveal as="li" key={service.slug} delay={Math.min(index, 5) * 60}>
          <ServiceCard service={service} badge={badge} />
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * « Nos services » de la rubrique : en-tête 820, grille de 3 colonnes (424, gap 20) ; Immobilier : groupes titrés suivis
 * d'un filet, espacés de 48 (28 en mobile) (`61:2327`). Une colonne en mobile.
 */
export function RubriqueServices({ category }: { category: CategoryDetail }) {
  const t = useTranslations('rubrique');
  const badge = tintBadge(category.tint);
  const services = category.services ?? [];
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  return (
    <section className="bg-neutral-50 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading
          eyebrow={t('services')}
          title={category.servicesTitle}
          lead={category.servicesLead}
          className="gap-3 md:gap-4 xl:max-w-[820px]"
        />
        {category.groups.length > 0 ? (
          <div className="flex flex-col gap-7 xl:gap-12">
            {category.groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3.5 xl:gap-5">
                <GroupTitle>{group.title}</GroupTitle>
                <ServiceGrid
                  services={group.serviceSlugs.flatMap((slug) => bySlug.get(slug) ?? [])}
                  badge={badge}
                />
              </div>
            ))}
          </div>
        ) : (
          <ServiceGrid services={services} badge={badge} />
        )}
      </div>
    </section>
  );
}
