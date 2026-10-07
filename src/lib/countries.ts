/**
 * Pays de résidence proposés dans les formulaires (code ISO 3166-1 alpha-2 attendu par l'API).
 * La France et le Cameroun en tête, puis les pays de la diaspora les plus probables, par ordre alphabétique.
 */
export const COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'FR', name: 'France' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CA', name: 'Canada' },
  { code: 'CI', name: 'Côte d’Ivoire' },
  { code: 'ES', name: 'Espagne' },
  { code: 'US', name: 'États-Unis' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GQ', name: 'Guinée équatoriale' },
  { code: 'IT', name: 'Italie' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'CF', name: 'République centrafricaine' },
  { code: 'CG', name: 'République du Congo' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'CH', name: 'Suisse' },
  { code: 'TD', name: 'Tchad' },
];
