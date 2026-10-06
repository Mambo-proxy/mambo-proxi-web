import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const RUBRIQUES = [
  { slug: 'experience', title: 'Des moments sur mesure, pensés pour vous.', services: 5 },
  { slug: 'immobilier', title: 'Se loger au Cameroun, en toute sérénité.', services: 7 },
  { slug: 'services-de-proximite', title: 'Votre quotidien simplifié, chez vous.', services: 3 },
  { slug: 'culture-evenementiel', title: 'Vivre le Cameroun, de l’intérieur.', services: 4 },
];

test.describe('pages rubrique', () => {
  for (const rubrique of RUBRIQUES) {
    test(`${rubrique.slug} : contenu, accessibilité, sans débordement`, async ({ page, pageErrors }) => {
      await page.goto(`/services/${rubrique.slug}`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(rubrique.title);
      await expect(page.getByRole('link', { name: /^Voir le service/ })).toHaveCount(rubrique.services);
      await expect(page.getByRole('heading', { name: 'Nos autres rubriques' })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('Immobilier : services regroupés', async ({ page }) => {
    await page.goto('/services/immobilier', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 3, name: 'Vous cherchez un logement' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Vous êtes propriétaire' })).toBeVisible();
  });

  test('rubrique inconnue : 404', async ({ page }) => {
    const response = await page.goto('/services/inconnue');
    expect(response?.status()).toBe(404);
  });
});

test.describe('agenda Culture & événementiel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/culture-evenementiel', { waitUntil: 'domcontentloaded' });
  });

  test('« Voir tout l’agenda » affiche les sorties suivantes', async ({ page }) => {
    const agenda = page.locator('#agenda');
    await expect(agenda.getByRole('article')).toHaveCount(3);
    await expect(async () => {
      await agenda.getByRole('button', { name: 'Voir tout l’agenda' }).click();
      await expect(agenda.getByRole('article')).toHaveCount(5, { timeout: 1500 });
    }).toPass();
  });

  test('inscription à un événement : validation puis confirmation', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /Je participe : Nuit des saveurs camerounaises/ });
    const dialog = page.getByRole('dialog');
    await expect(async () => {
      await trigger.click();
      await expect(dialog).toBeVisible({ timeout: 1500 });
    }).toPass();
    await dialog.getByRole('button', { name: 'Confirmer ma participation' }).click();
    await expect(dialog.getByText('Merci d’indiquer votre nom et votre prénom.')).toBeVisible();
    await expect(dialog.getByText('Merci d’accepter le traitement de vos données')).toBeVisible();

    await dialog.getByLabel(/Nom et prénom/).fill('Awa Mbarga');
    await dialog.getByLabel(/E-mail/).fill('awa@exemple.fr');
    await dialog.getByLabel(/Téléphone/).fill('+237 6 99 00 00 00');
    await dialog.getByLabel(/Nombre de places/).selectOption('2');
    await dialog.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await dialog.getByRole('button', { name: 'Confirmer ma participation' }).click();
    await expect(dialog.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });
});
