import {
  getAt,
  isTextPath,
  localTextStatus,
  setPath,
  textEntries,
  type TextRules,
} from '@/lib/admin/translation';
import type { TextTranslationStatus } from '@/lib/api/schema';

/**
 * Version anglaise des paramètres (onglet « English » de Coordonnées et Référencement), mêmes règles que l'API
 * (`SettingsTranslations`) : seuls les textes de la liste blanche se traduisent ; numéros, adresses e-mail,
 * coordonnées GPS, liens et nombres restent ceux du français. Module sans React, partagé avec les gestionnaires
 * simulés.
 */

export type TextGroup = 'coordonnees' | 'whatsapp' | 'seo' | 'chiffres';

type TextFieldSpec = {
  /** Chemin de la liste blanche (`*` = rang). */
  pattern: string;
  /** Libellé ; `{n}` = rang (à partir de 1). */
  label: string;
  multiline?: boolean;
  maxLength: number;
};

/** Champs traduisibles de chaque groupe, dans l'ordre d'affichage (liste blanche de l'API). */
export const SETTINGS_TEXT_FIELDS: Record<TextGroup, TextFieldSpec[]> = {
  coordonnees: [
    { pattern: 'hoursLabel', label: 'Horaires', maxLength: 120 },
    { pattern: 'agency.name', label: 'Nom de l’agence', maxLength: 120 },
    { pattern: 'agency.addressLines.*', label: 'Adresse de l’agence · ligne {n}', maxLength: 160 },
    { pattern: 'agency.openingHours.*.label', label: 'Horaires d’ouverture {n} · Jours', maxLength: 60 },
    { pattern: 'agency.openingHours.*.hours', label: 'Horaires d’ouverture {n} · Heures', maxLength: 60 },
    {
      pattern: 'agency.parcelReceptionNote',
      label: 'Réception des colis et courriers',
      multiline: true,
      maxLength: 300,
    },
  ],
  whatsapp: [{ pattern: 'message', label: 'Message WhatsApp pré-rempli', multiline: true, maxLength: 500 }],
  seo: [
    { pattern: 'defaultTitle', label: 'Titre par défaut', maxLength: 60 },
    { pattern: 'defaultDescription', label: 'Description par défaut', multiline: true, maxLength: 160 },
  ],
  chiffres: [
    { pattern: 'keyFigures.*.label', label: 'Chiffre {n} · Libellé', maxLength: 80 },
    { pattern: 'keyFigures.*.labelMobile', label: 'Chiffre {n} · Libellé en mobile', maxLength: 80 },
    { pattern: 'keyFigures.*.suffix', label: 'Chiffre {n} · Suffixe', maxLength: 16 },
    { pattern: 'keyFigures.*.valueText', label: 'Chiffre {n} · Valeur', maxLength: 24 },
  ],
};

export const isTextGroup = (group: string): group is TextGroup => group in SETTINGS_TEXT_FIELDS;

export function settingsTextRules(group: TextGroup): TextRules {
  return { paths: SETTINGS_TEXT_FIELDS[group].map((field) => field.pattern) };
}

export type SettingsTextField = {
  /** Chemin dans la valeur du groupe (`agency.addressLines.0`). */
  path: string;
  label: string;
  /** Texte français actuel (référence). */
  french: string;
  multiline: boolean;
  maxLength: number;
};

/** Textes français d'un groupe à traduire, dans l'ordre des champs puis des rangs. */
export function settingsTextFields(group: TextGroup, value: unknown): SettingsTextField[] {
  const entries = textEntries(value, settingsTextRules(group));
  return SETTINGS_TEXT_FIELDS[group].flatMap((spec) =>
    entries
      .filter(([path]) => isTextPath(path, { paths: [spec.pattern] }))
      .map(([path, french]) => {
        const rank = path.split('.').find((segment) => /^\d+$/.test(segment));
        return {
          path,
          label: spec.label.replace('{n}', rank === undefined ? '' : String(Number(rank) + 1)),
          french,
          multiline: spec.multiline ?? false,
          maxLength: spec.maxLength,
        };
      }),
  );
}

/** Version anglaise d'un groupe telle que renvoyée par l'API (`translations`). */
export type GroupTranslations = {
  en?: Record<string, unknown> | null;
  reviewedFields?: string[];
};

/** Texte anglais saisi pour un chemin (`''` sans traduction). */
export function englishText(translations: GroupTranslations | undefined, path: string): string {
  const value = getAt(translations?.en, path);
  return typeof value === 'string' ? value : '';
}

/** Saisie d'un texte anglais. */
export function editEnglishText(
  translations: GroupTranslations | undefined,
  path: string,
  value: string,
): GroupTranslations {
  return { ...translations, en: setPath(translations?.en ?? {}, path, value) };
}

/** Champ marqué revu (`reviewedFields`, envoyé avec « Enregistrer »). */
export function markReviewed(translations: GroupTranslations | undefined, path: string): GroupTranslations {
  const reviewed = translations?.reviewedFields ?? [];
  return {
    ...translations,
    en: translations?.en ?? null,
    reviewedFields: reviewed.includes(path) ? reviewed : [...reviewed, path],
  };
}

/**
 * Statut pendant l'édition : à traduire d'après la saisie, à revoir d'après l'API sauf les champs retouchés en
 * anglais ou marqués revus depuis le chargement.
 */
export function localSettingsStatus(
  group: TextGroup,
  value: unknown,
  translations: GroupTranslations | undefined,
  saved: { translations?: GroupTranslations; translationStatus?: { en: TextTranslationStatus } } | undefined,
): TextTranslationStatus {
  const fields = settingsTextFields(group, value);
  const settled = new Set(
    fields
      .filter(
        (field) =>
          translations?.reviewedFields?.includes(field.path) ||
          englishText(translations, field.path) !== englishText(saved?.translations, field.path),
      )
      .map((field) => field.path),
  );
  return localTextStatus(
    fields.map((field) => ({
      path: field.path,
      translated: englishText(translations, field.path).trim() !== '',
    })),
    saved?.translationStatus?.en,
    settled,
  );
}

/** Statut combiné de plusieurs groupes (badge de l'onglet « English »). */
export function combinedState(statuses: (TextTranslationStatus | null | undefined)[]) {
  const states = statuses.map((status) => status?.state);
  if (states.includes('MISSING')) return { state: 'MISSING' as const };
  if (states.includes('OUTDATED')) return { state: 'OUTDATED' as const };
  return { state: 'UP_TO_DATE' as const };
}
