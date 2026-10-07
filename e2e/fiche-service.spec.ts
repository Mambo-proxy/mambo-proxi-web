import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Un service par rubrique : la maquette (Chef privé) et trois fiches au contenu provisoire. */
const SERVICES = [
  { path: '/services/experience/chef-prive', name: 'Chef privé' },
  { path: '/services/immobilier/gestion-locative', name: 'Gestion locative' },
  {
    path: '/services/services-de-proximite/reception-colis-courrier',
    name: "Réception de colis et de courrier à l'agence",
  },
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
