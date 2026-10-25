import { expect, expectNoHorizontalScroll, test } from './fixtures';

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

  test('Trouver mon service : rubrique et service au clavier, puis la fiche', async ({ page }) => {
    const finder = page.getByRole('search', { name: 'Trouver mon service' });
    const chip = finder.getByRole('button', { name: 'Immobilier', exact: true });
    const field = finder.getByRole('combobox', { name: 'Votre service' });
    // Puce choisie au clavier une fois la page interactive (sans attente fixe ; idempotent si déjà choisie).
    await expect(async () => {
      await chip.focus();
      if ((await chip.getAttribute('aria-pressed')) !== 'true') await page.keyboard.press('Space');
      await expect(chip).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
    }).toPass();
    await field.focus();
    // Liste limitée à la rubrique, groupée sous son nom.
    await expect(finder.getByRole('option')).toHaveCount(7);
    await expect(finder.getByRole('group', { name: 'Immobilier' })).toBeVisible();
    await page.keyboard.type('gestion');
    await expect(finder.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('ArrowDown');
    await expect(field).toHaveAttribute('aria-activedescendant', /.+/);
    await page.keyboard.press('Enter');
    await expect(field).toHaveValue('Gestion locative');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await expect(finder.getByRole('link', { name: 'Demander un devis' })).toHaveAttribute(
      'href',
      '/devis?service=gestion-locative',
    );
    // Liste fermée : Entrée lance la recherche.
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/services\/immobilier\/gestion-locative$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gestion locative');
  });

  test('Trouver mon service : saisie libre, devis présélectionné, sans débordement', async ({
    page,
    pageErrors,
  }) => {
    const finder = page.getByRole('search', { name: 'Trouver mon service' });
    const field = finder.getByRole('combobox', { name: 'Votre service' });
    // Aucun résultat : message et lien vers tous les services (attendu une fois la page interactive).
    await expect(async () => {
      await field.fill('Atlantis');
      await expect(finder.getByText('Aucun service ne correspond à « Atlantis ».')).toBeVisible({
        timeout: 1000,
      });
    }).toPass();
    await expect(finder.getByRole('link', { name: 'Voir tous nos services' })).toHaveAttribute(
      'href',
      '/services',
    );
    // Ni rubrique ni service : « C'est parti » demande un choix et rend le focus au champ.
    await finder.getByRole('button', { name: 'C’est parti' }).click();
    await expect(finder.getByRole('alert')).toHaveText(
      'Choisissez une rubrique ou un service pour continuer.',
    );
    await expect(field).toBeFocused();
    await expectNoHorizontalScroll(page);
    // Recherche insensible aux accents, toutes rubriques confondues ; devis avec le service présélectionné.
    await field.fill('chef prive');
    await expect(finder.getByRole('group', { name: 'Expérience' }).getByRole('option')).toHaveText([
      'Chef privé',
    ]);
    await finder.getByRole('option', { name: 'Chef privé' }).click();
    await expect(field).toHaveValue('Chef privé');
    await finder.getByRole('link', { name: 'Demander un devis' }).click();
    await expect(page).toHaveURL(/\/devis\?service=chef-prive$/);
    await expect(page.getByRole('radio', { name: 'Chef privé' })).toBeChecked();
    expect(pageErrors).toEqual([]);
  });

  test('Trouver mon service : version anglaise', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const finder = page.getByRole('search', { name: 'Find my service' });
    const field = finder.getByRole('combobox', { name: 'Your service' });
    await expect(async () => {
      await field.fill('private');
      await expect(finder.getByRole('option', { name: 'Private chef' })).toBeVisible({ timeout: 1000 });
    }).toPass();
    await page.keyboard.press('Enter');
    await expect(field).toHaveValue('Private chef');
    await expect(finder.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
      'href',
      '/en/free-quote?service=chef-prive',
    );
    await finder.getByRole('button', { name: 'Let’s go' }).press('Enter');
    await expect(page).toHaveURL(/\/en\/services\/experience\/chef-prive$/);
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
