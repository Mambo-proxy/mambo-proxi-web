'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import {
  AddItemButton,
  charCountHelp,
  ConfirmDialog,
  PublishStatusBadge,
} from '@/components/admin/editor/editor-ui';
import { DragHandle, SortableItem, SortableList } from '@/components/admin/editor/sortable';
import {
  LanguageTabs,
  languagePanelId,
  languageTabId,
  type EditorLanguage,
} from '@/components/admin/pages/translation-editor';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { translationBadge } from '@/lib/admin/translation';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type {
  CategoryFields,
  CategoryInput,
  CategoryPatch,
  CategoryTint,
  PublishStatus,
} from '@/lib/api/schema';
import { CatalogEnglishFields } from './catalog-english';
import {
  catalogTextFields,
  CATEGORY_TEXT_UNITS,
  editEnglish,
  englishPayload,
  localCatalogStatus,
  type EnglishTexts,
} from './catalog-translation';
import { categoriesKey, fetchCategories, servicesKey, slugify, type Category } from './service-utils';

const TINTS: { value: CategoryTint; label: string }[] = [
  { value: 'orange-50', label: 'Orange clair' },
  { value: 'neutral-100', label: 'Gris clair' },
  { value: 'vert-50', label: 'Vert clair' },
  { value: 'neutral-900', label: 'Noir' },
];

/** Champs texte du formulaire de rubrique (valeurs saisies, chaînes vides = non renseigné). */
type CategoryForm = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  tint: CategoryTint;
  status: PublishStatus;
  eyebrow: string;
  heroTitle: string;
  heroLead: string;
  audiencesTitle: string;
  servicesTitle: string;
  servicesLead: string;
  processTitle: string;
  ctaTitle: string;
  ctaText: string;
  homeTitle: string;
  homeText: string;
  homeTextMobile: string;
  homeChips: string;
  seoTitle: string;
  seoDescription: string;
};

function toForm(category: Category | null): CategoryForm {
  return {
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    tagline: category?.tagline ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? 'Sparkles',
    tint: category?.tint ?? 'orange-50',
    status: category?.status ?? 'DRAFT',
    eyebrow: category?.eyebrow ?? '',
    heroTitle: category?.heroTitle ?? '',
    heroLead: category?.heroLead ?? '',
    audiencesTitle: category?.audiencesTitle ?? '',
    servicesTitle: category?.servicesTitle ?? '',
    servicesLead: category?.servicesLead ?? '',
    processTitle: category?.processTitle ?? '',
    ctaTitle: category?.ctaTitle ?? '',
    ctaText: category?.ctaText ?? '',
    homeTitle: category?.homeCard?.title ?? '',
    homeText: category?.homeCard?.text ?? '',
    homeTextMobile: category?.homeCard?.textMobile ?? '',
    homeChips: (category?.homeCard?.chips ?? []).join(', '),
    seoTitle: category?.seoTitle ?? '',
    seoDescription: category?.seoDescription ?? '',
  };
}

const orNull = (value: string) => value.trim() || null;

function toBody(form: CategoryForm): CategoryFields {
  return {
    name: form.name.trim(),
    // Adresse laissée vide : l'API la tire du nom (suffixée `-2`… si elle est prise) ; choisie et prise : 409.
    ...(form.slug.trim() ? { slug: slugify(form.slug) } : {}),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    icon: form.icon.trim(),
    tint: form.tint,
    status: form.status,
    eyebrow: orNull(form.eyebrow),
    heroTitle: form.heroTitle.trim() || form.name.trim(),
    heroLead: form.heroLead.trim(),
    audiencesTitle: orNull(form.audiencesTitle),
    servicesTitle: orNull(form.servicesTitle),
    servicesLead: orNull(form.servicesLead),
    processTitle: orNull(form.processTitle),
    ctaTitle: orNull(form.ctaTitle),
    ctaText: orNull(form.ctaText),
    homeCard: {
      title: form.homeTitle.trim() || form.tagline.trim(),
      text: form.homeText.trim() || form.description.trim().slice(0, 200),
      textMobile: orNull(form.homeTextMobile),
      chips: form.homeChips
        .split(',')
        .map((chip) => chip.trim())
        .filter(Boolean)
        .slice(0, 6),
    },
    seoTitle: orNull(form.seoTitle),
    seoDescription: orNull(form.seoDescription),
  };
}

/** Section repliable du formulaire (textes de la page de rubrique, carte d'accueil, SEO). */
function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-md border border-border-default">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-4 py-3 font-ui text-[14px] leading-5 font-semibold text-text-main hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden
          size={18}
          className="text-icon-default transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-4 border-t border-border-default p-4">{children}</div>
    </details>
  );
}

