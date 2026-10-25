import type { Locator, Page } from '@playwright/test';
import { expect } from './fixtures';

/** Comptes de démonstration (`src/mocks/session.ts`), un par rôle. */
export const DEMO_ACCOUNTS = {
  admin: 'mireille@mamboproxi.com',
  editor: 'equipe.douala@mamboproxi.com',
  manager: 'carine.eboa@mamboproxi.com',
  agent: 'paul.ngando@mamboproxi.com',
  writer: 'grace.nkongo@mamboproxi.com',
} as const;

/**
 * Connexion simulée : mot de passe quelconque, puis le code `123456` (gestionnaires de `src/mocks/handlers/auth.ts`).
 * Par défaut avec le compte administrateur de la maquette (Mireille Bell).
 */
export async function login(page: Page, email: string = DEMO_ACCOUNTS.admin) {
  await page.goto('/admin/connexion', { waitUntil: 'domcontentloaded' });
  const form = page.getByRole('form', { name: 'Connexion au back-office' });
  const code = page.getByRole('group', { name: 'Code de vérification à 6 chiffres' });
  // Saisie répétée tant que la page n'est pas hydratée (le formulaire est alors réinitialisé).
  await expect(async () => {
    if (await code.isVisible()) return;
    await form.getByLabel('Adresse e-mail').fill(email);
    await form.getByRole('textbox', { name: 'Mot de passe' }).fill('motdepasse-solide');
    await form.getByRole('button', { name: 'Se connecter' }).click();
    await expect(code).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 45_000 });
  await code.getByLabel('Chiffre 1 sur 6').pressSequentially('123456');
  // Le code complet est envoyé automatiquement ; sinon, envoi par le bouton.
  // Le bouton n'est cliqué que s'il est encore affiché (l'envoi automatique peut déjà être en cours).
  await page.waitForURL(/\/admin$/, { timeout: 10_000 }).catch(async () => {
    const submit = page.getByRole('button', { name: 'Valider le code' });
    if (await submit.isVisible()) await submit.click({ timeout: 5000 }).catch(() => {});
  });
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

type KeyboardMove = {
  /** Libellé de l'élément tel qu'annoncé (« Chef privé »). */
  label: string;
  key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
  /** Positions (à partir de 1) avant et après le déplacement, et nombre d'éléments de la liste. */
  from: number;
  to: number;
  total: number;
};

/**
 * Déplacement au clavier dans une `SortableList` (dnd-kit) : `Espace` pour saisir, une flèche, `Espace` pour déposer.
 * Chaque touche attend l'annonce de l'étape précédente : la flèche n'est prise en compte qu'une fois les emplacements
 * mesurés (l'élément saisi « survole » alors sa propre place) et son écouteur n'est posé qu'au tour suivant la saisie.
 * Enchaînées sans attente, les touches devancent ces deux étapes sur une machine rapide (CI) et la flèche est ignorée.
 */
export async function moveWithKeyboard(page: Page, handle: Locator, move: KeyboardMove) {
  const announced = (step: string) =>
    page.getByText(`« ${move.label} » ${step} sur ${move.total}.`, { exact: true });
  // Saisie répétée tant que la poignée n'a pas réagi (page pas encore hydratée).
  await expect(async () => {
    await handle.focus();
    await page.keyboard.press('Space');
    await expect(announced(`déplacé en position ${move.from}`)).toBeAttached({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });
  // Flèche répétée seulement si elle a été ignorée : l'annonce suit le déplacement dans le même rendu.
  await expect(async () => {
    await page.keyboard.press(move.key);
    await expect(announced(`déplacé en position ${move.to}`)).toBeAttached({ timeout: 1000 });
  }).toPass({ timeout: 10_000 });
  // Dépôt : l'annonce est aussitôt remplacée par le rendu de la liste réordonnée ; l'appelant vérifie le résultat.
  await page.keyboard.press('Space');
}
