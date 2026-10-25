'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { buttonVariants } from '@/components/ui/button';
import type { Navigation } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { DesktopNav } from './desktop-nav';
import { MobileMenu } from './mobile-menu';
import { SearchButton, SiteSearchDialog, useSiteSearch } from './search/search-launcher';
import { useScroll } from './use-scroll';

type SiteHeaderProps = {
  navigation: Navigation;
  whatsappHref: string | null;
  /** Barre supérieure (rendue côté serveur), affichée en desktop. */
  topBar: ReactNode;
};

/**
 * Barre supérieure + en-tête, collants. Desktop (Figma `45:57`) : 85 px, px 40, compact 72 px au défilement
 * avec ombre `elevation/1` ; la barre supérieure se replie après 80 px. Mobile (`45:125`) : 69 px, px 16,
 * masqué en descendant et réaffiché en remontant.
 * Entre 1280 et 1440 px (non maquetté), logo, marges et écarts resserrés : la ligne doit tenir avec une réserve
 * d'au moins 30 px, car le rendu des polices sous Linux élargit les libellés d'environ 40 px par rapport à Windows.
 * Recherche globale : loupe 40 px dans l'en-tête (desktop et tablette ; en mobile, dans le menu), raccourcis `/` et
 * `Ctrl+K`, panneau chargé à la demande. Entre 1280 et 1439 px, la loupe et son écart (40 + 6 px) sont compensés dans
 * `DesktopNav` (50 px retirés : voir son commentaire) ; la réserve de 30 px est conservée.
 */
export function SiteHeader({ navigation, whatsappHref, topBar }: SiteHeaderProps) {
  const t = useTranslations('site.header');
  const { scrolled, goingDown } = useScroll(80);
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useSiteSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Hauteur visible de l'en-tête (`--site-header-h`) : position des barres collantes et marge des ancres.
  useEffect(() => {
    const update = () => {
      const bottom = wrapperRef.current?.getBoundingClientRect().bottom ?? 0;
      document.documentElement.style.setProperty('--site-header-h', `${Math.max(0, Math.round(bottom))}px`);
    };
    update();
    const afterTransition = setTimeout(update, 220);
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(afterTransition);
      window.removeEventListener('resize', update);
    };
  }, [scrolled, goingDown, menuOpen]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'sticky top-0 z-40 transition-transform duration-200 ease-standard',
        scrolled && 'xl:-translate-y-9',
        goingDown && !menuOpen && 'max-xl:-translate-y-full',
      )}
    >
      {topBar}
      {/* Nommé pour les transitions de page : l'en-tête reste en place au-dessus du contenu qui change. */}
      <header
        className={cn(
          'relative border-b border-border-default backdrop-blur-[24px] transition-[padding,background-color,box-shadow] duration-200 ease-standard [view-transition-name:site-header]',
          'flex items-center justify-between gap-3 px-4 py-3 xl:gap-2 xl:px-3 wide:gap-3 wide:px-9',
          scrolled ? 'bg-neutral-0/95 shadow-1 xl:py-[11.5px]' : 'bg-neutral-0/86 xl:py-[18px]',
        )}
      >
        <Logo priority className="h-9 xl:h-8 wide:h-10" />
        <DesktopNav
          items={navigation.main.filter((item) => item.placement !== 'mobile')}
          megaMenu={navigation.megaMenu}
          signUp={navigation.signUp}
          compact={scrolled}
          search={<SearchButton onOpen={search.show} open={search.open} />}
        />
        <div className="flex items-center gap-2 xl:hidden">
          {/* En mobile (< 768 px), la ligne est trop étroite : la recherche est proposée dans le menu. */}
          <SearchButton onOpen={search.show} open={search.open} className="max-md:hidden md:size-11" />
          <Link href={routes.devis} className={buttonVariants({ size: 'sm', shape: 'pill' })}>
            {t('freeQuote')}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('openMenu')}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-default text-text-main"
          >
            <Menu aria-hidden size={22} />
          </button>
        </div>
      </header>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navigation.main}
        megaMenu={navigation.megaMenu}
        whatsappHref={whatsappHref}
        onSearch={search.show}
      />
      <SiteSearchDialog search={search} />
    </div>
  );
}
