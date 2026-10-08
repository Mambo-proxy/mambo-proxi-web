import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('partenaires', () => {
  test('page complète, accessible et sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/partenaires', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Construisons ensemble des services de confiance.',
    );
    await expect(page.getByRole('heading', { name: 'Trois façons de travailler avec nous' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('filtres des partenaires et adresse mise à jour', async ({ page, viewport }) => {
    await page.goto('/partenaires', { waitUntil: 'domcontentloaded' });
    const filters = page.getByRole('group', { name: 'Filtrer les partenaires' });
    const tiles = page.locator('#partenaires li');
    await expect(tiles).toHaveCount(8);
    await expect(async () => {
      await filters.getByRole('button', { name: 'Immobilier' }).click();
      await expect(tiles).toHaveCount(2, { timeout: 1500 });
    }).toPass();
    await expect(page).toHaveURL(/categorie=IMMOBILIER/);
    await filters.getByRole('button', { name: 'Tous' }).click();
    await expect(tiles).toHaveCount(8);
    // En mobile, seuls les 6 premiers logos sont affichés.
    const shown = (viewport?.width ?? 0) < 768 ? 6 : 8;
    await expect(tiles.filter({ visible: true })).toHaveCount(shown);
  });

  test('« Je candidate » présélectionne le type, puis envoi de la demande', async ({ page }) => {
    await page.goto('/partenaires', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Devenir partenaire' });
    await expect(async () => {
      await page.getByRole('link', { name: 'Je candidate : Immobilier' }).click();
      await expect(form.getByRole('radio', { name: 'Immobilier' })).toBeChecked({ timeout: 1500 });
    }).toPass();

    await form.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await expect(form.getByText('Merci d’indiquer le nom de votre structure.')).toBeVisible();
    await form.getByLabel(/Nom de la structure/).fill('Résidences Bonapriso');
    await form.getByLabel(/^Activité/).fill('Gestion de logements meublés');
    await form.getByLabel(/Nom et prénom/).fill('Paul Ndongo');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('paul@exemple.fr');
    await form.getByLabel(/Téléphone/).fill('+237 6 77 00 00 00');
    await form.getByLabel(/Pays et ville/).selectOption('CM|Douala');
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await expect(page.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });
});
