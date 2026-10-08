import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('formation', () => {
  test('page complète, accessible et sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/formation', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Transmettre les savoir-faire qui font la qualité.',
    );
    await expect(page.locator('#catalogue li')).toHaveCount(6);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('filtres du catalogue et lien « Voir les formations »', async ({ page }) => {
    await page.goto('/formation', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#catalogue li');
    await expect(async () => {
      await page
        .getByRole('group', { name: 'Filtrer les formations' })
        .getByRole('button', { name: 'Ateliers' })
        .click();
      await expect(cards).toHaveCount(1, { timeout: 1500 });
    }).toPass();
    await expect(page).toHaveURL(/categorie=ATELIERS/);
    await page.getByRole('link', { name: 'Voir les formations : Formation des professionnels' }).click();
    await expect(cards).toHaveCount(4);
    await expect(page).toHaveURL(/categorie=PROFESSIONNELS/);
  });

  test('« Demander cette formation » présélectionne la formation, puis envoi', async ({ page }) => {
    await page.goto('/formation', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Demande de formation' });
    await expect(async () => {
      await page
        .getByRole('link', { name: 'Demander cette formation : Hygiène et sécurité en cuisine' })
        .click();
      await expect(form.getByLabel(/Formation souhaitée/)).toHaveValue('hygiene-securite-cuisine', {
        timeout: 1500,
      });
    }).toPass();

    await form.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await expect(form.getByText('Merci d’indiquer votre structure.')).toBeVisible();
    await form.getByLabel(/^Structure/).fill('Restaurant Le Wouri');
    await form.getByLabel(/Nombre de participants/).fill('8');
    await form.getByLabel(/Nom et prénom/).fill('Clarisse Ebodé');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('clarisse@exemple.fr');
    await form.getByLabel(/Téléphone/).fill('+237 6 55 00 00 00');
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await expect(page.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });
});
