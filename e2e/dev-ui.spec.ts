import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('page des composants /dev/ui', () => {
  test('s’affiche sans erreur, sans débordement et sans violation d’accessibilité', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/dev/ui', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      "C'est une expérience pensée pour vous.",
    );
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('la modale se ferme avec Échap et rend le focus', async ({ page }) => {
    await page.goto('/dev/ui', { waitUntil: 'domcontentloaded' });
    const opener = page.getByRole('button', { name: 'Ouvrir la modale' });
    const dialog = page.getByRole('dialog', { name: 'Personnaliser les cookies' });
    // Le clic peut précéder l'hydratation de React : on le répète jusqu'à l'ouverture.
    await expect(async () => {
      await opener.click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('le calendrier se parcourt au clavier', async ({ page }) => {
    await page.goto('/dev/ui', { waitUntil: 'domcontentloaded' });
    const grid = page.getByRole('grid');
    const focusable = grid.locator('button[tabindex="0"]');
    const before = await focusable.getAttribute('data-day');
    // Les gestionnaires clavier n'existent qu'après l'hydratation : on réessaie jusqu'au déplacement.
    await expect(async () => {
      await focusable.focus();
      await page.keyboard.press('ArrowDown');
      const after = await page.evaluate(() => document.activeElement?.getAttribute('data-day'));
      expect(after).not.toBe(before);
    }).toPass();
  });
});
