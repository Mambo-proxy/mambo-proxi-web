import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Espaces insécables écrites en séquences d'échappement (u00A0, u202F), jamais en caractères invisibles.
    rules: {
      'no-irregular-whitespace': [
        'error',
        { skipStrings: false, skipTemplates: false, skipRegExps: false, skipJSXText: false },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/lib/api/schema.d.ts',
    'qa/**',
    'public/**',
  ]),
]);
