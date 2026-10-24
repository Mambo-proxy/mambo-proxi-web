import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openPartners(page: Page, query = '') {
  await page.goto(`/admin/partenaires${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Partenaires');
}

test.describe('back-office : partenaires', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('logos, catégories et visibilité', async ({ page, pageErrors }) => {
    await openPartners(page);
    await expect(page.getByRole('tab', { name: /^Logos affichés/ })).toContainText('8', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /^Demandes de partenariat/ })).toContainText('3');
    await expect(page.getByRole('button', { name: 'Saveurs de Douala', exact: true })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Afficher DLA Transports sur le site' })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: 'Afficher Immo Bonapriso sur le site' })).toBeChecked();
    await page.getByRole('radio', { name: 'Immobilier' }).click();
    await expect(page.getByRole('button', { name: 'Immo Bonapriso', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Saveurs de Douala', exact: true })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('masquer un logo', async ({ page }) => {
    await openPartners(page);
    const toggle = page.getByRole('switch', { name: 'Afficher Kribi Évasion sur le site' });
    await expect(toggle).toBeChecked({ timeout: 15_000 });
    await toggle.click({ force: true });
    await expect(page.getByText('Kribi Évasion n’est plus affiché sur le site.')).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });

  test('ajouter un partenaire : erreurs puis création', async ({ page }) => {
    await openPartners(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Ajouter un logo' }).click();
      await expect(page.getByRole('dialog', { name: 'Ajouter un partenaire' })).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    const dialog = page.getByRole('dialog', { name: 'Ajouter un partenaire' });
    await dialog.getByRole('textbox', { name: 'Site du partenaire' }).fill('exemple');
    await dialog.getByRole('button', { name: 'Ajouter le partenaire' }).click();
    await expect(dialog.getByText('Saisissez le nom du partenaire.')).toBeVisible();
    await expect(dialog.getByText('Saisissez une adresse commençant par https://.')).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Nom' }).fill('Bonabéri Traiteur');
    await dialog
      .getByRole('combobox', { name: 'Catégorie' })
      .selectOption({ label: 'Prestataires Expérience' });
    await dialog.getByRole('textbox', { name: 'Site du partenaire' }).fill('https://bonaberi-traiteur.cm');
    await dialog.getByRole('button', { name: 'Ajouter le partenaire' }).click();
    await expect(page.getByText('Partenaire ajouté.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bonabéri Traiteur', exact: true })).toBeVisible();
  });

  test('supprimer un partenaire après confirmation', async ({ page }) => {
    await openPartners(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'Atelier Bamoun', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Modifier « Atelier Bamoun »' })).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    await page
      .getByRole('dialog', { name: 'Modifier « Atelier Bamoun »' })
      .getByRole('button', { name: 'Supprimer' })
      .click();
    await page
      .getByRole('dialog', { name: 'Supprimer « Atelier Bamoun » ?' })
      .getByRole('button', { name: 'Supprimer le partenaire' })
      .click();
    await expect(page.getByText('Partenaire supprimé.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Atelier Bamoun', exact: true })).toHaveCount(0);
  });

  test('réordonner au clavier', async ({ page }) => {
    await openPartners(page);
    const handle = page.getByRole('button', { name: 'Déplacer Saveurs de Douala' });
    await expect(handle).toBeVisible({ timeout: 15_000 });
    await handle.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await expect(page.getByRole('switch').first()).toHaveAccessibleName(
      'Afficher Immo Bonapriso sur le site',
    );
  });

  test('demandes de partenariat : ouvertes dans les Demandes', async ({ page, pageErrors }) => {
    await openPartners(page, '?onglet=demandes');
    const list = page.getByRole('list', { name: 'Demandes de partenariat' });
    await expect(list.getByText('Saveurs du Wouri')).toBeVisible({ timeout: 15_000 });
    await expect(list.getByRole('link')).toHaveCount(3);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    await list.getByRole('link', { name: /Saveurs du Wouri/ }).click();
    await expect(page).toHaveURL(/\/admin\/demandes\?type=PARTENARIAT&id=/);
    expect(pageErrors).toEqual([]);
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-partenaires-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openPartners(page);
  await expect(page.getByRole('button', { name: 'Cabinet Ndoumbe', exact: true })).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-partenaires-${width}.png`, fullPage: true });
});
