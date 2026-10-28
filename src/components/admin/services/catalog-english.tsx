'use client';

import { CheckCheck, Languages } from 'lucide-react';
import { StatusPill } from '@/components/admin/editor/editor-ui';
import { TextTranslationField } from '@/components/admin/pages/translation-editor';
import { Button } from '@/components/ui/button';
import { FIELD_STATE_LABELS } from '@/lib/admin/translation';
import type { TextTranslationStatus } from '@/lib/api/schema';
import {
  catalogFieldState,
  englishAt,
  UNIT_LABELS,
  type CatalogTextField,
  type EnglishTexts,
} from './catalog-translation';

/**
 * Champs anglais d'un service ou d'une rubrique, groupés comme le formulaire français : un champ par texte
 * français (rappelé en aide), badge « À traduire » / « À revoir ». Un texte seul se marque revu sur son champ ; une
 * liste (étapes, FAQ, carte d'accueil…) a un encadré avec son badge et « Marquer comme revu ».
 */
export function CatalogEnglishFields({
  fields,
  english,
  status,
  readOnly,
  errorFor,
  onChange,
  onMarkReviewed,
}: {
  /** Textes français à traduire (`catalogTextFields`), dans l'ordre d'affichage. */
  fields: CatalogTextField[];
  english: EnglishTexts | null | undefined;
  /** Statut pendant l'édition (`localCatalogStatus`). */
  status: TextTranslationStatus;
  readOnly: boolean;
  /** Erreur de l'API pour un texte (`translations.en.<chemin>`). */
  errorFor: (path: string) => string | null;
  onChange: (path: string, value: string) => void;
  onMarkReviewed: (unit: string) => void;
}) {
  if (fields.length === 0)
    return (
      <p className="flex items-start gap-2 font-ui text-[14px] leading-5 text-text-muted">
        <Languages aria-hidden size={16} className="mt-0.5 shrink-0" />
        Aucun texte à traduire pour l’instant : remplissez d’abord la version française.
      </p>
    );
  const units = [...new Set(fields.map((field) => field.unit))];
  const renderField = (field: CatalogTextField, withUnitState: boolean) => (
    <TextTranslationField
      key={field.path}
      label={field.label}
      french={field.french}
      value={englishAt(english, field.path)}
      error={errorFor(field.path)}
      multiline={field.multiline ?? false}
      accent={field.accent ?? false}
      maxLength={field.maxLength}
      state={
        withUnitState
          ? catalogFieldState(field, english, status)
          : englishAt(english, field.path).trim() === ''
            ? 'missing'
            : null
      }
      onMarkReviewed={withUnitState && !readOnly ? () => onMarkReviewed(field.unit) : undefined}
      onChange={(value) => onChange(field.path, value)}
    />
  );
  return (
    <>
      {units.map((unit) => {
        const own = fields.filter((field) => field.unit === unit);
        const single = own.length === 1 && own[0]!.path === unit;
        if (single) return renderField(own[0]!, true);
        const state = status.missingFields.includes(unit)
          ? 'missing'
          : status.outdatedFields.includes(unit)
            ? 'outdated'
            : null;
        return (
          <div
            key={unit}
            role="group"
            aria-label={UNIT_LABELS[unit] ?? unit}
            className="flex flex-col gap-3 rounded-md border border-border-default p-3.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                {UNIT_LABELS[unit] ?? unit}
              </span>
              {state && (
                <StatusPill tone={state === 'missing' ? 'brand' : 'neutral'} className="py-0">
                  {FIELD_STATE_LABELS[state]}
                </StatusPill>
              )}
            </div>
            {state === 'outdated' && !readOnly && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Button variant="outline" size="sm" onClick={() => onMarkReviewed(unit)}>
                  <CheckCheck aria-hidden />
                  Marquer comme revu
                </Button>
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  Le texte français a changé : si la traduction reste juste, marquez-la comme revue.
                </span>
              </div>
            )}
            {own.map((field) => renderField(field, false))}
          </div>
        );
      })}
    </>
  );
}
