import { expect, test } from './fixtures';

const isMobile = (width: number | undefined) => (width ?? 0) < 768;

test.describe('accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('affiche les sections de la maquette dans l’ordre', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'C’est une expérience pensée pour vous.'.replace('’', "'"),
    );
    const titles = await page.locator('main h2:visible').allInnerTexts();
    const order = [
      'Une intervenante chez vous',
      'Tout ce dont vous avez besoin',
      'Simple comme un message.',
      'La proximité',
      'Nous intervenons partout à Douala.',
      'Ils',
      'Ils travaillent à nos côtés',
      'Un projet, une question',
    ];
    let last = -1;
    for (const start of order) {
      const index = titles.findIndex((title) => title.startsWith(start));
      expect(index, `section « ${start} »`).toBeGreaterThan(last);
      last = index;
    }
  });

  test('textes raccourcis en mobile, complets en desktop', async ({ page, viewport }) => {
    const lead = page.getByText('se déplacent chez vous, à Douala.', { exact: false }).first();
    const fullLead = page
      .getByText('se déplacent chez vous, à Douala et environs.', { exact: false })
      .first();
    if (isMobile(viewport?.width)) {
      await expect(lead).toBeVisible();
      await expect(fullLead).toBeHidden();
      await expect(page.getByRole('heading', { name: 'Ils en parlent.', exact: true })).toBeVisible();
    } else {
      await expect(fullLead).toBeVisible();
      await expect(page.getByRole('link', { name: 'Voir tous les services' })).toBeVisible();
    }
  });

  test('cartes des rubriques vers leurs pages', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Immobilier — 7 services/ }).first()).toHaveAttribute(
      'href',
      '/services/immobilier',
    );
  });

  test('chiffres clés lisibles par les lecteurs d’écran', async ({ page }) => {
    await expect(page.getByText('150+', { exact: true }).first()).toBeAttached();
    await expect(page.getByText('Douala', { exact: true }).first()).toBeAttached();
  });

  test('formules : réservation et devis avec la formule présélectionnée', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Maison + Linge', level: 3 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Réserver un créneau — Maison Essentiel' })).toHaveAttribute(
      'href',
      '/contact?service=maison-essentiel#rendez-vous',
    );
    await expect(page.getByRole('link', { name: 'Devis — Maison + Auto', exact: true })).toHaveAttribute(
      'href',
      '/devis?service=maison-auto',
    );
  });

  test('zones : recherche d’un quartier au clavier', async ({ page }) => {
    const search = page.getByRole('combobox', { name: 'Rechercher un quartier' });
    await search.fill('bonam');
    await expect(page.getByRole('option', { name: /Bonamoussadi/ })).toBeVisible();
    await search.press('Enter');
    await expect(page.getByText('Bonamoussadi est en Zone 3 — Élargie.')).toBeVisible();
    await search.fill('Atlantis');
    await search.press('Enter');
    await expect(page.getByText('Nous n’avons pas trouvé « Atlantis ».')).toBeVisible();
  });

  test('version anglaise', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      "It's an experience designed for you.",
    );
    await expect(page.getByRole('link', { name: 'Book a slot — Home Essential' })).toHaveAttribute(
      'href',
      '/en/contact?service=maison-essentiel#rendez-vous',
    );
  });

  test('carrousel des avis : défilement au clavier et indicateur de position', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 1280, 'Grille de 3 avis en desktop');
    const list = page.getByRole('list', { name: /Avis clients/ });
    const indicator = page.locator('[data-active]');
    await list.scrollIntoViewIfNeeded();
    await expect(async () => {
      await list.focus();
      for (let step = 0; step < 20; step += 1) await page.keyboard.press('ArrowRight');
      await expect(indicator).toHaveAttribute('data-active', '2', { timeout: 1500 });
    }).toPass();
  });
});
