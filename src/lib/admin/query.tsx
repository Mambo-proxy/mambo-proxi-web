'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { toast } from '@/components/ui/toaster';
import { ApiError, errorMessage, toApiError } from '@/lib/api/errors';
import { adminRoutes } from './routes';

/** Session expirée : retour à l'écran de connexion, en revenant ensuite sur la page en cours. */
function onUnauthorized(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401) return;
  const next = `${window.location.pathname}${window.location.search}`;
  // Rechargement complet volontaire : le cache des données de la session expirée est abandonné.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${adminRoutes.login}?suite=${encodeURIComponent(next)}`);
}

function createClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: onUnauthorized }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        onUnauthorized(error);
        // Message d'erreur par défaut, sauf si la mutation gère elle-même l'affichage.
        if (!mutation.options.onError && !(error instanceof ApiError && error.status === 401))
          toast.error(errorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
    },
  });
}

/** Cache des données du back-office (TanStack Query) : un client par onglet. */
export function AdminQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

/**
 * Données d'une réponse d'`openapi-fetch`, ou `ApiError` levée (utilisée dans `queryFn` / `mutationFn`).
 * @example useQuery({ queryKey: ['dashboard'], queryFn: () => data(browserApi.GET('/v1/admin/dashboard')) })
 */
export async function data<T>(request: Promise<ApiResult<T>>): Promise<T> {
  const { data: body, error, response } = await request;
  if (!response.ok) throw toApiError(error, response);
  return body as T;
}
