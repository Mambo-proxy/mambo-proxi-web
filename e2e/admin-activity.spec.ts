import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openActivity(page: Page, query = '') {
  await page.goto(`/admin/journal${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Journal d’activité');
}

test.describe('back-office : journal d’activité', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('actions par jour, filtres dans l’adresse', async ({ page, pageErrors }) => {
    await openActivity(page);
    await expect(page.getByRole('region', { name: 'Aujourd’hui' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/^Affichage de 1 à 25 sur \d+ actions$/)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    await expect(async () => {
      await page.getByRole('combobox', { name: 'Utilisateur' }).selectOption({ label: 'Équipe Douala' });
      await expect(page).toHaveURL(/actor=usr_equipe/, { timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await page.getByRole('combobox', { name: 'Type de contenu' }).selectOption('Demande');
    await expect(page).toHaveURL(/entity=Demande/);
    const rows = page.getByRole('listitem').filter({ hasText: /^\d{2}:\d{2}/ });
    await expect(rows.first()).toContainText('Équipe Douala');
    await expect(page.getByText('Mireille Bell ·')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('détail d’une modification', async ({ page }) => {
    await openActivity(page, '?entity=Demande&periode=tout');
    const details = page.getByRole('button', { name: 'Détails' }).first();
    await expect(details).toBeVisible({ timeout: 15_000 });
    await details.click();
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/ → /).first()).toBeVisible();
    await expect(page.getByText('Adresse IP :').first()).toBeVisible();
  });

  test('aucune activité pour une période vide', async ({ page }) => {
    await openActivity(page, '?entity=Magazine&periode=7j&actor=usr_equipe');
    await expect(page.getByText('Aucune activité')).toBeVisible({ timeout: 15_000 });
  });
});

// Capture de contrôle (`FIDELITE=1`) : `qa/fidelite/bo-journal-<largeur>.png` (écran non maquetté).
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openActivity(page);
  await expect(page.getByRole('region', { name: 'Aujourd’hui' })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-journal-${width}.png`, fullPage: true });
});
