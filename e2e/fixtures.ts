import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';

/** Tuile PNG transparente de 1 × 1 px. */
const EMPTY_TILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/** Tuiles de la carte des zones (OpenStreetMap) : servies vides, les tests ne dépendent pas du réseau. */
export const MAP_TILES = /^https:\/\/tile\.openstreetmap\.org\//;

/** Erreurs relevées pendant le test : console, exceptions, réponses en erreur. */
export const test = base.extend<{ pageErrors: string[] }>({
  page: async ({ page }, provide) => {
    await page.route(MAP_TILES, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: EMPTY_TILE }),
    );
    await provide(page);
  },
  pageErrors: async ({ page }, provide) => {
    const errors: string[] = [];
    // Les échecs de chargement sont relevés par l'écouteur de réponses (plus précis que le message console).
    page.on(
      'console',
      (message) =>
        message.type() === 'error' &&
        !message.text().startsWith('Failed to load resource') &&
        errors.push(message.text()),
    );
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('response', (response) => {
      if (response.status() < 400) return;
      // Préchargements Next.js de pages pas encore intégrées : ignorés (ils disparaissent avec les pages).
      if (response.request().headers()['next-router-prefetch']) return;
      errors.push(`${response.status()} ${response.url()}`);
    });
    await provide(errors);
  },
});

export { expect };

/** Aucune violation WCAG 2.2 A/AA détectable automatiquement. */
export async function expectAccessible(page: Page) {
  // Contenu dans son état final : sans cela, un élément en plein fondu d'apparition fausse le calcul des contrastes.
  await page.addStyleTag({
    content:
      '*, *::before, *::after { transition: none !important; animation: none !important; } .reveal { opacity: 1 !important; transform: none !important; }',
  });
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    violations.map((violation) => `${violation.id} : ${violation.help} (${violation.nodes.length})`),
  ).toEqual([]);
}

/** Pas de défilement horizontal de la page. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
