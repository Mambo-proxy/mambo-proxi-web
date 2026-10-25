import type { AdminUser, Role, UserRef } from '@/lib/api/schema';
import { can } from './permissions';
import { mockUsers } from './session';

const MINUTE = 60_000;

/** Dernière activité de démonstration (minutes avant le chargement des mocks), comme l'exemple de présence du contrat. */
const ACTIVE_MINUTES_AGO: Record<string, number> = {
  usr_mireille: 1,
  usr_paul: 3,
  usr_carine: 15 * 60,
  usr_equipe: 17 * 60,
  usr_grace: 5 * 24 * 60,
};

/** Utilisateurs du back-office (maquette : Mireille Bell et Équipe Douala, puis un compte de démonstration par rôle). */
export const adminUsers: AdminUser[] = mockUsers.map((user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  initials: user.initials ?? '',
  role: user.role,
  isActive: true,
  status: 'ACTIF',
  invitedAt: null,
  lastLoginAt: user.lastLoginAt ?? null,
  lastActiveAt:
    user.id in ACTIVE_MINUTES_AGO
      ? new Date(Date.now() - ACTIVE_MINUTES_AGO[user.id]! * MINUTE).toISOString()
      : null,
  createdAt: '2026-06-02T09:00:00.000Z',
}));

/** Fenêtre « en ligne » de la présence (`onlineWindowMinutes`). */
export const ONLINE_WINDOW_MINUTES = 5;

/** Activité d'une requête authentifiée (l'API l'écrit au plus une fois par minute). */
export function touchActivity(userId: string, now = Date.now()) {
  const user = adminUsers.find((item) => item.id === userId);
  if (!user) return;
  if (!user.lastActiveAt || now - new Date(user.lastActiveAt).getTime() >= MINUTE)
    user.lastActiveAt = new Date(now).toISOString();
}

/** Le rôle d'un utilisateur change aussi pour sa session simulée (permissions recalculées). */
export function syncSessionRole(userId: string, role: Role) {
  const account = mockUsers.find((user) => user.id === userId);
  if (account) account.role = role;
}

/** Peut recevoir des demandes et des rendez-vous : membre actif avec `requests:read` ou `requests:read-assigned`. */
export function isAssignable(user: AdminUser): boolean {
  return user.status === 'ACTIF' && can(user, 'requests:read', 'requests:read-assigned');
}

/** Membre assignable par identifiant, ou `null` (assignation refusée : 422). */
export function assignableMember(id: string): AdminUser | null {
  const user = adminUsers.find((item) => item.id === id);
  return user && isAssignable(user) ? user : null;
}

export function userRefOf(user: Pick<AdminUser, 'id' | 'name' | 'initials'>): UserRef {
  return { id: user.id, name: user.name, initials: user.initials };
}

export function isOnline(user: AdminUser, now = Date.now()): boolean {
  return (
    user.status === 'ACTIF' &&
    !!user.lastActiveAt &&
    now - new Date(user.lastActiveAt).getTime() < ONLINE_WINDOW_MINUTES * MINUTE
  );
}
