import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

const JOB = '/recrutement/coordinateur-rice-de-services';

test.describe('recrutement', () => {
  for (const url of ['/recrutement', JOB]) {
    test(`${url} : accessible, sans débordement`, async ({ page, pageErrors }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('offres : compteur, recherche et filtres', async ({ page }) => {
    await page.goto('/recrutement', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: '5 postes ouverts' })).toBeVisible();
    const offers = page.locator('#offres li');
    await expect(offers).toHaveCount(5);
    await expect(async () => {
      await page
        .getByRole('group', { name: 'Filtrer les offres' })
        .getByRole('button', { name: 'Douala' })
        .click();
      await expect(offers).toHaveCount(4, { timeout: 1500 });
    }).toPass();
    await page
      .getByRole('group', { name: 'Filtrer les offres' })
      .getByRole('button', { name: 'Tous' })
      .click();
    await page.getByRole('searchbox', { name: 'Rechercher un poste' }).fill('chauffeur');
    await expect(offers).toHaveCount(1);
    // Adresse du lien vérifiée, puis page ouverte : en local, les préchargements de la page saturent le serveur et
    // retardent parfois la navigation au clic de plus de 15 s.
    const link = offers.getByRole('link', { name: /Voir l’offre/ });
    await expect(link).toHaveAttribute('href', '/recrutement/chauffeur-euse-partenaire');
    await page.goto('/recrutement/chauffeur-euse-partenaire', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chauffeur·euse partenaire');
  });

  test('version anglaise : offres traduites, filtres de contrat et photo du héros', async ({ page }) => {
    await page.goto('/en/careers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Join a team that takes care of others.',
    );
    await expect(page.getByRole('navigation', { name: "Fil d'Ariane" })).toContainText('Home');
    await expect(page.getByRole('heading', { name: '5 open positions' })).toBeVisible();
    await expect(page.locator('#offres li').first()).toContainText('Posted 3 days ago');
    const offers = page.locator('#offres li');
    await expect(async () => {
      await page
        .getByRole('group', { name: 'Filter openings' })
        .getByRole('button', { name: 'Fixed-term' })
        .click();
      await expect(offers).toHaveCount(1, { timeout: 1500 });
    }).toPass();
    await expect(
      offers.getByRole('link', { name: 'See the opening: Customer relations officer' }),
    ).toBeVisible();
    await expect(page.locator('main img').first()).toHaveAttribute('alt', /shakes hands/);
  });

  test('détail : secteurs, rémunération et horaires, version anglaise', async ({ page }) => {
    await page.goto('/recrutement/intervenant-e-a-domicile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Intervenant·e à domicile');
    const header = page.locator('main section').first();
    await expect(header).toContainText('Secteurs : Bonamoussadi, Makèpè, Cité SIC');
    await expect(header).toContainText('Rémunération : 90 000 – 120 000 FCFA par mois');
    await expect(header).toContainText('8 h par jour · 5 jours par semaine');
    await expect(header).toContainText('Publiée le 2 octobre 2026');

    await page.goto('/en/careers/intervenant-e-a-domicile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home service provider');
    await expect(page.locator('main section').first()).toContainText('Pay: 90,000 – 120,000 FCFA a month');
    await expect(page.getByRole('link', { name: 'Apply for this position' })).toBeVisible();
  });

  test('détail : « Postuler à cette offre » présélectionne le poste, puis candidature avec CV', async ({
    page,
  }) => {
    await page.goto(JOB, { waitUntil: 'domcontentloaded' });
    const apply = page.getByRole('link', { name: 'Postuler à cette offre' });
    await expect(apply).toHaveAttribute(
      'href',
      '/recrutement?poste=coordinateur-rice-de-services#candidature',
    );
    await page.goto('/recrutement?poste=coordinateur-rice-de-services#candidature', {
      waitUntil: 'domcontentloaded',
    });
    const form = page.getByRole('form', { name: 'Candidature', exact: true });
    await expect(form.getByLabel(/Poste visé/)).toHaveValue('coordinateur-rice-de-services');

    await expect(async () => {
      await form.getByRole('button', { name: 'Envoyer ma candidature' }).click();
      await expect(form.getByText('Merci de joindre votre CV.')).toBeVisible({ timeout: 1500 });
    }).toPass();
    await form.getByLabel(/Nom et prénom/).fill('Brice Ngono');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('brice@exemple.fr');
    await form.getByLabel(/Téléphone/).fill('+237 6 99 11 22 33');
    await form.locator('input[type="file"]').setInputFiles({
      name: 'cv-brice-ngono.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 CV de test'),
    });
    await expect(form.getByText('cv-brice-ngono.pdf')).toBeVisible();
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer ma candidature' }).click();
    await expect(page.getByRole('status')).toContainText('Merci', { timeout: 15_000 });
  });
});
