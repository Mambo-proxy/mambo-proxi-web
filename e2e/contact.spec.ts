import type { Locator } from '@playwright/test';
import { expect, expectAccessible, expectNoHorizontalScroll, test } from './fixtures';

/** Premier jour disponible du calendrier (mois suivant si le mois en cours n'en a plus). */
async function pickFirstAvailableDay(appointment: Locator) {
  const available = appointment.locator('[data-day]:not([aria-disabled])');
  await expect(async () => {
    if ((await available.count()) === 0) {
      await appointment.getByRole('button', { name: 'Mois suivant' }).click();
    }
    await expect(available.first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });
  await available.first().click();
}

test.describe('contact', () => {
  test('page complète, accessible et sans débordement', async ({ page, pageErrors }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Parlons de votre projet.');
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: /Douala/ })).toHaveAttribute('href', /^tel:\+237/);
    await expect(main.getByRole('link', { name: /France/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /contact@mamboproxi\.com/ }).first()).toHaveAttribute(
      'href',
      /^mailto:/,
    );
    await expect(main.getByText('Adresse de l’agence · Douala, Cameroun')).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 2, name: 'Vérifiez que votre quartier est desservi.' }),
    ).toBeVisible();
    await expect(main.getByRole('link', { name: /Voir toutes les zones et les quartiers/ })).toHaveAttribute(
      'href',
      '/zones-d-intervention',
    );
    await expect(page.locator('#rendez-vous [data-day]:not([aria-disabled])').first()).toBeVisible({
      timeout: 15_000,
    });
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
    expect(pageErrors).toEqual([]);
  });

  test('« Nous contacter » : validation puis envoi', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Écrivez-nous' });
    await expect(async () => {
      await form.getByRole('button', { name: 'Envoyer le message' }).click();
      await expect(form.getByText('Merci d’indiquer votre nom et votre prénom.')).toBeVisible({
        timeout: 1500,
      });
    }).toPass();
    await form.getByLabel(/Nom et prénom/).fill('Awa Mbarga');
    await form.getByRole('textbox', { name: 'E-mail' }).fill('awa@exemple.fr');
    await expect(form.getByLabel('Ville')).toHaveValue('Douala');
    await form.getByLabel('Ville').selectOption('Yaoundé');
    await form.getByLabel('Sujet').selectOption('Partenariat');
    await form.getByLabel(/Message/).fill('Bonjour, je souhaite vous présenter mon activité de traiteur.');
    await form.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await form.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Merci' })).toBeVisible({ timeout: 15_000 });
  });

  test('onglet « Demande d’information » : service concerné et adresse mise à jour', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(async () => {
      await page.getByRole('radio', { name: /information/i }).click();
      await expect(page.getByLabel('Service concerné')).toBeVisible({ timeout: 1500 });
    }).toPass();
    await expect(page).toHaveURL(/onglet=information/);
    await page.getByLabel('Service concerné').selectOption('chef-prive');
  });

  test('prise de rendez-vous : créneau, coordonnées, demande envoyée', async ({ page }) => {
    await page.goto('/contact#rendez-vous', { waitUntil: 'domcontentloaded' });
    const appointment = page.locator('#rendez-vous');
    await expect(async () => {
      await appointment.getByRole('button', { name: 'Demander ce rendez-vous' }).click();
      await expect(appointment.getByRole('alert')).toContainText('Merci de choisir le motif', {
        timeout: 1500,
      });
    }).toPass();

    await appointment.locator('label', { hasText: 'Devis' }).click();
    await appointment.locator('label', { hasText: 'Visio' }).click();
    await pickFirstAvailableDay(appointment);
    await appointment
      .getByRole('group', { name: /créneaux disponibles/ })
      .locator('label')
      .first()
      .click();
    await appointment.getByRole('button', { name: 'Demander ce rendez-vous' }).click();

    const details = appointment.getByRole('form', { name: 'Vos coordonnées' });
    await details.getByLabel(/Nom et prénom/).fill('Jean-Marc Tchoua');
    await details.getByRole('textbox', { name: 'E-mail' }).fill('jean-marc@exemple.fr');
    await details.getByLabel(/Téléphone \/ WhatsApp/).fill('+237 6 99 00 00 00');
    await details.getByText(/J'accepte que Mambo Proxi traite mes données/).click();
    await details.getByRole('button', { name: 'Envoyer ma demande de rendez-vous' }).click();
    await expect(appointment.getByRole('status')).toContainText('est bien envoyée', { timeout: 15_000 });
  });

  test('version anglaise : textes, agence et zones traduits', async ({ page, pageErrors }) => {
    await page.goto('/en/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let’s talk about your project.');
    const main = page.getByRole('main');
    await expect(main.getByText('Quick reply, 7 days a week')).toBeVisible();
    await expect(main.getByText('Agency address · Douala, Cameroon')).toBeVisible();
    await expect(main.getByRole('heading', { level: 2, name: 'Come and meet us' })).toBeVisible();
    await expect(main.getByRole('link', { name: /See all areas and neighbourhoods/ })).toHaveAttribute(
      'href',
      '/en/service-areas',
    );
    expect(pageErrors).toEqual([]);
  });
});
