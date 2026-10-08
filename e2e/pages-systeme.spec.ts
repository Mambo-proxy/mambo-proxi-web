import { expect, expectAccessible, test } from './fixtures';

test.describe('pages système (liens des e-mails)', () => {
  test('confirmation de la newsletter : confirmée à l’ouverture', async ({ page }) => {
    await page.goto('/newsletter/confirmation?token=abc', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inscription confirmée', {
      timeout: 30_000,
    });
    await expectAccessible(page);
  });

  test('confirmation de la newsletter : lien expiré', async ({ page }) => {
    await page.goto('/newsletter/confirmation?token=expire', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Confirmation impossible', {
      timeout: 30_000,
    });
  });

  test('désinscription : rien ne se passe avant le clic, puis désinscription', async ({ page }) => {
    await page.goto('/newsletter/desinscription?token=abc', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Se désinscrire de la lettre Mambo');
    await expectAccessible(page);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(async () => {
      await page.getByRole('button', { name: 'Confirmer ma désinscription' }).click({ timeout: 2000 });
      await expect(heading).not.toHaveText('Se désinscrire de la lettre Mambo', { timeout: 1000 });
    }).toPass({ timeout: 20_000 });
    // Premier envoi simulé : le module des mocks se charge à la demande dans le navigateur.
    await expect(heading).toHaveText('Désinscription effectuée', { timeout: 30_000 });
  });

  test('créneau proposé déjà pris : proposition d’en choisir un autre', async ({ page }) => {
    await page.goto('/rendez-vous/confirmer?ref=MP-2026-0142&token=pris', { waitUntil: 'domcontentloaded' });
    const heading = page.getByRole('heading', { level: 1 });
    await expect(async () => {
      await page.getByRole('button', { name: 'Confirmer ce rendez-vous' }).click({ timeout: 2000 });
      await expect(heading).not.toHaveText('Confirmer le créneau proposé', { timeout: 1000 });
    }).toPass({ timeout: 20_000 });
    await expect(heading).toHaveText('Confirmation impossible', { timeout: 30_000 });
    await expect(page.getByRole('link', { name: 'Choisir un autre créneau' })).toHaveAttribute(
      'href',
      /contact/,
    );
  });
});
