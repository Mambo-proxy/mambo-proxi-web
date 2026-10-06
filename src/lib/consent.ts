'use client';

import { useSyncExternalStore } from 'react';

/** Choix de cookies : les cookies nécessaires sont toujours actifs ; seule la mesure d'audience est optionnelle. */
export type Consent = { analytics: boolean; decidedAt: string };

const COOKIE = 'mp_consent';
const VERSION = 1;
/** Choix mémorisé 6 mois (docs/03 — Bandeau cookies). */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 182;
const OPEN_EVENT = 'mp:open-cookie-preferences';

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Consent | null = null;

function readRaw(): string | null {
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE.length + 1)) : null;
}

/** Consentement enregistré, ou `null` si l'utilisateur n'a pas encore choisi. */
export function readConsent(): Consent | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as { v?: number; analytics?: unknown; decidedAt?: unknown }) : null;
    cachedValue =
      parsed &&
      parsed.v === VERSION &&
      typeof parsed.analytics === 'boolean' &&
      typeof parsed.decidedAt === 'string'
        ? { analytics: parsed.analytics, decidedAt: parsed.decidedAt }
        : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function saveConsent(analytics: boolean): void {
  const value = JSON.stringify({ v: VERSION, analytics, decidedAt: new Date().toISOString() });
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Consentement courant : `undefined` pendant le rendu serveur (bandeau non affiché, pas de saut à l'hydratation),
 * `null` si aucun choix, sinon le choix enregistré.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, readConsent, () => undefined);
}

/** Rouvre les préférences (lien « Gérer mes cookies » de la page Cookies). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookiePreferences(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
