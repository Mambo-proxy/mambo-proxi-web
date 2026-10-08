import type { Page } from '@playwright/test';
import { expect } from './fixtures';

/** Connexion simulée : mot de passe quelconque, puis le code `123456` (gestionnaires de `src/mocks/handlers/auth.ts`). */
export async function login(page: Page) {
  await page.goto('/admin/connexion', { waitUntil: 'domcontentloaded' });
  const form = page.getByRole('form', { name: 'Connexion au back-office' });
  const code = page.getByRole('group', { name: 'Code de vérification à 6 chiffres' });
  // Saisie répétée tant que la page n'est pas hydratée (le formulaire est alors réinitialisé).
  await expect(async () => {
    if (await code.isVisible()) return;
    await form.getByLabel('Adresse e-mail').fill('mireille@mamboproxi.com');
    await form.getByRole('textbox', { name: 'Mot de passe' }).fill('motdepasse-solide');
    await form.getByRole('button', { name: 'Se connecter' }).click();
    await expect(code).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30_000 });
  await code.getByLabel('Chiffre 1 sur 6').pressSequentially('123456');
  // Le code complet est envoyé automatiquement ; sinon, envoi par le bouton.
  await page.waitForURL(/\/admin$/, { timeout: 5000 }).catch(async () => {
    await page.getByRole('button', { name: 'Valider le code' }).click();
  });
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}
