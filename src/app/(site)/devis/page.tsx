import type { Metadata } from 'next';
import { QuoteForm } from '@/components/forms/quote/quote-form';
import { AccentText } from '@/components/ui/accent-text';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Devis gratuit',
  description:
    'Votre devis gratuit en 3 minutes : sans engagement, réponse personnalisée sous 24 h, par e-mail ou WhatsApp.',
  alternates: { canonical: '/devis' },
};

type SearchParams = { searchParams: Promise<{ service?: string; rubrique?: string }> };

/** Devis gratuit (desktop `70:8077`, mobile `70:8481`) : en-tête, progression, formulaire en 3 étapes, récapitulatif. */
export default async function QuotePage({ searchParams }: SearchParams) {
  const query = await searchParams;
  const [categories, settings] = await Promise.all([
    unwrap(
      api.GET('/v1/categories', {
        params: { query: { include: 'services' } },
        ...cached([cacheTags.categories, cacheTags.services]),
      }),
    ),
    getSiteSettings(),
  ]);
  // Champs dynamiques de l'étape 2 : `quoteFields` de chaque rubrique (administrables dans le back-office).
  const details = await Promise.all(
    categories.map((category) =>
      unwrapOrNull(
        api.GET('/v1/categories/{slug}', {
          params: { path: { slug: category.slug } },
          ...cached([cacheTags.category(category.slug), cacheTags.categories]),
        }),
      ),
    ),
  );
  const fieldsByCategory = Object.fromEntries(
    categories.map((category, index) => [category.slug, details[index]?.quoteFields ?? []]),
  );

  const withServices = categories.map((category) => ({ ...category, services: category.services ?? [] }));
  const presetService = withServices
    .flatMap((category) => category.services)
    .find((service) => service.slug === query.service);
  const presetCategory =
    presetService?.category.slug ??
    withServices.find((category) => category.slug === query.rubrique)?.slug ??
    null;

  return (
    <div className="bg-neutral-50">
      <section className="container-site flex flex-col gap-4 pt-5 pb-4 xl:pt-12">
        <Breadcrumb items={[{ label: 'Accueil', href: routes.home }, { label: 'Devis gratuit' }]} />
        <h1 className="font-brand text-[32px] leading-[38px] font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[52px] xl:leading-[58px]">
          <AccentText text="Votre devis gratuit ==en 3 minutes.==" />
        </h1>
        <p className="font-ui text-[16px] leading-6 text-text-muted xl:text-[19px] xl:leading-8">
          {frenchTypography('Sans engagement. Réponse personnalisée sous 24 h, par e-mail ou WhatsApp.')}
        </p>
      </section>
      <QuoteForm
        categories={withServices}
        fieldsByCategory={fieldsByCategory}
        initialCategory={presetCategory}
        initialService={presetService?.slug ?? null}
        whatsapp={
          settings.whatsapp.enabled
            ? { number: settings.whatsapp.number, message: settings.whatsapp.message }
            : null
        }
      />
    </div>
  );
}
