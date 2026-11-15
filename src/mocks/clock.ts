/**
 * « Maintenant » des données simulées datées (agenda, magazine). `NEXT_PUBLIC_MOCK_NOW` (tests de bout en bout) fige
 * la date : les exemples du contrat sont datés (premier événement le 14 novembre 2026, édition n° 2 programmée) et
 * les tests ne doivent pas dépendre du jour où ils tournent.
 */
export function mockNow(): number {
  const fixed = process.env.NEXT_PUBLIC_MOCK_NOW;
  return fixed ? Date.parse(fixed) : Date.now();
}
