import type { CurrentUser, Permission, Role, RoleDefinition } from '@/lib/api/schema';
import { problem } from './problem';

/**
 * Rôles et permissions simulés, recopiés du contrat : matrice du schéma `Role`, libellés et descriptions de
 * l'exemple de `GET /v1/admin/roles`. Le back-office ne code pas cette matrice : il lit `CurrentUser.permissions`
 * et `GET /v1/admin/roles` ; seule la simulation de l'API en a besoin.
 */
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'ADMIN',
    label: 'Administrateur·rice',
    description: 'Tout le back-office, paramètres sensibles, utilisateurs et journal compris.',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'team:read',
      'requests:read',
      'requests:write',
      'requests:assign',
      'requests:export',
      'requests:anonymize',
      'requests:revert-status',
      'appointments:read',
      'appointments:write',
      'appointments:assign',
      'availability:write',
      'applications:read',
      'applications:write',
      'contacts:read',
      'contacts:write',
      'contacts:export',
      'reviews:moderate',
      'content:read',
      'content:write',
      'media:write',
      'newsletter:read',
      'newsletter:write',
      'settings:read',
      'settings:write',
      'settings:admin',
      'users:manage',
      'audit:read',
    ],
  },
  {
    role: 'MANAGER',
    label: 'Responsable',
    description:
      'Demandes, rendez-vous, assignation, candidatures, contacts et statistiques ; contenus en lecture.',
    permissions: [
      'dashboard:read',
      'analytics:read',
      'team:read',
      'requests:read',
      'requests:write',
      'requests:assign',
      'requests:export',
      'requests:anonymize',
      'appointments:read',
      'appointments:write',
      'appointments:assign',
      'availability:write',
      'applications:read',
      'applications:write',
      'contacts:read',
      'contacts:write',
      'contacts:export',
      'reviews:moderate',
      'content:read',
      'newsletter:read',
      'settings:read',
    ],
  },
  {
    role: 'AGENT',
    label: 'Chargé·e de clientèle',
    description: 'Traite les demandes et rendez-vous qui lui sont assignés.',
    permissions: [
      'dashboard:read',
      'requests:read-assigned',
      'requests:write-assigned',
      'appointments:read-assigned',
      'appointments:write-assigned',
    ],
  },
  {
    role: 'EDITOR',
    label: 'Éditeur·rice',
    description: 'Demandes et contenus (périmètre historique, inchangé).',
    permissions: [
      'dashboard:read',
      'team:read',
      'requests:read',
      'requests:write',
      'requests:assign',
      'requests:export',
      'requests:anonymize',
      'appointments:read',
      'appointments:write',
      'appointments:assign',
      'availability:write',
      'applications:read',
      'applications:write',
      'contacts:read',
      'contacts:write',
      'contacts:export',
      'reviews:moderate',
      'content:read',
      'content:write',
      'media:write',
      'newsletter:read',
      'newsletter:write',
      'settings:read',
      'settings:write',
    ],
  },
  {
    role: 'WRITER',
    label: 'Rédacteur·rice',
    description:
      'Contenus du site, magazine et médiathèque ; aucun accès aux demandes ni aux données personnelles.',
    permissions: ['dashboard:read', 'content:read', 'content:write', 'media:write'],
  },
];

export const ROLES: Role[] = ROLE_DEFINITIONS.map((definition) => definition.role);

/** Permissions d'un rôle (matrice du contrat). */
export function permissionsOf(role: Role): Permission[] {
  return [...(ROLE_DEFINITIONS.find((definition) => definition.role === role)?.permissions ?? [])];
}

/** Vrai si l'utilisateur a au moins une des permissions (règle `x-permissions` : une seule suffit). */
export function can(user: Pick<CurrentUser, 'role'> | null | undefined, ...permissions: Permission[]) {
  if (!user) return false;
  const granted = permissionsOf(user.role);
  return permissions.some((permission) => granted.includes(permission));
}

/**
 * Périmètre limité aux dossiers assignés : `…:read-assigned` sans `…:read` (chargé·e de clientèle). Les listes
 * appliquent alors `assignee=me` d'office.
 */
