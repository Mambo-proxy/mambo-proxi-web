import { parseSitePath } from '@/i18n/href';
import type { AnalyticsAction } from '@/lib/api/schema';

/** Actions du contrat (`AnalyticsAction`), pour valider un attribut `data-track`. */
export const ANALYTICS_ACTIONS: readonly AnalyticsAction[] = [
  'quote',
  'whatsapp',
  'call',
  'email',
  'participate',
  'newsletter',
  'appointment',
  'sign_up',
  'contact',
  'application',
  'partner',
  'training',
];

const isAction = (value: string | undefined): value is AnalyticsAction =>
  !!value && (ANALYTICS_ACTIONS as readonly string[]).includes(value);

export type TrackedClick = { action: AnalyticsAction; target: string | null; placement: string | null };

/** Liens WhatsApp : `wa.me`, `api.whatsapp.com`, `web.whatsapp.com` et le schéma `whatsapp:` de l'application. */
const WHATSAPP = /^(?:https?:\/\/(?:wa\.me|(?:api|web|chat)\.whatsapp\.com)(?:[/?#]|$)|whatsapp:)/i;

/** Adresse interne (française) d'un lien du site, ou `null` pour un lien externe. */
function internalPath(href: string): { path: string; params: URLSearchParams } | null {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return { path: parseSitePath(url.pathname).internal, params: url.searchParams };
  } catch {
    return null;
  }
}

/**
 * Action reconnue d'après l'adresse d'un lien : appel (`tel:`), e-mail (`mailto:`), WhatsApp, demande de devis
 * (`/devis`, `/en/free-quote`, avec le service ou la rubrique choisis comme contenu concerné), inscription
 * (`/inscription`, `/en/sign-up`). Les autres liens ne sont pas mesurés (la page vue suffit).
 */
export function actionFromHref(href: string): Omit<TrackedClick, 'placement'> | null {
  const value = href.trim();
  if (/^tel:/i.test(value)) return { action: 'call', target: null };
  if (/^mailto:/i.test(value)) return { action: 'email', target: null };
  if (WHATSAPP.test(value)) return { action: 'whatsapp', target: null };
  const internal = internalPath(value);
  if (!internal) return null;
  if (internal.path === '/devis')
    return {
      action: 'quote',
      target: internal.params.get('service') ?? internal.params.get('rubrique'),
    };
  if (internal.path === '/inscription') return { action: 'sign_up', target: internal.params.get('profil') };
  return null;
}

/**
 * Emplacement du bouton : `data-track-placement` sur l'élément ou un parent, sinon déduit de la page (bouton
 * WhatsApp flottant, en-tête, pied de page, fenêtre, contenu).
 */
function placementOf(element: Element): string | null {
  const explicit = element.closest<HTMLElement>('[data-track-placement]')?.dataset.trackPlacement;
  if (explicit) return explicit;
  if (element.closest('[data-whatsapp-float]')) return 'sticky';
  if (element.closest('header')) return 'header';
  if (element.closest('footer')) return 'footer';
  if (element.closest('[role="dialog"], dialog')) return 'dialog';
  if (element.closest('main')) return 'section';
  return null;
}

const clip = (value: string | null | undefined, max: number) => (value ? value.slice(0, max) : null);

/**
 * Délégation des clics : à partir de l'élément cliqué, remonte au premier lien ou élément portant `data-track`
 * (`data-track="participate"`, contenu concerné dans `data-track-target`) et renvoie l'action mesurée, ou `null`.
 * `data-track="none"` exclut un lien de la mesure.
 */
export function classifyClick(start: EventTarget | null): TrackedClick | null {
  // `nodeType` plutôt qu'`instanceof Element` : fiable même pour un nœud texte ou un autre document.
  const node = start as Node | null;
  const element = node?.nodeType === 1 ? (node as Element) : (node?.parentElement ?? null);
  const source = element?.closest<HTMLElement>('[data-track], a[href]');
  if (!source) return null;
  const explicit = source.dataset.track;
  if (explicit === 'none') return null;
  const fromHref =
    source.tagName === 'A' && source.getAttribute('href')
      ? actionFromHref(source.getAttribute('href') ?? '')
      : null;
  const action = isAction(explicit) ? explicit : fromHref?.action;
  if (!action) return null;
  return {
    action,
    target: clip(source.dataset.trackTarget ?? (fromHref?.action === action ? fromHref.target : null), 120),
    placement: clip(placementOf(source), 40),
  };
}
