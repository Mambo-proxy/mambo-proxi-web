import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const JOB = '/recrutement/coordinateur-rice-de-services';

test.describe('recrutement', () => {
  for (const url of ['/recrutement', JOB]) {
    test(`${url} : accessible, sans débordement`, async ({ page, pageErrors }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('offres : compteur, recherche et filtres', async ({ page }) => {
    await page.goto('/recrutement', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: '4 postes ouverts' })).toBeVisible();
    const offers = page.locator('#offres li');
    await expect(offers).toHaveCount(4);
    await expect(async () => {
      await page
        .getByRole('group', { name: 'Filtrer les offres' })
        .getByRole('button', { name: 'Douala' })
        .click();
      await expect(offers).toHaveCount(2, { timeout: 1500 });
    }).toPass();
    await page
      .getByRole('group', { name: 'Filtrer les offres' })
      .getByRole('button', { name: 'Tous' })
      .click();
    await page.getByRole('searchbox', { name: 'Rechercher un poste' }).fill('chauffeur');
    await expect(offers).toHaveCount(1);
    await offers.getByRole('link', { name: /Voir l’offre/ }).click();
    await expect(page).toHaveURL(/\/recrutement\/chauffeur-euse-partenaire$/);
  });

  test('détail : « Postuler à cette offre » présélectionne le poste, puis candidature avec CV', async ({
    page,
  }) => {
    await page.goto(JOB, { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Postuler à cette offre' }).click();
    await expect(page).toHaveURL(/poste=coordinateur-rice-de-services/);
    const form = page.getByRole('form', { name: 'Candidature', exact: true });
    await expect(form.getByLabel(/Poste visé/)).toHaveValue('coordinateur-rice-de-services');

    await expect(async () => {
      await form.getByRole('button', { name: 'Envoyer ma candidature' }).click();
      await expect(form.getByText('Merci de joindre votre CV.')).toBeVisible({ timeout: 1500 });
    }).toPass();
    await form.getByLabel(/Nom et prénom/).fill('Brice Ngono');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('brice@exemple.fr');
    await form.getByLabel(/Téléphone/).fill('+237 6 99 11 22 33');
    await form.locator('input[type="file"]').setInputFiles({
      name: 'cv-brice-ngono.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 CV de test'),
    });
    await expect(form.getByText('cv-brice-ngono.pdf')).toBeVisible();
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer ma candidature' }).click();
    await expect(page.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });
});
