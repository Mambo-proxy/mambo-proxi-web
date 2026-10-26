import type { Page } from '@playwright/test';
import { DEMO_ACCOUNTS, login } from './admin-helpers';
import { expect, expectAccessible, test } from './fixtures';

/** Bandeau des écrans de contenus sans la permission d'écriture (`ReadOnlyNotice`). */
const readOnlyNotice = (page: Page) => page.getByRole('note').filter({ hasText: /^Lecture seule :/ });

/**
 * Lecture seule : une responsable (Carine Eboa, `content:read` sans `content:write`, `media:write` ni
 * `newsletter:write`) consulte les contenus ; les boutons d'écriture sont absents et les champs désactivés, au lieu
 * d'actions refusées par l'API (403).
 */
test.describe('back-office : contenus en lecture seule', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.manager);
  });

  test('services : liste et éditeur sans actions d’écriture', async ({ page, pageErrors }) => {
    await page.goto('/admin/services', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
    await expect(readOnlyNotice(page)).toHaveText(
      'Lecture seule : votre rôle permet de consulter ces contenus, pas de les modifier.',
    );
    await expect(
      page.getByRole('link', { name: 'Chef privé', exact: true }).locator('visible=true'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: 'Ajouter un service' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Gérer les rubriques' })).toHaveCount(0);
    // Ni glisser-déposer ni menu de publication ; l'interrupteur « Dans le menu » reste lisible mais figé.
    await expect(page.getByRole('button', { name: 'Déplacer Chef privé' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Autres actions pour « Chef privé »' })).toHaveCount(0);
    const menuSwitch = page.getByRole('switch').locator('visible=true').first();
    await expect(menuSwitch).toBeVisible();
    await expect(menuSwitch).toBeDisabled();
    await expectAccessible(page);

    await page.goto('/admin/services/svc_chef_prive', { waitUntil: 'load' });
    const name = page.getByRole('textbox', { name: 'Nom du service' });
    await expect(name).toHaveValue('Chef privé', { timeout: 15_000 });
    await expect(name).toBeDisabled();
    await expect(readOnlyNotice(page)).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Afficher dans le menu' })).toBeDisabled();
    // Barre supérieure : en double (bureau, mobile), une seule visible.
    await expect(
      page.getByRole('button', { name: 'Aperçu', exact: true }).locator('visible=true').first(),
    ).toBeVisible();
    for (const action of ['Publier', 'Enregistrer', 'Dépublier', 'Ajouter un public', 'Ajouter une étape'])
      await expect(page.getByRole('button', { name: action, exact: true })).toHaveCount(0);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('pages & textes : sections consultables, champs figés', async ({ page, pageErrors }) => {
    await page.goto('/admin/pages?section=hero', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pages & textes');
    const hero = page.getByRole('button', { name: 'Section principale', exact: true });
    await expect(hero).toHaveAttribute('aria-expanded', 'true', { timeout: 15_000 });
    await expect(readOnlyNotice(page)).toBeVisible();
    await expect(page.getByText(/^10 sections · cliquez pour consulter$/)).toBeVisible();

    const title = page.getByRole('textbox', { name: 'Titre', exact: true });
    await expect(title).toHaveValue(/^Mambo, ce n'est pas qu'un service\./);
    await expect(title).toBeDisabled();
    await expect(
      page.getByRole('switch', { name: 'Afficher la section « Témoignages » sur le site' }),
    ).toBeDisabled();
    for (const action of ['Publier les modifications', 'Ajouter une section', 'Supprimer la section'])
      await expect(page.getByRole('button', { name: action })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Déplacer la section/ })).toHaveCount(0);

    // Les sections restent dépliables pour être lues (bouton d'en-tête hors du formulaire figé).
    const commitments = page.getByRole('button', { name: 'Nos engagements', exact: true });
    await expect(async () => {
      await commitments.click();
      await expect(commitments).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
    }).toPass({ timeout: 20_000 });
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('magazine : éditions consultées, édition d’un numéro figée', async ({ page, pageErrors }) => {
    await page.goto('/admin/magazine', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Magazine');
    const table = page.getByRole('table', { name: 'Éditions du magazine' });
    await expect(
      table.getByRole('link', { name: 'N° 1 — Ensemble vers un bien-être global', exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(readOnlyNotice(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nouvelle édition' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Actions pour N° 1/ })).toHaveCount(0);
    await expect(
      table.getByRole('link', { name: 'Consulter N° 1 — Ensemble vers un bien-être global' }),
    ).toBeVisible();
    await expectAccessible(page);

    await page.goto('/admin/magazine/mag_n1', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Édition n° 1', { timeout: 15_000 });
    await expect(readOnlyNotice(page)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Titre', exact: true })).toBeDisabled();
    for (const action of ['Enregistrer', 'Mettre à jour', 'Publier', '+ Ajouter un article', 'Programmer'])
      await expect(page.getByRole('button', { name: action, exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Aperçu', exact: true })).toBeVisible();
    // Envoi par la newsletter : `newsletter:write` absent, ni test ni programmation.
    await expect(page.getByRole('button', { name: 'Envoyer un test' })).toHaveCount(0);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});
