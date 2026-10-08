import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const PAGES = [
  { path: '/mentions-legales', title: 'Mentions légales' },
  { path: '/confidentialite', title: 'Politique de confidentialité' },
  { path: '/cookies', title: 'Gestion des cookies' },
  { path: '/cgu', title: 'Conditions générales d’utilisation' },
];

test.describe('pages légales', () => {
  for (const legal of PAGES) {
    test(`${legal.path} : titre, sommaire, accessibilité`, async ({ page, pageErrors }) => {
      await page.goto(legal.path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(legal.title);
      await expect(page.getByText('Dernière mise à jour : octobre 2026')).toBeVisible();
      const nav = page.getByRole('navigation', { name: 'Pages légales' });
      await expect(nav.getByRole('link')).toHaveCount(4);
      await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', legal.path);
      await expect(page.getByRole('heading', { level: 2, name: /^1\. / })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('gestion des cookies : « Modifier mes choix » rouvre les préférences', async ({ page }) => {
    await page.goto('/cookies', { waitUntil: 'domcontentloaded' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Modifier mes choix de cookies' }).click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1500 });
    }).toPass();
  });
});
