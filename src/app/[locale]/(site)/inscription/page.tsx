import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegistrationLayout } from '@/components/forms/registration-layout';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { seoMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('registration');
  return seoMetadata({ title: t('metaTitle'), description: t('metaDescription'), path: '/inscription' });
}

type SearchParams = { searchParams: Promise<{ profil?: string }> };

/** S'inscrire (particulier `70:10558`, professionnel `70:11134`, mobile `70:10903` / `70:11492`). */
export default async function RegistrationPage({ searchParams }: SearchParams) {
  const { profil } = await searchParams;
  const [categories, t, tRubrique] = await Promise.all([
    unwrap(api.GET('/v1/categories', cached([cacheTags.categories]))),
    getTranslations('registration'),
    getTranslations('rubrique'),
  ]);
  return (
    <RegistrationLayout
      initialProfile={profil === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER'}
      categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
      labels={{ home: tRubrique('home'), breadcrumb: t('breadcrumb'), title: t('title') }}
    />
  );
}
