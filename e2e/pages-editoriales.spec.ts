import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Pages éditoriales pilotées par `GET /v1/pages/{key}` : titre, ancres du héros, bandeau final. */
const PAGES = [
  {
    path: '/qui-sommes-nous',
    title: 'Une agence de services de proximité au Cameroun.',
    anchors: ['presentation', 'notre-equipe', 'nos-valeurs', 'pourquoi-mambo'],
    cta: 'Faisons connaissance.',
  },
  {
    path: '/mission',
    title: 'Simplifier la vie, rapprocher les distances.',
    anchors: ['mission', 'vision', 'engagements', 'methode'],
    cta: 'Une demande à nous confier ?',
  },
  {
    path: '/magazine',
    title: 'Mambo Proxi — Édition n° 1',
    anchors: ['edito', 'sante-et-nutrition', 'beaute-et-bien-etre', 'recevoir-le-magazine'],
    cta: 'Recevez chaque numéro par e-mail.',
  },
  {
    path: '/zones-d-intervention',
    title: 'Nous intervenons partout à Douala.',
    anchors: ['la-carte', 'trouver-votre-quartier', 'quartiers-par-zone', 'zone-speciale'],
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

  test('Magazine : abonnement à la lettre Mambo et lecture dans l’autre langue', async ({ page }) => {
    await page.goto('/magazine', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'S’abonner à la lettre Mambo' })).toHaveAttribute(
      'href',
      '#lettre-mambo',
    );
    await expect(page.locator('#lettre-mambo')).toHaveCount(1);
    await page.getByRole('link', { name: 'Lire en anglais' }).click();
    await expect(page).toHaveURL(/\/en\/magazine$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mambo Proxi — Issue 1');
    await expect(page.getByRole('link', { name: 'Read in French' })).toHaveAttribute('href', '/magazine');
  });

  test('Zones d’intervention : quartiers par zone, recherche et version anglaise', async ({ page }) => {
    await page.goto('/zones-d-intervention', { waitUntil: 'domcontentloaded' });
    const zone3 = page.locator('#zone-3');
    await expect(zone3.getByRole('heading', { level: 4 })).toHaveText('Zone 3 — Élargie');
    await expect(zone3.getByRole('listitem')).toHaveCount(8);
    await expect(page.locator('#zone-speciale')).toContainText('Bonabéri (rive ouest du Wouri)');
    await expect(page.getByText('Délai moyen de livraison : 30 à 60 minutes selon le trafic.')).toBeVisible();
    const search = page.getByRole('combobox', { name: 'Rechercher un quartier' });
    await search.fill('kotto');
    await search.press('Enter');
    await expect(page.getByText('Kotto est en Zone 3 — Élargie.')).toBeVisible();

    await page.goto('/en/service-areas', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We cover all of Douala.');
    await expect(page.getByRole('heading', { level: 3, name: 'Neighbourhoods, area by area' })).toBeVisible();
    await expect(page.locator('#zone-1').getByRole('heading', { level: 4 })).toHaveText('Zone 1 — Nearby');
  });

  test('Qui sommes-nous : équipe à Douala, portraits et version anglaise', async ({ page }) => {
    await page.goto('/qui-sommes-nous', { waitUntil: 'domcontentloaded' });
    const team = page.locator('#notre-equipe');
    await expect(team.getByText('Une équipe présente à Douala, joignable et à l’écoute.')).toBeVisible();
    await expect(team.getByRole('listitem')).toHaveCount(4);
    await expect(page.locator('#pourquoi-mambo')).toContainText('univers de services');

    await page.goto('/en/about-us', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A local services agency in Cameroon.');
    await expect(
      page.getByRole('heading', { level: 2, name: 'The faces behind every service' }),
    ).toBeVisible();
  });
});
