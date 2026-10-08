import {
  Briefcase,
  Calendar,
  CalendarRange,
  FileText,
  GraduationCap,
  Handshake,
  History,
  Images,
  LayoutGrid,
  Mail,
  PanelsTopLeft,
  Settings,
  Sparkles,
  Star,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from 'next';
import { adminRoutes } from '@/lib/admin/routes';
import type { Role, SidebarCounts } from '@/lib/api/schema';

export type AdminNavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
  /** Compteur de la barre latérale (`GET /v1/admin/sidebar-counts`). */
  count?: keyof SidebarCounts;
  /** Réservé au rôle Administrateur. */
  adminOnly?: boolean;
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Navigation de la barre latérale (coque `85:10236`) ; Agenda, Médiathèque, Utilisateurs et Journal non maquettés. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Pilotage',
    items: [
      { label: 'Tableau de bord', href: adminRoutes.dashboard, icon: LayoutGrid },
      { label: 'Demandes', href: adminRoutes.requests, icon: FileText, count: 'requests' },
      { label: 'Rendez-vous', href: adminRoutes.appointments, icon: Calendar, count: 'appointments' },
    ],
  },
  {
    label: 'Contenus du site',
    items: [
      { label: 'Services', href: adminRoutes.services, icon: Sparkles },
      { label: 'Pages & textes', href: adminRoutes.pages, icon: PanelsTopLeft },
      { label: 'Avis clients', href: adminRoutes.reviews, icon: Star, count: 'reviews' },
      { label: 'Partenaires', href: adminRoutes.partners, icon: Handshake },
      { label: 'Formations', href: adminRoutes.trainings, icon: GraduationCap },
      { label: 'Recrutement', href: adminRoutes.jobs, icon: Briefcase, count: 'applications' },
      { label: 'Agenda', href: adminRoutes.events, icon: CalendarRange },
      { label: 'Médiathèque', href: adminRoutes.media, icon: Images },
    ],
  },
  {
    label: 'Relations',
    items: [
      { label: 'Contacts & inscrits', href: adminRoutes.contacts, icon: Users },
      { label: 'Newsletter', href: adminRoutes.newsletter, icon: Mail },
    ],
  },
  {
    label: 'Réglages',
    items: [
      { label: 'Paramètres', href: adminRoutes.settings, icon: Settings },
      { label: 'Utilisateurs', href: adminRoutes.users, icon: UserCog, adminOnly: true },
      { label: 'Journal d’activité', href: adminRoutes.activity, icon: History, adminOnly: true },
    ],
  },
];

/** Groupes visibles pour un rôle. */
export function navFor(role: Role): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || role === 'ADMIN'),
  }));
}

/** Élément actif : correspondance exacte pour le tableau de bord, par préfixe pour les autres écrans. */
export function isActive(href: string, pathname: string): boolean {
  if (href === adminRoutes.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur·rice',
  EDITOR: 'Éditeur·rice',
};
