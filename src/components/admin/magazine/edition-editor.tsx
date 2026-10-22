'use client';

import { TZDate } from '@date-fns/tz';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, Save, Trash2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { MediaPickerDialog, MediaThumb } from '@/components/admin/editor/media-picker';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { DragHandle, SortableItem, SortableList } from '@/components/admin/editor/sortable';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import { EmptyState } from '@/components/admin/ui/filters';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type {
  AdminMagazineArticle,
  AdminMagazineEdition,
  MagazineEditionFields,
  MediaImage,
} from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { DEFAULT_TIME_ZONE, formatDayMonthYear, formatStamp } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';
import { ArticleDialog } from './article-dialog';
import {
  ArticleLanguages,
  CompactField,
  CompactInput,
  compactButtonClass,
  compactPrimaryClass,
  editionHeading,
  EDITION_STATUS_LABELS,
  LanguagePill,
  LanguageSwitch,
  MagazineCard,
  magazineEditionKey,
  useRefreshMagazine,
  type EditingLanguage,
} from './magazine-ui';
import { usePreviewEdition } from './magazine-view';

type Draft = {
  number: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  publishDate: string;
  cover: MediaImage | null;
  editorial: string;
  editorialEn: string;
  signature: string;
  signatureEn: string;
};

/** Date et heure de Douala (UTC+1) au format des champs `date` / `datetime-local`. */
const toLocal = (iso: string, pattern: string) =>
  format(new TZDate(new Date(iso).getTime(), DEFAULT_TIME_ZONE), pattern);
const fromLocal = (value: string) => new Date(`${value}+01:00`).toISOString();

function draftOf(edition: AdminMagazineEdition): Draft {
  return {
    number: edition.number === null ? '' : String(edition.number),
    title: edition.title,
    titleEn: edition.titleEn ?? '',
    subtitle: edition.subtitle ?? '',
    subtitleEn: edition.subtitleEn ?? '',
    publishDate: edition.publishAt ? toLocal(edition.publishAt, 'yyyy-MM-dd') : '',
    cover: edition.cover,
    editorial: edition.editorial ?? '',
    editorialEn: edition.editorialEn ?? '',
    signature: edition.signature ?? '',
    signatureEn: edition.signatureEn ?? '',
  };
}

/** Corps de l'enregistrement : champs modifiés seulement. */
function changes(draft: Draft, edition: AdminMagazineEdition): MagazineEditionFields {
  const initial = draftOf(edition);
  const text = (value: string) => value.trim() || null;
  const body: MagazineEditionFields = {};
  if (draft.number !== initial.number) body.number = draft.number ? Number(draft.number) : null;
  if (draft.title !== initial.title) body.title = draft.title.trim();
  if (draft.titleEn !== initial.titleEn) body.titleEn = text(draft.titleEn);
  if (draft.subtitle !== initial.subtitle) body.subtitle = text(draft.subtitle);
  if (draft.subtitleEn !== initial.subtitleEn) body.subtitleEn = text(draft.subtitleEn);
  // Date seule : publication à 9 h, heure de Douala.
  if (draft.publishDate !== initial.publishDate)
    body.publishAt = draft.publishDate ? fromLocal(`${draft.publishDate}T09:00:00`) : null;
  if (draft.cover?.id !== initial.cover?.id) body.coverId = draft.cover?.id ?? null;
  if (draft.editorial !== initial.editorial) body.editorial = draft.editorial || null;
  if (draft.editorialEn !== initial.editorialEn) body.editorialEn = draft.editorialEn || null;
  if (draft.signature !== initial.signature) body.signature = text(draft.signature);
  if (draft.signatureEn !== initial.signatureEn) body.signatureEn = text(draft.signatureEn);
  return body;
}