export function assignedOnly(
  user: Pick<CurrentUser, 'role'> | null | undefined,
  domain: 'requests' | 'appointments',
) {
  return !can(user, `${domain}:read`) && can(user, `${domain}:read-assigned`);
}

/** Réponse 403 (Problem) quand la permission manque. */
export function forbidden(detail = 'Votre rôle ne donne pas accès à cette action.') {
  return problem(403, detail);
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** `x-permissions` de chaque opération `/v1/admin` du contrat (extrait de `contracts/openapi.yaml`). */
const OPERATIONS: [Method, string, Permission[]][] = [
  ['GET', '/v1/admin/dashboard', ['dashboard:read']],
  ['GET', '/v1/admin/search', ['dashboard:read']],
  ['GET', '/v1/admin/notifications', ['dashboard:read']],
  ['PATCH', '/v1/admin/notifications/read', ['dashboard:read']],
  ['GET', '/v1/admin/sidebar-counts', ['dashboard:read']],
  ['GET', '/v1/admin/me/tasks', ['dashboard:read']],
  ['GET', '/v1/admin/analytics/summary', ['analytics:read']],
  ['GET', '/v1/admin/requests', ['requests:read', 'requests:read-assigned']],
  ['GET', '/v1/admin/requests/export.csv', ['requests:export']],
  ['GET', '/v1/admin/requests/{id}', ['requests:read', 'requests:read-assigned']],
  ['PATCH', '/v1/admin/requests/{id}', ['requests:write', 'requests:write-assigned', 'requests:assign']],
  ['DELETE', '/v1/admin/requests/{id}', ['requests:anonymize']],
  ['POST', '/v1/admin/requests/{id}/notes', ['requests:write', 'requests:write-assigned']],
  ['POST', '/v1/admin/requests/{id}/duplicate', ['requests:write']],
  ['GET', '/v1/admin/requests/{id}/attachments/{attachmentId}', ['requests:read', 'requests:read-assigned']],
  ['GET', '/v1/admin/services', ['content:read']],
  ['POST', '/v1/admin/services', ['content:write']],
  ['PATCH', '/v1/admin/services/reorder', ['content:write']],
  ['GET', '/v1/admin/services/{id}', ['content:read']],
  ['PATCH', '/v1/admin/services/{id}', ['content:write']],
  ['DELETE', '/v1/admin/services/{id}', ['content:write']],
  ['POST', '/v1/admin/services/{id}/publish', ['content:write']],
  ['POST', '/v1/admin/services/{id}/unpublish', ['content:write']],
  ['POST', '/v1/admin/services/{id}/duplicate', ['content:write']],
  ['GET', '/v1/admin/services/{id}/preview-token', ['content:read']],
  ['GET', '/v1/admin/services/{id}/completeness', ['content:read']],
  ['GET', '/v1/admin/categories', ['content:read']],
  ['POST', '/v1/admin/categories', ['content:write']],
  ['PATCH', '/v1/admin/categories/reorder', ['content:write']],
  ['GET', '/v1/admin/categories/{id}', ['content:read']],
  ['PATCH', '/v1/admin/categories/{id}', ['content:write']],
  ['DELETE', '/v1/admin/categories/{id}', ['content:write']],
  ['GET', '/v1/admin/pages', ['content:read']],
  ['GET', '/v1/admin/pages/{key}', ['content:read']],
  ['PUT', '/v1/admin/pages/{key}', ['content:write']],
  ['POST', '/v1/admin/pages/{key}/publish', ['content:write']],
  ['POST', '/v1/admin/pages/{key}/discard', ['content:write']],
  ['GET', '/v1/admin/pages/{key}/preview-token', ['content:read']],
  ['GET', '/v1/admin/reviews', ['reviews:moderate']],
  ['POST', '/v1/admin/reviews', ['reviews:moderate']],
  ['GET', '/v1/admin/reviews/stats', ['reviews:moderate']],
  ['PATCH', '/v1/admin/reviews/{id}', ['reviews:moderate']],
  ['DELETE', '/v1/admin/reviews/{id}', ['reviews:moderate']],
  ['POST', '/v1/admin/reviews/{id}/reply', ['reviews:moderate']],
  ['GET', '/v1/admin/survey-questions', ['reviews:moderate']],
  ['PUT', '/v1/admin/survey-questions', ['reviews:moderate']],
  ['GET', '/v1/admin/appointments', ['appointments:read', 'appointments:read-assigned']],
  ['POST', '/v1/admin/appointments', ['appointments:write']],
  ['GET', '/v1/admin/appointments/{id}', ['appointments:read', 'appointments:read-assigned']],
  [
    'PATCH',
    '/v1/admin/appointments/{id}',
    ['appointments:write', 'appointments:write-assigned', 'appointments:assign'],
  ],
  ['GET', '/v1/admin/availability', ['appointments:read', 'availability:write']],
  ['PUT', '/v1/admin/availability', ['availability:write']],
  ['GET', '/v1/admin/jobs', ['content:read']],
  ['POST', '/v1/admin/jobs', ['content:write']],
  ['GET', '/v1/admin/jobs/{id}', ['content:read']],
  ['PATCH', '/v1/admin/jobs/{id}', ['content:write']],
  ['DELETE', '/v1/admin/jobs/{id}', ['content:write']],
  ['GET', '/v1/admin/applications', ['applications:read']],
  ['GET', '/v1/admin/applications/{id}', ['applications:read']],
  ['PATCH', '/v1/admin/applications/{id}', ['applications:write']],
  ['GET', '/v1/admin/applications/{id}/cv', ['applications:read']],
  ['GET', '/v1/admin/partners', ['content:read']],
  ['POST', '/v1/admin/partners', ['content:write']],
  ['PATCH', '/v1/admin/partners/reorder', ['content:write']],
  ['PATCH', '/v1/admin/partners/{id}', ['content:write']],
  ['DELETE', '/v1/admin/partners/{id}', ['content:write']],
  ['GET', '/v1/admin/trainings', ['content:read']],
  ['POST', '/v1/admin/trainings', ['content:write']],
  ['PATCH', '/v1/admin/trainings/reorder', ['content:write']],
  ['PATCH', '/v1/admin/trainings/{id}', ['content:write']],
  ['DELETE', '/v1/admin/trainings/{id}', ['content:write']],
  ['GET', '/v1/admin/training-requests', ['requests:read']],
  ['GET', '/v1/admin/magazine', ['content:read']],
  ['POST', '/v1/admin/magazine/editions', ['content:write']],
  ['GET', '/v1/admin/magazine/editions/{id}', ['content:read']],
  ['PATCH', '/v1/admin/magazine/editions/{id}', ['content:write']],
  ['DELETE', '/v1/admin/magazine/editions/{id}', ['content:write']],
  ['POST', '/v1/admin/magazine/editions/{id}/publish', ['content:write']],
  ['POST', '/v1/admin/magazine/editions/{id}/unpublish', ['content:write']],
  ['PUT', '/v1/admin/magazine/editions/{id}/articles', ['content:write']],
  ['GET', '/v1/admin/magazine/editions/{id}/preview-token', ['content:read']],
  ['POST', '/v1/admin/magazine/editions/{id}/newsletter/test', ['newsletter:write']],
  ['POST', '/v1/admin/magazine/editions/{id}/newsletter/schedule', ['newsletter:write']],
  ['GET', '/v1/admin/magazine/articles', ['content:read']],
  ['POST', '/v1/admin/magazine/articles', ['content:write']],
  ['PATCH', '/v1/admin/magazine/articles/{id}', ['content:write']],
  ['DELETE', '/v1/admin/magazine/articles/{id}', ['content:write']],
  ['GET', '/v1/admin/zones', ['content:read']],
  ['POST', '/v1/admin/zones', ['content:write']],
  ['PATCH', '/v1/admin/zones/reorder', ['content:write']],
  ['PATCH', '/v1/admin/zones/{id}', ['content:write']],
  ['DELETE', '/v1/admin/zones/{id}', ['content:write']],
  ['GET', '/v1/admin/events', ['content:read']],
  ['POST', '/v1/admin/events', ['content:write']],
  ['GET', '/v1/admin/events/{id}', ['content:read']],
  ['PATCH', '/v1/admin/events/{id}', ['content:write']],
  ['DELETE', '/v1/admin/events/{id}', ['content:write']],
  ['GET', '/v1/admin/contacts', ['contacts:read']],
  ['GET', '/v1/admin/contacts/export.csv', ['contacts:export']],
  ['GET', '/v1/admin/contacts/{id}', ['contacts:read']],
  ['DELETE', '/v1/admin/contacts/{id}', ['contacts:write']],
  ['GET', '/v1/admin/contacts/{id}/export', ['contacts:export']],
  ['GET', '/v1/admin/subscribers', ['newsletter:read']],
  ['GET', '/v1/admin/subscribers/export.csv', ['contacts:export']],
  ['DELETE', '/v1/admin/subscribers/{id}', ['newsletter:write']],
  ['GET', '/v1/admin/campaigns', ['newsletter:read']],
  ['POST', '/v1/admin/campaigns', ['newsletter:write']],
  ['GET', '/v1/admin/campaigns/segments', ['newsletter:read']],
  ['GET', '/v1/admin/campaigns/{id}', ['newsletter:read']],
  ['PATCH', '/v1/admin/campaigns/{id}', ['newsletter:write']],
  ['DELETE', '/v1/admin/campaigns/{id}', ['newsletter:write']],
  ['GET', '/v1/admin/campaigns/{id}/preview', ['newsletter:read']],
  ['POST', '/v1/admin/campaigns/{id}/test', ['newsletter:write']],
  ['POST', '/v1/admin/campaigns/{id}/schedule', ['newsletter:write']],
  ['POST', '/v1/admin/campaigns/{id}/cancel', ['newsletter:write']],
  ['POST', '/v1/admin/campaigns/{id}/send-now', ['newsletter:write']],
  ['GET', '/v1/admin/settings/{group}', ['settings:read']],
  ['PUT', '/v1/admin/settings/{group}', ['settings:write', 'settings:admin']],
  ['GET', '/v1/admin/system-status', ['settings:read']],
  ['GET', '/v1/admin/email-templates', ['settings:read']],
  ['GET', '/v1/admin/email-templates/{key}', ['settings:read']],
  ['PUT', '/v1/admin/email-templates/{key}', ['settings:write']],
  ['POST', '/v1/admin/email-templates/{key}/preview', ['settings:read']],
  ['POST', '/v1/admin/email-templates/{key}/test', ['settings:write']],
  ['GET', '/v1/admin/users', ['users:manage']],
  ['GET', '/v1/admin/users/presence', ['team:read']],
  ['GET', '/v1/admin/roles', ['team:read']],
  ['POST', '/v1/admin/users/invite', ['users:manage']],
  ['PATCH', '/v1/admin/users/{id}', ['users:manage']],
  ['DELETE', '/v1/admin/users/{id}', ['users:manage']],
  ['POST', '/v1/admin/users/{id}/reset-password', ['users:manage']],
  ['GET', '/v1/admin/media', ['content:read']],
  ['POST', '/v1/admin/media', ['media:write']],
  ['PATCH', '/v1/admin/media/{id}', ['media:write']],
  ['DELETE', '/v1/admin/media/{id}', ['media:write']],
  ['GET', '/v1/admin/audit-log', ['audit:read']],
];

const COMPILED = OPERATIONS.map(([method, path, permissions]) => ({
  method,
  permissions,
  params: (path.match(/\{/g) ?? []).length,
  pattern: new RegExp(`^${path.replace(/\./g, '\.').replace(/\{[^}]+\}/g, '[^/]+')}$`),
}));

/**
 * Permissions exigées par une requête du back-office, ou `null` si l'opération n'est pas décrite. Une adresse
 * littérale l'emporte sur un paramètre (`/requests/export.csv` avant `/requests/{id}`).
 */
export function requiredPermissions(method: string, pathname: string): Permission[] | null {
  const path = pathname.slice(pathname.indexOf('/v1/'));
  const matches = COMPILED.filter(
    (operation) => operation.method === method.toUpperCase() && operation.pattern.test(path),
  ).sort((a, b) => a.params - b.params);
  return matches[0]?.permissions ?? null;
}

/** Contrôle centralisé : 403 si l'utilisateur n'a aucune des permissions de l'opération, sinon `null`. */
export function checkPermissions(request: Request, user: Pick<CurrentUser, 'role'>) {
  const required = requiredPermissions(request.method, new URL(request.url).pathname);
  if (!required || can(user, ...required)) return null;
  return forbidden();
}
