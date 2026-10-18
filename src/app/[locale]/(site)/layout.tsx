import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { CookieBanner } from '@/components/site/cookie-banner';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { TopBar } from '@/components/site/top-bar';
import { WhatsappFloat } from '@/components/site/whatsapp-float';
import { getNavigation, getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

/** Balise de vérification Google Search Console, saisie dans les Paramètres du back-office. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const google = settings.analytics?.searchConsoleVerification;
  return google ? { verification: { google } } : {};
}

/** Gabarit des pages publiques : barre supérieure, en-tête, pied de page, WhatsApp flottant, bandeau cookies. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, navigation, t] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getTranslations('site'),
  ]);
  const whatsappHref = settings.whatsapp.enabled
    ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message)
    : null;

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-md bg-neutral-900 px-4 py-3 font-ui text-[14px] font-semibold text-neutral-0 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader
        navigation={navigation}
        whatsappHref={whatsappHref}
        topBar={<TopBar settings={settings} whatsappHref={whatsappHref} />}
      />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter navigation={navigation} settings={settings} whatsappHref={whatsappHref} />
      {whatsappHref && <WhatsappFloat href={whatsappHref} />}
      <CookieBanner ga4MeasurementId={settings.analytics?.ga4MeasurementId ?? null} />
    </>
  );
}
