import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('back-office : zones d’intervention', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/admin/zones', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zones d’intervention');
  });

  test('zones, tarifs masqués, aperçu de la carte', async ({ page, pageErrors }) => {
    const table = page.getByRole('table', { name: 'Zones d’intervention' });
    await expect(table.getByRole('button', { name: 'Zone 1 — Proximité', exact: true })).toBeVisible();
    await expect(table.getByText('Cité SIC (base), Ndoghem, Bépanda, Makèpè, Ndokoti')).toBeVisible();
    await expect(table.getByText('Bonabéri et hors zone · sur devis')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aperçu de la carte' })).toBeVisible();
    await expect(page.getByText('Aperçu des zones actives : contours et quartiers placés.')).toBeVisible();
    // Aperçu OpenStreetMap figé (tuiles servies vides par les fixtures) : quartiers placés des zones actives.
    const preview = page.getByRole('img', { name: 'Carte des zones d’intervention' });
    await expect(preview.locator('[data-quarter]')).toHaveCount(19, { timeout: 15_000 });
    await expect(page.getByRole('link', { name: /contributeurs OpenStreetMap/ })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('modifier une zone : délai enregistré', async ({ page }) => {
    await expect(async () => {
      await page.getByRole('button', { name: 'Modifier Zone 2 — Intermédiaire' }).click();
      await expect(page.getByRole('dialog', { name: 'Modifier « Zone 2 — Intermédiaire »' })).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    const dialog = page.getByRole('dialog', { name: 'Modifier « Zone 2 — Intermédiaire »' });
    await dialog.getByRole('textbox', { name: 'Délai moyen' }).fill('35–50 min');
    await dialog.getByRole('textbox', { name: 'Ajouter un quartier' }).fill('Bali');
    await dialog.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Retirer Bali' })).toBeVisible();
    // Position de Bali au clavier (le quartier ajouté est prêt à être placé), contour invalide refusé.
    await expect(dialog.getByRole('group', { name: 'Position de Bali' })).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Latitude' }).fill('4.041');
    await dialog.getByRole('textbox', { name: 'Longitude' }).fill('9.689');
    await expect(dialog.getByText(/Bali : 4,041\u00A0N · 9,689\u00A0E/)).toBeVisible();
    const geojson = dialog.getByRole('textbox', { name: 'GeoJSON du contour' });
    await geojson.fill('{"type": "Point", "coordinates": [9.7, 4.05]}');
    await dialog.getByRole('button', { name: 'Appliquer le contour' }).click();
    await expect(dialog.getByText('Aucun polygone trouvé', { exact: false })).toBeVisible();
    await geojson.fill(
      '{"type": "Polygon", "coordinates": [[[9.69, 4.068], [9.688, 4.04], [9.742, 4.03], [9.75, 4.06]]]}',
    );
    await dialog.getByRole('button', { name: 'Appliquer le contour' }).click();
    await expect(dialog.getByText('Contour enregistré : 1 polygone, 4 points.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Zone enregistrée.')).toBeVisible();
    // Colonne « Délai moyen » affichée à partir de 1 024 px.
    if ((page.viewportSize()?.width ?? 0) >= 1024)
      await expect(
        page.getByRole('table', { name: 'Zones d’intervention' }).getByText('35–50 min'),
      ).toBeVisible();
  });

  test('onglet Quartiers : déplacer un quartier', async ({ page, pageErrors }) => {
    await expect(async () => {
      await page.getByRole('tab', { name: /^Quartiers/ }).click();
      await expect(page).toHaveURL(/onglet=quartiers/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await page.getByRole('combobox', { name: 'Zone de Akwa' }).selectOption({ label: 'Zone 3 — Élargie' });
    await expect(page.getByText('Akwa déplacé vers « Zone 3 — Élargie ».')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-zones-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await page.goto('/admin/zones', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Bonabéri et hors zone · sur devis')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-zones-${width}.png`, fullPage: true });
});
