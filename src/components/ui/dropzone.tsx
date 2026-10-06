'use client';

import { FileText, Upload, X } from 'lucide-react';
import { useId, useRef, useState, type DragEvent } from 'react';
import { cn } from '@/lib/cn';
import { formatFileSize } from '@/lib/format/number';

type DropzoneProps = {
  /** Types acceptés (attribut `accept`), ex. `.pdf,.doc,.docx`. */
  accept: string;
  /** Taille maximale en octets (CV : 5 Mo). */
  maxSize: number;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Texte principal (maquette Recrutement : invitation à déposer le CV). */
  label: string;
  /** Aide sous le texte principal (formats et taille). */
  help: string;
  /** Message d'erreur externe (validation du formulaire). */
  error?: string | null;
  'aria-describedby'?: string;
};

/**
 * Zone de dépôt (Recrutement) : fond `neutral/50`, bordure 1 px pointillée `border/strong`, rayon 16, p 28,
 * pastille 44 blanche rayon 13 avec icône `upload` 20 orange ; texte Inter Medium 14/20, aide 12/16.
 * Utilisable au clavier (bouton) et par glisser-déposer.
 */
export function Dropzone({
  accept,
  maxSize,
  file,
  onFileChange,
  label,
  help,
  error,
  ...props
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const message = localError ?? error ?? null;

  function accepts(candidate: File) {
    const extensions = accept.split(',').map((value) => value.trim().toLowerCase());
    return extensions.some((extension) => candidate.name.toLowerCase().endsWith(extension));
  }

  function pick(candidate: File | undefined) {
    if (!candidate) return;
    if (!accepts(candidate)) {
      setLocalError(`Format non accepté. Formats acceptés : ${accept.replaceAll(',', ', ')}.`);
      return;
    }
    if (candidate.size > maxSize) {
      setLocalError(`Le fichier dépasse ${formatFileSize(maxSize)}.`);
      return;
    }
    setLocalError(null);
    onFileChange(candidate);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files[0]);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-default bg-neutral-0 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-orange-50 text-text-brand">
          <FileText aria-hidden size={20} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-ui text-[14px] leading-5 font-medium text-text-main">
            {file.name}
          </span>
          <span className="text-caption text-text-muted">{formatFileSize(file.size)}</span>
        </span>
        <button
          type="button"
          onClick={() => onFileChange(null)}
          aria-label={`Retirer ${file.name}`}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-icon-default hover:bg-neutral-100"
        >
          <X aria-hidden size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border border-dashed bg-neutral-50 p-7 text-center transition-colors',
          dragging ? 'border-brand-primary bg-orange-50' : 'border-border-strong',
          message && 'border-feedback-error',
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-[13px] bg-neutral-0 text-brand-primary">
          <Upload aria-hidden size={20} />
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-describedby={[`${id}-help`, message ? `${id}-error` : null, props['aria-describedby']]
            .filter(Boolean)
            .join(' ')}
          className="cursor-pointer rounded-xs font-ui text-[14px] leading-5 font-medium text-text-main underline-offset-2 hover:underline"
        >
          {label}
        </button>
        <span id={`${id}-help`} className="text-caption text-text-muted">
          {help}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          tabIndex={-1}
          className="sr-only"
          aria-hidden
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </div>
      {message && (
        <p id={`${id}-error`} role="alert" className="text-[13px] leading-4 text-feedback-error">
          {message}
        </p>
      )}
    </div>
  );
}
