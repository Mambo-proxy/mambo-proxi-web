'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { buttonVariants } from '@/components/ui/button';
import type { Navigation } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { DesktopNav } from './desktop-nav';
import { MobileMenu } from './mobile-menu';
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
 */
export function SiteHeader({ navigation, whatsappHref, topBar }: SiteHeaderProps) {
  const { scrolled, goingDown } = useScroll(80);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'sticky top-0 z-40 transition-transform duration-200 ease-standard',
        scrolled && 'xl:-translate-y-9',
        goingDown && !menuOpen && 'max-xl:-translate-y-full',
      )}
    >
      {topBar}
      <header
        className={cn(
          'relative border-b border-border-default backdrop-blur-[24px] transition-[padding,background-color,box-shadow] duration-200 ease-standard',
          'flex items-center justify-between gap-3 px-4 py-3 xl:px-4 wide:px-10',
          scrolled ? 'bg-neutral-0/95 shadow-1 xl:py-[11.5px]' : 'bg-neutral-0/86 xl:py-[18px]',
        )}
      >
        <Logo priority className="h-9 wide:h-10" />
        <DesktopNav
          items={navigation.main}
          megaMenu={navigation.megaMenu}
          signUp={navigation.signUp}
          compact={scrolled}
        />
        <div className="flex items-center gap-2 xl:hidden">
          <Link href={routes.devis} className={buttonVariants({ size: 'sm', shape: 'pill' })}>
            Devis gratuit
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
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
      />
    </div>
  );
}
