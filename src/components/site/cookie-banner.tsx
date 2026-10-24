'use client';

import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { onOpenCookiePreferences, saveConsent, useConsent } from '@/lib/consent';

// Modale « Personnaliser » chargée à sa première ouverture, hors du JavaScript initial des pages.
const CookiePreferences = dynamic(
  () => import('./cookie-preferences').then((module) => module.CookiePreferences),
  { ssr: false },
);

const outlineOnDark =
  'cursor-pointer rounded-md border border-neutral-600 px-4 py-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-neutral-0 transition-colors hover:bg-neutral-800 focus-visible:focus-ring-inverse';

/**
 * Bandeau cookies (Figma `71:9907`) : carte `neutral/900` rayon 24, `elevation/4`, 960 px centrée en bas
 * (mobile : pleine largeur moins 16 px) ; Refuser / Personnaliser / Accepter. « Personnaliser » ouvre une modale.
 * Google Analytics 4 n'est chargé qu'après consentement à la mesure d'audience.
 */
export function CookieBanner({ ga4MeasurementId }: { ga4MeasurementId: string | null }) {
  const t = useTranslations('site.cookies');
  const consent = useConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  // Gardée montée après la première ouverture (animation de fermeture, retour du focus).
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(
    () =>
      onOpenCookiePreferences(() => {
        setAnalytics(consent?.analytics ?? false);
        setPreferencesLoaded(true);
        setPreferencesOpen(true);
      }),
    [consent],
  );

  // Le bouton WhatsApp flottant se décale tant que le bandeau est affiché.
  const showBanner = consent === null;
  useEffect(() => {
    document.documentElement.toggleAttribute('data-cookie-banner', showBanner);
    return () => document.documentElement.removeAttribute('data-cookie-banner');
  }, [showBanner]);

  function decide(value: boolean) {
    saveConsent(value);
    setPreferencesOpen(false);
  }

  return (
    <>
      {showBanner && (
        <section
          aria-labelledby="cookie-banner-title"
          className={cn(
            'fixed inset-x-2 bottom-2 z-50 mx-auto flex max-w-[960px] flex-col gap-4 rounded-xl bg-neutral-900 p-5 shadow-4',
            'animate-[modal-in_300ms_var(--mp-easing-standard)] motion-reduce:animate-none md:inset-x-4 md:bottom-6 xl:flex-row xl:items-center xl:gap-6 xl:p-6',
          )}
        >
          <div className="flex flex-1 flex-col gap-1">
            <h2
              id="cookie-banner-title"
              className="font-ui text-[16px] leading-6 font-semibold text-neutral-0"
            >
              {t('title')}
            </h2>
            <p className="font-ui text-[14px] leading-5 text-neutral-300">{t('text')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => decide(false)} className={outlineOnDark}>
              {t('refuse')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalytics(false);
                setPreferencesLoaded(true);
                setPreferencesOpen(true);
              }}
              className={outlineOnDark}
            >
              {t('customize')}
            </button>
            <Button onClick={() => decide(true)} className="focus-visible:focus-ring-inverse max-md:flex-1">
              {t('accept')}
            </Button>
          </div>
        </section>
      )}

      {preferencesLoaded && (
        <CookiePreferences
          open={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
          analytics={analytics}
          onAnalyticsChange={setAnalytics}
          onDecide={decide}
        />
      )}

      {consent?.analytics && ga4MeasurementId && <GoogleAnalytics measurementId={ga4MeasurementId} />}
    </>
  );
}

function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)},{anonymize_ip:true});`}
      </Script>
    </>
  );
}
