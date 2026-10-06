'use client';

import { ChevronRight, Minus, Plus, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { buttonVariants } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { frenchTypography } from '@/lib/format/typography';
import { CategoryBadge } from './category-badge';
import { isActive, type MegaMenu, type NavItem } from './nav-types';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  megaMenu: MegaMenu;
  whatsappHref: string | null;
};

/**
 * Menu mobile plein écran (Figma `72:10211`) : `<dialog>` modal (page inerte, focus piégé, `Échap`),
 * glissement depuis la droite (300 ms), accordéons +/−, fermeture au changement de page.
 */
export function MobileMenu({ open, onClose, items, megaMenu, whatsappHref }: MobileMenuProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(() =>
    pathname.startsWith('/services') ? 'services' : null,
  );

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      aria-label="Menu"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'm-0 ml-auto h-dvh max-h-dvh w-full max-w-full overflow-hidden bg-neutral-0 p-0 text-text-main backdrop:bg-transparent xl:hidden',
        'translate-x-0 transition-[translate,display,overlay] transition-discrete duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'not-open:translate-x-full motion-reduce:transition-none starting:open:translate-x-full',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo className="h-9" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-text-main"
          >
            <X aria-hidden size={22} />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-5 py-2">
          <ul>
            {items.map((item, index) => (
              <li
                key={item.key}
                style={{ transitionDelay: open ? `${Math.min(index, 6) * 60}ms` : '0ms' }}
                className={cn(
                  'border-b border-border-default transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                )}
              >
                {item.kind === 'link' ? (
                  <Link
                    href={item.href as Route}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    className="block py-[13px] font-brand text-[19px] leading-7 font-semibold"
                  >
                    {frenchTypography(item.label)}
                  </Link>
                ) : (
                  <AccordionItem
                    item={item}
                    megaMenu={megaMenu}
                    expanded={expanded === item.key}
                    onToggle={() => setExpanded(expanded === item.key ? null : item.key)}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2.5 border-t border-border-default px-5 pt-4 pb-7">
          <div className="flex gap-2.5">
            <Link
              href={routes.inscription}
              className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 px-4 py-[13px]')}
            >
              S&apos;inscrire
            </Link>
            <Link href={routes.devis} className={cn(buttonVariants(), 'flex-1')}>
              Devis gratuit
            </Link>
          </div>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'whatsapp', fullWidth: true })}
            >
              Écrire sur WhatsApp
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}

function AccordionItem({
  item,
  megaMenu,
  expanded,
  onToggle,
}: {
  item: NavItem;
  megaMenu: MegaMenu;
  expanded: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={onToggle}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between py-[13px] text-left font-brand text-[19px] leading-7 font-semibold',
          expanded && 'text-text-brand',
        )}
      >
        {frenchTypography(item.label)}
        {expanded ? <Minus aria-hidden size={20} /> : <Plus aria-hidden size={20} />}
      </button>
      <div
        id={id}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul
          className={cn('flex min-h-0 flex-col gap-2 overflow-hidden', expanded && 'pb-3')}
          inert={!expanded}
        >
          {item.kind === 'mega'
            ? megaMenu.categories.map((category) => (
                <li key={category.slug}>
                  <SubmenuRow href={category.href}>
                    <CategoryBadge icon={category.icon} tint={category.tint} onLight />
                    <span className="flex flex-1 flex-col">
                      <span className="font-ui text-[14px] leading-5 font-semibold">
                        {frenchTypography(category.name)}
                      </span>
                      <span className="font-ui text-[12px] leading-4 text-text-muted">
                        {category.services.length} services
                      </span>
                    </span>
                  </SubmenuRow>
                </li>
              ))
            : item.children?.map((link) => (
                <li key={link.href}>
                  <SubmenuRow href={link.href}>
                    {link.icon && (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-neutral-0 text-neutral-700">
                        <Icon name={link.icon} size={17} />
                      </span>
                    )}
                    <span className="flex-1 font-ui text-[14px] leading-5 font-semibold">
                      {frenchTypography(link.label)}
                    </span>
                  </SubmenuRow>
                </li>
              ))}
        </ul>
      </div>
    </>
  );
}

function SubmenuRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as Route}
      className="flex min-h-[54px] items-center gap-3 rounded-lg bg-neutral-50 px-3 py-[9px] text-text-main"
    >
      {children}
      <ChevronRight aria-hidden size={16} className="shrink-0 text-icon-default" />
    </Link>
  );
}
