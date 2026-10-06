import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('Nos services', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services', { waitUntil: 'domcontentloaded' });
  });

  test('page complète, accessible et sans débordement', async ({ page, pageErrors }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('19 services, un seul interlocuteur.');
    await expect(page.getByRole('navigation', { name: "Fil d'Ariane" })).toContainText('Nos services');
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('les 19 services mènent à leur fiche', async ({ page }) => {
    const cards = page.locator('main section[id] article h3 a');
    await expect(cards).toHaveCount(19);
    await expect(page.getByRole('link', { name: 'Chef privé', exact: true })).toHaveAttribute(
      'href',
      '/services/experience/chef-prive',
    );
    await expect(page.getByRole('link', { name: 'Logement adapté et appartement meublé' })).toHaveAttribute(
      'href',
      '/services/immobilier/logement-adapte-meuble',
    );
  });

  test('barre des rubriques collante, défilement et rubrique active', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Rubriques' });
    const culture = nav.getByRole('link', { name: 'Culture & événementiel' });
    await expect(async () => {
      await culture.click();
      await expect(culture).toHaveAttribute('aria-current', 'location', { timeout: 1500 });
    }).toPass();
    await expect(page.getByRole('heading', { level: 2, name: 'Culture & événementiel' })).toBeInViewport();
    // La barre reste visible pendant le défilement.
    await expect(nav).toBeInViewport();
  });
});
