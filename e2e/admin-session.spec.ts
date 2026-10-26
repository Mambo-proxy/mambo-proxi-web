import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { login } from './admin-helpers';

/**
 * Renouvellement de la session du back-office (jeton d'accès de 15 min). Mocks : `mp_at=expire` fait répondre 401 à
 * toute route du back-office ; `POST /v1/auth/refresh` réussit si `mp_rt` désigne un compte de démonstration
 * (`src/mocks/handlers/auth.ts`).
 */

async function cookie(page: Page, name: string) {
  return (await page.context().cookies()).find((item) => item.name === name)?.value;
}

/** Remplace des cookies du site (mêmes nom, hôte et chemin que ceux déposés à la connexion). */
async function setCookies(page: Page, values: Record<string, string>) {
  const url = new URL('/', page.url()).toString();
  await page.context().addCookies(Object.entries(values).map(([name, value]) => ({ name, value, url })));
}

/** Période du tableau de bord (requête du navigateur) ; clic répété tant que la page n'est pas hydratée. */
async function choosePeriod(page: Page, label: string) {
  const radio = page
    .getByRole('radiogroup', { name: 'Période', exact: true })
    .getByRole('radio', { name: label });
  await expect(async () => {
    // Écran quitté (retour à la connexion) : le clic a bien été pris en compte.
    if (!/\/admin$/.test(page.url())) return;
    await radio.click({ timeout: 2000 });
    await expect(radio).toHaveAttribute('aria-checked', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}

test.describe('back-office : session expirée dans l’écran', () => {
  // Sélecteur de période du tableau de bord : masqué sous 768 px.
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 768, 'Sélecteur de période affiché dès 768 px.');

  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page.getByText('Bonjour Mireille')).toBeVisible();
    await expect(page.getByText('Nouvelles demandes').locator('visible=true').first()).toBeVisible();
  });

  test('jeton d’accès expiré : session renouvelée, données rechargées sans quitter l’écran', async ({
    page,
    pageErrors,
  }) => {
    await setCookies(page, { mp_at: 'expire' });

    await choosePeriod(page, '7 jours');

    await expect.poll(() => cookie(page, 'mp_at'), { timeout: 15_000 }).toBe('usr_mireille');
    await expect(page.getByText('vs semaine dernière').locator('visible=true').first()).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText('Impossible de charger le tableau de bord pour le moment.')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('renouvellement refusé : retour à la connexion, page de retour conservée', async ({ page }) => {
    await setCookies(page, { mp_at: 'expire', mp_rt: 'revoque' });

    await choosePeriod(page, '7 jours');

    await expect(page).toHaveURL(/\/admin\/connexion\?suite=%2Fadmin$/);
    await expect(page.getByRole('form', { name: 'Connexion au back-office' })).toBeVisible();
    // Aucune erreur brute affichée (message du 401 ou erreur générique).
    await expect(
      page.getByText(/Veuillez vous reconnecter|Session expirée|Une erreur est survenue/),
    ).toHaveCount(0);
    expect(await cookie(page, 'mp_rt')).toBeUndefined();
  });
});

test.describe('back-office : session expirée au chargement d’une page', () => {
  test('cookie mp_at disparu : session renouvelée par le serveur, la page s’affiche', async ({
    page,
    pageErrors,
  }) => {
    await login(page);
    await page.goto('/admin/demandes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes');
    // Écran quitté avant l'expiration : aucune requête du navigateur ne renouvelle la session à la place du serveur.
    await page.goto('about:blank');
    await page.context().clearCookies({ name: 'mp_at' });

    await page.goto('/admin/demandes', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/admin\/demandes$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes');
    expect(await cookie(page, 'mp_at')).toBe('usr_mireille');
    expect(pageErrors).toEqual([]);
  });

  test('renouvellement refusé : connexion, puis retour à la page demandée', async ({ page }) => {
    await login(page);
    await setCookies(page, { mp_rt: 'revoque' });
    await page.goto('about:blank');
    await page.context().clearCookies({ name: 'mp_at' });

    await page.goto('/admin/demandes?statut=NOUVELLE', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/admin\/connexion\?suite=%2Fadmin%2Fdemandes%3Fstatut%3DNOUVELLE$/);
    await expect(page.getByRole('form', { name: 'Connexion au back-office' })).toBeVisible();
    expect(await cookie(page, 'mp_rt')).toBeUndefined();
  });
});
