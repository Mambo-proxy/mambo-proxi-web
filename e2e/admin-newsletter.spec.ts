import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openNewsletter(page: Page, query = '') {
  await page.goto(`/admin/newsletter${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Newsletter');
}

const table = (page: Page) => page.getByRole('table', { name: 'Envois de la newsletter' });
const composer = (page: Page) =>
  page.getByRole('region', { name: /^(Nouvel envoi|Brouillon|Envoi programmé)$/ });

test.describe('back-office : newsletter', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('indicateurs, envois et envoi programmé ouvert dans le compositeur', async ({ page, pageErrors }) => {
    await openNewsletter(page);
    await expect(table(page).getByText('Octobre : préparer son installation au Cameroun')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('paragraph').filter({ hasText: /^1\s248$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Envoi programmé' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /^Objet/ })).toHaveValue(
      'Novembre : sorties culturelles et nouveaux services',
    );
    await expect(page.getByRole('radio', { name: /^Tous les inscrits/ })).toBeChecked();
    await expect(page.getByRole('toolbar', { name: /Mise en forme/ }).getByRole('button')).toHaveText([
      'B',
      'I',
      'Lien',
      'Image',
      'Bouton',
    ]);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('nouvel envoi : validation, bouton, test puis programmation', async ({ page }) => {
    await openNewsletter(page);
    // Un seul clic : chaque « Nouvel envoi » ouvre un compositeur vierge.
    await expect(page.getByRole('heading', { name: 'Envoi programmé' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Nouvel envoi' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvel envoi', level: 2 })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: 'Programmer' }).click();
    await expect(page.getByText('Saisissez l’objet de l’e-mail.')).toBeVisible();
    await page.getByRole('textbox', { name: /^Objet/ }).fill('Décembre : les fêtes à Douala');
    await page.getByText('Cameroun', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Contenu de l’e-mail' }).click();
    await page.keyboard.type('Bonjour {prénom}, voici nos idées de sorties pour les fêtes.');
    await page.getByRole('button', { name: 'Bouton', exact: true }).click();
    const buttonDialog = page.getByRole('dialog', { name: 'Bouton' });
    await buttonDialog.getByRole('textbox', { name: 'Texte du bouton' }).fill('Voir les sorties');
    await buttonDialog.getByRole('textbox', { name: 'Adresse' }).fill('/services/culture-evenementiel');
    await buttonDialog.getByRole('button', { name: 'Insérer le bouton' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Contenu de l’e-mail' }).locator('a[data-button]'),
    ).toHaveText('Voir les sorties');
    await expect(page).toHaveURL(/envoi=cmp_/, { timeout: 15_000 });
    await page.getByRole('button', { name: 'Test', exact: true }).click();
    const testDialog = page.getByRole('dialog', { name: 'Envoyer un test' });
    await testDialog.getByRole('button', { name: 'Envoyer le test' }).click();
    await expect(page.getByText(/^E-mail de test envoyé à /)).toBeVisible();
    await page.getByRole('button', { name: 'Programmer' }).click();
    await page
      .getByRole('dialog', { name: 'Programmer l’envoi' })
      .getByRole('button', { name: 'Programmer' })
      .click();
    await expect(page.getByText(/^Envoi programmé le /)).toBeVisible();
    await expect(table(page).getByText('Décembre : les fêtes à Douala')).toBeVisible();
  });

  test('aperçu d’un envoi parti', async ({ page, pageErrors }) => {
    await openNewsletter(page);
    await expect(async () => {
      await table(page)
        .getByRole('button', { name: 'Aperçu de « Septembre : la rentrée avec Mambo »' })
        .click();
      await expect(page.getByRole('dialog', { name: 'Aperçu de l’e-mail' })).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    const frame = page.getByRole('dialog', { name: 'Aperçu de l’e-mail' }).locator('iframe').contentFrame();
    await expect(frame.getByText('Bonjour Aurélie,')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('annuler la programmation', async ({ page }) => {
    await openNewsletter(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Annuler la programmation' }).click({ timeout: 3000 });
      await expect(page.getByText('Programmation annulée : l’envoi repasse en brouillon.')).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    await expect(composer(page).getByRole('heading', { name: 'Brouillon' })).toBeVisible();
  });

  test('export des inscrits', async ({ page }) => {
    await openNewsletter(page);
    await expect(table(page).getByText('Septembre : la rentrée avec Mambo')).toBeVisible({ timeout: 15_000 });
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter les inscrits' }).click();
    expect((await download).suggestedFilename()).toMatch(/^inscrits-newsletter-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-newsletter-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openNewsletter(page);
  await expect(page.getByRole('heading', { name: 'Envoi programmé' })).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-newsletter-${width}.png`, fullPage: true });
});
