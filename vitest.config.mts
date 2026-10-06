import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const resolve = {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    // `server-only` lève une erreur hors des Server Components : neutralisé pour les tests.
    'server-only': fileURLToPath(new URL('./src/test/empty.ts', import.meta.url)),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve,
  test: {
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
    projects: [
      {
        extends: true,
        test: { name: 'node', environment: 'node', include: ['src/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup-dom.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/lib/api/schema.d.ts', 'src/mocks/data/**'],
    },
  },
});
