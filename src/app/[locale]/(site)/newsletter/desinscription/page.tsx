import type { Metadata } from 'next';
import { TokenAction } from '@/components/sections/system/token-action';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export const metadata: Metadata = { title: 'Désinscription de la newsletter', robots: { index: false } };

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Lien de désinscription des e-mails : désinscription sur confirmation (`POST /v1/newsletter/unsubscribe`). */
export default async function NewsletterUnsubscribePage({
  params,
  searchParams,
}: LocaleParams & SearchParams) {
  await withLocale(params);
  const { token } = await searchParams;
  return <TokenAction kind="newsletter-unsubscribe" token={token ?? null} />;
}
