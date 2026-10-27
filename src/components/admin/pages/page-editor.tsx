'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, RotateCcw } from 'lucide-react';
import { useImperativeHandle, useMemo, useState, type Ref } from 'react';
import { ConfirmDialog, SavedNote, StatusPill } from '@/components/admin/editor/editor-ui';
import { SortableList } from '@/components/admin/editor/sortable';
import { useAutosave } from '@/components/admin/editor/use-autosave';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type {
  AdminPage,
  AdminPageSummary,
  PageDraftInput,
  PageSection,
  PageSectionType,
} from '@/lib/api/schema';
import { FieldErrorsContext } from './fields';
import {
  createSection,
  SECTION_TYPE_HELP,
  SECTION_TYPE_LABELS,
  sectionLabel,
  sectionsWithErrors,
  validateSections,
  type FieldErrors,
} from './page-model';
import { SectionCard, sectionToggleId, TopBarCard } from './section-card';

export const pageListKey = ['admin-pages'] as const;
export const pageKey = (key: string) => ['admin-pages', key] as const;

/** Commandes de l'éditeur utilisées par la barre supérieure (publication, changement de page). */
export type PageEditorHandle = {
  /** Enregistre immédiatement le brouillon ; `false` si l'enregistrement a échoué. */
  flush: () => Promise<boolean>;
  /** Vérifie les champs ; ouvre les sections à corriger. */
  validate: () => boolean;
};

/** Met à jour la page et son résumé dans le cache après un enregistrement, une publication ou une annulation. */
export function useStorePage() {
  const client = useQueryClient();
  return (page: AdminPage) => {
    client.setQueryData(pageKey(page.key), page);
    client.setQueryData<AdminPageSummary[]>(pageListKey, (list) =>
      list?.map((summary) =>
        summary.key === page.key
          ? {
              ...summary,
              hasDraft: page.hasDraft,
              updatedAt: page.updatedAt,
              publishedAt: page.publishedAt,
              updatedBy: page.updatedBy,
            }
          : summary,
      ),
    );
  };
}

type PageEditorProps = {
  page: AdminPage;
  openSections: string[];
  onOpenSections: (ids: string[]) => void;
  /** Brouillon annulé : l'éditeur est recréé avec la version publiée. */
  onReset: () => void;
  /** Sans `content:write` : sections consultables (dépliables) mais figées, sans sauvegarde automatique. */
  readOnly?: boolean;
  ref?: Ref<PageEditorHandle>;
};

/**
 * Éditeur d'une page (colonne « Sections » de `92:11033`) : en-tête (nom, nombre de sections, « Ajouter une
 * section »), statut publié / modifications non publiées, sauvegarde automatique du brouillon (`PUT`), aperçu et
 * annulation du brouillon, cartes de section réordonnables (glisser-déposer ou clavier) et dépliables.
 */
