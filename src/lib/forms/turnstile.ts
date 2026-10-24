/**
 * Cloudflare Turnstile en mode invisible (`appearance: 'interaction-only'`) : le widget reste caché et ne s'affiche
 * que si Cloudflare demande une interaction. Le script est injecté à la demande (premier focus dans le formulaire
 * ou premier envoi), jamais au chargement de la page. Sans clé publique (développement, mocks, tests), rien n'est
 * chargé et le jeton envoyé reste vide.
 *
 * Module sans dépendance (ni React, ni client de l'API) : il peut être importé par le pied de page sans alourdir le
 * JavaScript initial.
 */

export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Délai au-delà duquel l'envoi part avec un jeton vide (l'API tranche et renvoie son message d'erreur). */
const TOKEN_TIMEOUT_MS = 30_000;

/** Options de `turnstile.render()` utilisées ici (documentation Cloudflare, « Client-side rendering »). */
export type TurnstileRenderOptions = {
  sitekey: string;
  appearance: 'always' | 'execute' | 'interaction-only';
  size: 'normal' | 'flexible' | 'compact';
  theme: 'auto' | 'light' | 'dark';
  language: string;
  'response-field': boolean;
  'refresh-expired': 'auto' | 'manual' | 'never';
  callback: (token: string) => void;
  'error-callback': (code: string) => boolean;
  'expired-callback': () => void;
  'timeout-callback': () => void;
  'unsupported-callback': () => void;
  'before-interactive-callback': () => void;
  'after-interactive-callback': () => void;
};

/** Partie de l'objet global `window.turnstile` utilisée ici. */
export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | null | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoading: Promise<TurnstileApi> | null = null;

/** Injecte le script Turnstile une seule fois pour toute la page (nouvel essai possible après un échec). */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile indisponible.'));
    script.onerror = () => reject(new Error('Le script Turnstile n’a pas pu être chargé.'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptLoading = null;
    throw error;
  });
  return scriptLoading;
}

export type TurnstileWidgetOptions = {
  /** Clé publique du site ; vide = protection désactivée (jeton vide). */
  siteKey: string;
  theme?: TurnstileRenderOptions['theme'];
  /** Chargement de l'API (remplacé dans les tests). */
  load?: () => Promise<TurnstileApi>;
  timeoutMs?: number;
};

export type TurnstileWidget = {
  /** Rattache le widget à son conteneur (dans le formulaire). */
  attach: (container: HTMLElement) => void;
  /** Retire le widget (formulaire démonté) : un nouveau sera rendu au prochain rattachement. */
  detach: () => void;
  /** Charge le script et lance la vérification en arrière-plan (premier focus dans le formulaire). */
  prepare: () => void;
  /** Jeton à joindre à l'envoi : à usage unique, un nouveau est préparé aussitôt ; chaîne vide en cas d'échec. */
  token: () => Promise<string>;
};

/**
 * Pilote d'un widget Turnstile (un par formulaire). Le jeton obtenu est gardé jusqu'à l'envoi (Turnstile le
 * renouvelle de lui-même avant expiration) ; chaque envoi consomme le jeton et relance une vérification.
 */
export function createTurnstileWidget({
  siteKey,
  theme = 'auto',
  load = loadTurnstile,
  timeoutMs = TOKEN_TIMEOUT_MS,
}: TurnstileWidgetOptions): TurnstileWidget {
  let container: HTMLElement | null = null;
  /** Rendu en cours ou terminé ; `null` tant que rien n'est lancé. */
  let rendering: Promise<void> | null = null;
  let widget: { api: TurnstileApi; id: string } | null = null;
  /** Jeton prêt et pas encore utilisé. */
  let ready: string | null = null;
  /** Envois en attente d'un jeton. */
  let waiters: ((token: string) => void)[] = [];
  /** Incrémenté à chaque retrait : un rendu lancé avant le retrait est abandonné. */
  let generation = 0;

  function settleAll(token: string) {
    const pending = waiters;
    waiters = [];
    for (const resolve of pending) resolve(token);
  }

  /** Relance une vérification pour l'envoi suivant (le jeton remis est à usage unique). */
  function refresh() {
    const current = widget;
    if (current) setTimeout(() => current.api.reset(current.id), 0);
  }

  function setVisible(visible: boolean) {
    if (!container) return;
    if (visible) container.dataset.turnstile = 'visible';
    else delete container.dataset.turnstile;
  }

  function start() {
    if (!siteKey || !container || rendering) return;
    const started = generation;
    rendering = load()
      .then((api) => {
        if (started !== generation || !container) return;
        const id = api.render(container, {
          sitekey: siteKey,
          appearance: 'interaction-only',
          size: 'flexible',
          theme,
          language: document.documentElement.lang || 'auto',
          // Le jeton est lu par le formulaire : pas de champ caché `cf-turnstile-response`.
          'response-field': false,
          'refresh-expired': 'auto',
          callback: (token) => {
            const next = waiters.shift();
            if (next) {
              next(token);
              refresh();
            } else {
              ready = token;
            }
          },
          'error-callback': () => {
            ready = null;
            settleAll('');
            // Erreur prise en charge : Turnstile réessaie de lui-même (`retry: 'auto'`).
            return true;
          },
          'expired-callback': () => {
            ready = null;
          },
          'timeout-callback': () => {
            ready = null;
            settleAll('');
            refresh();
          },
          'unsupported-callback': () => settleAll(''),
          // Interaction demandée par Cloudflare : le conteneur, caché par défaut, s'affiche le temps du défi.
          'before-interactive-callback': () => setVisible(true),
          'after-interactive-callback': () => setVisible(false),
        });
        if (id) widget = { api, id };
        else settleAll('');
      })
      .catch(() => {
        if (started !== generation) return;
        // Script bloqué ou injoignable : l'envoi part sans jeton, un nouvel essai aura lieu au prochain envoi.
        rendering = null;
        settleAll('');
      });
  }

  function reset() {
    generation += 1;
    if (widget) widget.api.remove(widget.id);
    widget = null;
    rendering = null;
    ready = null;
    settleAll('');
  }

  return {
    attach(next) {
      if (container === next) return;
      if (container) reset();
      container = next;
    },
    detach() {
      setVisible(false);
      reset();
      container = null;
    },
    prepare: start,
    token() {
      if (!siteKey) return Promise.resolve('');
      if (ready) {
        const token = ready;
        ready = null;
        refresh();
        return Promise.resolve(token);
      }
      if (!container) return Promise.resolve('');
      const pending = new Promise<string>((resolve) => {
        const timer = setTimeout(() => {
          waiters = waiters.filter((waiter) => waiter !== settle);
          resolve('');
        }, timeoutMs);
        const settle = (token: string) => {
          clearTimeout(timer);
          resolve(token);
        };
        waiters.push(settle);
      });
      start();
      return pending;
    },
  };
}
