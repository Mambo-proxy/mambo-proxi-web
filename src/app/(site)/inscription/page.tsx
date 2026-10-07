import type { Metadata } from 'next';
import { RegistrationLayout } from '@/components/forms/registration-layout';
import { unwrap } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';

export const metadata: Metadata = {
  title: 'S’inscrire',
  description:
    'Créez votre compte Mambo : enregistrez vos informations une fois, ou rejoignez notre réseau de partenaires au Cameroun.',
  alternates: { canonical: '/inscription' },
};

type SearchParams = { searchParams: Promise<{ profil?: string }> };

/** S'inscrire (particulier `70:10558`, professionnel `70:11134`, mobile `70:10903` / `70:11492`). */
export default async function RegistrationPage({ searchParams }: SearchParams) {
  const { profil } = await searchParams;
  const categories = await unwrap(api.GET('/v1/categories', cached([cacheTags.categories])));
  return (
    <RegistrationLayout
      initialProfile={profil === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER'}
      categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
    />
  );
}
