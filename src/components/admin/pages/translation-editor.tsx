'use client';

import { CheckCheck, ChevronRight, CircleAlert, Languages, Minus } from 'lucide-react';
import { Fragment, useId, type ReactNode } from 'react';
import { StatusPill } from '@/components/admin/editor/editor-ui';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { ReadOnlyFieldset } from '@/components/admin/shell/permissions';
import { AccentText } from '@/components/ui/accent-text';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import type { PageSection, Seo } from '@/lib/api/schema';
import { FIELD_STATE_LABELS, type FieldTranslationState } from '@/lib/admin/translation';
import { cn } from '@/lib/cn';
import { useFieldError } from './fields';
import { sectionDescription, sectionLabel } from './page-model';
import {
  getAt,
  translatableFields,
  type EnglishDraft,
  type SectionTranslationState,
  type TranslatableField,
} from './page-translation';
import { sectionToggleId } from './section-card';

/**
 * Onglet « English » de l'éditeur de page : mêmes sections, dans le même ordre, mais seuls les textes se modifient.
 * Images, liens, réglages d'affichage, visibilité et structure (sections, éléments de listes) sont ceux de la
 * version française. Chaque champ rappelle le texte français à traduire.
 */

export type EditorLanguage = 'fr' | 'en';

export const languagePanelId = (lang: EditorLanguage, prefix = 'page-editor') => `${prefix}-${lang}`;
export const languageTabId = (lang: EditorLanguage, prefix = 'page-editor') => `${prefix}-tab-${lang}`;

/**
 * Onglets « Français | English » ; badge « À traduire » / « À revoir » sur l'anglais. Réutilisés par les autres
 * éditeurs bilingues (paramètres, zones…) : `idPrefix` distingue leurs identifiants (`languagePanelId(lang, prefix)`
 * pour le panneau associé).
 */
