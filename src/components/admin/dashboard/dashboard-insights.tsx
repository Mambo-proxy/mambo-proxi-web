'use client';

import { useAdmin } from '@/components/admin/shell/admin-context';
import type { Permission } from '@/lib/api/schema';
import { AudienceSection } from './audience-section';
import { TeamPresenceCard } from './team-presence-card';

/**
 * Sections « Audience » (permission `analytics:read`) et « Équipe connectée » (`team:read`) du tableau de bord.
 * Les permissions sont lues sur l'utilisateur connecté (`CurrentUser.permissions`, servies par l'API).
 */
export function DashboardInsights() {
  const { user } = useAdmin();
  const allowed = (permission: Permission) => user.permissions.includes(permission);
  const team = allowed('team:read') ? <TeamPresenceCard /> : null;

  if (allowed('analytics:read')) return <AudienceSection aside={team} />;
  if (team) return <div className="grid grid-cols-1 gap-4 xl:grid-cols-[696fr_400fr]">{team}</div>;
  return null;
}
