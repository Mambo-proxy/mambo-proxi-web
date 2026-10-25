import { render, renderHook, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_TRANSITION, SiteLink, useSiteRouter } from './site-link';

const navigation = vi.hoisted(() => ({
  params: { locale: 'en' },
  push: vi.fn(),
  replace: vi.fn(),
  linkProps: [] as Record<string, unknown>[],
}));

vi.mock('next/navigation', () => ({
  useParams: () => navigation.params,
  usePathname: () => '/en',
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));

// Lien de Next remplacé par une ancre qui garde ses propriétés, pour vérifier le type de transition transmis.
vi.mock('next/link', () => ({
  default: ({ href, transitionTypes, ...props }: ComponentProps<'a'> & { transitionTypes?: string[] }) => {
    navigation.linkProps.push({ href, transitionTypes });
    return <a href={String(href)} {...props} />;
  },
}));

describe('SiteLink', () => {
  beforeEach(() => {
    navigation.linkProps.length = 0;
  });

  it('convertit l’adresse dans la langue de la page et porte la transition de page', () => {
    render(<SiteLink href="/qui-sommes-nous">À propos</SiteLink>);
    expect(screen.getByRole('link', { name: 'À propos' })).toHaveAttribute('href', '/en/about-us');
    expect(navigation.linkProps).toEqual([{ href: '/en/about-us', transitionTypes: [PAGE_TRANSITION] }]);
  });

  it('transition retirée sur demande (menu mobile)', () => {
    render(
      <SiteLink href="/contact" transitionTypes={[]}>
        Contact
      </SiteLink>,
    );
    expect(navigation.linkProps[0]).toMatchObject({ transitionTypes: [] });
  });
});

describe('useSiteRouter', () => {
  it('push : adresse convertie et transition de page ; replace : sans transition', () => {
    const { result } = renderHook(() => useSiteRouter());
    result.current.push('/devis/confirmation?ref=MP-1');
    expect(navigation.push).toHaveBeenCalledWith('/en/free-quote/confirmation?ref=MP-1', {
      transitionTypes: [PAGE_TRANSITION],
    });
    result.current.push('/devis', { scroll: false, transitionTypes: [] });
    expect(navigation.push).toHaveBeenLastCalledWith('/en/free-quote', {
      scroll: false,
      transitionTypes: [],
    });
    result.current.replace('/avis-clients?tri=notes#avis', { scroll: false });
    expect(navigation.replace).toHaveBeenCalledWith('/en/reviews?tri=notes#avis', { scroll: false });
  });
});
