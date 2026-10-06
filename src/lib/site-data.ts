import 'server-only';
import { cache } from 'react';
import { unwrap } from './api/result';
import { api, cached } from './api/server';
import { cacheTags } from './api/tags';

/** Paramètres du site (coordonnées, WhatsApp, réseaux…) — une requête par rendu, mise en cache par Next. */
export const getSiteSettings = cache(() =>
  unwrap(api.GET('/v1/site/settings', cached([cacheTags.settings]))),
);

/** Menus, méga-menu et pied de page. */
export const getNavigation = cache(() =>
  unwrap(api.GET('/v1/site/navigation', cached([cacheTags.navigation]))),
);
