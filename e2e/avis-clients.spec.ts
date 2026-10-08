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

    await expect(async () => {
      await page.getByRole('combobox', { name: 'Trier les avis' }).selectOption('rating');
      await expect(page).toHaveURL(/tri=notes/, { timeout: 2000 });
    }).toPass();
    await expect(page).toHaveURL(/categorie=immobilier/);

    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await pagination.getByRole('link', { name: 'Page 2' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/categorie=immobilier/);
    await expect(pagination.locator('[aria-current="page"]')).toContainText('2');
  });
});
