import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Liste des pages en colonne à partir de 1 280 px ; liste déroulante en dessous. */
const hasPageColumn = (page: Page) => (page.viewportSize()?.width ?? 1440) >= 1280;

/** Ouvre l'écran (page et sections éventuelles dans l'adresse) et attend les sections chargées. */
async function openPages(page: Page, query = '') {
  await page.goto(`/admin/pages${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pages & textes');
  await expect(page.getByRole('list').locator('button[aria-expanded]').first()).toBeVisible({
    timeout: 15_000,
  });
}

async function choosePage(page: Page, title: string, key: string) {
  await expect(async () => {
    if (hasPageColumn(page))
      await page
        .getByRole('navigation', { name: 'Pages du site' })
        .getByRole('link', { name: title })
        .click();
    else await page.getByLabel('Page à modifier').selectOption(key);
    await expect(page).toHaveURL(new RegExp(`page=${key}`), { timeout: 2000 });
  }).toPass();
  await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
}

const savedNote = (page: Page) => page.getByText(/^Dernière sauvegarde automatique/);

test.describe('back-office : pages & textes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('écran accessible, sans débordement', async ({ page, pageErrors }) => {
    await openPages(page, '?section=hero');
    await expect(page.getByRole('heading', { level: 2, name: 'Accueil', exact: true })).toBeVisible();
    await expect(
      page.getByText(/^8 sections · glissez pour réordonner, cliquez pour modifier$/),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Section principale', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Nos engagements', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.getByRole('textbox', { name: 'Titre', exact: true })).toHaveValue(
      /^Mambo, ce n'est pas qu'un service\./,
    );
    await expect(
      page.getByRole('button', { name: /^Bouton principal Demander un devis gratuit vers Devis gratuit$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('switch', { name: 'Afficher la section « Témoignages » sur le site' }),
    ).toBeChecked();
    if (hasPageColumn(page)) {
      const list = page.getByRole('navigation', { name: 'Pages du site' });
      await expect(list.getByRole('link')).toHaveCount(18);
      await expect(list.getByRole('link', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page');
      await expect(list.getByRole('link', { name: /^Mentions légales Modifié hier$/ })).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('page et sections ouvertes conservées dans l’adresse', async ({ page, pageErrors }) => {
    await openPages(page);
    await choosePage(page, 'Qui sommes-nous ?', 'qui-sommes-nous');
    await page.getByRole('button', { name: 'Équipe', exact: true }).click();
    await expect(page).toHaveURL(/section=equipe/);
    await expect(page.getByRole('textbox', { name: 'Nom, membre 1' })).toHaveValue('Prénom Nom');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 2, name: 'Qui sommes-nous ?', exact: true })).toBeVisible(
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByRole('button', { name: 'Équipe', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await page.getByRole('button', { name: 'Équipe', exact: true }).click();
    await expect(page).not.toHaveURL(/section=/);

    // Page de rubrique : composée dans l'écran Services.
    await choosePage(page, 'Immobilier', 'immobilier');
    await expect(page.getByRole('link', { name: 'Modifier dans Services' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(pageErrors).toEqual([]);
  });

  test('modification d’un texte enregistrée automatiquement, puis publiée', async ({ page, pageErrors }) => {
    await openPages(page, '?page=accueil&section=hero');
    await expect(page.getByText('Publié', { exact: true })).toBeVisible();
    const lead = page.getByRole('textbox', { name: 'Texte de présentation' });
    await expect(async () => {
      await lead.fill('Un seul interlocuteur pour vos projets au Cameroun.');
      await expect(lead).toHaveValue('Un seul interlocuteur pour vos projets au Cameroun.', {
        timeout: 1000,
      });
    }).toPass();
    await expect(page.getByText('51 / 600 caractères')).toBeVisible();
    await expect(page.getByText('Modifications non publiées')).toBeVisible();
    await expect(savedNote(page)).toBeVisible({ timeout: 10_000 });
    if (hasPageColumn(page))
      await expect(
        page
          .getByRole('navigation', { name: 'Pages du site' })
          .getByRole('link', { name: /^Accueil Modifié/ }),
      ).toBeVisible();

    // Validation champ par champ : titre obligatoire.
    const title = page.getByRole('textbox', { name: 'Titre', exact: true });
    await title.fill('');
    await expect(page.getByText('Ce champ est obligatoire.')).toBeVisible();
    await expect(title).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByText('Corrigez les champs signalés : le brouillon sera enregistré ensuite.'),
    ).toBeVisible();
    await title.fill('Mambo, ==une expérience pensée pour vous.==');
    await expect(page.getByText(/^Aperçu :/)).toContainText('Mambo, une expérience pensée pour vous.');
    await expect(savedNote(page)).toBeVisible({ timeout: 10_000 });

    // Aperçu du brouillon dans un nouvel onglet.
    const [preview] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Aperçu du brouillon' }).click(),
    ]);
    await expect.poll(() => preview.url()).toMatch(/\/\?preview=apercu_/);
    await preview.close();

    await page.getByRole('button', { name: 'Publier les modifications' }).click();
    await expect(
      page.getByText('Page « Accueil » publiée : le site affiche la nouvelle version.'),
    ).toBeVisible();
    await expect(page.getByText('Publié', { exact: true })).toBeVisible();
    await expect(page.getByText('Modifications non publiées')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('éléments d’une section : ajout, réordonnancement au clavier, suppression', async ({
    page,
    pageErrors,
  }) => {
    await openPages(page, '?page=accueil&section=comment-ca-marche');
    const steps = page.getByRole('group', { name: 'Étapes' });
    const titles = steps.getByRole('textbox', { name: /^Titre, étape \d$/ });
    await expect(titles).toHaveCount(3);

    await expect(async () => {
      await steps.getByRole('button', { name: 'Ajouter une étape' }).click();
      await expect(titles).toHaveCount(4, { timeout: 1000 });
    }).toPass();
    await steps.getByRole('textbox', { name: 'Titre, étape 4' }).fill('Vous donnez votre avis');
    await expect(steps.getByRole('textbox', { name: 'Numéro, étape 4' })).toHaveValue('04');

    // Clavier : Espace pour saisir, flèche bas, Espace pour déposer.
    const handle = steps.getByRole('button', { name: 'Déplacer étape « Vous exprimez votre besoin »' });
    await handle.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await expect(titles.nth(0)).toHaveValue('Vous recevez un devis sur mesure');
    await expect(titles.nth(1)).toHaveValue('Vous exprimez votre besoin');

    await steps.getByRole('button', { name: 'Supprimer étape « Vous donnez votre avis »' }).click();
    await expect(titles).toHaveCount(3);
    await expect(savedNote(page)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('3\u00A0étapes : titre et texte')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('page légale : gras et lien dans un article, puis annulation du brouillon', async ({
    page,
    pageErrors,
  }) => {
    await openPages(page, '?page=mentions-legales&section=contenu');
    // Brouillon existant (modifié hier).
    await expect(page.getByText('Modifications non publiées')).toBeVisible();
    const editor = page.getByRole('textbox', { name: 'Texte de l’article 1' });
    await expect(editor).toContainText('Le site est édité par MAMBO Proxi.');

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.getByRole('button', { name: 'Gras' }).first().click();
    await expect(editor.locator('strong')).toHaveCount(1);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.getByRole('button', { name: 'Ajouter un lien' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Lien' });
    await dialog.getByLabel('Adresse du lien').fill('/contact');
    await dialog.getByRole('button', { name: 'Valider' }).click();
    await expect(editor.locator('a[href="/contact"]')).toHaveCount(1);
    await expect(savedNote(page)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Annuler les modifications' }).click();
    const confirm = page.getByRole('dialog', { name: 'Annuler les modifications ?' });
    await confirm.getByRole('button', { name: 'Annuler les modifications' }).click();
    await expect(page.getByText('Modifications annulées : la version publiée est rétablie.')).toBeVisible();
    await expect(page.getByText('Publié', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Texte de l’article 1' }).locator('a[href="/contact"]'),
    ).toHaveCount(0);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('sections : masquage, ajout et suppression avec confirmation', async ({ page, pageErrors }) => {
    await openPages(page, '?page=mission');
    const sections = page.getByRole('list').locator('button[aria-expanded]');
    const count = await sections.count();
    const visibility = page.getByRole('switch').first();
    await visibility.uncheck();
    await expect(page.getByText(/· masquée sur le site$/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Ajouter une section' }).click();
    await page
      .getByRole('dialog', { name: 'Ajouter une section' })
      .getByRole('button', { name: /^Questions fréquentes/ })
      .click();
    await expect(sections).toHaveCount(count + 1);
    await expect(page.getByRole('button', { name: /^Questions fréquentes/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByText('Indiquez la question.')).toBeVisible();

    await page.getByRole('button', { name: 'Supprimer la section' }).click();
    await page
      .getByRole('dialog', { name: 'Supprimer la section « Questions fréquentes » ?' })
      .getByRole('button', { name: 'Supprimer la section' })
      .click();
    await expect(sections).toHaveCount(count);
    await expect(savedNote(page)).toBeVisible({ timeout: 10_000 });
    expect(pageErrors).toEqual([]);
  });

  test('capture de fidélité (FIDELITE=1)', async ({ page }) => {
    test.skip(!process.env.FIDELITE, 'Capture à la demande : FIDELITE=1.');
    await openPages(page, '?page=accueil&section=hero');
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
    const width = page.viewportSize()?.width ?? 1440;
    const box = async (selector: string) => {
      const rect = await page.locator(selector).first().boundingBox();
      return (
        rect && {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        }
      );
    };
    const measures = {
      list: await box('nav[aria-labelledby="pages-list-title"]'),
      firstSection: await box('main li:has(button[aria-expanded])'),
      hero: await box('main li:has(button[aria-expanded="true"])'),
    };
    console.log(`[fidélité ${width}]`, JSON.stringify(measures));
    await page.screenshot({ path: `qa/fidelite/bo-pages-textes-${width}.png`, fullPage: true });
  });
});
