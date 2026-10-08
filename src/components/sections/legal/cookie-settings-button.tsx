'use client';

import { Button } from '@/components/ui/button';
import { openCookiePreferences } from '@/lib/consent';

/** « Modifier mes choix » (page Gestion des cookies) : rouvre les préférences du bandeau cookies. */
export function CookieSettingsButton() {
  return (
    <Button variant="outline" className="self-start" onClick={() => openCookiePreferences()}>
      Modifier mes choix de cookies
    </Button>
  );
}
