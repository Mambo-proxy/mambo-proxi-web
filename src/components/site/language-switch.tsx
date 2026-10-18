'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { localizeHref, parseSitePath } from '@/i18n/href';
import { locales } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Sélecteur de langue : la même page dans l'autre langue (`/qui-sommes-nous` ↔ `/en/about-us`).
 * - `bar` (barre supérieure `254:28015`) : « FR | EN » 12 px, langue active Inter SemiBold orange, autre Medium clair.
 * - `pill` (menu mobile `290:32174`) : pilule blanche bordée, langue active sur fond `neutral/900`.
 * Liens complets (rechargement) : le document change de langue (`<html lang>`, messages, contenus de l'API).
 */
export function LanguageSwitch({ variant }: { variant: 'bar' | 'pill' }) {
  const t = useTranslations('site.language');
  const { locale: current, internal } = parseSitePath(usePathname());

  if (variant === 'bar') {
    return (
      <nav aria-label={t('choose')}>
        <ul className="flex items-center gap-1.5 font-ui text-[12px]">
          {locales.map((locale, index) => (
            <Fragment key={locale}>
              {index > 0 && (
                <li aria-hidden className="font-medium text-neutral-300">
                  |
                </li>
              )}
              <li>
                <a
                  href={localizeHref(internal, locale)}
                  hrefLang={locale}
                  lang={locale}
                  aria-label={t(locale)}
                  aria-current={locale === current ? 'true' : undefined}
                  className={cn(
                    'rounded-xs focus-visible:focus-ring-inverse',
                    locale === current
                      ? 'font-semibold text-orange-400'
                      : 'font-medium text-neutral-300 hover:text-neutral-0',
                  )}
                >
                  {t(`short.${locale}`)}
                </a>
              </li>
            </Fragment>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p id="language-switch-label" className="font-ui text-[15px] font-medium text-neutral-700">
        {t('label')}
      </p>
      <ul
        aria-labelledby="language-switch-label"
        className="flex gap-0.5 rounded-full border border-border-default bg-neutral-0 p-1"
      >
        {locales.map((locale) => (
          <li key={locale}>
            <a
              href={localizeHref(internal, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? 'true' : undefined}
              className={cn(
                'flex rounded-full px-3 py-[7px] font-ui text-[13px] whitespace-nowrap',
                locale === current
                  ? 'bg-neutral-900 font-semibold text-neutral-0'
                  : 'font-medium text-neutral-700 hover:bg-neutral-100',
              )}
            >
              {t(`short.${locale}`)} — {t(locale)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