function CategoryEditor({
  category,
  formId,
  onSaved,
  onPendingChange,
}: {
  category: Category | null;
  formId: string;
  onSaved: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const client = useQueryClient();
  const [form, setForm] = useState(() => toForm(category));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<EditorLanguage>('fr');
  /** Textes anglais (forme `CategoryTexts`), envoyés avec « Enregistrer la rubrique ». */
  const [english, setEnglish] = useState<EnglishTexts>(
    () => (category?.translations?.en as EnglishTexts | null | undefined) ?? {},
  );
  /** Champs anglais marqués revus (`reviewedFields`). */
  const [reviewed, setReviewed] = useState<string[]>([]);
  const set = <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: '' }));
  };

  // Version anglaise : textes français tels qu'ils seront enregistrés, statut pendant l'édition.
  const french = toBody(form);
  const englishFields = catalogTextFields(CATEGORY_TEXT_UNITS, french);
  const englishStatus = localCatalogStatus({
    units: CATEGORY_TEXT_UNITS,
    french,
    english,
    saved: category?.translations?.en as EnglishTexts | null | undefined,
    server: category?.translationStatus.en,
    reviewed,
  });

  /** Corps envoyé : champs français et version anglaise (`translations`, règles `CatalogTranslations`). */
  function body(): CategoryFields {
    const fields = toBody(form);
    const en = englishPayload(CATEGORY_TEXT_UNITS, fields, english);
    if (!category && !en) return fields;
    const reviewedFields = reviewed.filter((unit) => en?.[unit] !== undefined);
    return { ...fields, translations: { en, ...(reviewedFields.length > 0 ? { reviewedFields } : {}) } };
  }

  const save = useMutation({
    mutationFn: (body: CategoryFields) =>
      category
        ? data(
            browserApi.PATCH('/v1/admin/categories/{id}', {
              params: { path: { id: category.id } },
              // Types générés : `CategoryFields & Record<string, never>` (voir `serviceBody`).
              body: body as CategoryPatch,
            }),
          )
        : data(browserApi.POST('/v1/admin/categories', { body: body as CategoryInput })),
    onMutate: () => onPendingChange(true),
    onSettled: () => onPendingChange(false),
    onSuccess: (saved) => {
      void client.invalidateQueries({ queryKey: categoriesKey });
      void client.invalidateQueries({ queryKey: servicesKey });
      toast.success(
        category ? `Rubrique « ${saved.name} » enregistrée.` : `Rubrique « ${saved.name} » créée.`,
      );
      onSaved();
    },
    onError: (error) => {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors);
        // Onglet de la langue des champs à corriger (`translations.en.…` : onglet « English »).
        const paths = Object.keys(error.fieldErrors);
        setLanguage(paths.every((path) => path.startsWith('translations.')) ? 'en' : 'fr');
      }
      toast.error(errorMessage(error));
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const missing: Record<string, string> = {};
    if (!form.name.trim()) missing.name = 'Indiquez le nom de la rubrique.';
    if (!form.tagline.trim()) missing.tagline = 'Écrivez une accroche.';
    if (!form.description.trim()) missing.description = 'Écrivez une description.';
    if (!form.icon.trim()) missing.icon = 'Indiquez une icône.';
    if (Object.keys(missing).length) {
      setErrors(missing);
      setLanguage('fr');
      return;
    }
    save.mutate(body());
  }

  const text = (
    key: keyof CategoryForm,
    label: string,
    options: { max?: number; required?: boolean; help?: string; multiline?: boolean } = {},
  ) => (
    <Field
      label={label}
      required={options.required}
      error={errors[key] || null}
      help={options.max ? charCountHelp(form[key], options.max, options.help) : options.help}
    >
      {(control) =>
        options.multiline ? (
          <Textarea
            {...control}
            rows={3}
            className="min-h-[76px]"
            value={form[key]}
            maxLength={options.max}
            onChange={(event) => set(key, event.target.value as never)}
          />
        ) : (
          <Input
            {...control}
            value={form[key]}
            maxLength={options.max}
            onChange={(event) => set(key, event.target.value as never)}
          />
        )
      }
    </Field>
  );

  const reviewError = Object.entries(errors).find(
    ([path, message]) => message && path.startsWith('translations.reviewedFields'),
  )?.[1];

  return (
    <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-4">
      <LanguageTabs
        idPrefix="category-dialog"
        value={language}
        onChange={setLanguage}
        badge={translationBadge(englishStatus)}
      />
      {language === 'en' ? (
        <div
          role="tabpanel"
          id={languagePanelId('en', 'category-dialog')}
          aria-labelledby={languageTabId('en', 'category-dialog')}
          className="flex flex-col gap-4"
        >
          <p className="font-ui text-[12px] leading-4 text-text-muted">
            Vide : le texte français est repris. Icône, teinte, images et liens : ceux du français.
          </p>
          {reviewError && (
            <p role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
              {reviewError}
            </p>
          )}
          <CatalogEnglishFields
            fields={englishFields}
            english={english}
            status={englishStatus}
            readOnly={false}
            errorFor={(path) => errors[`translations.en.${path}`] || null}
            onChange={(path, value) => {
              setEnglish((current) => editEnglish(current, path, value));
              setErrors((previous) => ({ ...previous, [`translations.en.${path}`]: '' }));
            }}
            onMarkReviewed={(unit) =>
              setReviewed((current) => (current.includes(unit) ? current : [...current, unit]))
            }
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          id={languagePanelId('fr', 'category-dialog')}
          aria-labelledby={languageTabId('fr', 'category-dialog')}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom" required error={errors.name || null}>
              {(control) => (
                <Input
                  {...control}
                  value={form.name}
                  maxLength={80}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((previous) => ({
                      ...previous,
                      name,
                      // L'adresse suit le nom d'une nouvelle rubrique tant qu'elle n'a pas été modifiée.
                      slug:
                        !category && previous.slug === slugify(previous.name) ? slugify(name) : previous.slug,
                    }));
                    setErrors((previous) => ({ ...previous, name: '' }));
                  }}
                />
              )}
            </Field>
            <Field
              label="Adresse"
              error={errors.slug || null}
              help={`/services/${slugify(form.slug) || '…'}`}
            >
              {(control) => (
                <Input
                  {...control}
                  value={form.slug}
                  maxLength={80}
                  onChange={(event) => set('slug', event.target.value)}
                />
              )}
            </Field>
          </div>
          {text('tagline', 'Accroche', { max: 120, required: true })}
          {text('description', 'Description', { max: 600, required: true, multiline: true })}
          <div className="grid gap-4 md:grid-cols-3">
            {text('icon', 'Icône', { required: true, help: 'Nom Lucide, ex. Sparkles.' })}
            <Field label="Teinte de la carte" required>
              {(control) => (
                <Select
                  {...control}
                  value={form.tint}
                  onChange={(event) => set('tint', event.target.value as CategoryTint)}
                >
                  {TINTS.map((tint) => (
                    <option key={tint.value} value={tint.value}>
                      {tint.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Statut">
              {(control) => (
                <Select
                  {...control}
                  value={form.status}
                  onChange={(event) => set('status', event.target.value as PublishStatus)}
                >
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="ARCHIVED">Archivée</option>
                </Select>
              )}
            </Field>
          </div>
          <Fold title="Textes de la page de rubrique">
            {text('eyebrow', 'Surtitre', { max: 60 })}
            {text('heroTitle', 'Titre principal', {
              max: 400,
              help: 'Entourez de == la partie à mettre en avant.',
            })}
            {text('heroLead', 'Texte d’introduction', { max: 400, multiline: true })}
            {text('audiencesTitle', 'Titre de la partie « Pour qui ? »', { max: 160 })}
            {text('servicesTitle', 'Titre de la liste des services', { max: 160 })}
            {text('servicesLead', 'Texte sous la liste des services', { max: 300 })}
            {text('processTitle', 'Titre de la partie « Comment ça marche ? »', { max: 160 })}
            {text('ctaTitle', 'Titre de l’appel à l’action')}
            {text('ctaText', 'Texte de l’appel à l’action', { multiline: true })}
          </Fold>
          <Fold title="Carte de la page d’accueil">
            {text('homeTitle', 'Titre de la carte', { max: 80 })}
            {text('homeText', 'Texte de la carte', { max: 200, multiline: true })}
            {text('homeTextMobile', 'Texte court (mobile)', { max: 120 })}
            {text('homeChips', 'Puces', { help: 'Séparées par des virgules, 6 au plus.' })}
          </Fold>
          <Fold title="Référencement (SEO)">
            {text('seoTitle', 'Titre pour Google', { max: 60 })}
            {text('seoDescription', 'Description pour Google', { max: 160, multiline: true })}
          </Fold>
        </div>
      )}
    </form>
  );
}

/**
 * Gestion des rubriques (non maquettée, même langage que l'éditeur) : liste réordonnable au glisser-déposer ou au
 * clavier (`PATCH /v1/admin/categories/reorder`), création, modification et suppression d'une rubrique vide.
 */
export function CategoriesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const formId = useId();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [pending, setPending] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const categories = useQuery({
    queryKey: categoriesKey,
    queryFn: fetchCategories,
    enabled: open,
  });

  const reorder = useMutation({
    mutationFn: (ordered: Category[]) =>
      data(
        browserApi.PATCH('/v1/admin/categories/reorder', { body: { ids: ordered.map((item) => item.id) } }),
      ),
    onMutate: (ordered) => {
      const previous = client.getQueryData<Category[]>(categoriesKey);
      client.setQueryData(categoriesKey, ordered);
      return { previous };
    },
    onError: (error, _ordered, context) => {
      if (context?.previous) client.setQueryData(categoriesKey, context.previous);
      toast.error(`L’ordre n’a pas pu être enregistré. ${errorMessage(error)}`);
    },
    onSuccess: () => toast.success('Ordre des rubriques enregistré.'),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: categoriesKey });
      void client.invalidateQueries({ queryKey: servicesKey });
    },
  });

  const remove = useMutation({
    mutationFn: (category: Category) =>
      data(browserApi.DELETE('/v1/admin/categories/{id}', { params: { path: { id: category.id } } })),
    onSuccess: (_result, category) => {
      void client.invalidateQueries({ queryKey: categoriesKey });
      toast.success(`Rubrique « ${category.name} » supprimée.`);
    },
    onSettled: () => setToDelete(null),
  });

  const close = () => {
    setEditing(null);
    onClose();
  };
  const current = editing === 'new' ? null : editing;

  return (
    <Modal
      open={open}
      onClose={close}
      maxWidth={720}
      title={editing ? (current ? `Modifier « ${current.name} »` : 'Nouvelle rubrique') : 'Rubriques'}
      description={
        editing
          ? 'Les champs marqués d’un astérisque sont obligatoires.'
          : 'Glissez les rubriques pour changer leur ordre dans le menu, sur l’accueil et sur la page « Nos services ».'
      }
      footer={
        editing ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button size="sm" type="submit" form={formId} loading={pending}>
              Enregistrer la rubrique
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={close}>
            Fermer
          </Button>
        )
      }
    >
      {editing ? (
        <CategoryEditor
          key={current?.id ?? 'new'}
          category={current}
          formId={formId}
          onSaved={() => setEditing(null)}
          onPendingChange={setPending}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {categories.isError ? (
            <div role="alert" className="flex flex-col items-start gap-3">
              <p className="font-ui text-[15px] leading-6">Impossible de charger les rubriques.</p>
              <Button variant="outline" size="sm" onClick={() => void categories.refetch()}>
                Réessayer
              </Button>
            </div>
          ) : !categories.data ? (
            Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-16 rounded-md" />)
          ) : (
            <SortableList
              items={categories.data}
              getId={(category) => category.id}
              getLabel={(category) => category.name}
              onReorder={(ordered) => reorder.mutate(ordered)}
              className="flex flex-col gap-2"
              renderItem={(category) => (
                <SortableItem
                  key={category.id}
                  id={category.id}
                  className="flex items-center gap-2 rounded-md bg-neutral-50 p-3"
                >
                  <DragHandle label={category.name} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
                      {category.name}
                    </span>
                    <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                      {category.serviceCount} service{category.serviceCount > 1 ? 's' : ''} · /services/
                      {category.slug}
                    </span>
                  </div>
                  <span className="max-sm:hidden">
                    <PublishStatusBadge status={category.status} />
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(category)}
                    aria-label={`Modifier la rubrique « ${category.name} »`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main"
                  >
                    <Pencil aria-hidden size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(category)}
                    disabled={category.serviceCount > 0}
                    aria-label={
                      category.serviceCount > 0
                        ? `Supprimer la rubrique « ${category.name} » (impossible : elle contient des services)`
                        : `Supprimer la rubrique « ${category.name} »`
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                </SortableItem>
              )}
            />
          )}
          <AddItemButton onClick={() => setEditing('new')}>Ajouter une rubrique</AddItemButton>
        </div>
      )}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Supprimer cette rubrique ?"
        description={toDelete ? `La rubrique « ${toDelete.name} » sera définitivement supprimée.` : undefined}
        confirmLabel="Supprimer la rubrique"
        destructive
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
      />
    </Modal>
  );
}
