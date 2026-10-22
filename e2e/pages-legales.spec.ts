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

  test('version anglaise : contenu, sommaire et bouton traduits', async ({ page, pageErrors }) => {
    await page.goto('/en/legal-notice', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Legal notice');
    await expect(page.getByText('Last updated: October 2026')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Legal pages' });
    await expect(nav.getByRole('link', { name: /Privacy/ })).toHaveAttribute('href', '/en/privacy-policy');
    await page.goto('/en/cookies', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Change my cookie choices' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