/** Magazine · Éditer une édition (`269:1677`). */
export function EditionEditor({ id }: { id: string }) {
  const edition = useQuery({
    queryKey: magazineEditionKey(id),
    queryFn: () => data(browserApi.GET('/v1/admin/magazine/editions/{id}', { params: { path: { id } } })),
  });

  if (edition.isError && !edition.data)
    return (
      <AdminPage title="Édition introuvable" breadcrumb={<Breadcrumb current="Édition" />}>
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Cette édition n’existe plus"
          text="Elle a peut-être été supprimée. Retrouvez les éditions du magazine dans la liste."
          action={
            <Link href={adminRoutes.magazine} className={compactButtonClass}>
              Retour au magazine
            </Link>
          }
        />
      </AdminPage>
    );
  if (!edition.data)
    return (
      <AdminPage title="Édition" breadcrumb={<Breadcrumb current="Édition" />}>
        <div aria-busy className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-[420px] rounded-lg" />
          <Skeleton className="h-[220px] rounded-lg" />
        </div>
      </AdminPage>
    );
  return <EditionForm key={edition.data.id} edition={edition.data} />;
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <span className="flex items-center gap-1.5">
      Contenus du site <ChevronRight aria-hidden size={12} />
      <Link href={adminRoutes.magazine} className="hover:underline">
        Magazine
      </Link>
      {` › ${current}`}
    </span>
  );
}

