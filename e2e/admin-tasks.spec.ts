import type { Page } from '@playwright/test';
import { DEMO_ACCOUNTS, login } from './admin-helpers';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Texte visible (ligne du tableau en desktop, carte en mobile). */
const visibleText = (page: Page, text: RegExp) => page.getByText(text).locator('visible=true');

async function openRequests(page: Page, query = '') {
  await page.goto(`/admin/demandes${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes');
}

/**
 * Rôles et tâches : un·e responsable distribue les demandes ; un chargé de clientèle (Paul Ngando) ne voit que les
 * siennes. Les données simulées vivent dans la page : l'assignation faite par la responsable est vérifiée dans sa
 * session, Paul retrouve les demandes qui lui sont assignées dans les données de démonstration.
 */
test.describe('back-office : rôles et tâches', () => {
  test('une responsable assigne une demande à Paul Ngando', async ({ page, pageErrors }) => {
    await login(page, DEMO_ACCOUNTS.manager);
    await expect(page.getByText('Bonjour Carine')).toBeVisible();
    await openRequests(page, '?id=req_0141');
    const panel = page.getByRole('region', { name: 'Demande MP-2026-0141' });
    await expect(panel.getByRole('heading', { name: 'Découverte du Cameroun' })).toBeVisible();

    const assignee = panel.getByRole('combobox', { name: 'Assignée à' });
    // La liste des personnes assignables vient de la présence de l'équipe.
    await expect(assignee.locator('option[value="usr_paul"]')).toHaveCount(1, { timeout: 15_000 });
    await expect(assignee.locator('option[value="usr_grace"]')).toHaveCount(0);
    await assignee.selectOption('usr_paul');
    await expect(page.getByText('Demande assignée à Paul Ngando.')).toBeVisible();
    await expect(assignee).toHaveValue('usr_paul');
    await expect(panel.getByText('Assignée à Paul Ngando')).toBeVisible();

    await panel.getByRole('button', { name: 'Fermer le détail' }).click();
    await page.getByRole('combobox', { name: 'Assignées à' }).selectOption('usr_paul');
    await expect(page).toHaveURL(/assignee=usr_paul/);
    await expect(visibleText(page, /^Patrick E\./).first()).toBeVisible();
    await expect(visibleText(page, /^Clarisse N\./).first()).toBeVisible();
    await expect(visibleText(page, /^Aurélie K\./)).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    expect(pageErrors).toEqual([]);
  });

  test('Paul Ngando : ses tâches, ses demandes, pas de menus réservés', async ({ page, pageErrors }) => {
    await login(page, DEMO_ACCOUNTS.agent);
    await expect(page.getByText('Bonjour Paul')).toBeVisible();

    const tasks = page.getByRole('region', { name: 'Mes tâches' });
    await expect(tasks.getByText('Boris O.')).toBeVisible({ timeout: 15_000 });
    await expect(tasks.getByText('Marie F.')).toBeVisible();
    await expect(tasks.getByText('Clarisse N.')).toBeVisible();
    await expect(tasks.getByRole('link', { name: /^2\s*En retard/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nouveau service' })).toHaveCount(0);

    // Menu : en mobile, la liste complète des écrans s'ouvre avec « Plus ».
    const mobile = (page.viewportSize()?.width ?? 0) < 768;
    if (mobile) await page.getByRole('button', { name: 'Plus' }).click();
    const nav = page.getByRole('navigation', {
      name: mobile ? 'Tous les écrans du back-office' : 'Navigation du back-office',
    });
    await expect(nav.getByRole('link', { name: /^Demandes/ })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^Rendez-vous/ })).toBeVisible();
    for (const reserved of [
      'Services',
      'Avis clients',
      'Contacts & inscrits',
      'Paramètres',
      'Journal d’activité',
    ])
      await expect(nav.getByRole('link', { name: new RegExp(`^${reserved}`) })).toHaveCount(0);
    await expectAccessible(page);

    await openRequests(page);
    await expect(visibleText(page, /^Clarisse N\./).first()).toBeVisible({ timeout: 15_000 });
    await expect(visibleText(page, /^Boris O\./).first()).toBeVisible();
    await expect(visibleText(page, /^Aurélie K\./)).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Assignées à' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Exporter' })).toHaveCount(0);

    // Filtre « En retard » : les demandes dont l'échéance est dépassée.
    await page.getByRole('combobox', { name: 'Échéance' }).selectOption('overdue');
    await expect(page).toHaveURL(/due=overdue/);
    await expect(visibleText(page, /^Boris O\./).first()).toBeVisible();
    await expect(visibleText(page, /^Marie F\./).first()).toBeVisible();
    await expect(visibleText(page, /^Clarisse N\./)).toHaveCount(0);
    await expect(page.getByText('En retard', { exact: true }).locator('visible=true').first()).toBeVisible();
    await expectAccessible(page);

    // Écran réservé ouvert par son adresse.
    await page.goto('/admin/parametres', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paramètres');
    await expect(page.getByText('Accès réservé')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
