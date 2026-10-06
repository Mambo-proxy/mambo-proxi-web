'use client';

import { ArrowRight, ChevronDown, User } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Visual } from '@/components/ui/visual';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { frenchTypography } from '@/lib/format/typography';
import { CategoryBadge } from './category-badge';
import { isActive, type MegaMenu, type NavItem, type NavLinkData } from './nav-types';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;
const SIGN_UP_KEY = 'inscription';

/** Ouverture au survol avec délai d'intention, fermeture différée (docs/04 — Navigation). */
function useMenuState() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    openKey,
    setOpenKey: (key: string | null) => {
      clear();
      setOpenKey(key);
    },
    hoverOpen: (key: string) => {
      clear();
      timer.current = setTimeout(() => setOpenKey(key), openKey ? 0 : OPEN_DELAY);
    },
    hoverClose: () => {
      clear();
      timer.current = setTimeout(() => setOpenKey(null), CLOSE_DELAY);
    },
    cancelClose: clear,
  };
}

/** Liens du panneau ouvert, pour la navigation aux flèches. */
function panelLinks(panel: HTMLElement | null): HTMLAnchorElement[] {
  return panel ? Array.from(panel.querySelectorAll<HTMLAnchorElement>('a[href]')) : [];
}

function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
  const links = panelLinks(event.currentTarget);
  const index = links.indexOf(document.activeElement as HTMLAnchorElement);
  const next = {
    ArrowDown: index + 1,
    ArrowRight: index + 1,
    ArrowUp: index - 1,
    ArrowLeft: index - 1,
    Home: 0,
    End: links.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  links[(next + links.length) % links.length]?.focus();
}

type DesktopNavProps = {
  items: NavItem[];
  megaMenu: MegaMenu;
  signUp: NavLinkData[];
  compact: boolean;
};

/**
 * Navigation desktop (≥ 1280 px) : 8 onglets (Figma `45:24`), méga-menu « Nos services » (`72:10000`),
 * sous-menus des autres onglets et de « S'inscrire » (non maquettés, même langage).
 * Clavier : `↓` ou `Espace` ouvre le panneau et place le focus sur le premier lien, flèches dans le panneau,
 * `Échap` ferme et rend le focus à l'onglet ; `Entrée` suit le lien de l'onglet.
 */
