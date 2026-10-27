import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openContacts(page: Page, query = '') {
  await page.goto(`/admin/contacts${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contacts & inscrits');
}

const table = (page: Page) => page.getByRole('table', { name: 'Contacts' });

test.describe('back-office : contacts & inscrits', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('indicateurs, onglets et contacts de la maquette', async ({ page, pageErrors }) => {
    await openContacts(page);
    await expect(page.getByRole('tab', { name: /^Tous/ })).toContainText(/1\s486/, { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /^Professionnels/ })).toContainText('174');
    await expect(page.getByText(/58\s%\sà Douala, 39\s%\sdans les environs/)).toBeAttached();
    await expect(table(page).getByRole('button', { name: 'Aurélie Kamga', exact: true })).toBeVisible();
    await expect(page.getByText(/Affichage de 1 à 6 sur 1\s486 contacts/)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('onglet et filtres conservés dans l’adresse', async ({ page }) => {
    await openContacts(page);
    await expect(async () => {
      await page.getByRole('tab', { name: /^Professionnels/ }).click();
      await expect(page).toHaveURL(/profil=PROFESSIONNEL/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await expect(table(page).getByRole('button', { name: 'Saveurs de Douala', exact: true })).toBeVisible();
    await expect(async () => {
      await page.getByRole('combobox', { name: 'Rubrique d’intérêt' }).selectOption('experience');
      await expect(page).toHaveURL(/interest=experience/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await expect(async () => {
      await page.getByRole('combobox', { name: 'Quartier' }).selectOption('Akwa');
      await expect(page).toHaveURL(/district=Akwa/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
  });

  test('fiche contact : demandes, export RGPD, fermeture', async ({ page, pageErrors }) => {
    await openContacts(page);
    await expect(async () => {
      await table(page).getByRole('button', { name: 'Aurélie Kamga', exact: true }).click();
      await expect(page.getByRole('region', { name: 'Fiche de Aurélie Kamga' })).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    const panel = page.getByRole('region', { name: 'Fiche de Aurélie Kamga' });
    await expect(panel.getByRole('heading', { name: /^Demandes \(\d+\)$/ })).toBeVisible();
    await expect(page).toHaveURL(/id=ctc_aurelie_kamga/);
    const download = page.waitForEvent('download');
    await panel.getByRole('button', { name: 'Exporter ses données' }).click();
    expect((await download).suggestedFilename()).toBe('donnees-ctc_aurelie_kamga.json');
    await expectAccessible(page);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('effacer un contact après confirmation', async ({ page }) => {
    await openContacts(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Actions pour Studio Lumière' }).click();
      await page.getByRole('menuitem', { name: 'Effacer le contact' }).click({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await page
      .getByRole('dialog', { name: 'Effacer « Studio Lumière » ?' })
      .getByRole('button', { name: 'Effacer le contact' })
      .click();
    await expect(page.getByText('Contact effacé, ses demandes sont anonymisées.')).toBeVisible();
    await expect(table(page).getByRole('button', { name: 'Studio Lumière', exact: true })).toHaveCount(0);
  });

  test('export CSV des contacts filtrés', async ({ page }) => {
    await openContacts(page, '?profil=PROFESSIONNEL');
    await expect(table(page).getByRole('button', { name: 'Saveurs de Douala', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    // Nom de l'API : date du jour à Douala (UTC+1).
    const douala = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter (CSV)' }).click();
    expect((await download).suggestedFilename()).toBe(`contacts-${douala}.csv`);
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-contacts-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openContacts(page);
  await expect(page.getByText(/Affichage de 1 à 6 sur 1\s486 contacts/)).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-contacts-${width}.png`, fullPage: true });
});
