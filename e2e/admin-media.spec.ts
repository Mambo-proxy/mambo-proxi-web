import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openLibrary(page: Page, query = '') {
  await page.goto(`/admin/mediatheque${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Médiathèque');
}

const grid = (page: Page) => page.getByRole('list', { name: 'Images de la médiathèque' });

// Petit PNG valide (1 × 1 px).
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('back-office : médiathèque', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('grille, recherche et usages', async ({ page, pageErrors }) => {
    await openLibrary(page);
    await expect(grid(page).getByRole('listitem').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/^\d+ images$/)).toBeVisible();
    await page.getByRole('searchbox', { name: 'Rechercher une image' }).fill('cheffe');
    await expect(page).toHaveURL(/q=cheffe/);
    await expect(grid(page).getByRole('listitem')).toHaveCount(1);
    await expect(grid(page)).toContainText('Utilisée · 1');
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('détail : texte alternatif et point focal', async ({ page }) => {
    await openLibrary(page, '?q=marche');
    await expect(async () => {
      await grid(page)
        .getByRole('button', { name: /^Ouvrir « Étal coloré/ })
        .click({ timeout: 3000 });
      await expect(page.getByRole('dialog', { name: 'marche.svg' })).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    const dialog = page.getByRole('dialog', { name: 'marche.svg' });
    await expect(dialog.getByRole('heading', { name: 'Non utilisée' })).toBeVisible();
    const focal = dialog.getByRole('button', { name: /^Point focal : 50\s%/ });
    await focal.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByRole('button', { name: /^Point focal : 45\s%/ })).toBeVisible();
    await dialog.getByRole('textbox', { name: /^Texte alternatif/ }).fill('');
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(dialog.getByText('Décrivez l’image en quelques mots.')).toBeVisible();
    await dialog.getByRole('textbox', { name: /^Texte alternatif/ }).fill('Marché de Douala au petit matin');
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Image enregistrée.')).toBeVisible();
    await expect(grid(page)).toContainText('Marché de Douala au petit matin');
  });

  test('suppression : refusée si utilisée, possible sinon', async ({ page }) => {
    await openLibrary(page, '?q=cheffe');
    await expect(async () => {
      await grid(page)
        .getByRole('button', { name: /^Ouvrir « Une cheffe/ })
        .click({ timeout: 3000 });
      await expect(page.getByRole('dialog', { name: 'chef.svg' })).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    const used = page.getByRole('dialog', { name: 'chef.svg' });
    await expect(used.getByRole('link', { name: 'Service « Chef privé »' })).toBeVisible();
    await expect(used.getByRole('button', { name: 'Supprimer' })).toBeDisabled();
    await used.getByRole('button', { name: 'Annuler' }).click();
    await expect(used).toBeHidden();

    await page.getByRole('searchbox', { name: 'Rechercher une image' }).fill('portrait.svg');
    await grid(page)
      .getByRole('button', { name: /^Ouvrir « Portrait/ })
      .click();
    await page
      .getByRole('dialog', { name: 'portrait.svg' })
      .getByRole('button', { name: 'Supprimer' })
      .click();
    await page
      .getByRole('dialog', { name: 'Supprimer cette image ?' })
      .getByRole('button', { name: 'Supprimer l’image' })
      .click();
    await expect(page.getByText('Image supprimée.')).toBeVisible();
    await expect(page.getByText('Aucune image ne correspond')).toBeVisible();
  });

  test('ajouter une image', async ({ page }) => {
    await openLibrary(page);
    await expect(grid(page).getByRole('listitem').first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Ajouter une image' }).click();
    const dialog = page.getByRole('dialog', { name: 'Ajouter une image' });
    await dialog.getByRole('button', { name: 'Ajouter l’image' }).click();
    await expect(dialog.getByText('Choisissez une image.')).toBeVisible();
    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'agence-akwa.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
    await expect(dialog.getByText(/^agence-akwa\.png · /)).toBeVisible();
    await dialog.getByRole('textbox', { name: /^Texte alternatif/ }).fill('Façade de l’agence à Akwa');
    await dialog.getByRole('button', { name: 'Ajouter l’image' }).click();
    await expect(page.getByText('Image ajoutée à la médiathèque.')).toBeVisible();
    await expect(grid(page).getByRole('listitem').first()).toContainText('Façade de l’agence à Akwa');
  });
});

// Capture de contrôle (`FIDELITE=1`) : `qa/fidelite/bo-mediatheque-<largeur>.png` (écran non maquetté).
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openLibrary(page);
  await expect(grid(page).getByRole('listitem').first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-mediatheque-${width}.png`, fullPage: true });
});
