import type { Navigation } from '@/lib/api/schema';

export type NavItem = Navigation['main'][number];
export type MegaMenu = Navigation['megaMenu'];
export type NavLinkData = Navigation['signUp'][number];

/** Onglet actif : correspondance exacte pour l'accueil, préfixe pour les autres (`/services/...`). */
export function isActive(pathname: string, href: string): boolean {
  const path = href.split(/[?#]/)[0] ?? href;
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}
