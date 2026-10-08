'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Globe, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { adminRoutes } from '@/lib/admin/routes';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { CurrentUser } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { ROLE_LABELS, isActive, navFor } from './nav';

export const sidebarCountsKey = ['sidebar-counts'] as const;

/** Compteurs de la barre latérale, rafraîchis toutes les minutes. */
export function useSidebarCounts() {
  return useQuery({
    queryKey: sidebarCountsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/sidebar-counts')),
    refetchInterval: 60_000,
  });
}

/** Déconnexion : session révoquée côté API, puis retour à l'écran de connexion. */
export async function logout() {
  await browserApi.POST('/v1/auth/logout').catch(() => undefined);
  window.location.assign(adminRoutes.login);
}

export function Avatar({ initials, size = 36 }: { initials: string; size?: 36 | 38 | 32 }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-orange-100 font-ui font-semibold text-orange-800',
        size === 38 ? 'text-[14px] leading-5' : 'text-[12px] leading-4 tracking-[0.01em]',
      )}
    >
      {initials}
    </span>
  );
}

/**
 * Barre latérale du back-office (`85:10236`) : 264 px à partir de 1280 px ; entre 768 et 1279 px, repliée en icônes
 * (72 px) avec un bouton pour la déplier ; masquée en mobile (navigation basse). Élément actif : fond `orange/50`,
 * icône orange, libellé SemiBold ; compteurs en pastille (orange sur l'élément actif).
 */
export function Sidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const counts = useSidebarCounts().data;
  const [expanded, setExpanded] = useState(false);
  const groups = navFor(user.role);
  // Libellés visibles : toujours en ≥ 1280 px, sur demande entre 768 et 1279 px.
  const labelClass = expanded ? '' : 'md:max-xl:sr-only';

  // La colonne porte le fond et la bordure sur toute la hauteur de la page ; la barre y reste collée à l'écran.
  return (
    <div className="z-30 hidden shrink-0 border-r border-border-default bg-neutral-0 md:block">
      <aside
        aria-label="Back-office"
        className={cn(
          'sticky top-0 flex h-dvh flex-col bg-neutral-0 px-3.5 py-5',
          'xl:w-[264px]',
          expanded ? 'w-[264px] shadow-4 xl:shadow-none' : 'w-[72px] px-2.5 xl:px-3.5',
        )}
      >
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-5">
          <Link
            href={adminRoutes.dashboard}
            className="flex shrink-0 rounded-xs"
            aria-label="Tableau de bord"
          >
            <Image
              src="/brand/logo-horizontal.svg"
              alt=""
              width={288}
              height={80}
              unoptimized
              priority
              className={cn('h-[33px] w-auto', !expanded && 'md:max-xl:hidden')}
            />
            <Image
              src="/brand/logo-symbol.svg"
              alt=""
              width={120}
              height={92}
              unoptimized
              className={cn('hidden h-[30px] w-auto', !expanded && 'md:max-xl:block')}
            />
          </Link>
          <span
            className={cn(
              'rounded-[6px] bg-neutral-100 px-2 py-[3px] font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-muted',
              !expanded && 'md:max-xl:hidden',
            )}
          >
            Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Replier le menu' : 'Déplier le menu'}
          className="mb-1 hidden size-[38px] items-center justify-center self-start rounded-[10px] text-icon-default hover:bg-neutral-100 md:max-xl:flex"
        >
          {expanded ? <PanelLeftClose aria-hidden size={18} /> : <PanelLeftOpen aria-hidden size={18} />}
        </button>

        <nav aria-label="Navigation du back-office" className="-mx-1 flex-1 overflow-y-auto px-1">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5 pt-3 pb-1">
              <p
                className={cn(
                  'px-3 pb-1.5 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-muted uppercase',
                  labelClass,
                )}
              >
                {group.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const count = item.count ? counts?.[item.count] : undefined;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        title={item.label}
                        className={cn(
                          'relative flex items-center gap-3 rounded-[10px] px-3 py-[9px] font-ui text-[14px] leading-5 tracking-[0.005em] transition-colors duration-150',
                          active
                            ? 'bg-orange-50 font-semibold text-text-main'
                            : 'font-medium text-neutral-700 hover:bg-neutral-50 hover:text-text-main',
                        )}
                      >
                        <Icon
                          aria-hidden
                          size={18}
                          className={cn('shrink-0', active ? 'text-brand-primary' : 'text-icon-default')}
                        />
                        <span className={cn('flex-1 truncate', labelClass)}>{item.label}</span>
                        {count ? (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em]',
                              active
                                ? 'bg-brand-primary text-text-on-primary'
                                : 'bg-neutral-100 text-text-main',
                              !expanded &&
                                'md:max-xl:absolute md:max-xl:top-0.5 md:max-xl:right-0.5 md:max-xl:px-1.5 md:max-xl:text-[10px]',
                            )}
                          >
                            {count}
                            <span className="sr-only"> en attente</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <a
          href="/"
          target="_blank"
          rel="noopener"
          title="Voir le site"
          className="mt-3 flex items-center gap-2.5 rounded-md bg-neutral-50 p-3 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:bg-neutral-100"
        >
          <Globe aria-hidden size={18} className="shrink-0" />
          <span className={cn('flex-1', labelClass)}>Voir le site</span>
          <ArrowUpRight aria-hidden size={16} className={cn(!expanded && 'md:max-xl:hidden')} />
          <span className="sr-only"> (nouvel onglet)</span>
        </a>

        <div className="flex items-center gap-2.5 px-1.5 pt-3.5">
          <span className={cn(!expanded && 'md:max-xl:hidden')}>
            <Avatar initials={user.initials ?? user.name.slice(0, 2).toUpperCase()} />
          </span>
          <div className={cn('flex min-w-0 flex-1 flex-col', labelClass)}>
            <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
              {user.name}
            </span>
            <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main"
          >
            <LogOut aria-hidden size={18} />
          </button>
        </div>
      </aside>
    </div>
  );
}
