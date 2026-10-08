import type { Page } from '@playwright/test';
import { login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Jour de l'agence (Douala) décalé de `days` jours, au format `yyyy-MM-dd`. */
function doualaDay(days: number) {
  return new Date(Date.now() + days * 86_400_000).toLocaleDateString('sv-SE', { timeZone: 'Africa/Douala' });
}

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;

/** Ouvre l'écran et attend la file « À confirmer » chargée. */
async function openCalendar(page: Page, query = '') {
  await page.goto(`/admin/rendez-vous${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rendez-vous');
  await expect(page.getByRole('button', { name: /^Sandrine M\. — voir le détail/ })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('back-office : rendez-vous', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('calendrier et file « À confirmer » accessibles, sans débordement', async ({ page, pageErrors }) => {
    await openCalendar(page);
    const pending = page.getByRole('region', { name: 'À confirmer' });
    await expect(pending.getByRole('listitem')).toHaveCount(3);
    await expect(pending.getByText('Devis · Événement · Téléphone')).toBeVisible();
    if (isMobile(page)) {
      // Mobile : vue jour (liste) par défaut, bandeau des jours de la semaine.
      await expect(page.getByRole('radio', { name: 'Jour' })).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByRole('group', { name: 'Jours de la semaine' })).toBeVisible();
    } else {
      await expect(page.getByRole('radio', { name: 'Semaine' })).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByRole('heading', { name: /^Semaine du / })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Partenariat · Saveurs de Douala,/ })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /^Immobilier · Ruth A\., .*Agence Douala, Confirmé$/ }),
      ).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('vue et période conservées dans l’adresse', async ({ page, pageErrors }) => {
    await openCalendar(page);
    await expect(async () => {
      await page.getByRole('radio', { name: 'Mois' }).click();
      await expect(page).toHaveURL(/vue=mois/, { timeout: 2000 });
    }).toPass();
    const title = page.getByRole('heading', { level: 2 }).filter({ hasText: /^[A-ZÉ][a-zéû]+ \d{4}$/ });
    const current = await title.textContent();
    await page.getByRole('button', { name: 'Mois suivant' }).click();
    await expect(page).toHaveURL(/date=\d{4}-\d{2}-01/);
    await expect(title).not.toHaveText(current ?? '');
    const next = await title.textContent();
    await expect(page.getByRole('button', { name: 'Aujourd’hui' })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('radio', { name: 'Mois' })).toHaveAttribute('aria-checked', 'true');
    await expect(title).toHaveText(next ?? '');

    await page.getByRole('button', { name: 'Aujourd’hui' }).click();
    await expect(page).not.toHaveURL(/date=/);
    await page.getByRole('radio', { name: 'Jour' }).click();
    await expect(page).toHaveURL(/vue=jour/);
    await page.getByRole('button', { name: 'Jour suivant' }).click();
    await expect(page).toHaveURL(new RegExp(`date=${doualaDay(1)}`));
    await expectNoHorizontalScroll(page);
    expect(pageErrors).toEqual([]);
  });

  test('détail d’un rendez-vous ouvert depuis la file et l’adresse', async ({ page }) => {
    await openCalendar(page);
    const panel = page.getByRole('region', { name: 'Rendez-vous MP-2026-0139' });
    await expect(async () => {
      await page.getByRole('button', { name: /^Sandrine M\. — voir le détail/ }).click();
      await expect(panel).toBeVisible({ timeout: 2000 });
    }).toPass();
    await expect(page).toHaveURL(/id=apt_0139/);
    await expect(panel.getByRole('heading', { name: 'Immobilier · Sandrine M.' })).toBeVisible();
    await expect(panel.getByText('Sandrine Mballa')).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Demandes de ce contact' })).toHaveAttribute(
      'href',
      /\/admin\/demandes\?q=sandrine/,
    );
    await expectAccessible(page);
    await panel.getByRole('button', { name: 'Fermer le détail' }).click();
    await expect(panel).toHaveCount(0);
    await expect(page).not.toHaveURL(/id=/);

    await page.goto('/admin/rendez-vous?id=apt_0140', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('region', { name: 'Rendez-vous MP-2026-0140' }).getByText('Agence Douala'),
    ).toBeVisible();
  });

  test('confirmation d’un rendez-vous à confirmer : compteurs mis à jour', async ({ page }) => {
    await openCalendar(page);
    const pending = page.getByRole('region', { name: 'À confirmer' });
    const sidebarLink = page.getByRole('link', { name: /^Rendez-vous\s*3 en attente/ });
    if (!isMobile(page)) await expect(sidebarLink).toBeVisible();
    await expect(async () => {
      await pending.getByRole('button', { name: 'Confirmer le rendez-vous de Sandrine M.' }).click();
      await expect(page.getByText(/^Rendez-vous confirmé/)).toBeVisible({ timeout: 3000 });
    }).toPass();
    await expect(pending.getByRole('listitem')).toHaveCount(2);
    await expect(pending.getByText('2 rendez-vous à confirmer')).toBeAttached();
    if (!isMobile(page))
      await expect(page.getByRole('link', { name: /^Rendez-vous\s*2 en attente/ })).toBeVisible();
  });

  test('saisie manuelle : validation puis rendez-vous visible dans le calendrier', async ({ page }) => {
    await openCalendar(page);
    const dialog = page.getByRole('dialog', { name: 'Ajouter un rendez-vous' });
    await expect(async () => {
      await page
        .getByRole('button', { name: 'Ajouter', exact: true })
        .locator('visible=true')
        .first()
        .click();
      await expect(dialog).toBeVisible({ timeout: 2000 });
    }).toPass();
    await expect(page).toHaveURL(/nouveau=1/);

    await dialog.getByRole('button', { name: 'Ajouter le rendez-vous' }).click();
    await expect(dialog.getByText('Indiquez le nom du contact.')).toBeVisible();
    await expect(dialog.getByText('Choisissez le motif.')).toBeVisible();
    await expect(dialog.getByLabel(/Nom et prénom/)).toBeFocused();

    const day = doualaDay(7);
    await dialog.getByLabel(/Nom et prénom/).fill('Awa Mbarga');
    await dialog.getByRole('textbox', { name: /E-mail/ }).fill('awa.mbarga@exemple.fr');
    await dialog.getByLabel(/Téléphone/).fill('+237 6 99 00 11 22');
    await dialog.getByLabel(/Motif/).selectOption('DEVIS');
    await dialog.getByLabel(/Format/).selectOption('VISIO');
    await dialog.getByLabel(/^Date/).fill(day);
    await dialog.getByLabel(/^Heure/).fill('11:30');
    await dialog.getByRole('button', { name: 'Ajouter le rendez-vous' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(/^Rendez-vous ajouté/)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`date=${day}`));
    const panel = page.getByRole('region', { name: /^Rendez-vous MP-2026-/ });
    await expect(panel.getByRole('heading', { name: 'Devis · Awa M.' })).toBeVisible();
    await expect(panel.getByText('Confirmé', { exact: true })).toBeVisible();
    await panel.getByRole('button', { name: 'Fermer le détail' }).click();
    await expect(page.getByRole('button', { name: /^Devis · Awa M\./ }).first()).toBeVisible();
  });

  test('annulation avec confirmation', async ({ page }) => {
    await page.goto('/admin/rendez-vous?id=apt_0140', { waitUntil: 'domcontentloaded' });
    const panel = page.getByRole('region', { name: 'Rendez-vous MP-2026-0140' });
    await expect(panel.getByText('Confirmé', { exact: true })).toBeVisible({ timeout: 15_000 });
    const dialog = page.getByRole('dialog', { name: 'Annuler ce rendez-vous ?' });
    await expect(async () => {
      await panel.getByRole('button', { name: 'Autres actions' }).click();
      await page.getByRole('menuitem', { name: 'Annuler le rendez-vous' }).click({ timeout: 2000 });
      await expect(dialog).toBeVisible({ timeout: 2000 });
    }).toPass();
    // Renoncer : rien ne change.
    await dialog.getByRole('button', { name: 'Garder le rendez-vous' }).click();
    await expect(dialog).toBeHidden();
    await expect(panel.getByText('Confirmé', { exact: true })).toBeVisible();

    await panel.getByRole('button', { name: 'Autres actions' }).click();
    await page.getByRole('menuitem', { name: 'Annuler le rendez-vous' }).click();
    await dialog
      .getByLabel('Message au client')
      .fill('Agence fermée exceptionnellement, nous vous rappelons.');
    await dialog.getByRole('button', { name: 'Annuler le rendez-vous' }).click();
    await expect(page.getByText(/^Rendez-vous annulé/)).toBeVisible();
    await expect(panel.getByText('Annulé', { exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Autres actions' })).toHaveCount(0);
  });

  test('réglage des disponibilités : validation et enregistrement', async ({ page, pageErrors }) => {
    await openCalendar(page);
    await page.getByRole('link', { name: 'Créneaux disponibles' }).locator('visible=true').first().click();
    await expect(page).toHaveURL(/\/admin\/rendez-vous\/disponibilites$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Créneaux disponibles');
    const save = page.getByRole('button', { name: 'Enregistrer', exact: true });
    await expect(save).toBeDisabled({ timeout: 15_000 });

    // Plage incohérente : erreur sur le champ.
    const end = page.getByLabel('Lundi, plage 1 : fin');
    await expect(async () => {
      await end.fill('07:00');
      await expect(save).toBeEnabled({ timeout: 2000 });
    }).toPass();
    await save.click();
    await expect(page.getByText('La fin doit suivre le début.')).toBeVisible();
    await expect(end).toHaveAttribute('aria-invalid', 'true');
    await end.fill('12:00');

    // Samedi fermé, délai de 48 h, fermeture ajoutée.
    await page.getByRole('switch', { name: 'Samedi' }).uncheck();
    await page.getByLabel('Délai de prévenance').selectOption('48');
    await page.getByRole('button', { name: 'Ajouter une fermeture' }).click();
    await page.getByRole('group', { name: 'Fermeture 3' }).getByLabel('Motif').fill('Fête nationale');
    const preview = page.getByRole('region', { name: 'Aperçu de la semaine' });
    await expect(preview.getByRole('listitem').filter({ hasText: 'Samedi' })).toContainText('Fermé');

    await save.click();
    await expect(page.getByText(/^Disponibilités enregistrées/)).toBeVisible();
    await expect(save).toBeDisabled();
    await expect(page.getByText(/Réglages à jour/)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('capture de fidélité (FIDELITE=1)', async ({ page }) => {
    test.skip(!process.env.FIDELITE, 'Capture à la demande : FIDELITE=1.');
    await openCalendar(page);
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
    });
    const width = page.viewportSize()?.width ?? 1440;
    const box = async (name: string) => {
      const region = page.getByRole('region', { name });
      if (!(await region.count())) return null;
      const rect = await region.first().boundingBox();
      return (
        rect && {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        }
      );
    };
    const measures = {
      calendar: await box(width < 768 ? 'Calendrier du jour' : 'Calendrier de la semaine'),
      pending: await box('À confirmer'),
    };
    console.log(`[fidélité ${width}]`, JSON.stringify(measures));
    await page.screenshot({ path: `qa/fidelite/bo-rendez-vous-${width}.png`, fullPage: true });
  });
});
