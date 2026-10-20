import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Visual } from '@/components/ui/visual';
import { SiteLink as Link } from '@/i18n/site-link';
import type { ServiceOffer, ServiceOffers as ServiceOffersData } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { formulaLinks } from '../home/formula-cards';
import { ResponsiveText } from '../responsive-text';
import { SectionHeading } from '../section-heading';
import { OffersCarousel } from './offers-carousel';

const action =
  'group/action inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] whitespace-nowrap';

/**
 * Carte d'offre (`254:11443`) : bordée, rayon 24 ; photo 220 ; contenu p 26, écarts 12 ; pastille d'icône 40
 * `vert/50` (facultative), titre Poppins 19/26, texte 15/23 ; action principale 14/20 et flèche →, l'autre action
 * en flèche ↗ orange (devis ↔ prise de rendez-vous, service présélectionné).
 */
function OfferCard({ offer, serviceSlug }: { offer: ServiceOffer; serviceSlug: string }) {
  const t = useTranslations('service.offers');
  const links = formulaLinks(offer.serviceSlug ?? serviceSlug);
  const [primary, secondary] =
    offer.action === 'BOOKING'
      ? [links.booking, { href: links.quote, label: t('quote') }]
      : [links.quote, { href: links.booking, label: t('booking') }];
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border-default bg-neutral-0">
      <Visual visual={offer.visual} sizes="(min-width: 768px) 352px, 290px" className="h-[220px] shrink-0" />
      <div className="flex flex-col gap-3 p-[26px]">
        <div className="flex items-center gap-3">
          {offer.icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-vert-50 text-vert-700">
              <Icon name={offer.icon} size={18} />
            </span>
          )}
          <h3 className="min-w-0 flex-1 font-brand text-[19px] leading-[26px] font-semibold text-text-main">
            <ResponsiveText
              desktop={frenchTypography(offer.title)}
              mobile={offer.titleMobile ? frenchTypography(offer.titleMobile) : null}
            />
          </h3>
        </div>
        <p className="font-ui text-[15px] leading-[23px] text-text-muted">
          <ResponsiveText
            desktop={frenchTypography(offer.text)}
            mobile={offer.textMobile ? frenchTypography(offer.textMobile) : null}
          />
        </p>
        <div className="flex items-center justify-between pt-1.5">
          <Link href={primary} className={`${action} text-text-main`}>
            <ResponsiveText
              desktop={frenchTypography(offer.actionLabel)}
              mobile={offer.actionLabelMobile ? frenchTypography(offer.actionLabelMobile) : null}
            />
            <span className="sr-only"> — {offer.title}</span>
            <ArrowRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/action:translate-x-[3px]"
            />
          </Link>
          <Link
            href={secondary.href}
            aria-label={t('otherAction', { action: secondary.label, title: offer.title })}
            className={`${action} text-text-brand`}
          >
            <ArrowUpRight
              aria-hidden
              size={16}
              className="transition-transform duration-200 group-hover/action:translate-x-[2px] group-hover/action:-translate-y-[2px]"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * « Nos offres » de la fiche service (Entretien du logement `254:11429`, Chef privé `289:14062`) et carrousels d'une
 * rubrique (véhicules et prestataires d'Expérience) : fond blanc, py 80 (56 en mobile) ; en-tête titre 48/56 (28/34 en
 * mobile) et chapô 18/28 ; carrousel des offres. Sur une rubrique, chaque offre précise son service (`serviceSlug`).
 */
export function ServiceOffers({
  offers,
  serviceSlug = '',
  id = 'offres',
}: {
  offers: ServiceOffersData;
  serviceSlug?: string;
  id?: string;
}) {
  const t = useTranslations('service.offers');
  return (
    <section id={id} className="scroll-mt-(--site-header-h,0px) bg-neutral-0 py-14 xl:py-20">
      <div className="container-site">
        <OffersCarousel
          labels={{ list: t('list', { title: offers.title }), previous: t('previous'), next: t('next') }}
          heading={
            <SectionHeading
              eyebrow={offers.eyebrow}
              title={offers.title}
              titleMobile={offers.titleMobile}
              lead={offers.lead}
              leadMobile={offers.leadMobile}
              titleClassName="max-md:text-[28px]! max-md:leading-[34px]! max-md:tracking-[-0.02em]!"
              leadClassName="max-md:text-[18px] max-md:leading-7"
            />
          }
        >
          {offers.items.map((offer) => (
            <OfferCard key={offer.id} offer={offer} serviceSlug={serviceSlug} />
          ))}
        </OffersCarousel>
      </div>
    </section>
  );
}
