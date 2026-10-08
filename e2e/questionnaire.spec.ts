import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

test.describe('questionnaire de satisfaction', () => {
  test('questionnaire : rappel de la prestation, accessible, sans en-tête du site', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/questionnaire/demo', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Comment s’est passée votre prestation ?',
    );
    await expect(page.getByText('Demande MP-2026-0142')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /principale/i })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('note obligatoire, progression, envoi puis remerciement', async ({ page }) => {
    await page.goto('/questionnaire/demo', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Questionnaire de satisfaction' });
    const progress = form.getByRole('progressbar');
    await expect(async () => {
      await form.getByRole('button', { name: 'Envoyer mes réponses' }).click();
      await expect(form.getByRole('alert')).toContainText('Merci de répondre à cette question.', {
        timeout: 1500,
      });
    }).toPass();

    await form
      .locator('label')
      .filter({ has: page.getByRole('radio', { name: /^4 sur 5/ }) })
      .click();
    await expect(progress).toHaveAttribute('aria-valuenow', '1');
    await form.locator('label', { hasText: 'Oui, tout à fait' }).first().click();
    await form
      .locator('label')
      .filter({ has: page.getByRole('radio', { name: '9', exact: true }) })
      .click();
    await expect(progress).toHaveAttribute('aria-valuenow', '3');
    await form.getByRole('textbox').fill('Chef ponctuel et repas délicieux.');
    await form.getByText(/J’accepte que mon avis/).click();
    await form.getByRole('button', { name: 'Envoyer mes réponses' }).click();

    await expect(page).toHaveURL(/\/questionnaire\/merci$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci pour votre avis !');
  });

  for (const [token, title] of [
    ['expire', 'Ce questionnaire n’est plus disponible'],
    ['deja-rempli', 'Ce questionnaire n’est plus disponible'],
    ['invalide', 'Ce lien n’est pas valide'],
  ] as const) {
    test(`jeton « ${token} » : état dédié`, async ({ page }) => {
      await page.goto(`/questionnaire/${token}`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toBeVisible();
    });
  }
});

test.describe('pages d’erreur', () => {
  // La réponse 404 du document est attendue : pas de vérification des erreurs réseau ici.
  test('adresse inconnue : 404 avec le gabarit du site, accessible', async ({ page }) => {
    const response = await page.goto('/cette-page-n-existe-pas', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Oups, cette page a pris un autre chemin.',
    );
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir nos services' })).toHaveAttribute('href', '/services');
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test('maintenance : page autonome accessible', async ({ page }) => {
    await page.goto('/maintenance', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le site fait une courte pause.');
    await expect(page.getByRole('link', { name: /contact@/ })).toHaveAttribute('href', /^mailto:/);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });
});
