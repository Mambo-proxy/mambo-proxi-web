import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Les deux maquettes (Chef privé, Entretien du logement) et des fiches au contenu provisoire. */
const SERVICES = [
  { path: '/services/experience/chef-prive', name: 'Chef privé' },
  { path: '/services/services-a-domicile/entretien-du-logement', name: 'Entretien du logement' },
  { path: '/services/immobilier/gestion-locative', name: 'Gestion locative' },
  { path: '/services/services-de-proximite/pressing-laverie', name: 'Pressing et laverie' },
  { path: '/services/culture-evenementiel/decouverte-cameroun', name: 'Découverte du Cameroun' },
];

const isMobile = (width: number | undefined) => (width ?? 0) < 768;

test.describe('fiches service', () => {
  for (const service of SERVICES) {
    test(`${service.path} : contenu, accessibilité, sans débordement`, async ({ page, pageErrors }) => {
      await page.goto(service.path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(service.name);
      await expect(page.getByRole('heading', { name: 'À qui s’adresse ce service ?' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Ce que Mambo fait concrètement' })).toBeVisible();
      await expect(page.getByText('Tarif communiqué sur devis')).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test('Chef privé : devis pré-rempli, FAQ, avis et services liés', async ({ page }) => {
    await page.goto('/services/experience/chef-prive', { waitUntil: 'domcontentloaded' });
    const quoteLinks = page.locator('a[href="/devis?service=chef-prive"]');
    expect(await quoteLinks.count()).toBeGreaterThanOrEqual(3);
    await expect(
      page.getByRole('navigation', { name: "Fil d'Ariane" }).getByRole('link', { name: 'Expérience' }),
    ).toHaveAttribute('href', '/services/experience');

    const faq = page.getByRole('main').locator('details');
    await expect(faq).toHaveCount(4);
    await expect(faq.first()).toHaveAttribute('open', '');
    await expect(page.getByText('Chaque prestation est unique')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Ils ont reçu un chef à domicile' })).toBeVisible();
    await expect(page.getByRole('blockquote')).toHaveCount(2);
    await expect(page.getByRole('main').getByRole('link', { name: /^Photographe/ })).toHaveAttribute(
      'href',
      '/services/experience/photographe',
    );
  });

  test('Entretien du logement : carrousel des offres, actions et flèches', async ({ page, viewport }) => {
    await page.goto('/services/services-a-domicile/entretien-du-logement', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: 'Choisissez l’offre adaptée à votre logement.' }),
    ).toBeVisible();
    const track = page.getByRole('list', { name: /faire défiler horizontalement/ });
    await expect(track.getByRole('article')).toHaveCount(5);
    await expect(track.getByRole('heading', { name: 'Grand nettoyage' })).toBeAttached();
    await expect(
      track.getByRole('link', {
        name: /Je demande un devis gratuit — Entretien régulier|Devis gratuit — Entretien régulier/,
      }),
    ).toHaveAttribute('href', '/devis?service=entretien-du-logement');
    // L'évaluation se réserve : action principale vers la prise de rendez-vous, devis en flèche ↗.
    await expect(track.getByRole('link', { name: /Réserver|Je réserve mon évaluation/ })).toHaveAttribute(
      'href',
      '/contact?service=entretien-du-logement#rendez-vous',
    );
    await expect(track.getByRole('link', { name: 'Devis gratuit — Évaluation à domicile' })).toHaveAttribute(
      'href',
      '/devis?service=entretien-du-logement',
    );

    if (isMobile(viewport?.width)) {
      await expect(page.getByRole('button', { name: 'Offre suivante' })).toBeHidden();
      return;
    }
    const previous = page.getByRole('button', { name: 'Offre précédente' });
    const next = page.getByRole('button', { name: 'Offre suivante' });
    await expect(previous).toBeDisabled();
    await next.click();
    await expect.poll(() => track.evaluate((list) => list.scrollLeft)).toBeGreaterThan(300);
    await expect(previous).toBeEnabled();
  });

  test('version anglaise : fiche et offres traduites', async ({ page }) => {
    await page.goto('/en/services/services-a-domicile/entretien-du-logement', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home cleaning');
    await expect(page.getByRole('heading', { name: 'Choose the offer that suits your home.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Who is this service for?' })).toBeVisible();
    await expect(page.getByText('Price given in a quote')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: "Fil d'Ariane" }).getByRole('link', { name: 'Home services' }),
    ).toHaveAttribute('href', '/en/services/services-a-domicile');
  });

  test('barre d’action fixe en mobile, à la place du bouton WhatsApp flottant', async ({
    page,
    viewport,
  }) => {
    await page.goto('/services/experience/chef-prive', { waitUntil: 'domcontentloaded' });
    const bar = page.locator('[data-action-bar]');
    if (isMobile(viewport?.width)) {
      await expect(bar).toBeVisible();
      await expect(bar.getByRole('link', { name: /^Devis gratuit/ })).toHaveAttribute(
        'href',
        '/devis?service=chef-prive',
      );
      await expect(bar.getByRole('link', { name: /^WhatsApp/ })).toHaveAttribute('href', /Chef%20priv/);
      await expect(page.locator('[data-whatsapp-float]')).toBeHidden();
    } else {
      await expect(bar).toBeHidden();
    }
  });

  test('service rattaché à une autre rubrique : 404', async ({ page }) => {
    const response = await page.goto('/services/immobilier/chef-prive');
    expect(response?.status()).toBe(404);
  });
});
