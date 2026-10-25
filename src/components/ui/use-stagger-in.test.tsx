import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStaggerIn } from './use-stagger-in';

function List({ filter, items }: { filter: string; items: string[] }) {
  const ref = useStaggerIn<HTMLUListElement>(filter);
  return (
    <ul ref={ref}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

describe('useStaggerIn', () => {
  const animate = vi.fn(() => ({ cancel: vi.fn() }));
  let reduce = false;

  beforeEach(() => {
    reduce = false;
    // jsdom ne fournit ni Web Animations ni `matchMedia`.
    Element.prototype.animate = animate as unknown as Element['animate'];
    window.matchMedia = vi.fn(() => ({ matches: reduce }) as MediaQueryList);
  });

  afterEach(() => {
    delete (Element.prototype as Partial<Element>).animate;
    delete (window as Partial<Window>).matchMedia;
  });

  it("n'anime rien au premier affichage ni quand la clé ne change pas", () => {
    const { rerender } = render(<List filter="TOUS" items={items} />);
    rerender(<List filter="TOUS" items={items.slice(0, 3)} />);
    expect(animate).not.toHaveBeenCalled();
  });

  it('fait réapparaître les éléments en cascade quand le filtre change (6 décalages au plus)', () => {
    const { rerender } = render(<List filter="TOUS" items={items} />);
    rerender(<List filter="IMMOBILIER" items={items} />);
    expect(animate).toHaveBeenCalledTimes(items.length);
    const delays = animate.mock.calls.map((call) => (call as unknown[])[1] as KeyframeAnimationOptions);
    expect(delays.map((options) => options.delay)).toEqual([0, 50, 100, 150, 200, 250, 300, 300]);
    expect(delays[0]).toMatchObject({ duration: 280, fill: 'backwards' });
  });

  it("respecte la réduction des animations demandée par l'utilisateur", () => {
    reduce = true;
    const { rerender } = render(<List filter="TOUS" items={items} />);
    rerender(<List filter="IMMOBILIER" items={items} />);
    expect(animate).not.toHaveBeenCalled();
  });
});
