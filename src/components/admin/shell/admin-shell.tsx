'use client';

import type { ReactNode } from 'react';
import { AdminQueryProvider } from '@/lib/admin/query';
import type { CurrentUser } from '@/lib/api/schema';
import { AdminContextProvider } from './admin-context';
import { BottomNav, MobileBar } from './mobile-nav';
import { SearchPalette } from './search-palette';
import { Sidebar } from './sidebar';

/**
 * Coque du back-office : barre latérale (≥ 768 px), barre mobile et navigation basse (< 768 px), palette ⌘K.
 * Fond de contenu `neutral/50`.
 */
export function AdminShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return (
    <AdminQueryProvider>
      <AdminContextProvider user={user}>
        <a
          href="#contenu-admin"
          className="sr-only z-50 rounded-md bg-neutral-900 px-4 py-3 font-ui text-[14px] font-semibold text-neutral-0 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>
        <div className="flex min-h-dvh bg-neutral-50">
          <Sidebar user={user} />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileBar />
            <main id="contenu-admin" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
        <SearchPalette />
      </AdminContextProvider>
    </AdminQueryProvider>
  );
}
