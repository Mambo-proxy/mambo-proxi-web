import { localTextStatus } from '@/lib/admin/translation';
import type { AdminZone, TextTranslationStatus } from '@/lib/api/schema';

/**
 * Version anglaise d'une zone (onglet « English » du dialogue) : nom, description et réponse à la recherche
 * (`nameEn`, `descriptionEn`, `resultEn`) ; textes anglais des quartiers suivis par l'API (`quarters.N.detail`,
 * `quarters.N.mapLabel`), non modifiables ici. Module sans React.
 */

export const ZONE_TEXT_FIELDS = [
  { field: 'name', english: 'nameEn', label: 'Nom' },
  { field: 'description', english: 'descriptionEn', label: 'Description' },
  { field: 'result', english: 'resultEn', label: 'Réponse à la recherche' },
] as const;

export type ZoneTextDraft = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  result: string;
  resultEn: string;
  /** Traductions marquées revues (`reviewedFields`, envoyé à l'enregistrement). */
  reviewedFields: string[];
};

/**
 * Statut pendant l'édition : champs à traduire d'après la saisie, à revoir d'après l'API sauf ceux retouchés en
 * anglais ou marqués revus ; textes des quartiers d'après l'API (sauf ceux marqués revus).
 */
export function localZoneStatus(draft: ZoneTextDraft, zone: AdminZone | null): TextTranslationStatus {
  const server = zone?.translationStatus?.en;
  const fields = ZONE_TEXT_FIELDS.filter(({ field }) => draft[field].trim() !== '').map(
    ({ field, english }) => ({
      path: field as string,
      translated: draft[english].trim() !== '',
    }),
  );
  const settled = new Set([
    ...draft.reviewedFields,
    ...ZONE_TEXT_FIELDS.filter(({ english }) => draft[english].trim() !== (zone?.[english] ?? '').trim()).map(
      ({ field }) => field as string,
    ),
  ]);
  const main = localTextStatus(fields, server, settled);
  const quarters = (paths: string[] | undefined) =>
    (paths ?? []).filter((path) => path.startsWith('quarters.') && !settled.has(path));
  const missingFields = [...main.missingFields, ...quarters(server?.missingFields)];
  const outdatedFields = [...main.outdatedFields, ...quarters(server?.outdatedFields)];
  return {
    state: missingFields.length > 0 ? 'MISSING' : outdatedFields.length > 0 ? 'OUTDATED' : 'UP_TO_DATE',
    missingFields,
    outdatedFields,
  };
}

/** « Quartier Akwa · détail » pour un chemin `quarters.N.detail` (textes des quartiers à revoir). */
export function quarterFieldLabel(path: string, quarters: readonly { name: string }[]): string {
  const [, rank, field] = path.split('.');
  const name = quarters[Number(rank)]?.name ?? `Quartier ${Number(rank) + 1}`;
  return `${name} · ${field === 'mapLabel' ? 'étiquette sur la carte' : 'précision'}`;
}
