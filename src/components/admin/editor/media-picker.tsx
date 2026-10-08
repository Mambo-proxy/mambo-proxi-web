'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useId, useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type { Media, MediaImage } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatFileSize } from '@/lib/format/number';

export const mediaListKey = ['media'] as const;

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml';
const MAX_SIZE = 10 * 1024 * 1024;

/** `Media` (médiathèque) → `MediaImage` (référence enregistrée dans un contenu). */
export function toMediaImage(media: Media): MediaImage {
  const { id, url, width, height, alt, focalPoint, blurDataUrl, variants } = media;
  return { id, url, width, height, alt, focalPoint, blurDataUrl, variants };
}

/** Envoi d'une image (`POST /v1/admin/media`, multipart) avec son texte alternatif. */
export function useUploadMedia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ file, alt }: { file: File; alt: string }) =>
      data(
        browserApi.POST('/v1/admin/media', {
          body: { file: file as unknown as string, alt },
          bodySerializer: () => {
            const form = new FormData();
            form.append('file', file);
            form.append('alt', alt);
            return form;
          },
        }),
      ),
    onSuccess: () => void client.invalidateQueries({ queryKey: mediaListKey }),
  });
}

/** Vignette d'une image du back-office (`next/image` sans optimisation : URL de l'API ou de la médiathèque). */
export function MediaThumb({
  image,
  className,
  sizes = '200px',
}: {
  image: Pick<MediaImage, 'url' | 'alt' | 'width' | 'height' | 'focalPoint'>;
  className?: string;
  sizes?: string;
}) {
  return (
    <span className={cn('relative block overflow-hidden bg-neutral-100', className)}>
      <Image
        src={image.url}
        alt={image.alt ?? ''}
        fill
        sizes={sizes}
        unoptimized
        className="object-cover"
        style={{
          objectPosition: image.focalPoint
            ? `${(image.focalPoint.x ?? 0.5) * 100}% ${(image.focalPoint.y ?? 0.5) * 100}%`
            : undefined,
        }}
      />
    </span>
  );
}

type ImageFieldProps = {
  label: string;
  value: MediaImage | null | undefined;
  onChange: (image: MediaImage | null) => void;
  help?: string;
  /** Format de la vignette (`aspect-[3/2]` par défaut ; logos : `aspect-[2/1]` sur fond blanc). */
  aspectClassName?: string;
  /** Logos : image entière (`object-contain`) plutôt que recadrée. */
  contain?: boolean;
};

/**
 * Champ image d'un éditeur : vignette et actions « Remplacer » / « Retirer », ou zone d'ajout (`91:10846` : fond
 * `neutral/50`, bordure pointillée, « Glisser une photo », « JPG ou PNG · 1600 px conseillé ») qui ouvre la
 * médiathèque. Une image déposée sur la zone est envoyée directement (texte alternatif demandé).
 */
export function ImageField({
  label,
  value,
  onChange,
  help,
  aspectClassName = 'aspect-[3/2]',
  contain,
}: ImageFieldProps) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [dropped, setDropped] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setDropped(file);
      setOpen(true);
    }
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className="font-ui text-[14px] leading-5 font-semibold text-text-main">
        {label}
      </span>
      {value ? (
        <div className="flex flex-wrap items-end gap-3">
          <MediaThumb
            image={value}
            className={cn(
              'w-[200px] rounded-md border border-border-default',
              aspectClassName,
              contain && 'bg-neutral-0 [&_img]:object-contain! [&_img]:p-3',
            )}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <RefreshCw aria-hidden />
              Remplacer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 aria-hidden />
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex h-[130px] w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong bg-neutral-50 p-4 text-center transition-colors hover:bg-neutral-100',
            dragging && 'border-brand-primary bg-orange-50',
          )}
        >
          <ImagePlus aria-hidden size={22} className="text-icon-default" />
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
            Glisser une photo
          </span>
          <span className="font-ui text-[12px] leading-4 text-text-muted">
            {help ?? 'JPG ou PNG · 1600 px conseillé'}
          </span>
        </button>
      )}
      <MediaPickerDialog
        open={open}
        initialFile={dropped}
        onClose={() => {
          setOpen(false);
          setDropped(null);
        }}
        onSelect={(image) => {
          onChange(image);
          setOpen(false);
          setDropped(null);
        }}
      />
    </div>
  );
}

type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (image: MediaImage) => void;
  /** Fichier déposé sur la zone d'ajout : l'onglet d'envoi s'ouvre directement. */
  initialFile?: File | null;
};

