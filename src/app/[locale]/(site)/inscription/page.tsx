import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { RegistrationLayout, RegistrationLayoutFromUrl } from '@/components/forms/registration-layout';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { seoMetadata } from '@/lib/seo/metadata';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  const t = await getTranslations('registration');
  return seoMetadata({ title: t('metaTitle'), description: t('metaDescription'), path: '/inscription' });
}

/**
 * S'inscrire (particulier `70:10558`, professionnel `70:11134`, mobile `70:10903` / `70:11492`).
 * Page prérendue : le profil `?profil=` est lu dans le navigateur.
 */
export default async function RegistrationPage({ params }: LocaleParams) {
  await withLocale(params);
  const [categories, t, tRubrique] = await Promise.all([
    unwrap(api.GET('/v1/categories', cached([cacheTags.categories]))),
    getTranslations('registration'),
    getTranslations('rubrique'),
  ]);
  const layoutProps = {
    categories: categories.map((category) => ({ slug: category.slug, name: category.name })),
    labels: { home: tRubrique('home'), breadcrumb: t('breadcrumb'), title: t('title') },
  };
  // Repli prérendu : le profil « Particulier », remplacé à l'hydratation par celui de l'adresse.
  return (
    <Suspense fallback={<RegistrationLayout {...layoutProps} initialProfile="PARTICULIER" />}>
      <RegistrationLayoutFromUrl {...layoutProps} />
    </Suspense>
  );
}