function EditionForm({ edition }: { edition: AdminMagazineEdition }) {
  const client = useQueryClient();
  const refresh = useRefreshMagazine();
  const router = useRouter();
  const preview = usePreviewEdition();
  const [draft, setDraft] = useState(() => draftOf(edition));
  const [language, setLanguage] = useState<EditingLanguage>('fr');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [articleDialog, setArticleDialog] = useState<{ article: AdminMagazineArticle | null } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [confirm, setConfirm] = useState<'delete' | 'unpublish' | null>(null);
  const articlesRef = useRef<HTMLDivElement>(null);
  const [synced, setSynced] = useState(edition);

  // Édition rechargée (enregistrement, articles) : le brouillon suit les valeurs enregistrées.
  if (synced !== edition) {
    const before = changes(draft, synced);
    setSynced(edition);
    if (Object.keys(before).length === 0) setDraft(draftOf(edition));
  }

  const body = changes(draft, edition);
  const dirty = Object.keys(body).length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const store = (updated: AdminMagazineEdition) => {
    client.setQueryData(magazineEditionKey(updated.id), updated);
    refresh();
  };

  const onError = (error: unknown) => {
    if (error instanceof ApiError) setErrors(error.fieldErrors);
    toast.error(errorMessage(error));
  };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Saisissez le titre.';
    if (draft.number && !/^[1-9]\d*$/.test(draft.number)) next.number = 'Saisissez un nombre entier.';
    setErrors(next);
    if (Object.keys(next).length) setLanguage('fr');
    return Object.keys(next).length === 0;
  }

  const save = useMutation({
    mutationFn: async (then: 'save' | 'publish') => {
      let current = edition;
      if (dirty)
        current = await data(
          browserApi.PATCH('/v1/admin/magazine/editions/{id}', {
            params: { path: { id: edition.id } },
            body: body as never,
          }),
        );
      if (then === 'publish')
        current = await data(
          browserApi.POST('/v1/admin/magazine/editions/{id}/publish', {
            params: { path: { id: edition.id } },
            body: { publishAt: current.publishAt },
          }),
        );
      return current;
    },
    onSuccess: (updated, then) => {
      setErrors({});
      setDraft(draftOf(updated));
      store(updated);
      toast.success(
        then === 'save'
          ? 'Édition enregistrée.'
          : updated.status === 'SCHEDULED'
            ? `Publication programmée le ${formatDayMonthYear(updated.publishAt!)}.`
            : 'Édition publiée.',
      );
    },
    onError,
  });

  function submit(then: 'save' | 'publish') {
    if (validate()) save.mutate(then);
  }

  const unpublish = useMutation({
    mutationFn: () =>
      data(
        browserApi.POST('/v1/admin/magazine/editions/{id}/unpublish', {
          params: { path: { id: edition.id } },
        }),
      ),
    onSuccess: (updated) => {
      setConfirm(null);
      store(updated);
      toast.success('Édition repassée en brouillon : elle n’est plus visible sur le site.');
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: () =>
      data(browserApi.DELETE('/v1/admin/magazine/editions/{id}', { params: { path: { id: edition.id } } })),
    onSuccess: () => {
      toast.success('Édition supprimée ; ses articles restent disponibles.');
      refresh();
      router.push(adminRoutes.magazine);
    },
    onError,
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      data(
        browserApi.PUT('/v1/admin/magazine/editions/{id}/articles', {
          params: { path: { id: edition.id } },
          body: { ids },
        }),
      ),
    onMutate: (ids) => {
      const byId = new Map(edition.articles.map((article) => [article.id, article]));
      client.setQueryData(magazineEditionKey(edition.id), {
        ...edition,
        articles: ids.map((articleId) => byId.get(articleId)).filter(Boolean),
      });
    },
    onSuccess: store,
    onError: (error) => {
      onError(error);
      client.setQueryData(magazineEditionKey(edition.id), edition);
    },
  });

  const en = language === 'en';
  const total = edition.articles.length;
  const translated = edition.articles.filter((article) => article.languages.includes('en')).length;
  const frComplete = Boolean(draft.title.trim() && draft.editorial);
  const heading = editionHeading({ number: draft.number ? Number(draft.number) : edition.number });
  const published = edition.status === 'PUBLISHED' || edition.status === 'SCHEDULED';

  function showTranslations() {
    setLanguage('en');
    articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const firstTodo = edition.articles.find((article) => !article.languages.includes('en'));
    if (firstTodo) setArticleDialog({ article: firstTodo });
  }

  return (
    <AdminPage
      title={heading}
      breadcrumb={<Breadcrumb current={heading} />}
      actions={
        <button
          type="button"
          onClick={() => submit('save')}
          disabled={save.isPending}
          className={cn(topbarActionClass, 'disabled:opacity-60')}
        >
          <Save aria-hidden />
          Enregistrer
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <LanguageSwitch
          value={language}
          onChange={setLanguage}
          labels={{
            fr: `Français · ${frComplete ? 'complet' : 'à compléter'}`,
            en: `English · ${translated} / ${total} traduits`,
          }}
        />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <MagazineCard title="Informations de l’édition">
              <div className="flex flex-col gap-4 sm:flex-row">
                <CompactField label="Numéro" error={errors.number} className="sm:w-[120px] sm:shrink-0">
                  {(control) => (
                    <CompactInput
                      {...control}
                      inputMode="numeric"
                      value={draft.number}
                      placeholder="Hors-série"
                      onChange={(event) => set('number', event.target.value.replace(/\D/g, ''))}
                    />
                  )}
                </CompactField>
                <CompactField
                  label={en ? 'Titre (anglais)' : 'Titre'}
                  error={en ? errors.titleEn : errors.title}
                  className="flex-1"
                >
                  {(control) => (
                    <CompactInput
                      {...control}
                      key={language}
                      lang={language}
                      value={en ? draft.titleEn : draft.title}
                      placeholder={en ? draft.title : undefined}
                      maxLength={120}
                      onChange={(event) => set(en ? 'titleEn' : 'title', event.target.value)}
                    />
                  )}
                </CompactField>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <CompactField label={en ? 'Sous-titre (anglais)' : 'Sous-titre'} className="flex-1">
                  {(control) => (
                    <CompactInput
                      {...control}
                      key={language}
                      lang={language}
                      value={en ? draft.subtitleEn : draft.subtitle}
                      placeholder={en ? draft.subtitle : 'Édition spéciale'}
                      maxLength={120}
                      onChange={(event) => set(en ? 'subtitleEn' : 'subtitle', event.target.value)}
                    />
                  )}
                </CompactField>
                <CompactField
                  label="Date de publication"
                  error={errors.publishAt}
                  className="sm:w-[200px] sm:shrink-0"
                >
                  {(control) => (
                    <CompactInput
                      {...control}
                      type="date"
                      value={draft.publishDate}
                      onChange={(event) => set('publishDate', event.target.value)}
                    />
                  )}
                </CompactField>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {draft.cover ? (
                  <MediaThumb
                    image={draft.cover}
                    className="h-28 w-[168px] shrink-0 rounded-md"
                    sizes="168px"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-28 w-[168px] shrink-0 items-center justify-center rounded-md bg-neutral-100 text-icon-default"
                  >
                    <BookOpen size={24} />
                  </span>
                )}
                <div className="flex min-w-[200px] flex-1 flex-col items-start gap-1.5">
                  <span className="font-ui text-[13px] leading-4 font-medium text-neutral-700">
                    Image de couverture
                  </span>
                  <span className="font-ui text-[13px] leading-4 text-text-muted">
                    JPG ou PNG · 1 600 px conseillé · texte alternatif obligatoire
                  </span>
                  <button type="button" className={compactButtonClass} onClick={() => setCoverOpen(true)}>
                    {draft.cover ? 'Remplacer l’image' : 'Choisir une image'}
                  </button>
                </div>
              </div>
            </MagazineCard>

            <MagazineCard
              title="Édito"
              subtitle="Signé par la fondatrice, affiché en ouverture de l’édition."
            >
              <RichTextEditor
                key={language}
                variant="labels"
                label={en ? 'Édito (anglais)' : 'Édito'}
                value={en ? draft.editorialEn : draft.editorial}
                onChange={(value) => set(en ? 'editorialEn' : 'editorial', value)}
                minHeight={120}
              />
              <CompactField label={en ? 'Signature (anglais)' : 'Signature'}>
                {(control) => (
                  <CompactInput
                    {...control}
                    key={language}
                    lang={language}
                    value={en ? draft.signatureEn : draft.signature}
                    placeholder={en ? draft.signature : undefined}
                    maxLength={120}
                    onChange={(event) => set(en ? 'signatureEn' : 'signature', event.target.value)}
                  />
                )}
              </CompactField>
            </MagazineCard>

            <div ref={articlesRef} className="scroll-mt-[100px]">
              <MagazineCard
                title="Articles de l’édition"
                subtitle={
                  total > 1
                    ? 'Glissez les articles pour changer l’ordre de lecture.'
                    : 'Ajoutez les articles de cette édition.'
                }
              >
                {total > 0 && (
                  <SortableList
                    items={edition.articles}
                    getId={(article) => article.id}
                    getLabel={(article) => article.title}
                    onReorder={(next) => reorder.mutate(next.map((article) => article.id))}
                    className="flex flex-col gap-4"
                    renderItem={(article) => (
                      <SortableItem
                        key={article.id}
                        id={article.id}
                        className="flex items-center gap-3.5 rounded-md border border-neutral-100 bg-neutral-0 px-3 py-2.5"
                      >
                        <DragHandle label={article.title} className="-mx-2 text-neutral-400" />
                        {article.image ? (
                          <MediaThumb
                            image={{ ...article.image, alt: '' }}
                            className="h-10 w-14 shrink-0 rounded-sm"
                            sizes="56px"
                          />
                        ) : (
                          <span aria-hidden className="h-10 w-14 shrink-0 rounded-sm bg-neutral-100" />
                        )}
                        <button
                          type="button"
                          onClick={() => setArticleDialog({ article })}
                          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
                        >
                          <span className="font-ui text-[14px] leading-[17px] font-semibold text-text-main hover:underline">
                            {en && article.titleEn ? article.titleEn : article.title}
                          </span>
                          <span className="font-ui text-[13px] leading-4 text-text-muted">
                            {en && article.themeEn ? article.themeEn : article.theme}
                          </span>
                        </button>
                        <span className="max-sm:hidden">
                          <ArticleLanguages article={article} />
                        </span>
                      </SortableItem>
                    )}
                  />
                )}
                <div>
                  <button type="button" className={compactButtonClass} onClick={() => setAddOpen(true)}>
                    + Ajouter un article
                  </button>
                </div>
              </MagazineCard>
            </div>
          </div>

          <aside aria-label="Publication et envoi" className="flex flex-col gap-6 xl:sticky xl:top-[107px]">
            <MagazineCard
              title="Publication"
              action={
                <ActionMenu
                  label="Autres actions sur l’édition"
                  items={[
                    ...(published
                      ? [
                          {
                            label: 'Repasser en brouillon',
                            icon: Undo2,
                            onSelect: () => setConfirm('unpublish'),
                          },
                        ]
                      : []),
                    {
                      label: 'Supprimer l’édition',
                      icon: Trash2,
                      danger: true,
                      disabled: edition.status === 'PUBLISHED',
                      onSelect: () => setConfirm('delete'),
                    },
                  ]}
                />
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui text-[13px] leading-4 font-medium text-neutral-700">Statut</span>
                <PublicationPill edition={edition} />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className={cn(compactButtonClass, 'flex-1')}
                  onClick={() => preview.mutate(edition.id)}
                  disabled={preview.isPending}
                >
                  Aperçu
                </button>
                <button
                  type="button"
                  className={cn(compactPrimaryClass, 'flex-1')}
                  onClick={() => submit(published ? 'save' : 'publish')}
                  disabled={save.isPending}
                >
                  {published ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
              {!published && (
                <p className="font-ui text-[12px] leading-4 text-text-muted">
                  {draft.publishDate && draft.publishDate > toLocal(new Date().toISOString(), 'yyyy-MM-dd')
                    ? 'La publication sera programmée à la date choisie.'
                    : 'L’édition sera publiée tout de suite sur le site.'}
                </p>
              )}
            </MagazineCard>

            <NewsletterCard edition={edition} onUpdated={store} />

            <MagazineCard
              title="Traduction anglaise"
              subtitle={`${translated} article${translated > 1 ? 's' : ''} sur ${total} traduit${translated > 1 ? 's' : ''}.`}
            >
              <div
                role="progressbar"
                aria-label="Articles traduits en anglais"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={translated}
                className="h-2 overflow-hidden rounded-xs bg-neutral-100"
              >
                <div
                  className="h-full rounded-xs bg-brand-primary transition-[width]"
                  style={{ width: `${total ? (translated / total) * 100 : 0}%` }}
                />
              </div>
              <div>
                <button
                  type="button"
                  className={compactButtonClass}
                  onClick={showTranslations}
                  disabled={translated === total}
                >
                  {translated === total ? 'Tous les articles sont traduits' : 'Voir les contenus à traduire'}
                </button>
              </div>
            </MagazineCard>
          </aside>
        </div>
      </div>

      <MediaPickerDialog
        open={coverOpen}
        onClose={() => setCoverOpen(false)}
        onSelect={(image) => {
          set('cover', image);
          setCoverOpen(false);
        }}
      />
      <ArticleDialog
        open={articleDialog !== null}
        onClose={() => setArticleDialog(null)}
        article={articleDialog?.article ?? null}
        editionId={edition.id}
        initialLanguage={language}
      />
      <AddArticlesDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        edition={edition}
        onCreate={() => {
          setAddOpen(false);
          setArticleDialog({ article: null });
        }}
        onAdded={store}
      />
      <ConfirmDialog
        open={confirm === 'unpublish'}
        onClose={() => setConfirm(null)}
        onConfirm={() => unpublish.mutate()}
        title="Repasser l’édition en brouillon ?"
        description="Elle ne sera plus visible sur le site jusqu’à sa prochaine publication."
        confirmLabel="Repasser en brouillon"
        pending={unpublish.isPending}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove.mutate()}
        title={`Supprimer « ${heading} » ?`}
        description="Ses articles ne sont pas supprimés : ils restent disponibles dans l’onglet « Articles »."
        confirmLabel="Supprimer l’édition"
        destructive
        pending={remove.isPending}
      />
    </AdminPage>
  );
}

/** « Publiée · 2 oct. 2026 » (`269:2134`), « Programmée · 6 nov. 2026 », « Brouillon ». */
function PublicationPill({ edition }: { edition: AdminMagazineEdition }) {
  const label = EDITION_STATUS_LABELS[edition.status];
  const dated = edition.publishAt && edition.status !== 'DRAFT';
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 font-ui text-[12px] leading-[15px] font-medium whitespace-nowrap',
        edition.status === 'PUBLISHED'
          ? 'bg-vert-100 text-vert-800'
          : edition.status === 'SCHEDULED'
            ? 'bg-orange-50 text-text-brand'
            : 'bg-neutral-100 text-neutral-700',
      )}
    >
      {dated ? `${label} · ${formatDayMonthYear(edition.publishAt!)}` : label}
    </span>
  );
}

