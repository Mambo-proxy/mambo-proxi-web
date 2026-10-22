'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { openCookiePreferences } from '@/lib/consent';

/** « Modifier mes choix » (page Gestion des cookies) : rouvre les préférences du bandeau cookies. */
export function CookieSettingsButton() {
  const t = useTranslations('legal');
  return (
    <Button variant="outline" className="self-start" onClick={() => openCookiePreferences()}>
      {t('settings')}
    </Button>
  );
}
