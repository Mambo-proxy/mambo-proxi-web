import { describe, expect, it } from 'vitest';
import type { AdminPartner } from '@/lib/api/schema';
import { mergeOrder } from './partner-order';

const partner = (id: string, category: AdminPartner['category']) =>
  ({ id, name: id, category, categoryLabel: category, visible: true, sortOrder: 0 }) as AdminPartner;

const all = [
  partner('a', 'EXPERIENCE'),
  partner('b', 'IMMOBILIER'),
  partner('c', 'EXPERIENCE'),
  partner('d', 'IMMOBILIER'),
  partner('e', 'EXPERIENCE'),
];

describe('ordre des logos', () => {
  it('reprend l’ordre complet sans filtre', () => {
    const reordered = [all[1]!, all[0]!, ...all.slice(2)];
    expect(mergeOrder(all, reordered).map((item) => item.id)).toEqual(['b', 'a', 'c', 'd', 'e']);
  });

  it('dans un filtre, ne déplace que les logos filtrés, aux emplacements qu’ils occupaient', () => {
    const experience = [all[4]!, all[0]!, all[2]!];
    expect(mergeOrder(all, experience).map((item) => item.id)).toEqual(['e', 'b', 'a', 'd', 'c']);
  });
});
