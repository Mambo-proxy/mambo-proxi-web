import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openTrainings(page: Page, query = '') {
  await page.goto(`/admin/formations${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Formations');
}

const catalogue = (page: Page) => page.getByRole('table', { name: 'Catalogue des formations' });

test.describe('back-office : formations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('catalogue et demandes récentes', async ({ page, pageErrors }) => {
    await openTrainings(page);
    await expect(page.getByRole('tab', { name: /^Catalogue/ })).toContainText('6', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /^Demandes de formation/ })).toContainText('4');
    await expect(
      catalogue(page).getByRole('button', { name: 'Accueil et relation client', exact: true }),
    ).toBeVisible();
    await expect(catalogue(page).getByText('Ateliers & sensibilisation').first()).toBeVisible();
    const recent = page.getByRole('table', { name: 'Demandes de formation récentes' });
    await expect(recent.getByRole('link')).toHaveCount(3);
    await expect(recent.getByRole('link').first()).toHaveText('Hôtel La Falaise');
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('dépublier une formation', async ({ page }) => {
    await openTrainings(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Actions pour Gestion locative : les fondamentaux' }).click();
      await page.getByRole('menuitem', { name: 'Dépublier' }).click({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByText('Formation dépubliée : elle n’apparaît plus sur le site.')).toBeVisible();
  });

  test('nouvelle formation : erreurs puis création', async ({ page }) => {
    await openTrainings(page);
    const dialog = page.getByRole('dialog', { name: 'Nouvelle formation' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Nouvelle formation' }).click();
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await dialog.getByRole('button', { name: 'Ajouter la formation' }).click();
    await expect(dialog.getByText('Saisissez le titre de la formation.')).toBeVisible();
    await expect(dialog.getByText('Saisissez la durée (ex. « 1 jour »).')).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Titre' }).fill('Premiers secours à domicile');
    await dialog.getByRole('combobox', { name: 'Catégorie' }).selectOption({ label: 'Sensibilisation' });
    await expect(dialog.getByRole('textbox', { name: 'Public' })).toHaveValue('Familles et associations');
    await dialog.getByRole('textbox', { name: 'Durée' }).fill('3 heures');
    await dialog.getByRole('radio', { name: 'ShieldCheck' }).click();
    await expect(dialog.getByRole('radio', { name: 'ShieldCheck' })).toBeChecked();
    await dialog.getByText('Publiée sur le site').click();
    await dialog.getByRole('button', { name: 'Ajouter la formation' }).click();
    await expect(page.getByText('Formation ajoutée.')).toBeVisible();
    await expect(
      catalogue(page).getByRole('button', { name: 'Premiers secours à domicile', exact: true }),
    ).toBeVisible();
  });

  test('supprimer une formation après confirmation', async ({ page }) => {
    await openTrainings(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Actions pour Hygiène et sécurité en cuisine' }).click();
      await page.getByRole('menuitem', { name: 'Supprimer' }).click({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await page
      .getByRole('dialog', { name: 'Supprimer « Hygiène et sécurité en cuisine » ?' })
      .getByRole('button', { name: 'Supprimer la formation' })
      .click();
    await expect(page.getByText('Formation supprimée.')).toBeVisible();
    await expect(
      catalogue(page).getByRole('button', { name: 'Hygiène et sécurité en cuisine', exact: true }),
    ).toHaveCount(0);
  });

  test('onglet Demandes : « Tout voir » puis détail dans les Demandes', async ({ page, pageErrors }) => {
    await openTrainings(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Tout voir' }).click();
      await expect(page).toHaveURL(/onglet=demandes/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    const list = page.getByRole('table', { name: 'Demandes de formation' });
    await expect(list.getByRole('link')).toHaveCount(4);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    await list.getByRole('link', { name: 'Résidences Bastos' }).click();
    await expect(page).toHaveURL(/\/admin\/demandes\?type=FORMATION&id=/);
    expect(pageErrors).toEqual([]);
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-formations-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openTrainings(page);
  await expect(page.getByRole('link', { name: 'Résidences Bastos' })).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-formations-${width}.png`, fullPage: true });
});
