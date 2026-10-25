import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/**
 * Mesure d'audience interne. Avec les mocks, `POST /v1/analytics/events` est résolu dans la page par les
 * gestionnaires MSW, sans requête réseau (`page.waitForRequest` ne la verrait pas) : les lots reçus sont relus dans
 * le magasin simulé, recopié dans `sessionStorage` (`src/mocks/data/analytics.ts`).
 */
const STORE = 'mp-mock-analytics';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type Batch = {
  consent: boolean;
  visitorId: string | null;
  events: { type: string; action: string | null }[];
};

/** Premier lot reçu contenant l'action, ou `null`. */
async function batchWith(page: Page, action: string): Promise<Batch | null> {
  return page.evaluate(
    ({ key, name }) => {
      const store = JSON.parse(sessionStorage.getItem(key) ?? '{"batches":[]}') as { batches: Batch[] };
      return store.batches.find((batch) => batch.events.some((event) => event.action === name)) ?? null;
    },
    { key: STORE, name: action },
  );
}

/** Module de suivi chargé (au repos, après l'hydratation). */
async function trackingReady(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-analytics', 'ready', { timeout: 20_000 });
}

/** Envoi immédiat de la file, comme à la fermeture de la page. */
async function flush(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
}

test.describe('mesure d’audience du site', () => {
  test('clic WhatsApp avant tout choix de cookies : comptage anonyme, sans identifiant', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('region', { name: 'Nous respectons votre vie privée' })).toBeVisible({
      timeout: 15_000,
    });
    await trackingReady(page);
    // Le lien WhatsApp ne quitte pas la page pendant le test (la mesure l'a déjà vu, en phase de capture).
    await page.evaluate(() =>
      document.addEventListener('click', (event) => {
        if ((event.target as Element).closest('a[href^="https://wa.me/"]')) event.preventDefault();
      }),
    );
    await page.locator('a[href^="https://wa.me/"]').first().dispatchEvent('click');
    await flush(page);

    await expect.poll(() => batchWith(page, 'whatsapp'), { timeout: 10_000 }).not.toBeNull();
    const batch = await batchWith(page, 'whatsapp');
    expect(batch?.consent).toBe(false);
    expect(batch?.visitorId).toBeNull();
    expect(batch?.events.some((event) => event.type === 'page_view')).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('mp_vid'))).toBeNull();
    expect(pageErrors).toEqual([]);
  });

  test('après « Accepter » : clic devis envoyé avec un identifiant pseudonyme', async ({
    page,
    pageErrors,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée' });
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(async () => {
      await banner.getByRole('button', { name: 'Accepter' }).click();
      await expect(banner).toBeHidden({ timeout: 1000 });
    }).toPass();
    await trackingReady(page);

    const quote = page.locator('main a[href^="/devis"]').first();
    await quote.scrollIntoViewIfNeeded();
    await quote.click();
    await expect(page).toHaveURL(/\/devis/);
    await flush(page);

    await expect.poll(() => batchWith(page, 'quote'), { timeout: 10_000 }).not.toBeNull();
    const batch = await batchWith(page, 'quote');
    expect(batch?.consent).toBe(true);
    expect(batch?.visitorId).toMatch(UUID);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('back-office : audience et équipe connectée', () => {
  test('chiffres, courbe et changement de période', async ({ page, pageErrors }) => {
    await login(page);
    const audience = page.getByRole('region', { name: 'Audience', exact: true });
    await audience.scrollIntoViewIfNeeded();
    await expect(audience.getByText('Visiteurs uniques', { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(audience.getByText('Pages vues', { exact: true }).first()).toBeVisible();
    await expect(audience.getByText('Clics sur les actions', { exact: true }).first()).toBeVisible();
    await expect(audience.getByRole('heading', { name: 'Clics par action' })).toBeVisible();
    await expect(audience.getByRole('heading', { name: 'Pages les plus vues' })).toBeVisible();
    await expect(audience.getByText('WhatsApp', { exact: true }).first()).toBeVisible();

    const days = (label: string) => page.getByRole('table', { name: `Visites par jour (${label})` });
    // En-tête + un jour par ligne.
    await expect(days('30 derniers jours').getByRole('row')).toHaveCount(31);

    const periods = page.getByRole('radiogroup', { name: 'Période de l’audience' });
    await periods.getByRole('radio', { name: '7 jours' }).click();
    await expect(periods.getByRole('radio', { name: '7 jours' })).toHaveAttribute('aria-checked', 'true');
    await expect(days('7 derniers jours').getByRole('row')).toHaveCount(8);
    await periods.getByRole('radio', { name: '90 jours' }).click();
    await expect(days('90 derniers jours').getByRole('row')).toHaveCount(91);

    const team = page.getByRole('region', { name: 'Équipe connectée' });
    await expect(team.getByRole('list', { name: 'Membres de l’équipe' })).toContainText('Mireille Bell');
    await expect(team.getByText('En ligne').first()).toBeVisible();

    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });
});
