'use client';

import { Calendar, Ellipsis, FileText, LayoutGrid, LogOut, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { adminRoutes } from '@/lib/admin/routes';
import { cn } from '@/lib/cn';
import { useAdmin } from './admin-context';
import { ROLE_LABELS, isActive, navFor } from './nav';
import { NotificationsButton } from './notifications';
import { Avatar, logout } from './sidebar';

/** Barre mobile du back-office (`95:11778`) : logo, recherche, notifications 38 × 38, avatar (menu du compte). */
export function MobileBar() {
  const { user, setSearchOpen } = useAdmin();
  const [account, setAccount] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border-default bg-neutral-0 px-4 py-3.5 md:hidden">
      <Link href={adminRoutes.dashboard} aria-label="Tableau de bord" className="flex rounded-xs">
        <Image
          src="/brand/logo-horizontal.svg"
          alt=""
          width={288}
          height={80}
          unoptimized
          className="h-8 w-auto"
        />
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Rechercher"
          className="flex size-[38px] items-center justify-center rounded-[10px] border border-border-default bg-neutral-0"
        >
          <Search aria-hidden size={18} />
        </button>
        <NotificationsButton size={38} />
        <button
          type="button"
          onClick={() => setAccount(true)}
          aria-label="Mon compte"
          className="rounded-full"
        >
          <Avatar initials={user.initials ?? user.name.slice(0, 2).toUpperCase()} size={38} />
        </button>
      </div>
      <Modal
        open={account}
        onClose={() => setAccount(false)}
        title={user.name}
        description={ROLE_LABELS[user.role]}
      >
        <div className="flex flex-col gap-3 pb-2">
          <p className="font-ui text-[14px] leading-5 text-text-muted">{user.email}</p>
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="rounded-md bg-neutral-50 p-3 font-ui text-[14px] leading-5 font-semibold text-text-main"
          >
            Voir le site <span className="sr-only">(nouvel onglet)</span>
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-md p-3 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-100"
          >
            <LogOut aria-hidden size={18} />
            Se déconnecter
          </button>
        </div>
      </Modal>
    </header>
  );
}

const TABS = [
  { label: 'Accueil', href: adminRoutes.dashboard, icon: LayoutGrid },
  { label: 'Demandes', href: adminRoutes.requests, icon: FileText },
  { label: 'Agenda', href: adminRoutes.appointments, icon: Calendar },
  { label: 'Avis', href: adminRoutes.reviews, icon: Star },
];

const tabClass = 'flex flex-col items-center gap-1 font-ui text-[11px] leading-4';

/** Pastille de l'icône (padding 4/14, rayon 999), fond `orange/50` sur l'onglet actif. */
function Pill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'flex rounded-full px-3.5 py-1',
        active ? 'bg-orange-50 text-text-main' : 'text-icon-default',
      )}
    >
      {children}
    </span>
  );
}

/**
 * Navigation basse mobile (`95:11876`) : Accueil, Demandes, Agenda, Avis, Plus (tous les écrans).
 * Élément actif : pastille `orange/50` autour de l'icône, libellé SemiBold.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAdmin();
  const [more, setMore] = useState(false);
  const inTabs = TABS.some((tab) => isActive(tab.href, pathname));

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-between border-t border-border-default bg-neutral-0 px-[18px] pt-2.5 pb-[max(24px,env(safe-area-inset-bottom))] md:hidden"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.href, pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                tabClass,
                active ? 'font-semibold text-text-main' : 'font-medium text-text-muted',
              )}
            >
              <Pill active={active}>
                <Icon aria-hidden size={20} />
              </Pill>
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          aria-haspopup="dialog"
          className={cn(tabClass, !inTabs ? 'font-semibold text-text-main' : 'font-medium text-text-muted')}
        >
          <Pill active={!inTabs}>
            <Ellipsis aria-hidden size={20} />
          </Pill>
          Plus
        </button>
      </nav>
      <Modal open={more} onClose={() => setMore(false)} title="Tous les écrans">
        <nav aria-label="Tous les écrans du back-office" className="flex flex-col gap-4 pb-2">
          {navFor(user.role).map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-muted uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActive(item.href, pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMore(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2.5 font-ui text-[15px] leading-6',
                      active ? 'bg-orange-50 font-semibold' : 'font-medium text-neutral-700',
                    )}
                  >
                    <Icon
                      aria-hidden
                      size={18}
                      className={active ? 'text-brand-primary' : 'text-icon-default'}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </Modal>
    </>
  );
}
