import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('inscription', () => {
  for (const path of ['/inscription', '/inscription?profil=professionnel']) {
    test(`${path} : accessible, sans débordement`, async ({ page, pageErrors }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Créer mon compte Mambo');
      await expect(page.getByRole('checkbox', { name: /lettre Mambo/ })).not.toBeChecked();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('particulier : validation puis inscription', async ({ page }) => {
    await page.goto('/inscription', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Inscription', exact: true });
    await expect(async () => {
      await form.getByRole('button', { name: 'Créer mon compte' }).click();
      await expect(form.getByText('Merci d’indiquer votre prénom.')).toBeVisible({ timeout: 1500 });
    }).toPass();
    await form.getByLabel(/Prénom/).fill('Aurélie');
    await form.getByLabel(/^Nom/).fill('Kamga');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('aurelie@exemple.fr');
    await form.getByLabel(/Téléphone/).fill('06 12 34 56 78');
    await form.getByLabel(/Pays de résidence/).selectOption('FR');
    await form.locator('label', { hasText: 'Immobilier' }).click();
    await expect(form.getByRole('checkbox', { name: 'Immobilier' })).toBeChecked();
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Créer mon compte' }).click();
    await expect(page.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });

  test('profil professionnel : champs de la structure et adresse mise à jour', async ({ page }) => {
    await page.goto('/inscription', { waitUntil: 'domcontentloaded' });
    await expect(async () => {
      await page.getByRole('radio', { name: /professionnel/i }).click();
      await expect(page.getByLabel(/Nom de la structure/)).toBeVisible({ timeout: 1500 });
    }).toPass();
    await expect(page).toHaveURL(/profil=professionnel/);
    await expect(page.getByRole('button', { name: 'Envoyer ma demande d’inscription' })).toBeVisible();
    await page.getByRole('button', { name: 'Envoyer ma demande d’inscription' }).click();
    await expect(page.getByText('Merci d’indiquer le nom de votre structure.')).toBeVisible();
  });
});
