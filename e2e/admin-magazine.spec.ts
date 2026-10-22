import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('back-office : magazine', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/admin/magazine', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Magazine');
  });

  test('éditions, onglet Articles conservé dans l’adresse', async ({ page, pageErrors }) => {
    const table = page.getByRole('table', { name: 'Éditions du magazine' });
    await expect(
      table.getByRole('link', { name: 'N° 1 — Ensemble vers un bien-être global', exact: true }),
    ).toBeVisible();
    await expect(table.getByText('Brouillon · 3 articles à traduire')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dernière campagne · Édition n° 1' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    await expect(async () => {
      await page.getByRole('tab', { name: /^Articles/ }).click();
      await expect(page).toHaveURL(/onglet=articles/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await expect(
      page.getByRole('button', { name: 'Kribi, la nature à deux heures de Douala', exact: true }),
    ).toBeVisible();
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('modifier une édition : titre enregistré, article à traduire', async ({ page, pageErrors }) => {
    await page.getByRole('link', { name: 'Modifier N° 1 — Ensemble vers un bien-être global' }).click();
    await expect(page).toHaveURL(/\/admin\/magazine\/mag_n1/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Édition n° 1');
    await expect(page.getByRole('button', { name: 'English · 4 / 6 traduits' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    const title = page.getByRole('textbox', { name: 'Titre', exact: true });
    await title.fill('Ensemble vers un bien-être global et durable');
    await page.getByRole('button', { name: 'Mettre à jour' }).click();
    await expect(page.getByText('Édition enregistrée.')).toBeVisible();

    // Version anglaise : le champ affiche le titre anglais.
    await page.getByRole('button', { name: 'English · 4 / 6 traduits' }).click();
    await expect(page.getByRole('textbox', { name: 'Titre (anglais)', exact: true })).toHaveValue(
      'Together towards overall well-being',
    );

    await page.getByRole('button', { name: 'Voir les contenus à traduire' }).click();
    const dialog = page.getByRole('dialog', { name: 'Modifier l’article' });
    await expect(dialog.getByRole('textbox', { name: 'Titre (anglais)', exact: true })).toHaveValue('');
    await dialog
      .getByRole('textbox', { name: 'Titre (anglais)', exact: true })
      .fill('Kribi, nature two hours from Douala');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(pageErrors).toEqual([]);
  });

  test('nouvelle édition : brouillon créé puis ouvert', async ({ page }) => {
    // Clic répété tant que la page n'est pas hydratée.
    await expect(async () => {
      await page.getByRole('button', { name: 'Nouvelle édition' }).locator('visible=true').first().click();
      await expect(page).toHaveURL(/\/admin\/magazine\/mag_/, { timeout: 10_000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Édition n° 4');
    await expect(page.getByRole('button', { name: 'Publier' })).toBeVisible();
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-magazine-<largeur>.png`, `bo-magazine-edition-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await page.goto('/admin/magazine', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Dernière campagne · Édition n° 1')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-magazine-${width}.png`, fullPage: true });
  await page.goto('/admin/magazine/mag_n1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Un logement sain, une famille en forme')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-magazine-edition-${width}.png`, fullPage: true });
});
