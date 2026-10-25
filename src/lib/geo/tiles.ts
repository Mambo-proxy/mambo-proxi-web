/**
 * Fond de la carte interactive des zones (Leaflet). Par défaut, les tuiles raster d'OpenStreetMap : service gratuit
 * soumis à la politique d'usage de la fondation OSM (https://operations.osmfoundation.org/policies/tiles/) —
 * attribution visible, pas de préchargement ni de téléchargement en masse, trafic modéré. Pour un trafic de
 * production soutenu, passer à un fournisseur dédié (MapTiler, Stadia Maps, Thunderforest, serveur de tuiles propre)
 * avec `NEXT_PUBLIC_MAP_TILES_URL` (gabarit `{z}/{x}/{y}`, clé d'API incluse) et `NEXT_PUBLIC_MAP_TILES_CREDIT`
 * (mention du fournisseur, ajoutée à celle d'OpenStreetMap). L'origine des tuiles est ajoutée aux CSP (`img-src`).
 */

export const DEFAULT_TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Mention obligatoire des données OpenStreetMap (licence ODbL). */
export const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';

export const mapTiles = {
  url: process.env.NEXT_PUBLIC_MAP_TILES_URL || DEFAULT_TILES_URL,
  /** Mention du fournisseur de tuiles (texte), affichée après celle d'OpenStreetMap ; vide avec les tuiles OSM. */
  credit: process.env.NEXT_PUBLIC_MAP_TILES_CREDIT || null,
  maxZoom: 18,
};

/**
 * Origine d'un gabarit de tuiles pour la CSP : `https://tile.openstreetmap.org` ; un sous-domaine variable
 * (`https://{s}.tile.example.com/…`) devient un joker (`https://*.tile.example.com`). `null` si illisible.
 */
export function tilesOrigin(template: string = mapTiles.url): string | null {
  const match = /^(https?:\/\/)([^/?#]+)/i.exec(template.trim());
  if (!match) return null;
  const host = match[2]!.replace(/\{[^}]*\}/g, '*');
  if (!/^(\*\.)?[a-z0-9.-]+(:\d+)?$/i.test(host)) return null;
  return `${match[1]!.toLowerCase()}${host.toLowerCase()}`;
}
