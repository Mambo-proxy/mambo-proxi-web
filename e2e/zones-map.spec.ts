import type { Page } from '@playwright/test';
import { approachZonesMap, expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Quartiers géolocalisés des données de démonstration (`GET /v1/zones`) : 5 + 5 + 8 + 1. */
const PLACED_QUARTERS = 19;

/** Carte chargée à la demande : on s'en approche, puis on attend les repères. */
async function openMap(page: Page, name = 'Carte des zones d’intervention à Douala') {
  await approachZonesMap(page);
  const map = page.getByRole('group', { name });
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('[data-quarter]')).toHaveCount(PLACED_QUARTERS, { timeout: 15_000 });
  return map;
}

// Les tuiles OpenStreetMap sont servies vides par `fixtures.ts` : contours et repères ne dépendent pas du réseau.
test.describe('carte des zones (OpenStreetMap)', () => {
  test('repères, contours, agence, attribution et accessibilité', async ({ page, pageErrors }) => {
    await page.goto('/zones-d-intervention', { waitUntil: 'domcontentloaded' });
    const map = await openMap(page);
    await expect(map.locator('[data-agency]')).toHaveCount(1);
    await expect(map.locator('.leaflet-overlay-pane path')).toHaveCount(4);
    // Base de départ : libellé permanent.
    await expect(map.getByText('Cité SIC · base de départ')).toBeVisible();
    const attribution = page.getByRole('link', { name: /contributeurs OpenStreetMap/ });
    await expect(attribution).toBeVisible();
    await expect(attribution).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
    await expect(page.getByRole('button', { name: 'Zoomer', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Recentrer la carte' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('recherche d’un quartier : la carte s’y centre et ouvre son info-bulle', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/zones-d-intervention', { waitUntil: 'domcontentloaded' });
    const map = await openMap(page);
    const search = page.getByRole('combobox', { name: 'Rechercher un quartier' });
    await search.fill('kotto');
    await search.press('Enter');
    await expect(page.getByText('Kotto est en Zone 3 — Élargie.')).toBeVisible();
    const popup = map.locator('.leaflet-popup');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Kotto');
    await expect(popup).toContainText('Zone 3 — Élargie');
    await expect(popup.getByRole('button', { name: 'Fermer l’info-bulle' })).toBeVisible();
    await expectAccessible(page);
    await popup.getByRole('button', { name: 'Fermer l’info-bulle' }).click();
    await expect(popup).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('molette : la page défile, zoom avec Ctrl ; boutons de zoom au clavier', async ({ page }) => {
    await page.goto('/zones-d-intervention', { waitUntil: 'domcontentloaded' });
    const map = await openMap(page);
    const box = (await map.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 120);
    await expect(page.getByText(/Maintenez (Ctrl|⌘) et faites défiler/)).toBeVisible();
    // Bouton « Zoomer » au clavier : le zoom de la carte change.
    const zoomIn = page.getByRole('button', { name: 'Zoomer', exact: true });
    const before = await map.locator('.leaflet-tile-container, .leaflet-proxy').first().getAttribute('style');
    await zoomIn.focus();
    await page.keyboard.press('Enter');
    await expect
      .poll(() => map.locator('.leaflet-tile-container, .leaflet-proxy').first().getAttribute('style'))
      .not.toBe(before);
  });

  test('accueil et contact : carte présente, version anglaise traduite', async ({ page, pageErrors }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openMap(page);
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await openMap(page);
    await page.goto('/en/service-areas', { waitUntil: 'domcontentloaded' });
    await openMap(page, 'Map of our service areas in Douala');
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
    await expect(page.getByRole('link', { name: /OpenStreetMap contributors/ })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});

test.describe('carte des zones sur écran tactile', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('un doigt fait défiler la page : glisser désactivé, zoom à deux doigts', async ({ page }) => {
    await page.goto('/zones-d-intervention', { waitUntil: 'domcontentloaded' });
    const map = await openMap(page);
    await expect(map).toHaveClass(/leaflet-touch-zoom/);
    await expect(map).not.toHaveClass(/leaflet-touch-drag/);
  });
});
