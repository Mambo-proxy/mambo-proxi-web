import { parseSitePath } from '@/i18n/href';
import type { AnalyticsEvent, AnalyticsEventBase } from '@/lib/api/schema';
import { classifyClick, type TrackedClick } from './classify';
import { privacyContext, type PrivacyContext } from './privacy';
import { sendBatch, type Sender, type SendMode } from './send';

/** Envoi périodique : au plus toutes les 10 s (contrat), et à la fermeture de la page. */
export const FLUSH_INTERVAL_MS = 10_000;
/** Limites d'un lot du contrat : 50 événements, 16 Kio. */
export const MAX_BATCH_EVENTS = 50;
export const MAX_BATCH_BYTES = 16 * 1024;
/** File en mémoire bornée : les plus anciens événements sont abandonnés au-delà. */
export const MAX_QUEUE = 500;

/** Page vue ou clic survenu avant le chargement du module (mémorisé par le composant du gabarit). */
export type PendingView = { pathname: string; at: number };
export type PendingClick = { target: EventTarget | null; pathname: string; at: number };

export type TrackerOptions = {
  send?: Sender;
  privacy?: () => PrivacyContext;
  /** Largeur de fenêtre (appareil) et référent, remplaçables dans les tests. */
  viewportWidth?: () => number;
  referrer?: () => string;
};

const byteLength = (value: string) => new TextEncoder().encode(value).length;

/** Appareil selon la largeur de la fenêtre (< 768, < 1280, au-delà), comme le contrat. */
export function deviceFor(width: number): AnalyticsEventBase['device'] {
  return width < 768 ? 'mobile' : width < 1280 ? 'tablet' : 'desktop';
}

/** Domaine du site d'origine (sans chemin) ; `null` pour un accès direct ou depuis le site lui-même. */
export function referrerHost(referrer: string, ownHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname;
    return host && host !== ownHost ? host.slice(0, 253) : null;
  } catch {
    return null;
  }
}

/**
 * Découpe les événements en corps JSON conformes (50 événements et 16 Kio au plus chacun). Le contexte de
 * consentement est le même pour tous les lots d'un envoi.
 */
export function encodeBatches(events: AnalyticsEvent[], privacy: PrivacyContext): string[] {
  const bodies: string[] = [];
  const encode = (chunk: AnalyticsEvent[]) => {
    const body = JSON.stringify({ ...privacy, events: chunk });
    if (byteLength(body) <= MAX_BATCH_BYTES || chunk.length === 1) {
      // Un événement seul ne dépasse jamais la limite (chemin, contenu et emplacement sont tronqués).
      bodies.push(body);
      return;
    }
    const middle = Math.ceil(chunk.length / 2);
    encode(chunk.slice(0, middle));
    encode(chunk.slice(middle));
  };
  for (let index = 0; index < events.length; index += MAX_BATCH_EVENTS)
    encode(events.slice(index, index + MAX_BATCH_EVENTS));
  return bodies;
}

/**
 * File des événements : pages vues et actions sont mises en attente puis envoyées par lots (`flush`). Les données
 * se limitent à l'adresse interne de la page, la langue, l'heure, le type d'appareil et, pour une action, son type,
 * son contenu (slug) et son emplacement : aucune donnée saisie, aucun identifiant sans consentement.
 */
export function createTracker(options: TrackerOptions = {}) {
  const send = options.send ?? sendBatch;
  const privacy = options.privacy ?? (() => privacyContext());
  const viewportWidth = options.viewportWidth ?? (() => window.innerWidth);
  const referrer = options.referrer ?? (() => document.referrer);
  const queue: AnalyticsEvent[] = [];
  let firstView = true;

  function base(pathname: string, at: number): AnalyticsEventBase {
    const { locale, internal } = parseSitePath(pathname);
    return {
      path: internal.slice(0, 300),
      lang: locale,
      occurredAt: new Date(at).toISOString(),
      device: deviceFor(viewportWidth()),
    };
  }

  function push(event: AnalyticsEvent) {
    queue.push(event);
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
  }

  function action(
    click: TrackedClick,
    pathname: string,
    at = Date.now(),
    step: 'click' | 'submit' = 'click',
  ) {
    push({ type: 'action', ...base(pathname, at), step, ...click });
  }

  return {
    /** Page vue ; le référent externe n'est retenu que pour la première page de la visite. */
    pageView(pathname: string, at = Date.now()) {
      const host = firstView ? referrerHost(referrer(), window.location.hostname) : null;
      firstView = false;
      push({ type: 'page_view', ...base(pathname, at), referrerHost: host });
    },
    action,
    /** Clic délégué : mesuré seulement s'il correspond à une action suivie. */
    click(target: EventTarget | null, pathname: string, at = Date.now()) {
      const click = classifyClick(target);
      if (click) action(click, pathname, at);
    },
    /** Envoie les événements en attente ; n'échoue jamais. */
    flush(mode: SendMode = 'interval') {
      if (queue.length === 0) return;
      const events = queue.splice(0);
      try {
        for (const body of encodeBatches(events, privacy()))
          void Promise.resolve(send(body, mode)).catch(() => undefined);
      } catch {
        // Mesure abandonnée : jamais d'erreur visible.
      }
    },
    get size() {
      return queue.length;
    },
  };
}

export type Tracker = ReturnType<typeof createTracker>;

/**
 * Démarre la mesure dans la page : rejoue les pages vues et clics survenus avant le chargement, écoute les clics
 * (délégation sur le document, clic principal et clic molette), envoie toutes les 10 s et à la fermeture de la page
 * (`visibilitychange` masqué, `pagehide`). Renvoie le suivi et la fonction d'arrêt.
 */
export function startTracker(
  options: TrackerOptions & { views?: PendingView[]; clicks?: PendingClick[] } = {},
) {
  const tracker = createTracker(options);
  for (const view of options.views ?? []) tracker.pageView(view.pathname, view.at);
  for (const click of options.clicks ?? []) tracker.click(click.target, click.pathname, click.at);

  const onClick = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    tracker.click(event.target, window.location.pathname);
  };
  const onHidden = () => document.visibilityState === 'hidden' && tracker.flush('unload');
  const onPageHide = () => tracker.flush('unload');
  // Phase de capture : le clic est vu même si un composant arrête sa propagation.
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', onPageHide);
  const timer = window.setInterval(() => tracker.flush('interval'), FLUSH_INTERVAL_MS);
  // Repère pour les tests de bout en bout : la mesure est active.
  document.documentElement.dataset.analytics = 'ready';

  return {
    tracker,
    stop() {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onPageHide);
      window.clearInterval(timer);
      delete document.documentElement.dataset.analytics;
      tracker.flush('unload');
    },
  };
}
