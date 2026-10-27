'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Crosshair,
  ExternalLink,
  ImageIcon,
  Images,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ConfirmDialog, StatusPill } from '@/components/admin/editor/editor-ui';
import {
  imageFileError,
  MEDIA_ACCEPT,
  MediaStatusPill,
  MediaThumb,
  MediaUploadFields,
  mediaListKey,
  pollWhileProcessing,
  uploadFieldErrors,
  useUploadMedia,
} from '@/components/admin/editor/media-picker';
import { AdminPage, topbarActionClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyFieldset, ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, ListPagination, SearchField } from '@/components/admin/ui/filters';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { Media } from '@/lib/api/schema';
import { formatDayMonthYear } from '@/lib/format/date';
import { formatFileSize, formatNumber } from '@/lib/format/number';

const PAGE_SIZE = 24;

const FORMATS: Record<Media['mimeType'], string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
};

/** « Utilisée · 3 », « Non utilisée ». */
function usageLabel(media: Media): string {
  return media.usages.length ? `Utilisée · ${formatNumber(media.usages.length)}` : 'Non utilisée';
}

/**
 * État dans l'adresse : recherche (`q`), page (`page`), image ouverte (`id`). `history.replaceState` (synchronisé
 * avec `useSearchParams`) : état purement client, sans nouvelle requête au serveur à chaque frappe.
 */
function useLibraryParams() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const id = params.get('id');
  function set(next: { q?: string; page?: number; id?: string | null }) {
    const search = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) continue;
      if (value === null || value === '' || (key === 'page' && value === 1)) search.delete(key);
      else search.set(key, String(value));
    }
    const query = search.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }
  return { q, page, id, set };
}

/**
 * Médiathèque (non maquettée) : toutes les images du site, recherche, texte alternatif, point focal, usages et
 * suppression d'une image inutilisée ; « Ajouter une image » dans la barre supérieure.
 */