/** « Envoi par la newsletter » (`269:2141`) : inscrits par langue, date d'envoi, test, programmation. */
function NewsletterCard({
  edition,
  onUpdated,
}: {
  edition: AdminMagazineEdition;
  onUpdated: (edition: AdminMagazineEdition) => void;
}) {
  const { user } = useAdmin();
  const { newsletter } = edition;
  const [sendAt, setSendAt] = useState(
    newsletter.scheduledAt ? toLocal(newsletter.scheduledAt, "yyyy-MM-dd'T'HH:mm") : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);

  const schedule = useMutation({
    mutationFn: () =>
      data(
        browserApi.POST('/v1/admin/magazine/editions/{id}/newsletter/schedule', {
          params: { path: { id: edition.id } },
          body: { scheduledAt: fromLocal(`${sendAt}:00`) },
        }),
      ),
    onSuccess: (updated) => {
      setError(null);
      onUpdated(updated);
      toast.success(`Envoi programmé le ${formatStamp(updated.newsletter.scheduledAt!)} (heure de Douala).`);
    },
    onError: (caught) => {
      setError(caught instanceof ApiError ? (caught.fieldErrors.scheduledAt ?? null) : null);
      toast.error(errorMessage(caught));
    },
  });

  return (
    <MagazineCard
      title="Envoi par la newsletter"
      subtitle="Une campagne par langue, aux seuls inscrits confirmés."
    >
      <dl className="flex flex-col gap-4 font-ui text-[14px] leading-[17px]">
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-text-main">Français</dt>
          <dd className="text-text-muted">{formatNumber(newsletter.subscribers.fr)} inscrits</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-text-main" lang="en">
            English
          </dt>
          <dd className="text-text-muted">{formatNumber(newsletter.subscribers.en)} inscrits</dd>
        </div>
      </dl>
      {newsletter.sentAt ? (
        <p className="font-ui text-[13px] leading-4 text-text-muted">
          Envoyée le {formatStamp(newsletter.sentAt)} (heure de Douala).
        </p>
      ) : (
        <>
          <CompactField label="Programmer l’envoi" help="Heure de Douala." error={error}>
            {(control) => (
              <CompactInput
                {...control}
                type="datetime-local"
                value={sendAt}
                onChange={(event) => setSendAt(event.target.value)}
              />
            )}
          </CompactField>
          <div className="flex gap-2.5">
            <button
              type="button"
              className={cn(compactButtonClass, 'flex-1 px-3')}
              onClick={() => setTestOpen(true)}
            >
              Envoyer un test
            </button>
            <button
              type="button"
              className={cn(compactPrimaryClass, 'flex-1 px-3')}
              disabled={schedule.isPending}
              onClick={() => {
                if (!sendAt) {
                  setError('Choisissez la date et l’heure d’envoi.');
                  return;
                }
                schedule.mutate();
              }}
            >
              Programmer
            </button>
          </div>
        </>
      )}
      <TestDialog
        open={testOpen}
        onClose={() => setTestOpen(false)}
        editionId={edition.id}
        defaultEmail={user.email}
      />
    </MagazineCard>
  );
}

