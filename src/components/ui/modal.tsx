'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Pied de la modale (boutons d'action). */
  footer?: ReactNode;
  /** Largeur maximale en desktop (px). En mobile, la modale s'affiche en panneau bas plein écran en largeur. */
  maxWidth?: number;
  className?: string;
};

/**
 * Modale / panneau bas (non maquettés : même langage que les cartes — fond blanc, rayon 28, `elevation/4`).
 * `<dialog>` natif ouvert avec `showModal()` : le reste de la page devient inerte, le focus reste dans la
 * modale, `Échap` ferme, et le focus revient sur l'élément d'origine à la fermeture.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 560,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clic sur le voile (en dehors du contenu) : fermeture.
        if (event.target === event.currentTarget) onClose();
      }}
      style={{ ['--modal-max' as string]: `${maxWidth}px` }}
      className={cn(
        'm-0 mt-auto max-h-[92dvh] w-full max-w-full overflow-visible bg-transparent p-0 text-text-main',
        'backdrop:bg-surface-overlay md:m-auto md:max-w-(--modal-max)',
        'open:animate-[modal-in_200ms_var(--mp-easing-standard)] motion-reduce:open:animate-none',
      )}
    >
      <div
        className={cn(
          'flex max-h-[92dvh] flex-col rounded-t-[28px] bg-neutral-0 shadow-4 md:rounded-[28px]',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6 md:px-8 md:pt-8">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-brand text-[24px] leading-8 font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="font-ui text-[15px] leading-6 text-text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default text-icon-default hover:bg-neutral-100"
          >
            <X aria-hidden size={20} />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-5 md:px-8">{children}</div>
        {footer && (
          <footer className="flex flex-col-reverse gap-3 border-t border-border-default px-6 py-5 md:flex-row md:justify-end md:px-8">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
