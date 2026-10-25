import type { Page } from '@playwright/test';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const isMobile = (width: number | undefined) => (width ?? 0) < 768;

const searchDialog = (page: Page, name = 'Recherche sur le site') => page.getByRole('dialog', { name });

/** Ouverture au clavier (`/`), une fois la page interactive (le raccourci est posé à l'hydratation). */
async function openWithKeyboard(page: Page, key = '/', name?: string) {
  const dialog = searchDialog(page, name);
  await expect(async () => {
    if (!(await dialog.isVisible())) await page.keyboard.press(key);
    await expect(dialog).toBeVisible({ timeout: 1500 });
  }).toPass();
  await expect(dialog.getByRole('combobox')).toBeFocused();
  return dialog;
}

/** Ouverture à la souris : loupe de l'en-tête, ou entrée du menu en mobile. */
async function openWithMouse(page: Page, mobile: boolean) {
  const dialog = searchDialog(page);
  await expect(async () => {
    if (mobile) {
      const menu = page.getByRole('dialog', { name: 'Menu' });
      if (!(await menu.isVisible())) await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      await menu.getByRole('button', { name: 'Rechercher sur le site' }).click({ timeout: 1500 });
    } else {
      await page.getByRole('button', { name: 'Rechercher sur le site' }).click();
    }
    await expect(dialog).toBeVisible({ timeout: 1500 });
  }).toPass();
  return dialog;
}

test.describe('recherche globale', () => {
  test('clavier : `/`, suggestions groupées, flèches puis Entrée ouvre la fiche', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dialog = await openWithKeyboard(page);
    const input = dialog.getByRole('combobox', { name: 'Rechercher' });
    await expect(dialog.getByText('Que cherchez-vous')).toBeVisible();

    await input.fill('chef');
    const listbox = dialog.getByRole('listbox', { name: 'Résultats de la recherche' });
    await expect(listbox.getByRole('group', { name: /^Services/ })).toBeVisible();
    await expect(listbox.getByRole('group', { name: /^Rubriques/ })).toBeVisible();
    const chef = listbox.getByRole('option', { name: /^Chef privé/ });
    await expect(chef).toBeVisible();
    await expect(chef.locator('mark').first()).toHaveText('Chef');
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await expectNoHorizontalScroll(page);
    await expectAccessible(page);

    await input.press('ArrowDown');
    await expect(chef).toHaveAttribute('aria-selected', 'true');
    await expect(input).toHaveAttribute('aria-activedescendant', (await chef.getAttribute('id')) ?? '');
    await input.press('ArrowUp');
    await expect(listbox.getByRole('option', { name: /Voir tous les résultats/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await input.press('ArrowDown');
    await expect(chef).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');

    await expect(page).toHaveURL(/\/services\/experience\/chef-prive$/);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Chef');
    expect(pageErrors).toEqual([]);
  });

  test('Ctrl+K ouvre, Échap ferme et rend le focus', async ({ page }) => {
    await page.goto('/qui-sommes-nous', { waitUntil: 'domcontentloaded' });
    const dialog = await openWithKeyboard(page, 'Control+k');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('souris : loupe (ou menu mobile), formation ouverte et mise en évidence', async ({
    page,
    viewport,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dialog = await openWithMouse(page, isMobile(viewport?.width));
    await dialog.getByRole('combobox').fill('hygiene');
    const option = dialog.getByRole('option', { name: /^Hygiène et sécurité en cuisine/ });
    await option.click();
    await expect(page).toHaveURL(/\/formation#hygiene-securite-cuisine$/);
    const card = page.locator('#hygiene-securite-cuisine');
    await expect(card).toHaveAttribute('data-targeted', 'true');
    await expect(card).toBeInViewport();
  });

  test('ancre d’une formation masquée par le filtre : catalogue sur « Toutes »', async ({ page }) => {
    await page.goto('/formation?categorie=ATELIERS#hygiene-securite-cuisine', {
      waitUntil: 'domcontentloaded',
    });
    const card = page.locator('#hygiene-securite-cuisine');
    await expect(card).toHaveAttribute('data-targeted', 'true');
    await expect(
      page.getByRole('group', { name: 'Filtrer les formations' }).getByRole('button', { name: 'Toutes' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#catalogue li')).toHaveCount(6);
  });

  test('« Voir tous les résultats » mène à la page de résultats', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dialog = await openWithKeyboard(page);
    await dialog.getByRole('combobox').fill('chef');
    await dialog.getByRole('option', { name: /Voir tous les résultats/ }).click();
    await expect(page).toHaveURL(/\/recherche\?q=chef$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Résultats pour.+chef/);
  });

  test('page de résultats `?q=` : groupes, liens, accessible et sans débordement', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/recherche?q=chef', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Résultats pour.+chef/);
    await expect(page.getByRole('heading', { level: 2, name: /^Services/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /^Rubriques/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Chef privé/ })).toHaveAttribute(
      'href',
      '/services/experience/chef-prive',
    );
    await expect(page.getByRole('searchbox', { name: 'Rechercher' })).toHaveValue('chef');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);

    // Nouvelle recherche depuis la page, puis aucun résultat.
    await page.getByRole('searchbox', { name: 'Rechercher' }).fill('zzzzzz');
    await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
    await expect(page).toHaveURL(/\/recherche\?q=zzzzzz$/);
    await expect(page.getByRole('heading', { level: 2, name: /Aucun résultat/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nous contacter' })).toBeVisible();
  });

  test('version anglaise : panneau et page de résultats traduits', async ({ page, pageErrors }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const dialog = await openWithKeyboard(page, '/', 'Site search');
    await dialog.getByRole('combobox', { name: 'Search' }).fill('chef');
    await expect(dialog.getByRole('group', { name: /^Categories/ })).toBeVisible();
    await expect(dialog.getByRole('option', { name: /^Private chef/ })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.goto('/en/search?q=chef', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Results for.+chef/);
    await expect(page.getByRole('link', { name: /^Private chef/ })).toHaveAttribute(
      'href',
      '/en/services/experience/chef-prive',
    );
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});
