import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('devis gratuit', () => {
  test('service pré-sélectionné : étape 2 active, accessible, sans débordement', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/devis?service=chef-prive', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votre devis gratuit en 3 minutes.');
    await expect(page.getByRole('radio', { name: 'Chef privé' })).toBeChecked();
    await expect(page.getByRole('listitem').filter({ hasText: 'Votre besoin (en cours)' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(page.getByLabel('Nombre de personnes')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('parcours complet : rubrique, besoin, coordonnées, confirmation', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Demande de devis gratuit' });
    await expect(async () => {
      await form.locator('label', { hasText: 'Immobilier' }).click();
      await expect(page.getByRole('radio', { name: 'Gestion locative' })).toBeAttached({ timeout: 1500 });
    }).toPass();
    await form.locator('label', { hasText: 'Gestion locative' }).click();
    await expect(form.getByLabel('Type de bien')).toBeVisible();

    await form.getByRole('button', { name: 'Continuer' }).click();
    await expect(page.getByText('Merci de décrire votre besoin')).toBeVisible();
    await form.getByLabel('Type de bien').selectOption('Appartement');
    await page
      .getByLabel(/Décrivez votre besoin/)
      .fill('Je souhaite confier mon appartement de Bonapriso à une équipe sur place.');
    await form.getByRole('button', { name: 'Continuer' }).click();
    await expect(page.getByRole('heading', { name: /Vos coordonnées/ })).toBeFocused();

    await form.getByRole('button', { name: 'Envoyer ma demande de devis' }).click();
    await expect(page.getByText('Merci d’indiquer votre nom et votre prénom.')).toBeVisible();
    await form.getByLabel(/Nom et prénom/).fill('Sandrine Mbappe');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('sandrine@exemple.fr');
    await form.getByLabel(/Téléphone \/ WhatsApp/).fill('+33 6 12 34 56 78');
    await form.getByLabel(/Pays de résidence/).selectOption('FR');
    await form.locator('label', { hasText: /^Téléphone$/ }).click();
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer ma demande de devis' }).click();

    await expect(page).toHaveURL(/\/devis\/confirmation\?ref=MP-\d{4}-\d{4}/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Merci, votre demande est bien envoyée/);
    await expect(page.getByText(/^MP-\d{4}-\d{4}$/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Suivre sur WhatsApp' })).toHaveAttribute('href', /MP-\d{4}/);
  });

  test('le brouillon est conservé au rechargement', async ({ page }) => {
    await page.goto('/devis?service=photographe', { waitUntil: 'domcontentloaded' });
    const description = page.getByLabel(/Décrivez votre besoin/);
    await expect(async () => {
      await description.fill('Séance photo de famille pendant nos vacances à Kribi.');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(description).toHaveValue('Séance photo de famille pendant nos vacances à Kribi.', {
        timeout: 2000,
      });
    }).toPass();
  });

  test('confirmation sans référence : retour au formulaire', async ({ page }) => {
    await page.goto('/devis/confirmation');
    await expect(page).toHaveURL(/\/devis$/);
  });

  test('confirmation : accessible, sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/devis/confirmation?ref=MP-2026-0142', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('MP-2026-0142')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});
