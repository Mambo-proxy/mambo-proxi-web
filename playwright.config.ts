import { defineConfig, devices } from '@playwright/test';

// Port modifiable (`E2E_PORT`) pour lancer plusieurs copies du dépôt en parallèle sans partager le serveur.
const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * Tests de bout en bout et de fidélité visuelle, sur le build de production branché sur les mocks.
 * Largeurs contrôlées : 390 (maquette mobile), 768 (tablette), 1280 et 1440 (maquette desktop).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // En local, l'exécution parallèle bloque des navigations (machine chargée) ; en série : ~1 min.
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'fr-FR',
    timezoneId: 'Africa/Douala',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'tablette-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    // Connexions gardées ouvertes 60 s : avec la valeur par défaut (5 s), Chrome réutilise parfois une connexion que
    // le serveur vient de fermer et attend 10 s avant de réessayer (tests instables sous Windows).
    command: `pnpm build && pnpm start --port ${PORT} --keepAliveTimeout 60000`,
    url: `http://localhost:${PORT}/dev/ui`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_API_MOCKING: 'enabled',
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
});
