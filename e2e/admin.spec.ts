import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('back-office : connexion', () => {
  test('page de connexion accessible, sans en-tête du site', async ({ page, pageErrors }) => {
    await page.goto('/admin/connexion', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connexion au back-office');
    await expect(page.getByRole('navigation', { name: /principale/i })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('back-office protégé : retour à la connexion sans session', async ({ page }) => {
    await page.goto('/admin/demandes', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });

  test('mot de passe incorrect : message d’erreur', async ({ page }) => {
    await page.goto('/admin/connexion', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Connexion au back-office' });
    await expect(async () => {
      await form.getByLabel('Adresse e-mail').fill('mireille@mamboproxi.com');
      await form.getByRole('textbox', { name: 'Mot de passe' }).fill('mauvais');
      await form.getByRole('button', { name: 'Se connecter' }).click();
      await expect(form.getByRole('alert')).not.toBeEmpty({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });

  test('connexion avec code puis tableau de bord', async ({ page, pageErrors }) => {
    await login(page);
    await expect(page.getByText('Bonjour Mireille')).toBeVisible();
    await expect(page.getByText('Nouvelles demandes').locator('visible=true').first()).toBeVisible();
    await expect(page.getByText('À faire aujourd’hui').locator('visible=true').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('back-office : demandes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/admin/demandes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes');
  });

  test('liste accessible, onglet de statut conservé dans l’adresse', async ({ page, pageErrors }) => {
    await expect(page.getByRole('tab', { name: /^Toutes/ })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /^Nouvelles/ }).click();
    await expect(page).toHaveURL(/status=NOUVELLE/);
    await expect(page.getByRole('tab', { name: /^Nouvelles/ })).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('détail : statut, note interne, fermeture', async ({ page }) => {
    // Ligne du tableau (lien) en desktop, carte (bouton) en mobile.
    const panel = page.getByRole('region', { name: /^Demande MP-/ });
    await expect(async () => {
      await page
        .getByText(/^Aurélie K\./)
        .locator('visible=true')
        .first()
        .click();
      await expect(panel.getByRole('heading', { name: 'Chef privé' })).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(panel.getByRole('link', { name: /E-mail/ })).toHaveAttribute(
      'href',
      /^mailto:aurelie\.k@email\.com/,
    );

    await panel.getByRole('button', { name: 'En cours' }).click();
    await expect(panel.getByRole('button', { name: 'En cours' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Statut mis à jour : En cours.')).toBeVisible();

    await panel.getByLabel('Notes internes').fill('Rappeler la cliente jeudi.');
    await panel.getByRole('button', { name: 'Enregistrer la note' }).click();
    await expect(panel.getByText('Rappeler la cliente jeudi.')).toBeVisible();

    await panel.getByRole('button', { name: 'Fermer le détail' }).click();
    await expect(panel).toHaveCount(0);
  });

  test('détail ouvert depuis l’adresse (lien partagé)', async ({ page }) => {
    await page.goto('/admin/demandes?id=req_0142', { waitUntil: 'domcontentloaded' });
    const panel = page.getByRole('region', { name: 'Demande MP-2026-0142' });
    await expect(panel.getByRole('heading', { name: 'Chef privé' })).toBeVisible();
  });
});

test.describe('back-office : gabarit', () => {
  test('adresse inconnue : 404 dans la coque du back-office', async ({ page }) => {
    await login(page);
    await page.goto('/admin/adresse-inconnue', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
    await expect(page.getByRole('link', { name: 'Retour au tableau de bord' })).toBeVisible();
    await expectAccessible(page);
  });
});