export function PageEditor({
  page,
  openSections,
  onOpenSections,
  onReset,
  readOnly = false,
  ref,
}: PageEditorProps) {
  const [sections, setSections] = useState<PageSection[]>(page.sections);
  const [adding, setAdding] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [server, setServer] = useState<{ for: string; errors: FieldErrors } | null>(null);
  const storePage = useStorePage();

  const serialized = JSON.stringify(sections);
  const localErrors = useMemo(() => validateSections(sections), [sections]);
  const errors = useMemo(
    () => ({ ...(server?.for === serialized ? server.errors : {}), ...localErrors }),
    [server, serialized, localErrors],
  );
  const valid = Object.keys(localErrors).length === 0;
  const errorSections = new Set(sectionsWithErrors(errors));

  const save = useMutation({
    mutationFn: (input: PageDraftInput) =>
      data(browserApi.PUT('/v1/admin/pages/{key}', { params: { path: { key: page.key } }, body: input })),
    onSuccess: (saved) => storePage(saved),
    onError: (error, input) => {
      const fieldErrors = error instanceof ApiError && error.status === 422 ? error.fieldErrors : {};
      if (Object.keys(fieldErrors).length)
        setServer({ for: JSON.stringify(input.sections), errors: fieldErrors });
      // Erreur sans champ de section à signaler (droits, page inconnue, réseau…) : message de l'API.
      if (sectionsWithErrors(fieldErrors).length === 0) toast.error(errorMessage(error));
    },
  });

  const autosave = useAutosave({
    value: { sections, seo: page.seo } satisfies PageDraftInput,
    save: (value) => save.mutateAsync(value),
    enabled: valid && !readOnly,
    initialSavedAt: page.hasDraft ? page.updatedAt : null,
  });

  const discard = useMutation({
    mutationFn: () =>
      data(browserApi.POST('/v1/admin/pages/{key}/discard', { params: { path: { key: page.key } } })),
    onSuccess: (restored) => {
      setDiscarding(false);
      storePage(restored);
      toast.success('Modifications annulées : la version publiée est rétablie.');
      onReset();
    },
  });

  function validate() {
    const invalid = sectionsWithErrors(localErrors);
    if (invalid.length === 0) return true;
    const ids = invalid.map((index) => sections[index]?.id).filter((id): id is string => Boolean(id));
    onOpenSections([...new Set([...openSections, ...ids])]);
    window.setTimeout(() => document.getElementById(sectionToggleId(ids[0] ?? ''))?.focus(), 50);
    return false;
  }

  useImperativeHandle(ref, () => ({ flush: autosave.flush, validate }));

  async function preview() {
    // Fenêtre ouverte tout de suite (sinon bloquée par le navigateur), puis dirigée vers l'aperçu.
    const preview = window.open('about:blank', '_blank');
    if (preview) preview.opener = null;
    try {
      if (valid) await autosave.flush();
      const token = await data(
        browserApi.GET('/v1/admin/pages/{key}/preview-token', { params: { path: { key: page.key } } }),
      );
      if (preview) preview.location.href = token.url;
      else window.open(token.url, '_blank', 'noopener');
    } catch (error) {
      preview?.close();
      toast.error(errorMessage(error));
    }
  }

  const toggle = (id: string) =>
    onOpenSections(
      openSections.includes(id) ? openSections.filter((open) => open !== id) : [...openSections, id],
    );

  function add(type: Exclude<PageSectionType, 'dynamic'>) {
    const section = createSection(
      type,
      sections.map((current) => current.id),
    );
    setSections([...sections, section]);
    setAdding(false);
    onOpenSections([...openSections, section.id]);
    window.setTimeout(() => {
      const toggleButton = document.getElementById(sectionToggleId(section.id));
      toggleButton?.scrollIntoView({ block: 'center' });
      toggleButton?.focus();
    }, 50);
  }

  const pending = page.hasDraft || autosave.dirty;
  const count = sections.length;
  const addable = page.allowedSectionTypes.filter(
    (type): type is Exclude<PageSectionType, 'dynamic'> => type !== 'dynamic',
  );

  return (
    <FieldErrorsContext.Provider value={errors}>
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-brand text-[20px] leading-7 font-semibold text-text-main">{page.title}</h2>
              {pending ? (
                <StatusPill tone="brand">Modifications non publiées</StatusPill>
              ) : (
                <StatusPill tone="success">Publié</StatusPill>
              )}
            </div>
            <p className="font-ui text-[12px] leading-4 text-text-muted">
              {count} section{count > 1 ? 's' : ''} ·{' '}
              {readOnly ? 'cliquez pour consulter' : 'glissez pour réordonner, cliquez pour modifier'}
            </p>
          </div>
          {addable.length > 0 && !readOnly && (
            <button type="button" onClick={() => setAdding(true)} className={topbarSecondaryClass}>
              <Plus aria-hidden />
              Ajouter une section
            </button>
          )}
        </div>

        {(pending || autosave.pending || autosave.error || !valid) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-orange-200 bg-orange-50 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              {valid ? (
                <SavedNote savedAt={autosave.savedAt} saving={autosave.pending} error={autosave.error} />
              ) : (
                <p aria-live="polite" className="font-ui text-[12px] leading-4 text-text-main">
                  Corrigez les champs signalés : le brouillon sera enregistré ensuite.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => void preview()}>
                <Eye aria-hidden />
                Aperçu du brouillon
              </Button>
              {page.hasDraft && !readOnly && (
                <Button variant="ghost" size="sm" onClick={() => setDiscarding(true)}>
                  <RotateCcw aria-hidden />
                  Annuler les modifications
                </Button>
              )}
            </div>
          </div>
        )}

        {page.key === 'accueil' && <TopBarCard />}

        {count > 0 ? (
          <SortableList
            items={sections}
            getId={(section) => section.id}
            getLabel={sectionLabel}
            onReorder={setSections}
            disabled={readOnly}
            className="flex flex-col gap-3.5"
            renderItem={(section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                path={`sections.${index}`}
                open={openSections.includes(section.id)}
                hasErrors={errorSections.has(index)}
                readOnly={readOnly}
                onToggle={() => toggle(section.id)}
                onChange={(next) =>
                  setSections(sections.map((current, position) => (position === index ? next : current)))
                }
                onRemove={() => {
                  setSections(sections.filter((_, position) => position !== index));
                  onOpenSections(openSections.filter((open) => open !== section.id));
                  toast.success(`Section « ${sectionLabel(section)} » supprimée du brouillon.`);
                }}
              />
            )}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-border-strong bg-neutral-0 p-6 text-center font-ui text-[14px] leading-5 text-text-muted">
            Cette page n’a aucune section.{!readOnly && ' Ajoutez-en une pour commencer.'}
          </p>
        )}
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Ajouter une section"
        description="La section est ajoutée en bas de la page ; glissez-la ensuite à sa place."
        maxWidth={640}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {addable.map((type) => (
            <li key={type}>
              <button
                type="button"
                onClick={() => add(type)}
                className="flex h-full w-full flex-col gap-0.5 rounded-md border border-border-default p-3.5 text-left transition-colors hover:border-brand-primary hover:bg-orange-50"
              >
                <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
                  {SECTION_TYPE_LABELS[type]}
                </span>
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  {SECTION_TYPE_HELP[type]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <ConfirmDialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        onConfirm={() => discard.mutate()}
        pending={discard.isPending}
        title="Annuler les modifications ?"
        description={`Le brouillon de la page « ${page.title} » sera supprimé et la version publiée rétablie. Cette action est irréversible.`}
        confirmLabel="Annuler les modifications"
        destructive
      />
    </FieldErrorsContext.Provider>
  );
}