function TestDialog({
  open,
  onClose,
  editionId,
  defaultEmail,
}: {
  open: boolean;
  onClose: () => void;
  editionId: string;
  defaultEmail: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const send = useMutation({
    mutationFn: () =>
      data(
        browserApi.POST('/v1/admin/magazine/editions/{id}/newsletter/test', {
          params: { path: { id: editionId } },
          body: { email: email.trim() },
        }),
      ),
    onSuccess: (response) => {
      toast.success(response.message);
      onClose();
    },
    onError: (caught) => {
      setError(
        caught instanceof ApiError
          ? (caught.fieldErrors.email ?? errorMessage(caught))
          : errorMessage(caught),
      );
    },
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Envoyer un test"
      description="Une version par langue complète est envoyée à cette adresse."
      maxWidth={460}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={send.isPending} onClick={() => send.mutate()}>
            Envoyer
          </Button>
        </div>
      }
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          send.mutate();
        }}
      >
        <CompactField label="Adresse e-mail" error={error}>
          {(control) => (
            <CompactInput
              {...control}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </CompactField>
      </form>
    </Modal>
  );
}

/** Ajout d'articles existants (sans édition) ou création d'un nouvel article. */
function AddArticlesDialog({
  open,
  onClose,
  edition,
  onCreate,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  edition: AdminMagazineEdition;
  onCreate: () => void;
  onAdded: (edition: AdminMagazineEdition) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const available = useQuery({
    queryKey: ['magazine', 'articles', 'none'],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/magazine/articles', { params: { query: { edition: 'none' } } })),
    enabled: open,
  });
  const add = useMutation({
    mutationFn: () =>
      data(
        browserApi.PUT('/v1/admin/magazine/editions/{id}/articles', {
          params: { path: { id: edition.id } },
          body: { ids: [...edition.articles.map((article) => article.id), ...selected] },
        }),
      ),
    onSuccess: (updated) => {
      toast.success(selected.length > 1 ? `${selected.length} articles ajoutés.` : 'Article ajouté.');
      setSelected([]);
      onAdded(updated);
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un article"
      description="Choisissez des articles qui n’appartiennent à aucune édition, ou créez-en un nouveau."
      maxWidth={560}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onCreate}>
            Nouvel article
          </Button>
          <Button size="sm" disabled={!selected.length} loading={add.isPending} onClick={() => add.mutate()}>
            Ajouter à l’édition
          </Button>
        </div>
      }
    >
      {!available.data ? (
        <div aria-busy className="flex flex-col gap-2">
          <Skeleton className="h-[62px] rounded-md" />
          <Skeleton className="h-[62px] rounded-md" />
        </div>
      ) : available.data.length === 0 ? (
        <p className="font-ui text-[14px] leading-5 text-text-muted">
          Tous les articles appartiennent déjà à une édition. Créez un nouvel article.
        </p>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Articles sans édition</legend>
          {available.data.map((article) => {
            const checked = selected.includes(article.id);
            return (
              <label
                key={article.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3.5 rounded-md border px-3 py-2.5 transition-colors',
                  checked ? 'border-brand-primary bg-orange-50' : 'border-border-default hover:bg-neutral-50',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((current) =>
                      checked ? current.filter((item) => item !== article.id) : [...current, article.id],
                    )
                  }
                  className="size-4 accent-brand-primary"
                />
                {article.image && (
                  <MediaThumb
                    image={{ ...article.image, alt: '' }}
                    className="h-10 w-14 shrink-0 rounded-sm"
                    sizes="56px"
                  />
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-ui text-[14px] leading-[17px] font-semibold text-text-main">
                    {article.title}
                  </span>
                  <span className="font-ui text-[13px] leading-4 text-text-muted">{article.theme}</span>
                </span>
                <LanguagePill tone={article.languages.includes('en') ? 'done' : 'todo'}>
                  {article.languages.includes('en') ? 'FR · EN' : 'EN à traduire'}
                </LanguagePill>
              </label>
            );
          })}
        </fieldset>
      )}
    </Modal>
  );
}
