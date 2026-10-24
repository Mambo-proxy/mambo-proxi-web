import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('back-office : recrutement', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('offres et dernières candidatures, écran accessible', async ({ page, pageErrors }) => {
    await page.goto('/admin/recrutement', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recrutement');
    await expect(page.getByRole('tab', { name: /^Offres/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /^Candidatures/ })).toContainText('14');
    const offers = page.getByRole('region', { name: 'Offres d’emploi' });
    await expect(
      offers
        .getByRole('link', { name: 'Coordinateur·rice de services', exact: true })
        .locator('visible=true'),
    ).toBeVisible();
    await expect(offers.getByText('Non publiée').locator('visible=true')).toBeVisible();
    const latest = page.getByRole('region', { name: 'Dernières candidatures' });
    await expect(latest.getByRole('button', { name: 'Grace Nkoulou', exact: true }).locator('visible=true')).toBeVisible();
    await expect(
      latest.getByRole('button', { name: /^Télécharger le CV de/ }).locator('visible=true'),
    ).toHaveCount(4);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('candidatures filtrées par offre, détail et changement de statut', async ({ page, pageErrors }) => {
    await page.goto('/admin/recrutement', { waitUntil: 'load' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Toutes les candidatures' }).click({ timeout: 3000 });
      await expect(page.getByRole('tab', { name: /^Candidatures/ })).toHaveAttribute('aria-selected', 'true', {
        timeout: 3000,
      });
    }).toPass({ timeout: 30_000 });
    await expect(page).toHaveURL(/onglet=candidatures/);
    await expect(page.getByText('Affichage de 1 à 10 sur 14 candidatures')).toBeVisible();

    await page.getByLabel('Offre', { exact: true }).selectOption({ label: 'Coordinateur·rice de services' });
    await expect(page).toHaveURL(/offre=job_coordinateur/);
    await expect(page.getByText('Affichage de 1 à 6 sur 6 candidatures')).toBeVisible();

    await page.getByRole('button', { name: 'Grace Nkoulou', exact: true }).locator('visible=true').click();
    const dialog = page.getByRole('dialog', { name: 'Grace Nkoulou' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/^Coordinatrice d’événements depuis quatre ans/)).toBeVisible();
    // Ouverte, la candidature passe de « Nouveau » à « Lu ».
    await expect(dialog.getByLabel('Statut de la candidature')).toHaveValue('LU');
    await dialog.getByLabel('Statut de la candidature').selectOption('RETENU');
    await expect(page.getByText('Candidature marquée « Retenu ».')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/candidature=/);
    expect(pageErrors).toEqual([]);
  });

  test('création d’une offre : champs obligatoires, brouillon, publication', async ({ page, pageErrors }) => {
    await page.goto('/admin/recrutement', { waitUntil: 'load' });
    await expect(async () => {
      await page.getByRole('link', { name: 'Nouvelle offre' }).locator('visible=true').first().click();
      await expect(page).toHaveURL(/\/admin\/recrutement\/offres\/nouvelle$/, { timeout: 10_000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nouvelle offre');

    const save = page.getByRole('button', { name: 'Enregistrer', exact: true }).locator('visible=true');
    await expect(async () => {
      await save.click();
      await expect(page.getByText('Indiquez l’intitulé du poste.')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByText('Présentez le poste en quelques lignes.')).toBeVisible();
    await expect(page.getByLabel(/^Intitulé du poste/)).toBeFocused();

    await page.getByLabel(/^Intitulé du poste/).fill('Cuisinier·ère à domicile');
    await page.getByLabel(/^Type de contrat/).fill('CDI');
    await page
      .getByLabel(/^Présentation du poste/)
      .fill('Vous préparez les repas de nos clients, chez eux, à Douala.');
    await save.click();
    await expect(page).toHaveURL(/\/admin\/recrutement\/offres\/job_\w+$/);
    await expect(page.getByText('Brouillon enregistré.')).toBeVisible();

    // Publication refusée sans mission, puis acceptée.
    await page.getByRole('button', { name: 'Publier l’offre' }).click();
    await expect(page.getByText('Ajoutez au moins une mission avant de publier l’offre.')).toBeVisible();
    await page.getByRole('button', { name: 'Ajouter une mission' }).click();
    await page.getByRole('textbox', { name: 'Mission 1', exact: true }).fill('Préparer les repas de la semaine');
    await page.getByRole('button', { name: 'Publier l’offre' }).click();
    await expect(page.getByText('« Cuisinier·ère à domicile » est publiée sur le site.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir l’offre' }).locator('visible=true')).toHaveAttribute(
      'href',
      /^\/recrutement\/cuisinier/,
    );
    expect(pageErrors).toEqual([]);
  });

  test('offre inconnue : message et retour', async ({ page }) => {
    await page.goto('/admin/recrutement/offres/job_inconnue', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offre introuvable');
    await expect(page.getByRole('link', { name: 'Retour au recrutement' })).toBeVisible();
  });
});

/** Captures de contrôle de fidélité (`FIDELITE=1`), comparées à `qa/reference/backoffice/bo-recrutement.png`. */
test.describe('back-office : recrutement (fidélité)', () => {
  test.skip(!process.env.FIDELITE, 'Captures à la demande (FIDELITE=1).');

  test('capture pleine page', async ({ page }) => {
    await login(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.goto('/admin/recrutement', { waitUntil: 'load' });
    await expect(
      page.getByRole('region', { name: 'Dernières candidatures' }).getByText('Boris Essomba').first(),
    ).toBeAttached();
    await page.screenshot({ path: `qa/fidelite/bo-recrutement-${width}.png`, fullPage: true });
  });
});
