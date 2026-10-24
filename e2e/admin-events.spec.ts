import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openAgenda(page: Page, query = '') {
  await page.goto(`/admin/agenda${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Agenda');
}

const table = (page: Page) => page.getByRole('table', { name: 'Événements de l’agenda' });

test.describe('back-office : agenda', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('événements à venir, places et onglets', async ({ page, pageErrors }) => {
    await openAgenda(page);
    await expect(
      table(page).getByRole('row').filter({ hasText: 'Nuit des saveurs camerounaises' }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('tab', { name: /^À venir/ })).toHaveAttribute('aria-selected', 'true');
    await expect(
      table(page).getByRole('row').filter({ hasText: 'Festival des arts de Douala' }),
    ).toContainText('Brouillon');
    await expect(table(page).getByText('6 / 40 places').first()).toBeAttached();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    await page.getByRole('tab', { name: /^Passés/ }).click();
    await expect(page).toHaveURL(/periode=passes/);
    await expect(
      table(page).getByRole('row').filter({ hasText: 'Atelier cuisine : le ndolé' }),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('inscriptions d’un événement', async ({ page }) => {
    await openAgenda(page);
    const row = table(page).getByRole('row').filter({ hasText: 'Nuit des saveurs camerounaises' });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(async () => {
      await row
        .getByRole('button', { name: 'Actions pour Nuit des saveurs camerounaises' })
        .click({ timeout: 3000 });
      await page.getByRole('menuitem', { name: 'Inscriptions (2)' }).click({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    const dialog = page.getByRole('dialog', { name: 'Inscriptions · Nuit des saveurs camerounaises' });
    await expect(dialog.getByRole('listitem')).toHaveCount(2);
    await expect(dialog.getByRole('link').first()).toHaveAttribute('href', /\/admin\/demandes\?id=/);
  });

  test('nouvel événement : validation, création puis publication', async ({ page }) => {
    await openAgenda(page);
    await expect(table(page).getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Nouvel événement' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nouvel événement' });
    await dialog.getByRole('button', { name: 'Ajouter l’événement' }).click();
    await expect(dialog.getByText('Saisissez le titre de l’événement.')).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Titre' }).fill('Brunch musical à Bonanjo');
    await dialog.getByRole('combobox', { name: /^Type/ }).fill('Concert');
    await dialog.getByLabel('Date').fill('2027-02-07');
    await dialog.getByLabel('Début').fill('10:30');
    await dialog.getByRole('spinbutton', { name: /^Nombre de places/ }).fill('40');
    await dialog.getByRole('radio', { name: 'Culture' }).click();
    await dialog.getByRole('button', { name: 'Ajouter l’événement' }).click();
    await expect(page.getByText('Événement ajouté.')).toBeVisible();

    const row = table(page).getByRole('row').filter({ hasText: 'Brunch musical à Bonanjo' });
    await expect(row).toContainText('Brouillon');
    await row.getByRole('button', { name: 'Actions pour Brunch musical à Bonanjo' }).click();
    await page.getByRole('menuitem', { name: 'Publier' }).click();
    await expect(page.getByText('Événement publié dans l’agenda du site.')).toBeVisible();
    await expect(row).toContainText('Publié');
  });
});

// Capture de contrôle (`FIDELITE=1`) : `qa/fidelite/bo-agenda-<largeur>.png` (écran non maquetté).
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openAgenda(page);
  await expect(
    table(page).getByRole('row').filter({ hasText: 'Nuit des saveurs camerounaises' }),
  ).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-agenda-${width}.png`, fullPage: true });
});
