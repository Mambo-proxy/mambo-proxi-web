import type { AdminPartner } from '@/lib/api/schema';

/** Ordre complet après un réordonnancement dans un filtre : les logos filtrés reprennent leurs emplacements. */
export function mergeOrder(all: AdminPartner[], reordered: AdminPartner[]): AdminPartner[] {
  const moved = new Set(reordered.map((partner) => partner.id));
  let next = 0;
  return all.map((partner) => (moved.has(partner.id) ? reordered[next++]! : partner));
}
