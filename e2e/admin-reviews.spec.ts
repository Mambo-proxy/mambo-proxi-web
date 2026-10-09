import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

async function openReviews(page: Page, query = '') {
  await page.goto(`/admin/avis${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avis clients');
}

const card = (page: Page, name: RegExp) => page.getByRole('article', { name });

test.describe('back-office : avis clients', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('page accessible : indicateurs, avis à valider, questionnaire', async ({ page, pageErrors }) => {
    await openReviews(page);
    await expect(page.getByRole('tab', { name: /^À valider/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /^À valider/ })).toContainText('4', { timeout: 15_000 });
    await expect(card(page, /^Aurélie K\. · Paris/)).toContainText('Publication acceptée par le client');
    await expect(card(page, /^Marc O\. · Lyon/)).toContainText('Publication non autorisée');
    await expect(card(page, /^Marc O\./).getByRole('button', { name: 'Suivi interne' })).toBeVisible();
    await expect(page.getByText('Note moyenne')).toBeVisible();
    await expect(page.getByText('Recommandation (0 à 10)')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Répartition des notes' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('onglet et filtre de service conservés dans l’adresse', async ({ page }) => {
    await openReviews(page);
    await expect(async () => {
      await page.getByRole('tab', { name: /^Publiés/ }).click();
      await expect(page).toHaveURL(/status=PUBLIE/, { timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /^Publiés/ })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /^À valider/ }).click();
    await expect(page).not.toHaveURL(/status=/);
    await expect(async () => {
      await page.getByRole('combobox', { name: 'Service' }).selectOption('location-voiture');
      await expect(page).toHaveURL(/service=location-voiture/, { timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(card(page, /^Marc O\./)).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('combobox', { name: 'Service' })).toHaveValue('location-voiture');
    await expect(page.getByRole('article')).toHaveCount(1);
  });

  test('publier un avis : le compteur « à valider » diminue', async ({ page }) => {
    await openReviews(page);
    const sidebarLink = page
      .getByRole('navigation', { name: 'Navigation du back-office' })
      .getByRole('link', { name: /Avis clients/ });
    // Barre latérale à partir de 768 px (pas de compteurs dans la navigation mobile).
    const withSidebar = (page.viewportSize()?.width ?? 0) >= 768;
    if (withSidebar) await expect(sidebarLink).toContainText('4');
    const aurelie = card(page, /^Aurélie K\./);
    await expect(async () => {
      await aurelie.getByRole('button', { name: 'Publier' }).click();
      await expect(page.getByText('Avis publié sur le site.')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(aurelie).toHaveCount(0);
    await expect(page.getByRole('tab', { name: /^À valider/ })).toContainText('3');
    if (withSidebar) await expect(sidebarLink).toContainText('3');
    await page.getByRole('tab', { name: /^Publiés/ }).click();
    await expect(card(page, /^Aurélie K\. · Paris$/)).toBeVisible();
  });

  test('masquer (refuser) un avis après confirmation', async ({ page }) => {
    await openReviews(page);
    const herve = card(page, /^Hervé D\./);
    await expect(async () => {
      await herve.getByRole('button', { name: 'Masquer' }).click();
      await expect(page.getByRole('dialog', { name: 'Masquer cet avis ?' })).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    // Annuler : rien ne change.
    await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();
    await expect(herve).toBeVisible();
    await herve.getByRole('button', { name: 'Masquer' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Masquer l’avis' }).click();
    await expect(page.getByText(/Avis masqué/)).toBeVisible();
    await expect(herve).toHaveCount(0);
    await expect(page.getByRole('tab', { name: /^Masqués/ })).toContainText('10');
  });

  test('réponse publique : publier puis retirer', async ({ page }) => {
    await openReviews(page);
    const aurelie = card(page, /^Aurélie K\./);
    const dialog = page.getByRole('dialog', { name: 'Répondre à Aurélie K.' });
    await expect(async () => {
      await aurelie.getByRole('button', { name: 'Répondre' }).click();
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await dialog.getByRole('button', { name: 'Publier la réponse' }).click();
    await expect(dialog.getByText('Écrivez une réponse avant de la publier.')).toBeVisible();
    await dialog.getByLabel('Réponse publique').fill('Merci Aurélie, à très bientôt à Douala !');
    await dialog.getByRole('button', { name: 'Publier la réponse' }).click();
    await expect(page.getByText('Réponse publiée.')).toBeVisible();
    await expect(aurelie.getByText('Merci Aurélie, à très bientôt à Douala !')).toBeVisible();

    await aurelie.getByRole('button', { name: 'Modifier la réponse' }).click();
    await dialog.getByRole('button', { name: 'Retirer la réponse' }).click();
    const confirm = page.getByRole('dialog', { name: 'Retirer la réponse ?' });
    await confirm.getByRole('button', { name: 'Retirer la réponse' }).click();
    await expect(page.getByText('Réponse retirée.')).toBeVisible();
    await expect(aurelie.getByText('Réponse de MAMBO Proxi')).toHaveCount(0);
  });

  test('mettre un avis publié en avant sur l’accueil', async ({ page }) => {
    await openReviews(page, '?status=PUBLIE');
    const clarisse = card(page, /^Clarisse N\./);
    await expect(async () => {
      await clarisse.getByRole('button', { name: 'Mettre en avant' }).click();
      await expect(page.getByText('Avis mis en avant sur l’accueil.')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await expect(clarisse.getByText('Mis en avant sur l’accueil')).toBeVisible();
    await clarisse.getByRole('button', { name: 'Retirer de l’accueil' }).click();
    await expect(page.getByText('Avis retiré de l’accueil.')).toBeVisible();
  });

  test('ajout manuel d’un avis : erreurs puis création', async ({ page }) => {
    await openReviews(page);
    const dialog = page.getByRole('dialog', { name: 'Ajouter un avis' });
    await expect(async () => {
      await page.getByRole('button', { name: 'Ajouter un avis' }).first().click();
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
    await dialog.getByRole('button', { name: 'Ajouter l’avis' }).click();
    await expect(dialog.getByText('Choisissez une note de 1 à 5 étoiles.')).toBeVisible();
    await dialog.getByLabel('Nom affiché').fill('Léa N.');
    await dialog.getByLabel('Ville').fill('Douala');
    await dialog.locator('label').filter({ hasText: '5 étoiles' }).click();
    await expect(dialog.getByRole('radio', { name: '5 étoiles' })).toBeChecked();
    await dialog
      .getByRole('textbox', { name: /^Avis/ })
      .fill('Une équipe attentive du début à la fin, merci !');
    await dialog.getByRole('button', { name: 'Ajouter l’avis' }).click();
    await expect(page.getByText(/^Avis ajouté\s+: il est à valider\.$/)).toBeVisible();
    await expect(card(page, /^Léa N\. · Douala/)).toContainText('Ajouté manuellement');
    await expect(page.getByRole('tab', { name: /^À valider/ })).toContainText('5');
  });
});

test.describe('back-office : questionnaire de satisfaction', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/admin/avis/questionnaire', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Questionnaire de satisfaction');
  });

  const titles = (page: Page) =>
    page
      .getByRole('region', { name: 'Questions' })
      .locator('ol > li button[aria-expanded] > span:first-child');

  test('page accessible, ordre au clavier enregistré et repris sur la page des avis', async ({
    page,
    pageErrors,
  }) => {
    await expect(titles(page)).toHaveText([
      'Note globale (1 à 5 étoiles)',
      'Ponctualité et professionnalisme',
      'Qualité de l’information',
      'Recommandation (0 à 10)',
      'Commentaire libre',
    ]);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    await expect(async () => {
      await page.getByRole('button', { name: 'Déplacer la question 1' }).focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(250);
      await page.keyboard.press('Space');
      await expect(titles(page).first()).toHaveText('Ponctualité et professionnalisme', { timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(titles(page).nth(1)).toHaveText('Note globale (1 à 5 étoiles)');
    await expect(page.getByText('Modifications non enregistrées.')).toBeVisible();
    await page.getByRole('button', { name: 'Enregistrer le questionnaire' }).click();
    await expect(page.getByText('Questionnaire enregistré.')).toBeVisible();

    // Navigation interne : les données simulées du navigateur sont conservées.
    await page.getByRole('link', { name: 'Avis clients' }).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avis clients');
    await expect(
      page.getByRole('region', { name: 'Questionnaire de satisfaction' }).locator('li').first(),
    ).toHaveText(/Ponctualité et professionnalisme/);
    expect(pageErrors).toEqual([]);
  });

  test('ajout d’une question : validation puis enregistrement', async ({ page }) => {
    const label = page.getByRole('textbox', { name: 'Intitulé de la question' });
    await expect(async () => {
      if (!(await label.count())) await page.getByRole('button', { name: 'Ajouter une question' }).click();
      await expect(label).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Enregistrer le questionnaire' }).click();
    await expect(page.getByText('Saisissez l’intitulé de la question.')).toBeVisible();
    await label.fill('Le chauffeur était-il courtois ?');
    await page.getByRole('button', { name: 'Enregistrer le questionnaire' }).click();
    await expect(page.getByText('Questionnaire enregistré.')).toBeVisible();
    await expect(titles(page)).toHaveCount(6);
    await expect(titles(page).last()).toHaveText('Le chauffeur était-il courtois ?');
    // 5 questions déjà posées : la nouvelle est créée inactive.
    await expect(page.getByRole('region', { name: 'Questions' }).locator('ol > li').last()).toContainText(
      'Inactive',
    );
  });

  test('suppression d’une question avec confirmation', async ({ page }) => {
    await expect(async () => {
      await page.getByRole('button', { name: 'Supprimer la question 5 : Commentaire libre' }).click();
      await expect(page.getByRole('dialog', { name: 'Supprimer cette question ?' })).toBeVisible({
        timeout: 2000,
      });
    }).toPass({ timeout: 30_000 });
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer la question' }).click();
    await expect(titles(page)).toHaveCount(4);
    await page.getByRole('button', { name: 'Enregistrer le questionnaire' }).click();
    await expect(page.getByText('Questionnaire enregistré.')).toBeVisible();
    await expect(page.getByText('Toutes les modifications sont enregistrées.')).toBeVisible();
  });
});

// Captures de contrôle de fidélité (`FIDELITE=1`) : `qa/fidelite/bo-avis-clients-<largeur>.png`.
test('capture de fidélité', async ({ page }, testInfo) => {
  test.skip(!process.env.FIDELITE, 'Capture à la demande (FIDELITE=1).');
  const width = page.viewportSize()?.width ?? 0;
  await login(page);
  await openReviews(page);
  await expect(card(page, /^Marc O\./)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Répartition des notes' })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `qa/fidelite/bo-avis-clients-${width}.png`, fullPage: true });
  const regions = await page.evaluate(() =>
    ['main header', 'section[aria-label^="Avis"]', 'aside[aria-label^="Questionnaire"]'].map((selector) => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();
      return `${selector} : ${box ? `${Math.round(box.width)} × ${Math.round(box.height)} @ y${Math.round(box.top)}` : '—'}`;
    }),
  );
  testInfo.annotations.push({ type: 'régions', description: regions.join(' | ') });
  await page.getByRole('link', { name: 'Modifier les questions' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Questionnaire de satisfaction');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `qa/fidelite/bo-avis-questionnaire-${width}.png`, fullPage: true });
  console.log(`[${width}] ${regions.join(' | ')}`);
});
