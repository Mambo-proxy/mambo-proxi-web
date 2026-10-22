import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('avis clients', () => {
  test('page complète, accessible et sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/avis-clients', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ce que nos clients disent de nous.');
    await expect(page.getByText('120 avis vérifiés')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('filtre par rubrique, tri et pagination conservent les paramètres', async ({ page }) => {
    await page.goto('/avis-clients', { waitUntil: 'domcontentloaded' });
    await expect(async () => {
      await page
        .getByRole('navigation', { name: 'Filtrer par rubrique' })
        .getByRole('link', { name: 'Immobilier' })
        .click();
      await expect(page).toHaveURL(/categorie=immobilier/, { timeout: 3000 });
    }).toPass();
    await expect(
      page
        .getByRole('navigation', { name: 'Filtrer par rubrique' })
        .getByRole('link', { name: 'Immobilier' }),
    ).toHaveAttribute('aria-current', 'page');

    // Une nouvelle sélection relance la navigation et annule la précédente : chaque essai attend jusqu'à 15 s.
    await expect(async () => {
      await page.getByRole('combobox', { name: 'Trier les avis' }).selectOption('rating');
      await expect(page).toHaveURL(/tri=notes/, { timeout: 15_000 });
    }).toPass({ timeout: 45_000 });
    await expect(page).toHaveURL(/categorie=immobilier/);

    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await pagination.getByRole('link', { name: 'Page 2' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/categorie=immobilier/);
    await expect(pagination.locator('[aria-current="page"]')).toContainText('2');
  });

  test('version anglaise : note, filtres, tri et badges traduits', async ({ page }) => {
    await page.goto('/en/reviews', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('What our clients say about us.');
    await expect(page.getByRole('navigation', { name: "Fil d'Ariane" })).toContainText('Home');
    await expect(page.getByText('120 verified reviews')).toBeVisible();
    await expect(page.locator('main section').first()).toContainText('4.9 out of 5');
    const filters = page.getByRole('navigation', { name: 'Filter by category' });
    await expect(filters.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('combobox', { name: 'Sort reviews' })).toHaveValue('recent');
    // Liste mobile et grille desktop : seul l'un des deux exemplaires est affiché.
    await expect(page.getByText('Temporary housing').filter({ visible: true }).first()).toBeVisible();
    await expect(
      page.getByText('Verified after the service').filter({ visible: true }).first(),
    ).toBeVisible();
  });
});
