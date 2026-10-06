import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const isDesktop = (width: number | undefined) => (width ?? 0) >= 1280;

test.describe('gabarit des pages publiques', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('accueil sans erreur, sans débordement ni violation d’accessibilité', async ({ page, pageErrors }) => {
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('méga-menu au clavier (desktop)', async ({ page, viewport }) => {
    test.skip(!isDesktop(viewport?.width), 'Navigation desktop uniquement');
    const tab = page.getByRole('link', { name: 'Nos services' }).first();
    const firstService = page.getByRole('link', { name: 'Location de voiture' }).first();
    await expect(async () => {
      await tab.focus();
      await page.keyboard.press('ArrowDown');
      await expect(firstService).toBeFocused({ timeout: 1000 });
    }).toPass();
    await expect(tab).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('link', { name: 'Photographe' }).first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu mobile : ouverture, accordéon, fermeture par Échap', async ({ page, viewport }) => {
    test.skip(isDesktop(viewport?.width), 'En-tête mobile et tablette uniquement');
    const opener = page.getByRole('button', { name: 'Ouvrir le menu' });
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(async () => {
      await opener.click();
      await expect(menu).toBeVisible({ timeout: 1000 });
    }).toPass();
    await menu.getByRole('button', { name: 'Nos services' }).click();
    await expect(menu.getByRole('link', { name: 'Immobilier 7 services' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('bandeau cookies : choix mémorisé, aucune mesure sans accord', async ({ page }) => {
    const gtag: string[] = [];
    page.on('request', (request) => request.url().includes('googletagmanager') && gtag.push(request.url()));
    const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée' });
    // Le bandeau s'affiche une fois la page interactive (le choix est lu dans le navigateur).
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(async () => {
      await banner.getByRole('button', { name: 'Refuser' }).click();
      await expect(banner).toBeHidden({ timeout: 1000 });
    }).toPass();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(banner).toBeHidden();
    expect(gtag).toEqual([]);
  });

  test('newsletter : adresse invalide puis adresse déjà inscrite', async ({ page }) => {
    const form = page.getByRole('form', { name: 'Inscription à la lettre Mambo' });
    const email = form.getByRole('textbox', { name: 'Votre adresse e-mail' });
    await expect(async () => {
      await email.fill('awa@');
      await form.getByRole('button', { name: "S'abonner" }).click();
      await expect(form.getByText('Merci d’indiquer une adresse e-mail valide.')).toBeVisible({
        timeout: 1000,
      });
    }).toPass();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await email.fill('deja@exemple.fr');
    await form.getByRole('button', { name: "S'abonner" }).click();
    // Premier envoi : le module des mocks est chargé à la demande dans le navigateur.
    await expect(page.getByRole('status')).toContainText('déjà inscrit', { timeout: 15_000 });
  });

  test('bouton WhatsApp flottant après défilement', async ({ page }) => {
    const button = page.getByRole('link', { name: 'Écrire sur WhatsApp (nouvel onglet)' }).last();
    // Apparition après 400 px de défilement (une fois la page interactive) ou au plus tard après 4 s.
    await expect(async () => {
      await page.mouse.wheel(0, 600);
      await expect(button).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 10_000 });
    await expect(button).toHaveAttribute('href', /^https:\/\/wa\.me\/237600000000\?text=/);
  });
});
