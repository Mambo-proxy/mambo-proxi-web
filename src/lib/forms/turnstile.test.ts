// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTurnstileWidget, type TurnstileApi, type TurnstileRenderOptions } from './turnstile';

/** Faux `window.turnstile` : garde les options du dernier rendu pour déclencher les rappels à la main. */
function fakeTurnstile() {
  let options: TurnstileRenderOptions | null = null;
  const api: TurnstileApi = {
    render: vi.fn((_container: HTMLElement, next: TurnstileRenderOptions) => {
      options = next;
      return 'widget-1';
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  return {
    api,
    load: vi.fn(() => Promise.resolve(api)),
    get options() {
      if (!options) throw new Error('Widget non rendu.');
      return options;
    },
  };
}

/** Laisse se résoudre les promesses en attente (chargement simulé du script). */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('widget Turnstile', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sans clé publique, ne charge rien et donne un jeton vide', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: '', load: turnstile.load });
    widget.attach(document.createElement('div'));
    widget.prepare();
    await expect(widget.token()).resolves.toBe('');
    expect(turnstile.load).not.toHaveBeenCalled();
  });

  it('charge le script au premier focus et rend un widget invisible', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    const container = document.createElement('div');
    widget.attach(container);
    expect(turnstile.load).not.toHaveBeenCalled();
    widget.prepare();
    widget.prepare();
    await flush();
    expect(turnstile.load).toHaveBeenCalledTimes(1);
    expect(turnstile.api.render).toHaveBeenCalledTimes(1);
    expect(turnstile.options).toMatchObject({
      sitekey: 'cle-publique',
      appearance: 'interaction-only',
      'response-field': false,
    });
  });

  it('remet le jeton déjà prêt puis relance une vérification', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    widget.attach(document.createElement('div'));
    widget.prepare();
    await flush();
    turnstile.options.callback('jeton-1');
    await expect(widget.token()).resolves.toBe('jeton-1');
    await flush();
    expect(turnstile.api.reset).toHaveBeenCalledWith('widget-1');
  });

  it('au premier envoi sans focus préalable, attend le jeton', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    widget.attach(document.createElement('div'));
    const token = widget.token();
    await flush();
    turnstile.options.callback('jeton-2');
    await expect(token).resolves.toBe('jeton-2');
  });

  it('donne un jeton vide si le script ne se charge pas', async () => {
    const widget = createTurnstileWidget({
      siteKey: 'cle-publique',
      load: () => Promise.reject(new Error('bloqué')),
    });
    widget.attach(document.createElement('div'));
    await expect(widget.token()).resolves.toBe('');
  });

  it('donne un jeton vide en cas d’erreur du défi', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    widget.attach(document.createElement('div'));
    const token = widget.token();
    await flush();
    expect(turnstile.options['error-callback']('300030')).toBe(true);
    await expect(token).resolves.toBe('');
  });

  it('donne un jeton vide passé le délai d’attente', async () => {
    vi.useFakeTimers();
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load, timeoutMs: 1000 });
    widget.attach(document.createElement('div'));
    const token = widget.token();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(token).resolves.toBe('');
  });

  it('affiche le conteneur le temps d’un défi interactif', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    const container = document.createElement('div');
    widget.attach(container);
    widget.prepare();
    await flush();
    turnstile.options['before-interactive-callback']();
    expect(container.dataset.turnstile).toBe('visible');
    turnstile.options['after-interactive-callback']();
    expect(container.dataset.turnstile).toBeUndefined();
  });

  it('retire le widget au démontage du formulaire', async () => {
    const turnstile = fakeTurnstile();
    const widget = createTurnstileWidget({ siteKey: 'cle-publique', load: turnstile.load });
    widget.attach(document.createElement('div'));
    widget.prepare();
    await flush();
    widget.detach();
    expect(turnstile.api.remove).toHaveBeenCalledWith('widget-1');
    await expect(widget.token()).resolves.toBe('');
  });
});