export function LanguageTabs({
  value,
  onChange,
  badge,
  idPrefix = 'page-editor',
}: {
  value: EditorLanguage;
  onChange: (lang: EditorLanguage) => void;
  badge: string | null;
  idPrefix?: string;
}) {
  const tabs: { lang: EditorLanguage; label: string }[] = [
    { lang: 'fr', label: 'Français' },
    { lang: 'en', label: 'English' },
  ];
  return (
    <div
      role="tablist"
      aria-label="Langue du contenu"
      className="flex w-fit gap-1 rounded-md border border-border-default bg-neutral-0 p-1"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        const next = value === 'fr' ? 'en' : 'fr';
        onChange(next);
        document.getElementById(languageTabId(next, idPrefix))?.focus();
      }}
    >
      {tabs.map(({ lang, label }) => {
        const selected = value === lang;
        return (
          <button
            key={lang}
            type="button"
            role="tab"
            id={languageTabId(lang, idPrefix)}
            aria-selected={selected}
            aria-controls={selected ? languagePanelId(lang, idPrefix) : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(lang)}
            className={cn(
              'inline-flex items-center gap-2 rounded-sm px-3 py-1.5 font-ui text-[14px] leading-5 transition-colors',
              selected
                ? 'bg-orange-50 font-semibold text-text-brand'
                : 'font-medium text-neutral-700 hover:bg-neutral-50',
            )}
          >
            <span lang={lang}>{label}</span>
            {lang === 'en' && badge && (
              <StatusPill tone="warning" className="py-0">
                {badge}
              </StatusPill>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Texte brut d'un HTML (référence française d'un article), raccourci. */
function plain(text: string, max = 280): string {
  const flat = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Aide sous un champ anglais : texte français de référence. */
function frenchReference(french: string, value: string, rich = false): ReactNode {
  return (
    <>
      Français : <span className="text-text-main">{rich ? plain(french) : plain(french, 400)}</span>
      {value.trim() === french.trim() && ' · identique au français, à traduire'}
    </>
  );
}

/** Champ anglais d'un texte des pages : erreur de l'API lue dans le contexte de l'éditeur (`en.sections.3.title`). */
function TranslationField({
  errorPath,
  ...props
}: Omit<TextTranslationFieldProps, 'error'> & { errorPath: string }) {
  return <TextTranslationField {...props} error={useFieldError(errorPath)} />;
}

export type TextTranslationFieldProps = Omit<TranslatableField, 'path' | 'group' | 'rich' | 'accent'> & {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  /** Texte mis en forme (éditeur riche). */
  rich?: boolean;
  /** Texte mis en avant avec `==…==` (aperçu). */
  accent?: boolean;
  /** État du champ : badge « À traduire » / « À revoir ». */
  state?: FieldTranslationState;
  /** « Marquer comme revu » (champ « À revoir »), absent en lecture seule. */
  onMarkReviewed?: () => void;
  /** Saisie limitée (mêmes limites que le français). */
  maxLength?: number;
};

/**
 * Champ anglais d'un texte, réutilisable par tous les éditeurs bilingues : saisie, texte français de référence en
 * aide, erreur, badge d'état et « Marquer comme revu » pour un champ dont le français a changé.
 */
export function TextTranslationField({
  label,
  value,
  french,
  error,
  multiline,
  rich = false,
  accent = false,
  state = null,
  onMarkReviewed,
  maxLength,
  onChange,
}: TextTranslationFieldProps) {
  if (rich)
    return (
      <div className="flex flex-col gap-1">
        <RichTextEditor
          label={label}
          value={value}
          onChange={onChange}
          headings={[2, 3]}
          minHeight={120}
          error={error}
        />
        <details className="font-ui text-[12px] leading-4 text-text-muted">
          <summary className="cursor-pointer">Voir le texte français</summary>
          <p className="mt-1 whitespace-pre-line">{plain(french, 4000)}</p>
        </details>
      </div>
    );
  const field = (
    <Field
      label={
        state ? (
          <span className="inline-flex flex-wrap items-center gap-2">
            {label}
            <StatusPill tone={state === 'missing' ? 'brand' : 'neutral'} className="py-0">
              {FIELD_STATE_LABELS[state]}
            </StatusPill>
          </span>
        ) : (
          label
        )
      }
      error={error}
      help={
        <>
          {frenchReference(french, value)}
          {accent && value.includes('==') && (
            <span className="mt-1 block text-text-main">
              Aperçu : <AccentText text={value} />
            </span>
          )}
        </>
      }
    >
      {(control) =>
        multiline || accent || value.length > 90 ? (
          <Textarea
            {...control}
            lang="en"
            rows={1}
            value={value}
            maxLength={maxLength}
            placeholder={plain(french, 120)}
            onChange={(event) => onChange(event.target.value)}
            className="field-sizing-content min-h-0 resize-none"
          />
        ) : (
          <Input
            {...control}
            lang="en"
            value={value}
            maxLength={maxLength}
            placeholder={plain(french, 120)}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }
    </Field>
  );
  if (state !== 'outdated' || !onMarkReviewed) return field;
  return (
    <div className="flex flex-col gap-1.5">
      {field}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button variant="outline" size="sm" onClick={onMarkReviewed}>
          <CheckCheck aria-hidden />
          Marquer comme revu
        </Button>
        <span className="font-ui text-[12px] leading-4 text-text-muted">
          La traduction reste juste malgré le changement du français.
        </span>
      </div>
    </div>
  );
}

/** Titre de la page et référencement (titre, description) en anglais. */
export function EnglishPageFields({
  draft,
  frenchTitle,
  frenchSeo,
  readOnly,
  onChange,
}: {
  draft: EnglishDraft;
  frenchTitle: string;
  frenchSeo: Seo;
  readOnly: boolean;
  onChange: (next: EnglishDraft) => void;
}) {
  const fields = [
    {
      label: 'Titre de la page',
      french: frenchTitle,
      value: draft.title,
      errorPath: 'en.title',
      set: (title: string) => onChange({ ...draft, title }),
    },
    {
      label: 'Titre pour les moteurs de recherche',
      french: frenchSeo.title ?? '',
      value: draft.seo.title,
      errorPath: 'en.seo.title',
      set: (title: string) => onChange({ ...draft, seo: { ...draft.seo, title } }),
    },
    {
      label: 'Description pour les moteurs de recherche',
      french: frenchSeo.description ?? '',
      value: draft.seo.description,
      errorPath: 'en.seo.description',
      set: (description: string) => onChange({ ...draft, seo: { ...draft.seo, description } }),
      multiline: true,
    },
  ];
  return (
    <section
      aria-label="Titre et référencement en anglais"
      className="flex flex-col gap-4 rounded-lg border border-border-default bg-neutral-0 p-[18px]"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-ui text-[15px] leading-6 font-semibold text-text-main">Titre et référencement</h3>
        <p className="font-ui text-[12px] leading-4 text-text-muted">
          Vide : le texte français est repris. Image de partage et indexation : repris de la version
          française.
        </p>
      </div>
      <ReadOnlyFieldset readOnly={readOnly}>
        {fields
          .filter((field) => field.french.trim() !== '' || field.value)
          .map((field) => (
            <TranslationField
              key={field.errorPath}
              label={field.label}
              french={field.french}
              value={field.value ?? ''}
              errorPath={field.errorPath}
              multiline={field.multiline ?? false}
              rich={false}
              accent={false}
              onChange={field.set}
            />
          ))}
      </ReadOnlyFieldset>
    </section>
  );
}

const STATE_LABELS: Record<Exclude<SectionTranslationState, null>, string> = {
  missing: 'À traduire',
  outdated: 'À revoir',
};

/**
 * Bandeau au-dessus des sections anglaises quand plusieurs sont « À revoir » : « Tout marquer comme revu » (les
 * traductions restent justes malgré les changements du français).
 */
export function ReviewAllBar({
  count,
  reviewing,
  disabled,
  onReviewAll,
}: {
  count: number;
  reviewing: boolean;
  disabled: boolean;
  onReviewAll: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border-default bg-neutral-0 px-4 py-2.5">
      <p className="min-w-0 flex-1 font-ui text-[12px] leading-4 text-text-main">
        {count} sections à revoir : si leurs traductions restent justes malgré les changements du texte
        français, marquez-les comme revues.
      </p>
      <Button variant="outline" size="sm" loading={reviewing} disabled={disabled} onClick={onReviewAll}>
        <CheckCheck aria-hidden />
        Tout marquer comme revu
      </Button>
    </div>
  );
}

/**
 * Carte d'une section dans l'onglet anglais : même en-tête que la carte française (nom, description), sans poignée,
 * interrupteur ni suppression ; badge « À traduire » / « À revoir » ; champs texte de la section. Une section
 * « À revoir » propose « Marquer comme revue » (traduction juste malgré le changement du français).
 */
export function EnglishSectionCard({
  french,
  english,
  index,
  open,
  hasErrors,
  state,
  readOnly,
  reviewing = false,
  reviewDisabled = false,
  onToggle,
  onEdit,
  onMarkReviewed,
}: {
  /** Section française (structure et textes de référence). */
  french: PageSection;
  /** Section affichée : textes anglais saisis, ou textes français à traduire. */
  english: PageSection;
  index: number;
  open: boolean;
  hasErrors: boolean;
  state: SectionTranslationState;
  readOnly: boolean;
  /** Enregistrement en cours de la section marquée revue. */
  reviewing?: boolean;
  /** Marquage impossible pour l'instant (autre marquage en cours, champs français à corriger). */
  reviewDisabled?: boolean;
  onToggle: () => void;
  onEdit: (path: string, value: string) => void;
  /** Absent en lecture seule. */
  onMarkReviewed?: () => void;
}) {
  const id = useId();
  const label = sectionLabel(french);
  const fields = translatableFields(french);
  const path = `en.sections.${index}`;
  const sectionError = useFieldError(path);
  const reviewError = useFieldError(`${path}.reviewed`);
  const groups: { name: string | null; fields: TranslatableField[] }[] = [];
  for (const field of fields) {
    const last = groups.at(-1);
    if (last && last.name === field.group) last.fields.push(field);
    else groups.push({ name: field.group, fields: [field] });
  }
  const renderField = (field: TranslatableField) => {
    const current = getAt(english, field.path);
    return (
      <TranslationField
        key={field.path}
        label={field.label}
        french={field.french}
        value={typeof current === 'string' ? current : field.french}
        errorPath={`${path}.${field.path}`}
        multiline={field.multiline}
        rich={field.rich}
        accent={field.accent}
        onChange={(value) => onEdit(field.path, value)}
      />
    );
  };
  return (
    <li
      className={cn(
        'rounded-lg bg-neutral-0',
        open ? 'border-2 border-brand-primary p-[17px]' : 'border border-border-default p-[18px]',
      )}
    >
      <div className="relative flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-ui text-[15px] leading-6 font-semibold text-text-main">
            <button
              type="button"
              id={sectionToggleId(`en-${french.id}`)}
              aria-expanded={open}
              aria-controls={`${id}-content`}
              aria-describedby={`${id}-description`}
              onClick={onToggle}
              className={cn(
                'rounded-xs text-left after:absolute after:inset-0 after:rounded-md after:content-[""]',
                'focus-visible:outline-none focus-visible:after:focus-ring',
              )}
            >
              {label}
              {state && <span className="sr-only"> ({STATE_LABELS[state].toLowerCase()})</span>}
              {hasErrors && <span className="sr-only"> (champs à corriger)</span>}
            </button>
          </h3>
          <p id={`${id}-description`} className="truncate font-ui text-[12px] leading-4 text-text-muted">
            {fields.length === 0 ? 'Aucun texte à traduire' : sectionDescription(french)}
            {!french.enabled && ' · masquée sur le site'}
          </p>
        </div>
        {hasErrors && (
          <span aria-hidden className="relative z-10 size-2 shrink-0 rounded-full bg-feedback-error" />
        )}
        {state && (
          <StatusPill tone={state === 'missing' ? 'brand' : 'neutral'} className="relative z-10">
            {STATE_LABELS[state]}
          </StatusPill>
        )}
        <span aria-hidden className="ml-1 flex text-icon-default">
          {open ? <Minus size={18} /> : <ChevronRight size={18} />}
        </span>
      </div>
      {open && (
        <div id={`${id}-content`} className="mt-4 flex flex-col gap-4">
          <p className="flex items-start gap-2 font-ui text-[12px] leading-4 text-text-muted">
            <Languages aria-hidden size={14} className="mt-px shrink-0" />
            {state === 'missing'
              ? 'Section pré-remplie avec le texte français : remplacez chaque texte par sa traduction. '
              : state === 'outdated'
                ? 'Le texte français a changé depuis la traduction : comparez avec le texte français rappelé sous chaque champ. '
                : ''}
            Images, liens, réglages d’affichage et visibilité : repris de la version française.
          </p>
          {state === 'outdated' && onMarkReviewed && !readOnly && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Button
                variant="outline"
                size="sm"
                loading={reviewing}
                disabled={reviewDisabled}
                onClick={onMarkReviewed}
              >
                <CheckCheck aria-hidden />
                Marquer comme revue
              </Button>
              <span className="font-ui text-[12px] leading-4 text-text-muted">
                La traduction reste juste : la section n’est plus signalée « À revoir ».
              </span>
            </div>
          )}
          {reviewError && (
            <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-4 text-feedback-error">
              <CircleAlert aria-hidden size={16} className="mt-px shrink-0" />
              {reviewError}
            </p>
          )}
          {sectionError && (
            <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-4 text-feedback-error">
              <CircleAlert aria-hidden size={16} className="mt-px shrink-0" />
              {sectionError}
            </p>
          )}
          <ReadOnlyFieldset readOnly={readOnly}>
            {fields.length === 0 ? (
              <p className="font-ui text-[14px] leading-5 text-text-muted">
                Cette section ne contient aucun texte à traduire : elle s’affiche telle quelle en anglais.
              </p>
            ) : (
              groups.map((group, position) =>
                group.name === null ? (
                  <Fragment key={`champs-${position}`}>{group.fields.map(renderField)}</Fragment>
                ) : (
                  <div
                    key={`${group.name}-${position}`}
                    role="group"
                    aria-label={group.name}
                    className="flex flex-col gap-3 rounded-md border border-border-default p-3.5"
                  >
                    <span aria-hidden className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                      {group.name}
                    </span>
                    {group.fields.map(renderField)}
                  </div>
                ),
              )
            )}
          </ReadOnlyFieldset>
        </div>
      )}
    </li>
  );
}
