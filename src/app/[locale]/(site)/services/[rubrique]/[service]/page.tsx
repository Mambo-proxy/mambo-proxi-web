import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { QuoteCard, AppointmentCard } from '@/components/sections/service/quote-card';
import { RelatedServices } from '@/components/sections/service/related-services';
import { ServiceActionBar } from '@/components/sections/service/service-action-bar';
import { ServiceContent } from '@/components/sections/service/service-content';
import { ServiceHero } from '@/components/sections/service/service-hero';
import { ServiceOffers } from '@/components/sections/service/service-offers';
import { ServiceReviews } from '@/components/sections/service/service-reviews';
import { CtaBand } from '@/components/site/cta-band';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';
import { seoMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { faqJsonLd, serviceJsonLd } from '@/lib/seo/json-ld';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

type Params = LocaleParams<{ rubrique: string; service: string }>;

/** Fiche du service, à condition qu'elle appartienne bien à la rubrique de l'adresse. */
async function getService(rubrique: string, slug: string) {
  const service = await unwrapOrNull(
    api.GET('/v1/services/{slug}', {
      params: { path: { slug } },
      ...cached([cacheTags.service(slug), cacheTags.services]),
    }),
  );
  return service?.category.slug === rubrique ? service : null;
}

/** Fiches générées au build ; API injoignable : aucune, chaque fiche est générée à sa première visite. */
export async function generateStaticParams() {
  try {
    const services = await unwrap(api.GET('/v1/services', cached([cacheTags.services])));
    // Une formule n'a pas de fiche : sa carte mène à la section des formules de sa rubrique.
    return services
      .filter((service) => service.kind !== 'formula')
      .map((service) => ({ rubrique: service.category.slug, service: service.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await withLocale(params);
  const { rubrique, service: slug } = await params;
  const service = await getService(rubrique, slug);
  if (!service) return {};
  return seoMetadata({
    title: service.name,
    description: service.summary,
    path: service.href,
    seo: service.seo,
  });
}

/**
 * Fiche service (Chef privé `62:4161`, mobile `62:4733` ; Entretien du logement `253:25267`, mobile `253:25641`) :
 * gabarit commun à tous les services, avec le carrousel « Nos offres » sous le héros quand la fiche en a.
 */
export default async function ServicePage({ params }: Params) {
  await withLocale(params);
  const { rubrique, service: slug } = await params;
  const [service, settings, t] = await Promise.all([
    getService(rubrique, slug),
    getSiteSettings(),
    getTranslations('service'),
  ]);
  if (!service) notFound();

  const quoteHref = `/devis?service=${service.slug}` as Route;
  const whatsappHref =
    service.showWhatsapp && settings.whatsapp.enabled
      ? whatsappUrl(
          settings.whatsapp.number,
          settings.whatsapp.message,
          t('whatsappContext', { name: service.name }),
        )
      : null;
  const { contact } = settings;

  return (
    <>
      <JsonLd data={[serviceJsonLd(service), faqJsonLd(service.faq)]} />
      <ServiceHero
        service={service}
        quoteHref={quoteHref}
        whatsappHref={whatsappHref}
        breadcrumb={[
          { label: t('home'), href: routes.home },
          { label: t('services'), href: '/services' as Route },
          { label: service.category.name, href: `/services/${service.category.slug}` as Route },
          { label: service.name },
        ]}
      />
      {service.offers && <ServiceOffers offers={service.offers} serviceSlug={service.slug} />}
      <ServiceContent
        service={service}
        aside={
          <>
            <QuoteCard
              bullets={service.quoteBullets}
              quoteHref={quoteHref}
              whatsappHref={whatsappHref}
              phone={{
                href: contact.phoneCameroon,
                display: contact.phoneCameroonDisplay ?? contact.phoneCameroon,
              }}
            />
            <AppointmentCard className="max-md:hidden" />
          </>
        }
      />
      <ServiceReviews title={service.reviewsTitle} reviews={service.reviews} />
      <RelatedServices title={service.relatedTitle} services={service.related} />
      {service.cta && (
        <CtaBand
          title={service.cta.title}
          text={service.cta.text}
          href={quoteHref}
          whatsappHref={whatsappHref}
        />
      )}
      <ServiceActionBar serviceName={service.name} quoteHref={quoteHref} whatsappHref={whatsappHref} />
    </>
  );
}
