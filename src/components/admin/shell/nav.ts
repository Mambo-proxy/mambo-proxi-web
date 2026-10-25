import {
  BookOpen,
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
  MapPin,
  PanelsTopLeft,
  Settings,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from 'next';
import { adminRoutes } from '@/lib/admin/routes';
import type { CurrentUser, Permission, Role, SidebarCounts } from '@/lib/api/schema';
import { hasPermission } from './permissions';

export type AdminNavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
  /** Compteur de la barre latérale (`GET /v1/admin/sidebar-counts`). */
  count?: keyof SidebarCounts;
  /** Permissions donnant accès à l'écran (une seule suffit, comme les `x-permissions` du contrat). */
  permissions: Permission[];
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Navigation de la barre latérale (coque `85:10236`) ; Agenda, Médiathèque et Journal non maquettés (utilisateurs : onglet de Paramètres). */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Pilotage',
    items: [
      {
        label: 'Tableau de bord',
        href: adminRoutes.dashboard,
        icon: LayoutGrid,
        permissions: ['dashboard:read'],
      },
      {
        label: 'Demandes',
        href: adminRoutes.requests,
        icon: FileText,
        count: 'requests',
        permissions: ['requests:read', 'requests:read-assigned'],
      },
      {
        label: 'Rendez-vous',
        href: adminRoutes.appointments,
        icon: Calendar,
        count: 'appointments',
        permissions: ['appointments:read', 'appointments:read-assigned'],
      },
    ],
  },
  {
    label: 'Contenus du site',
    items: [
      { label: 'Services', href: adminRoutes.services, icon: Sparkles, permissions: ['content:read'] },
      {
        label: 'Pages & textes',
        href: adminRoutes.pages,
        icon: PanelsTopLeft,
        permissions: ['content:read'],
      },
      {
        label: 'Avis clients',
        href: adminRoutes.reviews,
        icon: Star,
        count: 'reviews',
        permissions: ['reviews:moderate'],
      },
      { label: 'Partenaires', href: adminRoutes.partners, icon: Handshake, permissions: ['content:read'] },
      {
        label: 'Formations',
        href: adminRoutes.trainings,
        icon: GraduationCap,
        permissions: ['content:read'],
      },
      { label: 'Magazine', href: adminRoutes.magazine, icon: BookOpen, permissions: ['content:read'] },
      { label: 'Zones d’intervention', href: adminRoutes.zones, icon: MapPin, permissions: ['content:read'] },
      {
        label: 'Recrutement',
        href: adminRoutes.jobs,
        icon: Briefcase,
        count: 'applications',
        permissions: ['applications:read'],
      },
      { label: 'Agenda', href: adminRoutes.events, icon: CalendarRange, permissions: ['content:read'] },
      { label: 'Médiathèque', href: adminRoutes.media, icon: Images, permissions: ['content:read'] },
    ],
  },
  {
    label: 'Relations',
    items: [
      {
        label: 'Contacts & inscrits',
        href: adminRoutes.contacts,
        icon: Users,
        permissions: ['contacts:read'],
      },
      { label: 'Newsletter', href: adminRoutes.newsletter, icon: Mail, permissions: ['newsletter:read'] },
    ],
  },
  {
    label: 'Réglages',
    items: [
      { label: 'Paramètres', href: adminRoutes.settings, icon: Settings, permissions: ['settings:read'] },
      // Réservé aux administrateurs (`audit:read`).
      { label: 'Journal d’activité', href: adminRoutes.activity, icon: History, permissions: ['audit:read'] },
    ],
  },
];

/** Groupes et écrans visibles selon les permissions de l'utilisateur ; un groupe vide est masqué. */
export function navFor(user: Pick<CurrentUser, 'permissions'>): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(user, ...item.permissions)),
  })).filter((group) => group.items.length > 0);
}

/**
 * Sous-écrans aux droits plus étroits que leur entrée de menu (écran de saisie ou de réglage).
 * Ex. : un responsable lit les services mais n'en crée pas.
 */
const SUB_SCREENS: { href: string; label: string; permissions: Permission[] }[] = [
  { href: '/admin/services/nouveau', label: 'Nouveau service', permissions: ['content:write'] },
  { href: '/admin/recrutement/offres', label: 'Offre d’emploi', permissions: ['content:read'] },
  {
    href: '/admin/rendez-vous/disponibilites',
    label: 'Disponibilités',
    permissions: ['availability:write'],
  },
];

/**
 * Écran correspondant à une adresse (sous-écran, sinon entrée de menu par préfixe) et permissions exigées ;
 * `null` pour une adresse hors menu (page introuvable).
 */
export function screenFor(pathname: string): { label: string; permissions: Permission[] } | null {
  const sub = SUB_SCREENS.find((screen) => isActive(screen.href, pathname));
  if (sub) return sub;
  for (const group of ADMIN_NAV)
    for (const item of group.items) if (isActive(item.href, pathname)) return item;
  return null;
}

/** Élément actif : correspondance exacte pour le tableau de bord, par préfixe pour les autres écrans. */
export function isActive(href: string, pathname: string): boolean {
  if (href === adminRoutes.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Libellés des rôles (contrat, schéma `Role`) : affichage immédiat dans la coque, sans attendre `GET /v1/admin/roles`
 * (réservé à `team:read`). Les descriptions et permissions viennent de l'API.
 */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur·rice',
  MANAGER: 'Responsable',
  AGENT: 'Chargé·e de clientèle',
  EDITOR: 'Éditeur·rice',
  WRITER: 'Rédacteur·rice',
};
