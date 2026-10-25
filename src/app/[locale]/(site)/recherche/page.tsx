import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { SearchPage, SearchPageFromUrl } from '@/components/site/search/search-page';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { routes } from '@/lib/routes';
import { seoMetadata } from '@/lib/seo/metadata';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  const t = await getTranslations('search');
  return seoMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    path: '/recherche',
    noindex: true,
  });
}

/**
 * Résultats de la recherche globale (`/recherche?q=chef`, `/en/search?q=chef`), non maquettée. Page prérendue : le
 * texte recherché est lu dans le navigateur et les résultats demandés à l'API côté client ; repli du `<Suspense>` :
 * la page sans recherche. Non indexée et absente du plan du site.
 */
export default async function SearchResultsPage({ params }: LocaleParams) {
  await withLocale(params);
  const [t, tRubrique] = await Promise.all([getTranslations('search'), getTranslations('rubrique')]);
  const breadcrumb = (
    <Breadcrumb items={[{ label: tRubrique('home'), href: routes.home }, { label: t('eyebrow') }]} />
  );
  return (
    <Suspense fallback={<SearchPage query="" breadcrumb={breadcrumb} />}>
      <SearchPageFromUrl breadcrumb={breadcrumb} />
    </Suspense>
  );
}
