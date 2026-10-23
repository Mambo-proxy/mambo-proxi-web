import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openServices(page: Page, query = '') {
  await page.goto(`/admin/services${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
}

test.describe('back-office : services', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('liste accessible : compteurs, lignes et pagination', async ({ page, pageErrors }) => {
    await openServices(page);
    await expect(page.getByRole('tab', { name: /^Tous/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /^Tous/ })).toContainText('23', { timeout: 15_000 });
    await expect(page.getByRole('link', { name: 'Modifier Chef privé' })).toBeVisible();
    await expect(page.getByText('/services/experience/chef-prive')).toBeVisible();
    await expect(page.getByText('Affichage de 9 sur 23 services · 1 brouillon')).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Afficher Chef privé dans le menu' })).toBeChecked();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('filtre par rubrique conservé dans l’adresse', async ({ page }) => {
    await openServices(page);
    await expect(async () => {
      await page.getByRole('tab', { name: /^Expérience/ }).click();
      await expect(page).toHaveURL(/rubrique=experience/, { timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: 'Modifier Chef privé' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Modifier Entretien du logement' })).toHaveCount(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('tab', { name: /^Expérience/ })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: /^Tous/ }).click();
    await expect(page).not.toHaveURL(/rubrique=/);
  });

  test('interrupteur « Dans le menu » : la préférence est enregistrée', async ({ page }) => {
    await openServices(page);
    const toggle = page.getByRole('switch', { name: 'Afficher Chef privé dans le menu' });
    await expect(toggle).toBeChecked();
    await expect(async () => {
      await toggle.click();
      await expect(page.getByText('« Chef privé » n’apparaît plus dans le menu.')).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 30_000 });
    await expect(toggle).not.toBeChecked();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('switch', { name: 'Afficher Chef privé dans le menu' })).not.toBeChecked();
    await page.getByRole('switch', { name: 'Afficher Chef privé dans le menu' }).click();
    await expect(page.getByRole('switch', { name: 'Afficher Chef privé dans le menu' })).toBeChecked();
  });

  test('éditeur : champs de la maquette, complétude et publication', async ({ page, pageErrors }) => {
    await page.goto('/admin/services/svc_visites_douala', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modifier le service');
    await expect(page.getByLabel('Nom du service')).toHaveValue('Visites guidées de Douala');
    await expect(page.getByLabel('Rubrique')).toHaveValue(/cat_culture_evenementiel/);
    await expect(page.getByLabel('Phrase d’accroche')).toHaveValue(
      'Découvrez Douala avec un guide passionné, loin des circuits classiques.',
    );
    await expect(page.getByText('Page complète à 86 %')).toBeVisible();
    await expect(page.getByText('6 sections sur 7')).toBeVisible();
    await expect(page.getByText('Photo principale en haute définition')).toBeVisible();
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);

    // Sauvegarde automatique après une pause de saisie.
    const tagline = page.getByLabel('Phrase d’accroche');
    await tagline.fill('Découvrez Douala autrement, avec un guide passionné.');
    await expect(page.getByText(/Dernière sauvegarde automatique/)).toBeVisible({ timeout: 10_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Phrase d’accroche')).toHaveValue(
      'Découvrez Douala autrement, avec un guide passionné.',
    );

    await expect(async () => {
      await page.getByRole('button', { name: 'Publier' }).first().click();
      await expect(page.getByText('« Visites guidées de Douala » est en ligne.')).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByText('Publié').first()).toBeVisible();
  });

  test('créer un service : brouillon puis redirection vers son éditeur', async ({ page }) => {
    await page.goto('/admin/services/nouveau', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nouveau service');
    await page.getByLabel('Nom du service').fill('Service de test');
    await page.getByLabel('Rubrique').selectOption({ label: 'Expérience' });
    await page.getByLabel('Phrase d’accroche').fill('Une accroche de test.');
    await expect(async () => {
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await expect(page.getByText('« Service de test » a été enregistré.')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/services\/svc_/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modifier le service');
    await expect(page.getByLabel('Nom du service')).toHaveValue('Service de test');
  });
});
