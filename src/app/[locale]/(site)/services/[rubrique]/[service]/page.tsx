import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { QuoteCard, AppointmentCard } from '@/components/sections/service/quote-card';
import { RelatedServices } from '@/components/sections/service/related-services';
import { ServiceActionBar } from '@/components/sections/service/service-action-bar';
import { ServiceContent } from '@/components/sections/service/service-content';
import { ServiceHero } from '@/components/sections/service/service-hero';
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

type Params = { params: Promise<{ rubrique: string; service: string }> };

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

export async function generateStaticParams() {
  const services = await unwrap(api.GET('/v1/services', cached([cacheTags.services])));
  return services.map((service) => ({ rubrique: service.category.slug, service: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
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

/** Fiche service (Chef privé desktop `62:4161`, mobile `62:4733`) : gabarit commun aux 19 services. */
export default async function ServicePage({ params }: Params) {
  const { rubrique, service: slug } = await params;
  const [service, settings] = await Promise.all([getService(rubrique, slug), getSiteSettings()]);
  if (!service) notFound();

  const quoteHref = `/devis?service=${service.slug}` as Route;
  const whatsappHref =
    service.showWhatsapp && settings.whatsapp.enabled
      ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message, `Service : ${service.name}`)
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
          { label: 'Accueil', href: routes.home },
          { label: 'Nos services', href: '/services' as Route },
          { label: service.category.name, href: `/services/${service.category.slug}` as Route },
          { label: service.name },
        ]}
      />
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
