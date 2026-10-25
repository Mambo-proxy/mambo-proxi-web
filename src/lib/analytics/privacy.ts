import { readConsent } from '@/lib/consent';

/** Identifiant pseudonyme du navigateur (avec consentement uniquement), conservé dans le stockage local. */
export const VISITOR_STORAGE_KEY = 'mp_vid';
/** Renouvelé tous les 6 mois au plus (durée du choix de cookies ; le contrat autorise 13 mois). */
export const VISITOR_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;

type StoredVisitor = { id: string; createdAt: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** UUID v4 aléatoire (`crypto.randomUUID` n'existe que dans un contexte sécurisé). */
function randomUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Refus de suivi exprimé par le navigateur (« Do Not Track », Global Privacy Control) : jamais d'identifiant. */
export function browserOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  return (
    nav.globalPrivacyControl === true ||
    nav.doNotTrack === '1' ||
    nav.doNotTrack === 'yes' ||
    win.doNotTrack === '1' ||
    nav.msDoNotTrack === '1'
  );
}

/** Supprime l'identifiant (consentement retiré ou absent). */
export function forgetVisitor(): void {
  try {
    localStorage.removeItem(VISITOR_STORAGE_KEY);
  } catch {
    // Stockage indisponible (navigation privée stricte) : rien à effacer.
  }
}

/**
 * Identifiant du visiteur : réutilisé tant qu'il a moins de 6 mois et qu'il est postérieur au dernier choix de
 * cookies (un consentement retiré puis redonné produit un nouvel identifiant), sinon renouvelé. `null` si le
 * stockage local est indisponible.
 */
export function visitorId(decidedAt: number, now = Date.now()): string | null {
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<StoredVisitor>) : null;
    if (
      stored &&
      typeof stored.id === 'string' &&
      UUID.test(stored.id) &&
      typeof stored.createdAt === 'number' &&
      stored.createdAt >= decidedAt &&
      now - stored.createdAt < VISITOR_MAX_AGE_MS
    )
      return stored.id;
    const next: StoredVisitor = { id: randomUuid(), createdAt: now };
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(next));
    return next.id;
  } catch {
    return null;
  }
}

export type PrivacyContext = { consent: true; visitorId?: string } | { consent: false };

/**
 * Contexte d'envoi, relu à chaque lot : avec le consentement « Mesure d'audience » (et sans refus du navigateur),
 * `consent: true` et l'identifiant pseudonyme ; sinon `consent: false`, sans identifiant, et l'identifiant
 * éventuellement conservé est effacé.
 */
export function privacyContext(now = Date.now()): PrivacyContext {
  const consent = readConsent();
  if (!consent?.analytics || browserOptedOut()) {
    forgetVisitor();
    return { consent: false };
  }
  const decidedAt = Date.parse(consent.decidedAt);
  const id = visitorId(Number.isNaN(decidedAt) ? 0 : decidedAt, now);
  return id ? { consent: true, visitorId: id } : { consent: true };
}
