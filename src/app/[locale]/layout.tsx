import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { RootDocument } from '@/components/root-document';
import { routing } from '@/i18n/routing';
import { SITE_NAME } from '@/lib/seo/site';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: t('description'),
  };
}

/** Racine du site public, une par langue (`fr` sans préfixe, `en` sous `/en`). */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <RootDocument lang={locale}>
      <NextIntlClientProvider>{children as ReactNode}</NextIntlClientProvider>
    </RootDocument>
  );
}
