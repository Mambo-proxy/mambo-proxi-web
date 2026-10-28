import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openSettings(page: Page, query = '') {
  await page.goto(`/admin/parametres${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paramètres');
}

const save = (page: Page) => page.getByRole('button', { name: /^Enregistrer/ });

test.describe('back-office : paramètres', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('coordonnées de la maquette, onglets et colonne latérale', async ({ page, pageErrors }) => {
    await openSettings(page);
    await expect(page.getByRole('textbox', { name: 'Téléphone WhatsApp' })).toHaveValue(
      '+237 6 00 00 00 00',
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByRole('tablist', { name: 'Rubriques des paramètres' }).getByRole('tab')).toHaveText(
      ['Coordonnées', 'E-mails automatiques', 'Référencement', 'Utilisateurs', 'Sécurité & sauvegardes'],
    );
    await expect(page.getByRole('textbox', { name: 'Horaires' })).toHaveValue('Lun – Sam · 8h – 20h');
    await expect(page.getByRole('textbox', { name: 'Instagram' })).toHaveValue('instagram.com/mamboproxi');
    await expect(page.getByRole('switch', { name: 'Afficher le bouton WhatsApp' })).toBeChecked();
    await expect(page.getByRole('switch', { name: /^Envoyer « / })).toHaveCount(4);
    // Maquette : 2 utilisateurs ; les mocks ajoutent un compte de démonstration par rôle (5 au total).
    await expect(page.getByText('5 utilisateurs')).toBeVisible();
    await expect(page.getByText(/^Chaque nuit · dernière : /)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('enregistrer : erreurs par champ puis mise à jour', async ({ page }) => {
    await openSettings(page);
    const whatsapp = page.getByRole('textbox', { name: 'Téléphone WhatsApp' });
    await expect(whatsapp).toHaveValue('+237 6 00 00 00 00', { timeout: 15_000 });
    // Même numéro dans les deux cartes.
    await whatsapp.fill('+237 6 99 11 22 33');
    await expect(page.getByRole('textbox', { name: 'Numéro WhatsApp' })).toHaveValue('+237 6 99 11 22 33');
    await page.getByRole('textbox', { name: 'Téléphone Cameroun' }).fill('6 00');
    await page.getByRole('textbox', { name: 'Horaires' }).fill('Lun – Sam · 8h – 19h');
    await save(page).click();
    await expect(page.getByText('Saisissez un numéro au format +237 6 00 00 00 00.')).toBeVisible();
    await page.getByRole('textbox', { name: 'Téléphone Cameroun' }).fill('+237 6 55 44 33 22');
    await save(page).click();
    await expect(page.getByText('Paramètres enregistrés : le site est mis à jour.')).toBeVisible();
    await expect(page.getByText('Saisissez un numéro au format +237 6 00 00 00 00.')).toHaveCount(0);
  });

  test('e-mails automatiques : modèle, variable et aperçu', async ({ page, pageErrors }) => {
    await openSettings(page);
    await expect(async () => {
      await page
        .getByRole('button', { name: 'Modifier le modèle « Accusé de réception »' })
        .click({ timeout: 3000 });
      await expect(page.getByRole('dialog', { name: /^Modèle · Accusé de réception du devis/ })).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 20_000 });
    const dialog = page.getByRole('dialog', { name: /^Modèle · Accusé de réception du devis/ });
    const title = dialog.getByRole('textbox', { name: 'Titre' });
    await title.fill('Bonjour ');
    await dialog.getByRole('button', { name: '{prénom}' }).click();
    await expect(title).toHaveValue('Bonjour {prénom}');
    await dialog.getByRole('button', { name: 'Aperçu' }).click();
    const frame = page.getByRole('dialog', { name: 'Aperçu de l’e-mail' }).locator('iframe').contentFrame();
    await expect(frame.getByRole('heading', { name: 'Bonjour Aurélie' })).toBeVisible();
    await page
      .getByRole('dialog', { name: 'Aperçu de l’e-mail' })
      .getByRole('button', { name: 'Fermer' })
      .click();
    await dialog.getByRole('button', { name: 'Enregistrer le modèle' }).click();
    await expect(page.getByText('Modèle « Accusé de réception du devis » enregistré.')).toBeVisible();

    const survey = page.getByRole('switch', { name: 'Envoyer « Questionnaire de satisfaction »' });
    await survey.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await survey.click({ force: true });
    await expect(survey).not.toBeChecked();
    await expect(page.getByText(/« Questionnaire de satisfaction » désactivé/)).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('onglet e-mails : réglages et e-mails indispensables', async ({ page }) => {
    await openSettings(page, '?onglet=e-mails');
    await expect(page.getByRole('textbox', { name: 'Nom de l’expéditeur' })).toHaveValue('MAMBO Proxi', {
      timeout: 15_000,
    });
    await expect(page.getByRole('switch', { name: 'Envoyer « Code de connexion »' })).toHaveCount(0);
    await expect(page.getByText('Toujours envoyé').first()).toBeAttached();
    await page.getByRole('spinbutton', { name: 'Questionnaire envoyé après' }).fill('48');
    await save(page).click();
    await expect(page.getByText('Paramètres enregistrés : le site est mis à jour.')).toBeVisible();
    await page.getByRole('tab', { name: 'Coordonnées' }).click();
    await expect(page.getByText('48\u00A0h après le passage au statut « Prestation réalisée »')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('inviter un utilisateur depuis la colonne latérale', async ({ page }) => {
    await openSettings(page);
    await expect(page.getByText('5 utilisateurs')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Inviter' }).click();
    const dialog = page.getByRole('dialog', { name: 'Inviter un utilisateur' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/onglet=utilisateurs/);
    await dialog.getByRole('button', { name: 'Envoyer l’invitation' }).click();
    await expect(dialog.getByText('Indiquez le nom.')).toBeVisible();
    await dialog.getByRole('textbox', { name: /^Nom/ }).fill('Paul Eto');
    await dialog.getByRole('textbox', { name: /^Adresse e-mail/ }).fill('paul.eto@mamboproxi.com');
    await dialog.getByRole('button', { name: 'Envoyer l’invitation' }).click();
    await expect(page.getByText('Invitation envoyée à paul.eto@mamboproxi.com.')).toBeVisible();
    const list = page.getByRole('list', { name: 'Utilisateurs du back-office' });
    await expect(list.getByRole('listitem').filter({ hasText: 'Paul Eto' })).toContainText('Invité·e');
  });

  test('référencement, sécurité et sauvegardes', async ({ page }) => {
    await openSettings(page, '?onglet=referencement');
    await expect(page.getByRole('textbox', { name: 'Titre par défaut' })).toHaveValue(/^MAMBO Proxi/, {
      timeout: 15_000,
    });
    await expect(page.getByRole('group', { name: 'Aperçu dans Google' })).toContainText('mamboproxi.com');
    await page.getByRole('tab', { name: 'Sécurité & sauvegardes' }).click();
    await expect(page.getByText('Chaque nuit à 02:00')).toBeVisible({ timeout: 15_000 });
    const maintenance = page.getByRole('switch', { name: 'Mode maintenance' });
    // Au centre de l'écran : en mobile, la navigation basse couvre le bas de la fenêtre.
    await maintenance.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await maintenance.click({ force: true });
    await expect(
      page.getByText('Après « Enregistrer », le site ne sera plus visible par les visiteurs.'),
    ).toBeVisible();
    await save(page).click();
    await expect(page.getByText('Paramètres enregistrés : le site est mis à jour.')).toBeVisible();
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-parametres-<largeur>.png`.
test('capture de fidélité', async ({ page }) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openSettings(page);
  await expect(page.getByRole('textbox', { name: 'Téléphone WhatsApp' })).toHaveValue('+237 6 00 00 00 00');
  await expect(page.getByText(/^Chaque nuit · dernière : /)).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `qa/fidelite/bo-parametres-${width}.png`, fullPage: true });
});