export function MediaLibrary() {
  const { q, page, id, set } = useLibraryParams();
  // Envoi, modification et suppression : `media:write` (absent du rôle responsable).
  const canWrite = useCan()('media:write');
  const [search, setSearch] = useState(q);
  const [uploading, setUploading] = useState(false);
  const list = useQuery({
    queryKey: [...mediaListKey, 'library', q, page],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/media', {
          params: { query: { q: q || undefined, page, pageSize: PAGE_SIZE } },
        }),
      ),
    placeholderData: keepPreviousData,
    // Image envoyée ou remplacée : `PROCESSING` jusqu'à la création des variantes, la liste est relue.
    refetchInterval: pollWhileProcessing,
  });
  const items = list.data?.data;
  const meta = list.data?.meta;
  const opened = items?.find((item) => item.id === id) ?? null;

  return (
    <AdminPage
      title="Médiathèque"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Médiathèque
        </span>
      }
      actions={
        canWrite && (
          <button type="button" onClick={() => setUploading(true)} className={topbarActionClass}>
            <Upload aria-hidden />
            Ajouter une image
          </button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <ReadOnlyNotice
          permission="media:write"
          text="votre rôle permet de consulter les images, pas d’en ajouter, d’en modifier ni d’en supprimer."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchField
            label="Rechercher une image"
            placeholder="Nom du fichier, description…"
            value={search}
            onChange={(value) => {
              setSearch(value);
              set({ q: value.trim(), page: 1 });
            }}
            className="w-full sm:w-[320px]"
          />
          {meta && (
            <p className="font-ui text-[13px] leading-5 text-text-muted" aria-live="polite">
              {formatNumber(meta.total)} image{meta.total > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <AdminCard className="overflow-hidden">
          {list.isError && !items ? (
            <div className="p-6">
              <EmptyState
                icon={<Images size={24} />}
                title="Médiathèque indisponible"
                text="Le chargement a échoué."
              />
            </div>
          ) : !items ? (
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {Array.from({ length: 12 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-md" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ImageIcon size={24} />}
                title={q ? 'Aucune image ne correspond' : 'Aucune image'}
                text={
                  q
                    ? 'Essayez un autre mot.'
                    : canWrite
                      ? 'Ajoutez une première image.'
                      : 'Les images du site apparaîtront ici.'
                }
              />
            </div>
          ) : (
            <>
              <ul
                aria-label="Images de la médiathèque"
                className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:p-5 lg:grid-cols-4 2xl:grid-cols-6"
              >
                {items.map((media) => (
                  <li key={media.id}>
                    <button
                      type="button"
                      onClick={() => set({ id: media.id })}
                      aria-label={`Ouvrir « ${media.alt || media.fileName} »`}
                      className="group flex w-full flex-col gap-2 rounded-md border border-border-default p-2 text-left transition-colors hover:border-border-strong"
                    >
                      <MediaThumb
                        image={media}
                        sizes="(min-width: 1280px) 240px, 50vw"
                        className="aspect-[3/2] w-full rounded-sm"
                      />
                      <span className="flex min-w-0 flex-col gap-1 px-0.5 pb-0.5">
                        <span className="line-clamp-2 min-h-10 font-ui text-[13px] leading-5 font-medium text-text-main">
                          {media.alt || media.fileName}
                        </span>
                        <span className="truncate font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
                          {FORMATS[media.mimeType]} · {formatFileSize(media.size)}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          <StatusPill tone={media.usages.length ? 'success' : 'neutral'}>
                            {usageLabel(media)}
                          </StatusPill>
                          <MediaStatusPill status={media.status} />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {meta && (
                <ListPagination
                  page={meta.page}
                  pageSize={meta.pageSize}
                  total={meta.total}
                  totalPages={meta.totalPages}
                  noun="images"
                  onPage={(next) => set({ page: next })}
                />
              )}
            </>
          )}
        </AdminCard>
      </div>
      {opened && (
        <MediaDialog key={opened.id} media={opened} readOnly={!canWrite} onClose={() => set({ id: null })} />
      )}
      {canWrite && <UploadDialog open={uploading} onClose={() => setUploading(false)} />}
    </AdminPage>
  );
}

const clamp = (value: number) => Math.min(1, Math.max(0, Math.round(value * 100) / 100));

/**
 * Détail d'une image : aperçu et point focal, texte alternatif, informations, usages, suppression. Sans
 * `media:write` : consultation seulement (point focal affiché, texte alternatif figé).
 */
function MediaDialog({
  media,
  readOnly = false,
  onClose,
}: {
  media: Media;
  readOnly?: boolean;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [alt, setAlt] = useState(media.alt ?? '');
  const [focal, setFocal] = useState({ x: media.focalPoint?.x ?? 0.5, y: media.focalPoint?.y ?? 0.5 });
  const [altError, setAltError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const used = media.usages.length > 0;

  const save = useMutation({
    mutationFn: () =>
      data(
        browserApi.PATCH('/v1/admin/media/{id}', {
          params: { path: { id: media.id } },
          body: { alt: alt.trim(), focalPoint: focal },
        }),
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: mediaListKey });
      toast.success('Image enregistrée.');
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setAltError(error.fieldErrors.alt ?? null);
      toast.error(errorMessage(error));
    },
  });

  const fileInput = useRef<HTMLInputElement>(null);
  // Remplacement du fichier : même identifiant, texte alternatif et point focal ; variantes recréées.
  const replace = useMutation({
    mutationFn: (file: File) =>
      data(
        browserApi.PUT('/v1/admin/media/{id}/file', {
          params: { path: { id: media.id } },
          body: { file: file as unknown as string },
          bodySerializer: () => {
            const form = new FormData();
            form.append('file', file);
            return form;
          },
        }),
      ),
    onSuccess: (updated) => {
      void client.invalidateQueries({ queryKey: mediaListKey });
      toast.success(
        updated.status === 'PROCESSING'
          ? 'Fichier remplacé. Les variantes sont en cours de création.'
          : 'Fichier remplacé.',
      );
    },
    onError: (error) => toast.error(uploadFieldErrors(error).file ?? errorMessage(error)),
  });

  function replaceWith(file: File) {
    const error = imageFileError(file);
    if (error) return toast.error(error);
    replace.mutate(file);
  }

  const remove = useMutation({
    mutationFn: () => data(browserApi.DELETE('/v1/admin/media/{id}', { params: { path: { id: media.id } } })),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: mediaListKey });
      toast.success('Image supprimée.');
      setConfirming(false);
      onClose();
    },
    onError: (error) => {
      setConfirming(false);
      // 409 `media-in-use` : usages relus (l'image a pu être ajoutée à un contenu entre-temps).
      if (error instanceof ApiError && error.status === 409)
        void client.invalidateQueries({ queryKey: mediaListKey });
      toast.error(errorMessage(error));
    },
  });

  function pointAt(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    setFocal({
      x: clamp((event.clientX - box.left) / box.width),
      y: clamp((event.clientY - box.top) / box.height),
    });
  }

  function moveWithKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-0.05, 0],
      ArrowRight: [0.05, 0],
      ArrowUp: [0, -0.05],
      ArrowDown: [0, 0.05],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setFocal((previous) => ({ x: clamp(previous.x + move[0]), y: clamp(previous.y + move[1]) }));
  }

  const preview = { ...media, focalPoint: focal };
  const percent = (value: number) => `${Math.round(value * 100)}\u00A0%`;

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={media.fileName}
        description={`${FORMATS[media.mimeType]} · ${formatNumber(media.width)} × ${formatNumber(media.height)} px · ${formatFileSize(media.size)} · ajoutée le ${formatDayMonthYear(media.createdAt)}`}
        maxWidth={820}
        footer={
          readOnly ? (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={used}
                  onClick={() => setConfirming(true)}
                  className="text-feedback-error"
                >
                  <Trash2 aria-hidden size={16} />
                  Supprimer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  loading={replace.isPending}
                  onClick={() => fileInput.current?.click()}
                >
                  <RefreshCw aria-hidden size={16} />
                  Remplacer le fichier
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept={MEDIA_ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) replaceWith(file);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  loading={save.isPending}
                  onClick={() => {
                    if (!alt.trim()) return setAltError('Décrivez l’image en quelques mots.');
                    save.mutate();
                  }}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          )
        }
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-3">
            {readOnly ? (
              // Lecture seule : image et point focal affichés, sans saisie.
              <div
                role="img"
                aria-label={`${media.alt || media.fileName} · point focal : ${percent(focal.x)} depuis la gauche, ${percent(focal.y)} depuis le haut.`}
                className="relative block overflow-hidden rounded-md border border-border-default bg-neutral-50"
                style={{ aspectRatio: `${media.width} / ${media.height}` }}
              >
                <MediaThumb
                  image={{ ...media, focalPoint: null }}
                  sizes="520px"
                  className="absolute inset-0"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-neutral-0 bg-neutral-900/60 text-neutral-0 shadow-2"
                  style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                >
                  <Crosshair size={14} />
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={pointAt}
                onKeyDown={moveWithKeys}
                aria-label={`Point focal : ${percent(focal.x)} depuis la gauche, ${percent(focal.y)} depuis le haut. Cliquez sur l’image ou utilisez les flèches.`}
                className="relative block cursor-crosshair overflow-hidden rounded-md border border-border-default bg-neutral-50"
                style={{ aspectRatio: `${media.width} / ${media.height}` }}
              >
                <MediaThumb
                  image={{ ...media, focalPoint: null }}
                  sizes="520px"
                  className="absolute inset-0"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-neutral-0 bg-neutral-900/60 text-neutral-0 shadow-2"
                  style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                >
                  <Crosshair size={14} />
                </span>
              </button>
            )}
            {media.status !== 'READY' && (
              <p className="flex flex-wrap items-center gap-2 font-ui text-[12px] leading-4 text-text-muted">
                <MediaStatusPill status={media.status} />
                {media.status === 'PROCESSING'
                  ? 'Les variantes pour le site sont en cours de création ; l’image reste utilisable.'
                  : 'Les variantes n’ont pas pu être créées : remplacez le fichier.'}
              </p>
            )}
            <p className="font-ui text-[12px] leading-4 text-text-muted">
              Point focal : la partie gardée quand l’image est recadrée (vignettes, bannières, mobile).
            </p>
            <div className="flex items-end gap-3" aria-label="Aperçu des recadrages" role="group">
              <MediaThumb image={preview} sizes="80px" className="aspect-square w-16 rounded-sm" />
              <MediaThumb image={preview} sizes="160px" className="aspect-[16/9] w-32 rounded-sm" />
              <MediaThumb image={preview} sizes="60px" className="aspect-[3/4] w-12 rounded-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <ReadOnlyFieldset readOnly={readOnly}>
              <Field
                label="Texte alternatif"
                required
                error={altError}
                help="Ce que montre l’image, lu par les lecteurs d’écran et les moteurs de recherche."
              >
                {(control) => (
                  <Input
                    {...control}
                    maxLength={200}
                    value={alt}
                    onChange={(event) => {
                      setAlt(event.target.value);
                      setAltError(null);
                    }}
                  />
                )}
              </Field>
            </ReadOnlyFieldset>
            <section aria-labelledby={`usages-${media.id}`} className="flex flex-col gap-2">
              <h3
                id={`usages-${media.id}`}
                className="font-ui text-[14px] leading-5 font-semibold text-text-main"
              >
                {used
                  ? `Utilisée à ${formatNumber(media.usages.length)} endroit${media.usages.length > 1 ? 's' : ''}`
                  : 'Non utilisée'}
              </h3>
              {used ? (
                <ul className="flex flex-col gap-1.5">
                  {media.usages.map((usage) => (
                    <li
                      key={`${usage.kind}-${usage.label}`}
                      className="font-ui text-[13px] leading-5 text-text-main"
                    >
                      {usage.href ? (
                        <Link
                          href={usage.href as Route}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {usage.label}
                          <ExternalLink aria-hidden size={12} className="text-icon-default" />
                        </Link>
                      ) : (
                        usage.label
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-ui text-[13px] leading-5 text-text-muted">
                  Aucune page ne l’affiche : elle peut être supprimée.
                </p>
              )}
              {used && (
                <p className="font-ui text-[12px] leading-4 text-text-muted">
                  Remplacez-la à ces endroits avant de pouvoir la supprimer.
                </p>
              )}
            </section>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => remove.mutate()}
        title="Supprimer cette image ?"
        description={`« ${media.alt || media.fileName} » sera supprimée définitivement de la médiathèque.`}
        confirmLabel="Supprimer l’image"
        destructive
        pending={remove.isPending}
      />
    </>
  );
}

/** « Ajouter une image » : envoi d'un fichier et de son texte alternatif. */
function UploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const upload = useUploadMedia();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [altError, setAltError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFile(null);
      setAlt('');
      setFileError(null);
      setAltError(null);
    }
  }

  async function submit() {
    if (!file) return setFileError('Choisissez une image.');
    if (!alt.trim()) return setAltError('Décrivez l’image en quelques mots.');
    try {
      await upload.mutateAsync({ file, alt: alt.trim() });
      toast.success('Image ajoutée à la médiathèque.');
      onClose();
    } catch (error) {
      const fields = uploadFieldErrors(error);
      setFileError(fields.file);
      setAltError(fields.alt);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter une image"
      description="Les variantes pour le site (480, 960 et 1600 px) sont créées automatiquement."
      maxWidth={560}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={upload.isPending} onClick={() => void submit()}>
            Ajouter l’image
          </Button>
        </div>
      }
    >
      <MediaUploadFields
        file={file}
        onFile={(candidate) => {
          const error = imageFileError(candidate);
          setFileError(error);
          if (!error) setFile(candidate);
        }}
        fileError={fileError}
        alt={alt}
        onAlt={(value) => {
          setAlt(value);
          setAltError(null);
        }}
        altError={altError}
      />
    </Modal>
  );
}
