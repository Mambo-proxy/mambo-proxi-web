'use client';

import { ImagePlus, Star, X } from 'lucide-react';
import { useId, useState, type DragEvent } from 'react';
import { MediaPickerDialog, MediaThumb } from '@/components/admin/editor/media-picker';
import { Visual } from '@/components/ui/visual';
import type { IllustrationScene, MediaImage } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

/** Visuels d'un service : photo principale (`coverImageId`) puis 3 visuels de galerie au plus. */
export type VisualsValue = { coverImageId: string | null; galleryImageIds: string[] };

const MAX_GALLERY = 3;

const tileButton =
  'flex size-7 items-center justify-center rounded-full bg-neutral-0 text-text-main shadow-2 hover:bg-neutral-100';

/** Boutons d'une vignette : visibles au survol, au focus clavier et toujours sur écran tactile. */
const tileActions =
  'absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100';

/**
 * Galerie « Visuels » (`91:10794`) : le premier visuel est la photo principale (200 × 130), les suivants 130 × 130,
 * puis la zone d'ajout « Glisser une photo » (médiathèque ou dépôt d'un fichier). Sans photo principale,
 * l'illustration provisoire du service occupe la première place.
 */
export function VisualsField({
  value,
  onChange,
  illustration,
  media,
  onMedia,
  error,
}: {
  value: VisualsValue;
  onChange: (value: VisualsValue) => void;
  illustration: IllustrationScene;
  /** Images connues (photo principale renvoyée par l'API, médiathèque, images choisies). */
  media: Record<string, MediaImage>;
  onMedia: (image: MediaImage) => void;
  error?: string | null;
}) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [dropped, setDropped] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const { coverImageId, galleryImageIds } = value;
  const cover = coverImageId ? media[coverImageId] : null;
  const full = galleryImageIds.length >= MAX_GALLERY && !!coverImageId;

  function add(image: MediaImage) {
    onMedia(image);
    if (!coverImageId) onChange({ coverImageId: image.id, galleryImageIds });
    else if (!galleryImageIds.includes(image.id) && image.id !== coverImageId)
      onChange({ coverImageId, galleryImageIds: [...galleryImageIds, image.id] });
  }

  function makeMain(id: string) {
    const rest = galleryImageIds.map((item) => (item === id ? coverImageId : item));
    onChange({ coverImageId: id, galleryImageIds: rest.filter((item): item is string => !!item) });
  }

  function removeCover() {
    const [next = null, ...rest] = galleryImageIds;
    onChange({ coverImageId: next, galleryImageIds: rest });
  }

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
        Visuels
      </span>
      <ul className="flex flex-wrap gap-3">
        <li className="group relative">
          {coverImageId ? (
            <>
              {cover ? (
                <MediaThumb
                  image={cover}
                  sizes="200px"
                  className="h-[130px] w-[200px] rounded-md bg-orange-100"
                />
              ) : (
                <span className="block h-[130px] w-[200px] rounded-md bg-neutral-100" />
              )}
              <span className="sr-only">Photo principale{cover?.alt ? ` : ${cover.alt}` : ''}</span>
              <div className={tileActions}>
                <button
                  type="button"
                  onClick={removeCover}
                  aria-label="Retirer la photo principale"
                  className={tileButton}
                >
                  <X aria-hidden size={14} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Visual
                visual={{ illustration, image: null, alt: '' }}
                sizes="200px"
                className="h-[130px] w-[200px] rounded-md bg-orange-100!"
              />
              <span className="sr-only">Illustration provisoire (aucune photo principale)</span>
            </>
          )}
        </li>
        {galleryImageIds.map((id, index) => {
          const image = media[id];
          return (
            <li key={id} className="group relative">
              {image ? (
                <MediaThumb image={image} sizes="130px" className="size-[130px] rounded-md bg-orange-100" />
              ) : (
                <span className="block size-[130px] rounded-md bg-neutral-100" />
              )}
              <span className="sr-only">
                Visuel {index + 2}
                {image?.alt ? ` : ${image.alt}` : ''}
              </span>
              <div className={tileActions}>
                <button
                  type="button"
                  onClick={() => makeMain(id)}
                  aria-label={`Utiliser le visuel ${index + 2} comme photo principale`}
                  className={tileButton}
                >
                  <Star aria-hidden size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ coverImageId, galleryImageIds: galleryImageIds.filter((item) => item !== id) })
                  }
                  aria-label={`Retirer le visuel ${index + 2}`}
                  className={tileButton}
                >
                  <X aria-hidden size={14} />
                </button>
              </div>
            </li>
          );
        })}
        {!full && (
          <li className="min-w-[180px] flex-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              aria-describedby={error ? `${labelId}-error` : undefined}
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
                JPG ou PNG · 1600 px conseillé
              </span>
            </button>
          </li>
        )}
      </ul>
      {error && (
        <p id={`${labelId}-error`} role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
          {error}
        </p>
      )}
      <MediaPickerDialog
        open={open}
        initialFile={dropped}
        onClose={() => {
          setOpen(false);
          setDropped(null);
        }}
        onSelect={(image) => {
          add(image);
          setOpen(false);
          setDropped(null);
        }}
      />
    </div>
  );
}