/** Médiathèque en modale : choisir une image existante ou en envoyer une nouvelle. */
export function MediaPickerDialog({ open, onClose, onSelect, initialFile }: MediaPickerDialogProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [selected, setSelected] = useState<Media | null>(null);
  const [q, setQ] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [altError, setAltError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected(null);
      setAlt('');
      setFileError(null);
      setAltError(null);
      setFile(initialFile ?? null);
      setTab(initialFile ? 'upload' : 'library');
    }
  }

  const list = useQuery({
    queryKey: [...mediaListKey, q],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/media', { params: { query: { q: q || undefined, pageSize: 48 } } })),
    enabled: open && tab === 'library',
  });

  function pick(candidate: File | undefined) {
    if (!candidate) return;
    if (!ACCEPT.split(',').includes(candidate.type)) {
      setFileError('Format non accepté. Formats acceptés : JPG, PNG, WebP ou SVG.');
      return;
    }
    if (candidate.size > MAX_SIZE) {
      setFileError(`L’image dépasse ${formatFileSize(MAX_SIZE)}.`);
      return;
    }
    setFileError(null);
    setFile(candidate);
  }

  async function confirm() {
    if (tab === 'library') {
      if (selected) onSelect(toMediaImage(selected));
      return;
    }
    if (!file) {
      setFileError('Choisissez une image.');
      return;
    }
    if (!alt.trim()) {
      setAltError(
        'Décrivez l’image en quelques mots (lu par les lecteurs d’écran et les moteurs de recherche).',
      );
      return;
    }
    try {
      const media = await upload.mutateAsync({ file, alt: alt.trim() });
      onSelect(toMediaImage(media));
    } catch (error) {
      setFileError(errorMessage(error));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choisir une image"
      maxWidth={760}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            loading={upload.isPending}
            disabled={tab === 'library' && !selected}
            onClick={() => void confirm()}
          >
            {tab === 'library' ? 'Utiliser cette image' : 'Envoyer et utiliser'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Source de l’image"
          className="flex w-max gap-1 rounded-md bg-neutral-100 p-1"
        >
          {(
            [
              ['library', 'Médiathèque'],
              ['upload', 'Envoyer une image'],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                'rounded-sm px-3 py-1.5 font-ui text-[14px] leading-5 font-medium',
                tab === value
                  ? 'bg-neutral-0 font-semibold text-text-main shadow-1'
                  : 'text-text-muted hover:text-text-main',
              )}
            >
              {text}
            </button>
          ))}
        </div>

        {tab === 'library' ? (
          <div role="tabpanel" aria-label="Médiathèque" className="flex flex-col gap-3">
            <Input
              type="search"
              aria-label="Rechercher une image"
              placeholder="Nom du fichier, description…"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
            {list.isPending ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : list.isError ? (
              <p role="alert" className="font-ui text-[14px] text-feedback-error">
                {errorMessage(list.error)}
              </p>
            ) : list.data.data.length === 0 ? (
              <p className="py-8 text-center font-ui text-[14px] text-text-muted">
                Aucune image ne correspond.
              </p>
            ) : (
              <ul className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto p-0.5 sm:grid-cols-4">
                {list.data.data.map((media) => {
                  const active = selected?.id === media.id;
                  return (
                    <li key={media.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelected(media)}
                        onDoubleClick={() => onSelect(toMediaImage(media))}
                        className={cn(
                          'relative flex w-full flex-col gap-1.5 rounded-md border p-1.5 text-left transition-colors',
                          active
                            ? 'border-neutral-900 ring-1 ring-neutral-900'
                            : 'border-border-default hover:border-border-strong',
                        )}
                      >
                        <MediaThumb image={media} className="aspect-[3/2] w-full rounded-sm" />
                        <span className="truncate px-0.5 font-ui text-[12px] leading-4 text-text-main">
                          {media.alt || media.fileName}
                        </span>
                        {active && (
                          <span
                            aria-hidden
                            className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-neutral-900 text-neutral-0"
                          >
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div role="tabpanel" aria-label="Envoyer une image" className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => pick(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                pick(event.dataTransfer.files[0]);
              }}
              aria-describedby={fileError ? 'media-file-error' : undefined}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-neutral-50 p-7 text-center hover:bg-neutral-100"
            >
              <span className="flex size-11 items-center justify-center rounded-[13px] bg-neutral-0 text-brand-primary">
                <Upload aria-hidden size={20} />
              </span>
              <span className="font-ui text-[14px] leading-5 font-medium text-text-main">
                {file
                  ? `${file.name} · ${formatFileSize(file.size)}`
                  : 'Glisser une image ou cliquer pour la choisir'}
              </span>
              <span className="font-ui text-[12px] leading-4 text-text-muted">
                JPG, PNG, WebP ou SVG · 10 Mo max · 1600 px conseillé
              </span>
            </button>
            {fileError && (
              <p
                id="media-file-error"
                role="alert"
                className="font-ui text-[13px] leading-4 text-feedback-error"
              >
                {fileError}
              </p>
            )}
            <Field
              label="Texte alternatif"
              required
              error={altError}
              help="Décrivez ce que montre l’image, en une phrase courte."
            >
              {(control) => (
                <Input
                  {...control}
                  value={alt}
                  maxLength={200}
                  onChange={(event) => {
                    setAlt(event.target.value);
                    setAltError(null);
                  }}
                />
              )}
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}
