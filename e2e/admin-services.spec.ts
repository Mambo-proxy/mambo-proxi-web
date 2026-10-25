import type { Page } from '@playwright/test';
import { login, moveWithKeyboard } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Ordonnée d'un service dans la liste visible (tableau en desktop, cartes en mobile). */
async function top(page: Page, name: string) {
  const box = await page
    .getByRole('link', { name, exact: true })
    .locator('visible=true')
    .first()
    .boundingBox();
  return box?.y ?? Number.NaN;
}

test.describe('back-office : services', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('liste accessible, filtre par rubrique conservé dans l’adresse', async ({ page, pageErrors }) => {
    await page.goto('/admin/services', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
    await expect(page.getByRole('tab', { name: /^Tous/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /^Tous/ })).toContainText('27');
    await expect(page.getByText('Affichage de 9 sur 27 services · 1 brouillon')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Chef privé', exact: true }).locator('visible=true'),
    ).toBeVisible();

    await expect(async () => {
      await page.getByRole('tab', { name: /^Culture & événementiel/ }).click();
      await expect(page).toHaveURL(/category=culture-evenementiel/, { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    const draft = page
      .getByRole('link', { name: 'Visites guidées de Douala', exact: true })
      .locator('visible=true');
    await expect(draft).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Chef privé', exact: true }).locator('visible=true'),
    ).toHaveCount(0);
    await expect(page.getByText('Affichage de 5 sur 5 services · 1 brouillon')).toBeVisible();

    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('réordonnancement au clavier, ordre conservé au rechargement des données', async ({ page }) => {
    await page.goto('/admin/services?category=experience', { waitUntil: 'load' });
    const handle = page.getByRole('button', { name: 'Déplacer Chef privé' }).locator('visible=true');
    await expect(handle).toBeVisible();
    expect(await top(page, 'Chef privé')).toBeLessThan(await top(page, 'Location de voiture'));

    await moveWithKeyboard(page, handle, { label: 'Chef privé', key: 'ArrowDown', from: 1, to: 2, total: 5 });
    await expect(page.getByText('Ordre d’affichage enregistré.')).toBeVisible();
    expect(await top(page, 'Location de voiture')).toBeLessThan(await top(page, 'Chef privé'));

    // Onglet « Tous » : nouvelle requête aux données simulées, l'ordre envoyé est bien celui enregistré.
    await expect(async () => {
      await page.getByRole('tab', { name: /^Tous/ }).click();
      await expect(page).not.toHaveURL(/category=/, { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(
      page.getByRole('link', { name: 'Photographe', exact: true }).locator('visible=true'),
    ).toBeVisible();
    expect(await top(page, 'Location de voiture')).toBeLessThan(await top(page, 'Chef privé'));
    expect(await top(page, 'Chef privé')).toBeLessThan(await top(page, 'Photographe'));
  });

  test('création d’un service : champs obligatoires, enregistrement puis publication', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/admin/services', { waitUntil: 'load' });
    await expect(async () => {
      await page.getByRole('link', { name: 'Ajouter un service' }).locator('visible=true').first().click();
      await expect(page).toHaveURL(/\/admin\/services\/nouveau$/, { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nouveau service');

    const save = page.getByRole('button', { name: 'Enregistrer', exact: true });
    await expect(async () => {
      await save.click();
      await expect(page.getByText('Indiquez le nom du service.')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByText('Choisissez une rubrique.')).toBeVisible();
    await expect(page.getByText('Écrivez une phrase d’accroche.')).toBeVisible();
    await expect(page.getByLabel(/^Nom du service/)).toBeFocused();

    await page.getByLabel(/^Nom du service/).fill('Cours de cuisine camerounaise');
    await page.getByLabel(/^Rubrique/).selectOption({ label: 'Culture & événementiel' });
    await page
      .getByLabel(/^Phrase d’accroche/)
      .fill('Apprenez les recettes du pays avec une cuisinière de Douala.');
    await expect(
      page.getByText('Une phrase courte, affichée sous le titre. 60 / 120 caractères.'),
    ).toBeVisible();
    await expect(page.getByLabel('Titre pour Google')).toHaveValue(
      'Cours de cuisine camerounaise | MAMBO Proxi',
    );
    await expect(page.getByLabel(/^Adresse de la page/)).toHaveValue('cours-de-cuisine-camerounaise');
    await page.getByLabel('Titre de l’étape 1').fill('Choix du menu');

    await save.click();
    await expect(page).toHaveURL(/\/admin\/services\/svc_\w+$/);
    await expect(
      page.getByText(/^(Brouillon enregistré|Modifications enregistrées)\.$/).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Publier' }).locator('visible=true').first().click();
    await expect(page.getByText('« Cours de cuisine camerounaise » est publié.')).toBeVisible();
    await expect(page.getByRole('complementary').getByText('Publié', { exact: true })).toBeVisible();

    // Retour à la liste (navigation dans l'application : les données simulées sont conservées).
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
    await expect(async () => {
      await page.getByRole('tab', { name: /^Culture & événementiel/ }).click();
      await expect(
        page
          .getByRole('link', { name: 'Cours de cuisine camerounaise', exact: true })
          .locator('visible=true'),
      ).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    expect(pageErrors).toEqual([]);
  });

  test('modification : ajout et suppression d’une étape, sauvegarde automatique', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/admin/services/svc_visites_douala', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Visites guidées de Douala');
    await expect(page.getByLabel('Titre de l’étape 3')).toHaveValue('Visite avec un guide local');

    await expect(async () => {
      await page.getByRole('button', { name: 'Ajouter une étape' }).click();
      await expect(page.getByLabel('Titre de l’étape 4')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await page.getByLabel('Titre de l’étape 4').fill('Photos souvenirs');
    await page.getByRole('button', { name: 'Supprimer étape 1' }).click();
    await expect(page.getByLabel('Titre de l’étape 1')).toHaveValue('Proposition d’itinéraire et devis');
    await expect(page.getByLabel('Titre de l’étape 3')).toHaveValue('Photos souvenirs');
    await expect(page.getByLabel('Titre de l’étape 4')).toHaveCount(0);

    await expect(page.getByText('Dernière sauvegarde automatique à l’instant')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText('Modifications enregistrées.')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('complétude calculée en direct, éditeur accessible', async ({ page, pageErrors }) => {
    await page.goto('/admin/services/svc_visites_douala', { waitUntil: 'load' });
    const card = page.getByRole('region', { name: 'Complétude' });
    await expect(card.getByRole('heading')).toHaveText('Page complète à 86 %');
    await expect(card.getByText('6 sections sur 7')).toBeVisible();
    await expect(card.getByText('Photo principale en haute définition')).toBeVisible();
    await expect(page.getByLabel('Titre pour Google')).toHaveValue('Visites guidées de Douala | MAMBO Proxi');
    await expect(page.getByText('39 / 60 caractères')).toBeVisible();

    await expect(async () => {
      await page.getByRole('button', { name: 'Supprimer question 1' }).click();
      await expect(card.getByRole('heading')).toHaveText('Page complète à 71 %', { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(card.getByText('5 sections sur 7')).toBeVisible();

    await page.getByRole('button', { name: 'Choisir un avis publié' }).click();
    const picker = page.getByRole('dialog', { name: 'Choisir un avis publié' });
    await expect(picker).toBeVisible();
    await picker.getByRole('button', { name: 'Annuler' }).click();
    await expect(picker).toBeHidden();

    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('aperçu de la page dans un nouvel onglet', async ({ page }) => {
    await page.goto('/admin/services/svc_chef_prive', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chef privé');
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Aperçu' }).locator('visible=true').first().click();
    await expect(await popup).toHaveURL(/\/services\/experience\/chef-prive\?preview=/);
  });

  test('rubriques : liste réordonnable et modification', async ({ page, pageErrors }) => {
    await page.goto('/admin/services', { waitUntil: 'load' });
    const dialog = page.getByRole('dialog', { name: 'Rubriques' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Gérer les rubriques' }).click();
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(dialog.getByRole('button', { name: /^Déplacer/ })).toHaveCount(5);
    await expectAccessible(page);

    await dialog.getByRole('button', { name: 'Modifier la rubrique « Immobilier »' }).click();
    const form = page.getByRole('dialog', { name: 'Modifier « Immobilier »' });
    await form.getByLabel(/^Accroche/).fill('Se loger au Cameroun en toute sérénité');
    await form.getByRole('button', { name: 'Enregistrer la rubrique' }).click();
    await expect(page.getByText('Rubrique « Immobilier » enregistrée.')).toBeVisible();
    await expect(dialog).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('service inconnu : 404 dans la coque', async ({ page }) => {
    await page.goto('/admin/services/svc_inconnu', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
    await expect(page.getByRole('link', { name: 'Retour au tableau de bord' })).toBeVisible();
  });

  test('« Nouveau service » du tableau de bord ouvre l’éditeur', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Nouveau service' }).first();
    await expect(link).toHaveAttribute('href', '/admin/services/nouveau');
    if ((page.viewportSize()?.width ?? 0) < 768) return; // Mobile : titre et actions du tableau de bord masqués.
    await expect(async () => {
      await link.click();
      await expect(page).toHaveURL(/\/admin\/services\/nouveau$/, { timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nouveau service');
  });
});

/** Captures de contrôle de fidélité (`FIDELITE=1`), comparées à `qa/reference/backoffice/`. */
test.describe('back-office : services (fidélité)', () => {
  test.skip(!process.env.FIDELITE, 'Captures à la demande (FIDELITE=1).');

  test('captures pleine page', async ({ page }, info) => {
    await login(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.goto('/admin/services', { waitUntil: 'load' });
    await expect(page.getByText('Affichage de 9 sur 27 services · 1 brouillon')).toBeVisible();
    await page.screenshot({ path: `qa/fidelite/bo-services-${width}.png`, fullPage: true });
    await page.goto('/admin/services/svc_visites_douala', { waitUntil: 'load' });
    await expect(page.getByRole('region', { name: 'Complétude' })).toBeVisible();
    await page.screenshot({ path: `qa/fidelite/bo-ajouter-un-service-${width}.png`, fullPage: true });
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('main section[aria-labelledby], aside section')].map((element) => {
        const box = element.getBoundingClientRect();
        return `${element.querySelector('h2')?.textContent ?? ''} ${Math.round(box.width)}×${Math.round(box.height)}`;
      }),
    );
    info.annotations.push({ type: 'mesures', description: sizes.join(' | ') });
    console.log(`[${width}] ${sizes.join(' | ')}`);
  });
});
