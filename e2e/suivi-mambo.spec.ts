import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('Suivi Mambo', () => {
  test('page accessible, sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/suivi-mambo', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Suivi Mambo : votre espace client, bientôt en ligne.',
    );
    await expect(page.getByText('Bientôt disponible')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('« Me prévenir » : adresse invalide puis inscription', async ({ page }) => {
    await page.goto('/suivi-mambo', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Être prévenu de l’ouverture' });
    const email = form.getByRole('textbox', { name: 'Votre adresse e-mail' });
    await expect(async () => {
      await email.fill('pas-une-adresse');
      await form.getByRole('button', { name: 'Me prévenir' }).click();
      await expect(form.getByText('Merci d’indiquer une adresse e-mail valide.')).toBeVisible({
        timeout: 1500,
      });
    }).toPass();
    await email.fill('aurelie@exemple.fr');
    await form.getByRole('button', { name: 'Me prévenir' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Merci' })).toBeVisible({ timeout: 15_000 });
  });
});
