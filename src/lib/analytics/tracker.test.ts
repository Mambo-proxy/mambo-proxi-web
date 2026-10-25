// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnalyticsActionEvent, AnalyticsEventBatch, AnalyticsPageView } from '@/lib/api/schema';
import { saveConsent } from '@/lib/consent';
import { classifyClick } from './classify';
import { privacyContext, VISITOR_MAX_AGE_MS, VISITOR_STORAGE_KEY } from './privacy';
import type { SendMode } from './send';
import {
  createTracker,
  deviceFor,
  encodeBatches,
  FLUSH_INTERVAL_MS,
  MAX_BATCH_BYTES,
  referrerHost,
  startTracker,
} from './tracker';

/** Envois capturés : corps décodé et mode (périodique ou fermeture de page). */
function capture() {
  const sent: { batch: AnalyticsEventBatch; mode: SendMode }[] = [];
  const send = vi.fn((body: string, mode: SendMode) => {
    sent.push({ batch: JSON.parse(body) as AnalyticsEventBatch, mode });
  });
  return { sent, send };
}

const clearConsent = () => {
  document.cookie = 'mp_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

function setDoNotTrack(value: string | null) {
  Object.defineProperty(navigator, 'doNotTrack', { value, configurable: true });
}

function element(html: string, selector: string): Element {
  document.body.innerHTML = html;
  const found = document.querySelector(selector);
  if (!found) throw new Error(`Élément introuvable : ${selector}`);
  return found;
}

beforeEach(() => {
  clearConsent();
  localStorage.clear();
  setDoNotTrack(null);
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('délégation des clics : actions reconnues', () => {
  it('liens d’appel, d’e-mail et WhatsApp', () => {
    expect(classifyClick(element('<a href="tel:+237600000000">Appeler</a>', 'a'))?.action).toBe('call');
    expect(classifyClick(element('<a href="mailto:contact@mamboproxi.com">E-mail</a>', 'a'))?.action).toBe(
      'email',
    );
    expect(
      classifyClick(element('<a href="https://wa.me/237600000000?text=Bonjour">WA</a>', 'a'))?.action,
    ).toBe('whatsapp');
    expect(
      classifyClick(element('<a href="https://api.whatsapp.com/send?phone=1">WA</a>', 'a'))?.action,
    ).toBe('whatsapp');
  });

  it('devis et inscription, en français comme en anglais, avec le service concerné', () => {
    expect(classifyClick(element('<a href="/devis?service=chef-prive">Devis</a>', 'a'))).toMatchObject({
      action: 'quote',
      target: 'chef-prive',
    });
    expect(
      classifyClick(element('<a href="/en/free-quote?rubrique=immobilier">Quote</a>', 'a')),
    ).toMatchObject({
      action: 'quote',
      target: 'immobilier',
    });
    expect(classifyClick(element('<a href="/inscription">S’inscrire</a>', 'a'))?.action).toBe('sign_up');
    expect(
      classifyClick(element('<a href="/en/sign-up?profil=professionnel">Sign up</a>', 'a')),
    ).toMatchObject({
      action: 'sign_up',
      target: 'professionnel',
    });
  });

  it('clic sur un élément à l’intérieur du lien (icône, texte)', () => {
    const icon = element('<a href="/devis"><span><svg></svg>Devis gratuit</span></a>', 'svg');
    expect(classifyClick(icon)?.action).toBe('quote');
  });

  it('boutons marqués data-track, avec le contenu concerné', () => {
    const button = element(
      '<button type="button" data-track="participate" data-track-target="concert-makossa">Je participe</button>',
      'button',
    );
    expect(classifyClick(button)).toMatchObject({ action: 'participate', target: 'concert-makossa' });
    expect(
      classifyClick(element('<button data-track="newsletter">S’abonner</button>', 'button'))?.action,
    ).toBe('newsletter');
  });

  it('ignore les autres liens, les boutons non marqués, data-track inconnu ou « none »', () => {
    expect(classifyClick(element('<a href="/qui-sommes-nous">Qui sommes-nous</a>', 'a'))).toBeNull();
    expect(classifyClick(element('<a href="https://www.facebook.com/mambo">Facebook</a>', 'a'))).toBeNull();
    expect(
      classifyClick(element('<a href="https://autre-site.fr/devis">Devis ailleurs</a>', 'a')),
    ).toBeNull();
    expect(classifyClick(element('<button>Ouvrir</button>', 'button'))).toBeNull();
    expect(classifyClick(element('<button data-track="inconnu">?</button>', 'button'))).toBeNull();
    expect(classifyClick(element('<a href="tel:+33100000000" data-track="none">Appel</a>', 'a'))).toBeNull();
    expect(classifyClick(null)).toBeNull();
  });

  it('emplacement : en-tête, pied de page, bouton flottant, contenu, ou explicite', () => {
    const placement = (html: string) => classifyClick(element(html, 'a'))?.placement;
    expect(placement('<header><a href="/devis">Devis</a></header>')).toBe('header');
    expect(placement('<footer><a href="tel:+1">Appel</a></footer>')).toBe('footer');
    expect(placement('<a data-whatsapp-float href="https://wa.me/1">WA</a>')).toBe('sticky');
    expect(placement('<main><section><a href="/devis">Devis</a></section></main>')).toBe('section');
    expect(placement('<main><div data-track-placement="hero"><a href="/devis">Devis</a></div></main>')).toBe(
      'hero',
    );
  });
});

describe('file d’attente et regroupement', () => {
  const noConsent = () => ({ consent: false }) as const;

  it('n’envoie rien sans événement', () => {
    const { send } = capture();
    createTracker({ send, privacy: noConsent }).flush();
    expect(send).not.toHaveBeenCalled();
  });

  it('page vue : adresse interne française, langue, appareil, référent externe sur la première page seulement', () => {
    const { sent, send } = capture();
    const tracker = createTracker({
      send,
      privacy: noConsent,
      viewportWidth: () => 390,
      referrer: () => 'https://www.google.com/search?q=mambo',
    });
    tracker.pageView('/en/about-us', Date.parse('2026-10-25T09:00:00.000Z'));
    tracker.pageView('/services/experience/chef-prive');
    tracker.flush();
    const [first, second] = sent[0]?.batch.events as AnalyticsPageView[];
    expect(first).toMatchObject({
      type: 'page_view',
      path: '/qui-sommes-nous',
      lang: 'en',
      device: 'mobile',
      occurredAt: '2026-10-25T09:00:00.000Z',
      referrerHost: 'www.google.com',
    });
    expect(second).toMatchObject({ path: '/services/experience/chef-prive', lang: 'fr', referrerHost: null });
    expect(tracker.size).toBe(0);
  });

  it('un seul lot pour les événements regroupés, découpé à 50 événements', () => {
    const { sent, send } = capture();
    const tracker = createTracker({ send, privacy: noConsent });
    for (let index = 0; index < 120; index += 1) tracker.pageView(`/page-${index}`);
    tracker.flush();
    expect(sent.map((item) => item.batch.events.length)).toEqual([50, 50, 20]);
  });

  it('lots de 16 Kio au plus', () => {
    const events = Array.from({ length: 50 }, (_, index) => ({
      type: 'page_view' as const,
      path: `/${'x'.repeat(290)}-${index}`,
      lang: 'fr' as const,
      occurredAt: new Date().toISOString(),
    }));
    const bodies = encodeBatches(events, { consent: false });
    expect(bodies.length).toBeGreaterThan(1);
    for (const body of bodies)
      expect(new TextEncoder().encode(body).length).toBeLessThanOrEqual(MAX_BATCH_BYTES);
    expect(
      bodies.reduce((total, body) => total + (JSON.parse(body) as AnalyticsEventBatch).events.length, 0),
    ).toBe(50);
  });

  it('action cliquée : type, étape, contenu et emplacement', () => {
    const { sent, send } = capture();
    const tracker = createTracker({ send, privacy: noConsent, viewportWidth: () => 1440 });
    tracker.click(element('<header><a href="/devis?service=chef-prive">Devis</a></header>', 'a'), '/');
    tracker.click(element('<a href="/qui-sommes-nous">Qui</a>', 'a'), '/');
    tracker.flush();
    expect(sent[0]?.batch.events).toHaveLength(1);
    expect(sent[0]?.batch.events[0] as AnalyticsActionEvent).toMatchObject({
      type: 'action',
      action: 'quote',
      step: 'click',
      target: 'chef-prive',
      placement: 'header',
      path: '/',
      device: 'desktop',
    });
  });

  it('un échec d’envoi n’interrompt jamais la page', async () => {
    const tracker = createTracker({
      send: () => Promise.reject(new Error('Réseau indisponible')),
      privacy: noConsent,
    });
    tracker.pageView('/');
    expect(() => tracker.flush()).not.toThrow();
    const throwing = createTracker({
      send: () => {
        throw new Error('Balise refusée');
      },
      privacy: noConsent,
    });
    throwing.pageView('/');
    expect(() => throwing.flush()).not.toThrow();
    await Promise.resolve();
  });

  it('appareil selon la largeur ; référent du site lui-même ignoré', () => {
    expect([deviceFor(390), deviceFor(768), deviceFor(1279), deviceFor(1280)]).toEqual([
      'mobile',
      'tablet',
      'tablet',
      'desktop',
    ]);
    expect(referrerHost('http://localhost:3000/devis', 'localhost')).toBeNull();
    expect(referrerHost('', 'localhost')).toBeNull();
  });
});

describe('consentement et identifiant de visiteur', () => {
  it('sans choix ou après refus : consent false, aucun identifiant ni stockage', () => {
    expect(privacyContext()).toEqual({ consent: false });
    saveConsent(false);
    expect(privacyContext()).toEqual({ consent: false });
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBeNull();
  });

  it('avec consentement : identifiant UUID v4 conservé d’un lot à l’autre', () => {
    saveConsent(true);
    const first = privacyContext();
    const second = privacyContext();
    expect(first.consent).toBe(true);
    const id = first.consent ? first.visitorId : undefined;
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second).toEqual(first);
  });

  it('identifiant renouvelé après 6 mois', () => {
    saveConsent(true);
    const start = Date.now();
    const first = privacyContext(start);
    const later = privacyContext(start + VISITOR_MAX_AGE_MS + 1);
    expect(first.consent && later.consent && first.visitorId !== later.visitorId).toBe(true);
  });

  it('consentement retiré : identifiant effacé, lots sans identifiant', () => {
    saveConsent(true);
    privacyContext();
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).not.toBeNull();
    saveConsent(false);
    expect(privacyContext()).toEqual({ consent: false });
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBeNull();
  });

  it('« Do Not Track » respecté même après « Accepter »', () => {
    saveConsent(true);
    setDoNotTrack('1');
    expect(privacyContext()).toEqual({ consent: false });
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBeNull();
  });

  it('le corps envoyé suit le consentement au moment de l’envoi', () => {
    const { sent, send } = capture();
    const tracker = createTracker({ send });
    tracker.pageView('/');
    tracker.flush();
    saveConsent(true);
    tracker.pageView('/devis');
    tracker.flush();
    expect(sent[0]?.batch).not.toHaveProperty('visitorId');
    expect(sent[0]?.batch.consent).toBe(false);
    expect(sent[1]?.batch.consent).toBe(true);
    expect(sent[1]?.batch.visitorId).toBeTruthy();
  });
});

describe('mesure dans la page', () => {
  it('rejoue les pages vues et clics antérieurs, délègue les clics, envoie à la fermeture de la page', () => {
    const { sent, send } = capture();
    document.body.innerHTML =
      '<main><a id="wa" href="https://wa.me/237600000000">WhatsApp</a><a id="tel" href="tel:+237600000000">Appel</a></main>';
    const early = document.getElementById('tel');
    // jsdom ne sait pas naviguer : le lien cliqué ne quitte pas la page.
    const preventNavigation = (event: Event) => event.preventDefault();
    document.addEventListener('click', preventNavigation);
    const { stop } = startTracker({
      send,
      views: [{ pathname: '/', at: Date.now() }],
      clicks: [{ target: early, pathname: '/', at: Date.now() }],
    });
    expect(document.documentElement.dataset.analytics).toBe('ready');
    document
      .getElementById('wa')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    window.dispatchEvent(new Event('pagehide'));
    expect(sent).toHaveLength(1);
    expect(sent[0]?.mode).toBe('unload');
    expect(
      sent[0]?.batch.events.map((event) => (event.type === 'action' ? event.action : event.type)),
    ).toEqual(['page_view', 'call', 'whatsapp']);
    stop();
    document.removeEventListener('click', preventNavigation);
    expect(document.documentElement.dataset.analytics).toBeUndefined();
  });

  it('envoi périodique toutes les 10 s, et quand la page est masquée', () => {
    vi.useFakeTimers();
    const { sent, send } = capture();
    const { tracker, stop } = startTracker({ send });
    tracker.pageView('/');
    vi.advanceTimersByTime(FLUSH_INTERVAL_MS - 1);
    expect(sent).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(sent.map((item) => item.mode)).toEqual(['interval']);

    tracker.pageView('/contact');
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(sent.map((item) => item.mode)).toEqual(['interval', 'unload']);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    stop();
  });

  it('clic molette mesuré, clic droit ignoré', () => {
    const { sent, send } = capture();
    document.body.innerHTML = '<a id="quote" href="/devis">Devis</a>';
    const { stop } = startTracker({ send });
    const link = document.getElementById('quote');
    link?.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    link?.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    stop();
    expect(sent[0]?.batch.events).toHaveLength(1);
  });
});
