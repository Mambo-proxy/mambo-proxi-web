import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createAdminServerClient } from '@/lib/api/server';
import { adminRoutes } from './routes';

/**
 * Utilisateur connecté, vérifié côté serveur auprès de l'API (`GET /v1/auth/me`) : le proxy ne contrôle que la
 * présence d'un cookie. Session absente ou expirée → écran de connexion.
 */
export const requireAdminUser = cache(async () => {
  const client = await createAdminServerClient();
  const { data, response } = await client.GET('/v1/auth/me');
  if (response.status === 401 || response.status === 403 || !data) redirect(adminRoutes.login);
  return data;
});
