import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Pages éditoriales pilotées par `GET /v1/pages/{key}` : titre, ancres du héros, bandeau final. */
const PAGES = [
  {
    path: '/qui-sommes-nous',
    title: 'Une agence qui relie la France et le Cameroun.',
    anchors: ['presentation', 'notre-equipe', 'nos-valeurs', 'pourquoi-mambo'],
    cta: 'Faisons connaissance.',
  },
  {
    path: '/mission',
    title: 'Simplifier la vie, rapprocher les distances.',
    anchors: ['mission', 'vision', 'engagements', 'methode'],
    cta: 'Une demande à nous confier ?',
  },
];

test.describe('pages éditoriales', () => {
  for (const page of PAGES) {
    test(`${page.path} : contenu, ancres, accessibilité, sans débordement`, async ({
      page: browser,
      pageErrors,
    }) => {
      await browser.goto(page.path, { waitUntil: 'domcontentloaded' });
      await expect(browser.getByRole('heading', { level: 1 })).toHaveText(page.title);
      const anchors = browser.getByRole('navigation', { name: 'Sur cette page' }).getByRole('link');
      await expect(anchors).toHaveCount(page.anchors.length);
      for (const id of page.anchors) await expect(browser.locator(`[id="${id}"]`)).toHaveCount(1);
      await expect(browser.getByRole('heading', { level: 2, name: page.cta })).toBeVisible();
      await expectNoHorizontalScroll(browser);
      await expectAccessible(browser);
      expect(pageErrors).toEqual([]);
    });
  }

  test('puce d’ancrage : défilement vers la section et puce active', async ({ page }) => {
    await page.goto('/mission', { waitUntil: 'domcontentloaded' });
    const chip = page
      .getByRole('navigation', { name: 'Sur cette page' })
      .getByRole('link', { name: 'Nos engagements' });
    await expect(async () => {
      await chip.click();
      await expect(chip).toHaveAttribute('aria-current', 'location', { timeout: 1500 });
    }).toPass();
    await expect(page.locator('#engagements')).toBeInViewport();
  });
});
