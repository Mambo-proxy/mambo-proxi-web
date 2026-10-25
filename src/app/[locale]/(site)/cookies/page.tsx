import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/sections/legal/legal-page';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  return legalMetadata('cookies');
}

export default async function Page({ params }: LocaleParams) {
  await withLocale(params);
  return <LegalPage pageKey="cookies" />;
}
