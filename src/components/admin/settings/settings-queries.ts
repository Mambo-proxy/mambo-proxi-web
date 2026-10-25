'use client';

import { useQuery } from '@tanstack/react-query';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';

export const emailTemplatesKey = ['email-templates'] as const;
export const adminUsersKey = ['admin-users'] as const;
export const systemStatusKey = ['system-status'] as const;

export function useEmailTemplates() {
  return useQuery({
    queryKey: emailTemplatesKey,
    queryFn: () => data(browserApi.GET('/v1/admin/email-templates')),
  });
}

/** Utilisateurs du back-office (réservé aux administrateurs : `enabled` à `false` pour un éditeur). */
export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: adminUsersKey,
    queryFn: () => data(browserApi.GET('/v1/admin/users')),
    enabled,
  });
}

export const rolesKey = ['admin-roles'] as const;

/** Rôles, libellés, périmètres et permissions (`GET /v1/admin/roles`, permission `team:read`). */
export function useRoles(enabled = true) {
  return useQuery({
    queryKey: rolesKey,
    queryFn: () => data(browserApi.GET('/v1/admin/roles')),
    staleTime: Infinity,
    enabled,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: systemStatusKey,
    queryFn: () => data(browserApi.GET('/v1/admin/system-status')),
  });
}
