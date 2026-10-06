'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import { onOpenCookiePreferences, saveConsent, useConsent } from '@/lib/consent';

const outlineOnDark =
  'cursor-pointer rounded-md border border-neutral-600 px-4 py-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-neutral-0 transition-colors hover:bg-neutral-800 focus-visible:focus-ring-inverse';

/**
 * Bandeau cookies (Figma `71:9907`) : carte `neutral/900` rayon 24, `elevation/4`, 960 px centrée en bas
 * (mobile : pleine largeur moins 16 px) ; Refuser / Personnaliser / Accepter. « Personnaliser » ouvre une modale.
 * Google Analytics 4 n'est chargé qu'après consentement à la mesure d'audience.
 */
export function CookieBanner({ ga4MeasurementId }: { ga4MeasurementId: string | null }) {
  const consent = useConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(
    () =>
      onOpenCookiePreferences(() => {
        setAnalytics(consent?.analytics ?? false);
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
              Nous respectons votre vie privée
            </h2>
            <p className="font-ui text-[14px] leading-5 text-neutral-300">
              Nous utilisons des cookies pour mesurer l’audience et améliorer le site. Vous pouvez accepter,
              refuser ou personnaliser vos choix.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => decide(false)} className={outlineOnDark}>
              Refuser
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalytics(false);
                setPreferencesOpen(true);
              }}
              className={outlineOnDark}
            >
              Personnaliser
            </button>
            <Button onClick={() => decide(true)} className="focus-visible:focus-ring-inverse max-md:flex-1">
              Accepter
            </Button>
          </div>
        </section>
      )}

      <Modal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        title="Personnaliser les cookies"
        description="Choisissez les cookies que vous acceptez. Vous pouvez modifier ces choix à tout moment depuis la page Cookies."
        footer={
          <>
            <Button variant="outline" onClick={() => decide(false)}>
              Tout refuser
            </Button>
            <Button onClick={() => decide(analytics)}>Enregistrer mes choix</Button>
          </>
        }
      >
        <ul className="flex flex-col divide-y divide-border-default">
          <li className="flex flex-col gap-2 pb-4">
            <Switch id="cookies-necessaires" label="Cookies nécessaires" checked disabled readOnly />
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              Indispensables au fonctionnement du site (mémorisation de vos choix, sécurité des formulaires).
              Toujours actifs.
            </p>
          </li>
          <li className="flex flex-col gap-2 pt-4">
            <Switch
              id="cookies-mesure"
              label="Mesure d’audience (Google Analytics)"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
            />
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              Statistiques de visite anonymisées pour améliorer le site. Désactivée tant que vous ne
              l’acceptez pas.
            </p>
          </li>
        </ul>
      </Modal>

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
