import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TokenAction } from '@/components/sections/system/token-action';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  const t = await getTranslations('system.meta');
  return { title: t('newsletterConfirm'), robots: { index: false } };
}

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Lien de l'e-mail de double opt-in : confirme l'inscription à la newsletter (`POST /v1/newsletter/confirm`). */
export default async function NewsletterConfirmationPage({
  params,
  searchParams,
}: LocaleParams & SearchParams) {
  await withLocale(params);
  const { token } = await searchParams;
  return <TokenAction kind="newsletter-confirm" token={token ?? null} />;
}