export function DesktopNav({ items, megaMenu, signUp, compact }: DesktopNavProps) {
  const pathname = usePathname();
  const menu = useMenuState();
  const baseId = useId();
  const panelId = (key: string) => `${baseId}-${key}`;
  const triggerId = (key: string) => `${baseId}-${key}-onglet`;

  // Fermeture au changement de page.
  useEffect(() => {
    menu.setOpenKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function openWithFocus(key: string) {
    menu.setOpenKey(key);
    requestAnimationFrame(() => panelLinks(document.getElementById(panelId(key)))[0]?.focus());
  }

  function close(key: string, restoreFocus: boolean) {
    menu.setOpenKey(null);
    if (restoreFocus) document.getElementById(triggerId(key))?.focus();
  }

  function triggerKeyDown(event: KeyboardEvent<HTMLElement>, key: string) {
    if (event.key === 'ArrowDown' || event.key === ' ') {
      event.preventDefault();
      openWithFocus(key);
    } else if (event.key === 'Escape') {
      close(key, true);
    }
  }

  function panelProps(key: string) {
    return {
      id: panelId(key),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(key, true);
          return;
        }
        onPanelKeyDown(event);
      },
      onMouseEnter: menu.cancelClose,
      onMouseLeave: menu.hoverClose,
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        const next = event.relatedTarget as Node | null;
        if (next && !event.currentTarget.contains(next) && next !== document.getElementById(triggerId(key)))
          menu.setOpenKey(null);
      },
    };
  }

  const megaOpen = menu.openKey === 'services';

  return (
    <>
      <nav aria-label="Navigation principale" className="hidden xl:block">
        <ul className="flex items-center gap-1 wide:gap-2.5">
          {items.map((item) => {
            const active =
              isActive(pathname, item.href) || (item.key === 'services' && pathname.startsWith('/services'));
            const hasPanel = item.kind !== 'link';
            const open = menu.openKey === item.key;
            return (
              <li
                key={item.key}
                className="relative"
                onMouseEnter={hasPanel ? () => menu.hoverOpen(item.key) : undefined}
                onMouseLeave={hasPanel ? menu.hoverClose : undefined}
              >
                <Link
                  href={item.href as Route}
                  id={triggerId(item.key)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  aria-expanded={hasPanel ? open : undefined}
                  aria-controls={hasPanel ? panelId(item.key) : undefined}
                  onKeyDown={hasPanel ? (event) => triggerKeyDown(event, item.key) : undefined}
                  className={cn(
                    'group/tab flex flex-col items-center gap-1 rounded-sm px-1 py-2 font-ui text-[14px] leading-5 tracking-[0.005em]',
                    active || open
                      ? 'font-semibold text-text-main'
                      : 'font-medium text-neutral-700 hover:text-text-main',
                  )}
                >
                  <span className="flex items-center gap-0.5 whitespace-nowrap">
                    {frenchTypography(item.label)}
                    {hasPanel && (
                      <ChevronDown
                        aria-hidden
                        size={14}
                        className={cn('transition-transform duration-200', open && 'rotate-180')}
                      />
                    )}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'size-[5px] rounded-full bg-brand-primary transition-[opacity,transform] duration-200',
                      active
                        ? 'scale-100 opacity-100'
                        : 'scale-50 opacity-0 group-hover/tab:scale-100 group-hover/tab:opacity-100',
                    )}
                  />
                </Link>
                {item.kind === 'dropdown' && item.children && (
                  <Dropdown open={open} links={item.children} {...panelProps(item.key)} />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden items-center gap-2.5 xl:flex">
        <div
          className="relative"
          onMouseEnter={() => menu.hoverOpen(SIGN_UP_KEY)}
          onMouseLeave={menu.hoverClose}
        >
          <button
            type="button"
            id={triggerId(SIGN_UP_KEY)}
            aria-expanded={menu.openKey === SIGN_UP_KEY}
            aria-controls={panelId(SIGN_UP_KEY)}
            onClick={() =>
              menu.openKey === SIGN_UP_KEY ? menu.setOpenKey(null) : openWithFocus(SIGN_UP_KEY)
            }
            onKeyDown={(event) => triggerKeyDown(event, SIGN_UP_KEY)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-border-strong px-3.5 py-3 font-ui text-[14px] leading-5 font-semibold text-text-main transition-colors hover:bg-neutral-100"
          >
            <User aria-hidden size={18} />
            S&apos;inscrire
          </button>
          <Dropdown
            open={menu.openKey === SIGN_UP_KEY}
            links={signUp}
            align="right"
            {...panelProps(SIGN_UP_KEY)}
          />
        </div>
        <Link href={routes.devis} className={buttonVariants()}>
          Devis gratuit
        </Link>
      </div>

      {/* Méga-menu : panneau sous l'en-tête et voile sur la page. */}
      <div
        aria-hidden
        onClick={() => menu.setOpenKey(null)}
        className={cn(
          'absolute inset-x-0 top-full z-10 hidden h-dvh bg-neutral-900/35 transition-opacity duration-200 xl:block',
          megaOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <MegaPanel
        open={megaOpen}
        menu={megaMenu}
        compact={compact}
        {...panelProps('services')}
        onMouseEnter={menu.cancelClose}
      />
    </>
  );
}

type PanelProps = {
  id: string;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
};

function panelClasses(open: boolean) {
  return cn(
    'origin-top transition-[opacity,transform,visibility] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0',
  );
}

/** Sous-menu simple (non maquetté) : carte blanche rayon 20, `elevation/4`, lignes avec pastille d'icône. */
function Dropdown({
  open,
  links,
  align = 'left',
  ...panel
}: PanelProps & { open: boolean; links: NavLinkData[]; align?: 'left' | 'right' }) {
  return (
    <div
      {...panel}
      className={cn(
        'absolute top-full z-20 pt-3',
        align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2',
        open ? '' : 'pointer-events-none',
      )}
    >
      <ul
        className={cn(
          'flex w-72 flex-col gap-0.5 rounded-[20px] border border-border-default bg-neutral-0 p-2 shadow-4',
          panelClasses(open),
        )}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href as Route}
              tabIndex={open ? undefined : -1}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 font-ui text-[14px] leading-5 font-medium text-text-main transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50"
            >
              {link.icon && (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-neutral-700">
                  <Icon name={link.icon} size={16} />
                </span>
              )}
              {frenchTypography(link.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Méga-menu « Nos services » : panneau blanc (marges 40 à 1440 → 1360 px), rayon 28, p 32, gap 32, `elevation/4` ;
 * 4 colonnes (gap 28) + encart promo sombre 280 px. Colonnes en cascade (60 ms).
 */
function MegaPanel({
  open,
  menu,
  compact,
  ...panel
}: PanelProps & { open: boolean; menu: MegaMenu; compact: boolean }) {
  return (
    <div
      {...panel}
      className={cn(
        'absolute inset-x-10 top-full z-20 hidden pt-[11px] xl:block',
        compact && 'pt-2',
        open ? '' : 'pointer-events-none',
      )}
    >
      <div
        className={cn(
          'flex gap-8 rounded-[28px] border border-border-default bg-neutral-0 p-8 shadow-4',
          panelClasses(open),
        )}
      >
        <div className="grid flex-1 grid-cols-4 gap-7">
          {menu.categories.map((category, index) => (
            <div
              key={category.slug}
              style={{ transitionDelay: open ? `${index * 60}ms` : '0ms' }}
              className={cn(
                'flex flex-col gap-3.5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                open ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
              )}
            >
              <div className="flex flex-col gap-4 border-b border-border-default pb-4">
                <div className="flex items-center gap-2.5">
                  <CategoryBadge icon={category.icon} tint={category.tint} />
                  <div className="flex flex-col">
                    <p className="font-ui text-[15px] leading-6 font-semibold text-text-main">
                      {frenchTypography(category.name)}
                    </p>
                    <p className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                      {frenchTypography(category.tagline)}
                    </p>
                  </div>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {category.services.map((service) => (
                  <li key={service.slug}>
                    <PanelLink href={service.href} open={open}>
                      {frenchTypography(service.name)}
                    </PanelLink>
                  </li>
                ))}
              </ul>
              <Link
                href={category.href as Route}
                tabIndex={open ? undefined : -1}
                className="group/more inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
              >
                Toute la rubrique
                <ArrowRight
                  aria-hidden
                  size={16}
                  className="transition-transform duration-200 group-hover/more:translate-x-[3px]"
                />
              </Link>
            </div>
          ))}
        </div>
        <aside className="flex w-[280px] shrink-0 flex-col gap-3.5 self-start rounded-[22px] bg-neutral-900 p-6">
          <Visual
            visual={{ illustration: menu.promo.illustration, image: null, alt: '' }}
            sizes="232px"
            className="h-[130px] w-full rounded-lg"
          />
          <p className="font-ui text-[16px] leading-6 font-semibold text-neutral-0">
            {frenchTypography(menu.promo.title)}
          </p>
          <p className="font-ui text-[14px] leading-5 text-neutral-300">
            {frenchTypography(menu.promo.text)}
          </p>
          <Link
            href={menu.promo.cta.href as Route}
            tabIndex={open ? undefined : -1}
            className={cn(buttonVariants({ fullWidth: true }), 'focus-visible:focus-ring-inverse')}
          >
            {menu.promo.cta.label}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function PanelLink({ href, open, children }: { href: string; open: boolean; children: ReactNode }) {
  return (
    <Link
      href={href as Route}
      tabIndex={open ? undefined : -1}
      className="block rounded-xs font-ui text-[14px] leading-5 text-text-main transition-colors hover:text-text-brand"
    >
      {children}
    </Link>
  );
}
